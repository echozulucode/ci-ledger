"""
LDAP authentication service.

Provides flexible LDAP/Active Directory authentication with:
- Multiple LDAP server support
- Automatic user provisioning
- Group-based role assignment
- Connection pooling and health checks
- Comprehensive error handling and logging
"""
import logging
from typing import Optional, Dict, List, Tuple
from datetime import datetime

from ldap3 import Server, Connection, ALL, NTLM, SIMPLE, Tls
from ldap3.core.exceptions import (
    LDAPException, 
    LDAPBindError, 
    LDAPSocketOpenError,
    LDAPSocketReceiveError,
    LDAPOperationsErrorResult
)
import ssl

from app.core.config import settings

logger = logging.getLogger(__name__)


class LDAPConfig:
    """LDAP configuration with validation and defaults."""
    
    def __init__(self):
        self.enabled = settings.LDAP_ENABLED
        self.server = settings.LDAP_SERVER
        self.port = settings.LDAP_PORT or 389
        self.use_ssl = settings.LDAP_USE_SSL
        self.bind_dn = settings.LDAP_BIND_DN
        self.bind_password = settings.LDAP_BIND_PASSWORD
        self.search_base = settings.LDAP_SEARCH_BASE
        
        # Additional configuration from environment
        self.timeout = getattr(settings, 'LDAP_TIMEOUT', 10)
        self.use_ntlm = getattr(settings, 'LDAP_USE_NTLM', False)
        self.user_search_filter = getattr(settings, 'LDAP_USER_SEARCH_FILTER', 
                                          '(sAMAccountName={username})')
        self.group_search_filter = getattr(settings, 'LDAP_GROUP_SEARCH_FILTER',
                                           '(member={user_dn})')
        self.admin_groups = self._parse_list(getattr(settings, 'LDAP_ADMIN_GROUPS', ''))
        self.allowed_groups = self._parse_list(getattr(settings, 'LDAP_ALLOWED_GROUPS', ''))
        
        # Attributes to retrieve
        self.user_attributes = ['cn', 'mail', 'displayName', 'memberOf', 'sAMAccountName']
        
    @staticmethod
    def _parse_list(value: str) -> List[str]:
        """Parse comma-separated string to list."""
        if not value:
            return []
        return [item.strip() for item in value.split(',') if item.strip()]
    
    def is_valid(self) -> Tuple[bool, Optional[str]]:
        """Validate LDAP configuration."""
        if not self.enabled:
            return True, None
            
        if not self.server:
            return False, "LDAP_SERVER is required"
        if not self.bind_dn:
            return False, "LDAP_BIND_DN is required"
        if not self.bind_password:
            return False, "LDAP_BIND_PASSWORD is required"
        if not self.search_base:
            return False, "LDAP_SEARCH_BASE is required"
            
        return True, None


class LDAPService:
    """LDAP authentication and user management service."""
    
    def __init__(self):
        self.config = LDAPConfig()
        self._server: Optional[Server] = None
        self._last_health_check: Optional[datetime] = None
        self._health_check_interval = 300  # 5 minutes
        
    def _get_server(self) -> Server:
        """Get or create LDAP server instance."""
        if self._server is None:
            tls_config = None
            if self.config.use_ssl:
                tls_config = Tls(validate=ssl.CERT_REQUIRED)
            
            self._server = Server(
                self.config.server,
                port=self.config.port,
                use_ssl=self.config.use_ssl,
                tls=tls_config,
                get_info=ALL,
                connect_timeout=self.config.timeout
            )
            logger.info(f"LDAP server initialized: {self.config.server}:{self.config.port}")
        
        return self._server
    
    def _create_connection(
        self, 
        user_dn: Optional[str] = None, 
        password: Optional[str] = None
    ) -> Connection:
        """Create LDAP connection with appropriate authentication."""
        server = self._get_server()
        
        # Use service account credentials if not provided
        bind_user = user_dn or self.config.bind_dn
        bind_pass = password or self.config.bind_password
        
        # Determine authentication type
        authentication = NTLM if self.config.use_ntlm else SIMPLE
        
        conn = Connection(
            server,
            user=bind_user,
            password=bind_pass,
            authentication=authentication,
            auto_bind=False,
            raise_exceptions=True,
            receive_timeout=self.config.timeout
        )
        
        return conn
    
    def health_check(self) -> Dict[str, any]:
        """
        Check LDAP server health and connectivity.
        
        Returns dict with status, message, and details.
        """
        if not self.config.enabled:
            return {
                "status": "disabled",
                "message": "LDAP authentication is disabled",
                "healthy": True
            }
        
        # Check configuration validity
        is_valid, error_msg = self.config.is_valid()
        if not is_valid:
            return {
                "status": "error",
                "message": f"Invalid configuration: {error_msg}",
                "healthy": False
            }
        
        try:
            conn = self._create_connection()
            
            # Try to bind
            if not conn.bind():
                return {
                    "status": "error",
                    "message": f"Bind failed: {conn.result}",
                    "healthy": False
                }
            
            # Try a simple search to verify connectivity
            conn.search(
                search_base=self.config.search_base,
                search_filter='(objectClass=*)',
                search_scope='BASE',
                attributes=['objectClass']
            )
            
            conn.unbind()
            
            self._last_health_check = datetime.utcnow()
            
            return {
                "status": "ok",
                "message": "LDAP server is reachable and responding",
                "healthy": True,
                "server": self.config.server,
                "port": self.config.port,
                "ssl": self.config.use_ssl,
                "last_check": self._last_health_check.isoformat()
            }
            
        except LDAPSocketOpenError as e:
            logger.error(f"LDAP connection failed: {e}")
            return {
                "status": "error",
                "message": f"Cannot connect to LDAP server: {e}",
                "healthy": False
            }
        except LDAPBindError as e:
            logger.error(f"LDAP bind failed: {e}")
            return {
                "status": "error",
                "message": f"LDAP bind failed (check service account credentials): {e}",
                "healthy": False
            }
        except LDAPException as e:
            logger.error(f"LDAP error: {e}")
            return {
                "status": "error",
                "message": f"LDAP error: {e}",
                "healthy": False
            }
    
    def authenticate(self, username: str, password: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """
        Authenticate user against LDAP/Active Directory.
        
        Args:
            username: Username (can be email or sAMAccountName)
            password: User password
        
        Returns:
            Tuple of (success, user_info_dict, error_message)
        """
        if not self.config.enabled:
            return False, None, "LDAP authentication is disabled"
        
        # Validate configuration
        is_valid, error_msg = self.config.is_valid()
        if not is_valid:
            logger.error(f"LDAP configuration error: {error_msg}")
            return False, None, f"LDAP configuration error: {error_msg}"
        
        try:
            # First, use service account to find user DN
            user_dn, user_info = self._find_user(username)
            
            if not user_dn:
                logger.warning(f"User not found in LDAP: {username}")
                return False, None, "User not found in directory"
            
            # Check if user is in allowed groups (if configured)
            if self.config.allowed_groups:
                user_groups = user_info.get('groups', [])
                if not any(group in user_groups for group in self.config.allowed_groups):
                    logger.warning(f"User {username} not in allowed groups")
                    return False, None, "User not authorized (group membership required)"
            
            # Attempt to bind with user's credentials
            conn = self._create_connection(user_dn, password)
            
            if not conn.bind():
                logger.warning(f"LDAP bind failed for user: {username}")
                return False, None, "Invalid credentials"
            
            conn.unbind()
            
            logger.info(f"LDAP authentication successful for user: {username}")
            return True, user_info, None
            
        except LDAPBindError as e:
            # Bind errors typically mean invalid credentials
            logger.warning(f"Invalid credentials for user: {username}")
            return False, None, "Invalid credentials"
        except LDAPSocketOpenError as e:
            logger.error(f"LDAP connection failed: {e}")
            return False, None, "LDAP server unreachable"
        except LDAPException as e:
            logger.error(f"LDAP authentication error for {username}: {e}")
            return False, None, f"Authentication error: {str(e)}"
        except Exception as e:
            logger.error(f"Unexpected error during LDAP authentication: {e}")
            return False, None, "Authentication system error"
    
    def _find_user(self, username: str) -> Tuple[Optional[str], Optional[Dict]]:
        """
        Find user in LDAP directory using service account.
        
        Returns tuple of (user_dn, user_info_dict)
        """
        # Handle email format
        if '@' in username:
            search_filter = f'(mail={username})'
        else:
            search_filter = self.config.user_search_filter.format(username=username)
        
        conn = self._create_connection()
        
        try:
            if not conn.bind():
                logger.error(f"Service account bind failed: {conn.result}")
                return None, None
            
            # Search for user
            conn.search(
                search_base=self.config.search_base,
                search_filter=search_filter,
                search_scope='SUBTREE',
                attributes=self.config.user_attributes
            )
            
            if not conn.entries:
                return None, None
            
            # Get first matching entry
            entry = conn.entries[0]
            user_dn = entry.entry_dn
            
            # Extract user information
            user_info = {
                'dn': user_dn,
                'username': str(entry.sAMAccountName) if hasattr(entry, 'sAMAccountName') else username,
                'email': str(entry.mail) if hasattr(entry, 'mail') else None,
                'full_name': str(entry.displayName) if hasattr(entry, 'displayName') else str(entry.cn) if hasattr(entry, 'cn') else None,
                'groups': []
            }
            
            # Extract group memberships
            if hasattr(entry, 'memberOf'):
                user_info['groups'] = [self._extract_cn_from_dn(dn) for dn in entry.memberOf]
            
            # Determine if user should be admin based on group membership
            user_info['is_admin'] = any(
                group in user_info['groups'] 
                for group in self.config.admin_groups
            ) if self.config.admin_groups else False
            
            conn.unbind()
            
            logger.info(f"Found user in LDAP: {username} -> {user_dn}")
            return user_dn, user_info
            
        except LDAPException as e:
            logger.error(f"Error finding user {username}: {e}")
            return None, None
        finally:
            if conn.bound:
                conn.unbind()
    
    @staticmethod
    def _extract_cn_from_dn(dn: str) -> str:
        """Extract CN (Common Name) from Distinguished Name."""
        # DN format: "CN=Group Name,OU=Groups,DC=domain,DC=com"
        parts = dn.split(',')
        for part in parts:
            if part.strip().upper().startswith('CN='):
                return part.split('=', 1)[1]
        return dn
    
    def get_user_groups(self, user_dn: str) -> List[str]:
        """Get list of groups for a user."""
        conn = self._create_connection()
        
        try:
            if not conn.bind():
                return []
            
            # Search for groups containing this user
            group_filter = self.config.group_search_filter.format(user_dn=user_dn)
            
            conn.search(
                search_base=self.config.search_base,
                search_filter=group_filter,
                search_scope='SUBTREE',
                attributes=['cn']
            )
            
            groups = [str(entry.cn) for entry in conn.entries]
            conn.unbind()
            
            return groups
            
        except LDAPException as e:
            logger.error(f"Error getting groups for {user_dn}: {e}")
            return []
        finally:
            if conn.bound:
                conn.unbind()


# Global LDAP service instance
ldap_service = LDAPService()

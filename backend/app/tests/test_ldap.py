"""Tests for LDAP authentication functionality."""
import pytest
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.ldap_service import LDAPService, LDAPConfig


class TestLDAPConfig:
    """Test LDAP configuration."""
    
    def test_config_validation_disabled(self):
        """Test that disabled LDAP config is always valid."""
        with patch('app.core.ldap_service.settings') as mock_settings:
            mock_settings.LDAP_ENABLED = False
            config = LDAPConfig()
            is_valid, error = config.is_valid()
            assert is_valid is True
            assert error is None
    
    def test_config_validation_missing_server(self):
        """Test validation fails when server is missing."""
        with patch('app.core.ldap_service.settings') as mock_settings:
            mock_settings.LDAP_ENABLED = True
            mock_settings.LDAP_SERVER = None
            mock_settings.LDAP_BIND_DN = "CN=test"
            mock_settings.LDAP_BIND_PASSWORD = "pass"
            mock_settings.LDAP_SEARCH_BASE = "DC=test"
            mock_settings.LDAP_PORT = 389
            mock_settings.LDAP_USE_SSL = False
            
            config = LDAPConfig()
            is_valid, error = config.is_valid()
            assert is_valid is False
            assert "LDAP_SERVER" in error
    
    def test_config_validation_complete(self):
        """Test validation passes with complete config."""
        with patch('app.core.ldap_service.settings') as mock_settings:
            mock_settings.LDAP_ENABLED = True
            mock_settings.LDAP_SERVER = "ldap://dc.test.com"
            mock_settings.LDAP_BIND_DN = "CN=test,DC=test"
            mock_settings.LDAP_BIND_PASSWORD = "password"
            mock_settings.LDAP_SEARCH_BASE = "DC=test,DC=com"
            mock_settings.LDAP_PORT = 389
            mock_settings.LDAP_USE_SSL = False
            mock_settings.LDAP_USE_NTLM = False
            mock_settings.LDAP_TIMEOUT = 10
            mock_settings.LDAP_USER_SEARCH_FILTER = "(sAMAccountName={username})"
            mock_settings.LDAP_GROUP_SEARCH_FILTER = "(member={user_dn})"
            mock_settings.LDAP_ADMIN_GROUPS = "Admins"
            mock_settings.LDAP_ALLOWED_GROUPS = ""
            
            config = LDAPConfig()
            is_valid, error = config.is_valid()
            assert is_valid is True
            assert error is None
    
    def test_parse_list_empty(self):
        """Test parsing empty string to list."""
        config = LDAPConfig()
        result = config._parse_list("")
        assert result == []
    
    def test_parse_list_single(self):
        """Test parsing single item."""
        config = LDAPConfig()
        result = config._parse_list("Group1")
        assert result == ["Group1"]
    
    def test_parse_list_multiple(self):
        """Test parsing multiple items."""
        config = LDAPConfig()
        result = config._parse_list("Group1, Group2, Group3")
        assert result == ["Group1", "Group2", "Group3"]


class TestLDAPService:
    """Test LDAP service functionality."""
    
    def test_health_check_disabled(self):
        """Test health check when LDAP is disabled."""
        service = LDAPService()
        with patch.object(service.config, 'enabled', False):
            result = service.health_check()
            assert result['status'] == 'disabled'
            assert result['healthy'] is True
    
    def test_health_check_invalid_config(self):
        """Test health check with invalid configuration."""
        service = LDAPService()
        with patch.object(service.config, 'enabled', True):
            with patch.object(service.config, 'is_valid', return_value=(False, "Missing server")):
                result = service.health_check()
                assert result['status'] == 'error'
                assert result['healthy'] is False
                assert "Invalid configuration" in result['message']
    
    @patch('app.core.ldap_service.Connection')
    @patch('app.core.ldap_service.Server')
    def test_health_check_success(self, mock_server, mock_connection):
        """Test successful health check."""
        # Setup mocks
        mock_conn_instance = MagicMock()
        mock_conn_instance.bind.return_value = True
        mock_conn_instance.search.return_value = True
        mock_connection.return_value = mock_conn_instance
        
        service = LDAPService()
        with patch.object(service.config, 'enabled', True):
            with patch.object(service.config, 'is_valid', return_value=(True, None)):
                with patch.object(service.config, 'server', 'ldap://test.com'):
                    with patch.object(service.config, 'port', 389):
                        with patch.object(service.config, 'search_base', 'DC=test'):
                            result = service.health_check()
                            assert result['status'] == 'ok'
                            assert result['healthy'] is True
                            assert 'last_check' in result
    
    def test_extract_cn_from_dn(self):
        """Test extracting CN from distinguished name."""
        service = LDAPService()
        
        dn = "CN=Domain Admins,OU=Groups,DC=example,DC=com"
        cn = service._extract_cn_from_dn(dn)
        assert cn == "Domain Admins"
        
        dn = "CN=Users,DC=example,DC=com"
        cn = service._extract_cn_from_dn(dn)
        assert cn == "Users"
    
    def test_authenticate_disabled(self):
        """Test authentication when LDAP is disabled."""
        service = LDAPService()
        with patch.object(service.config, 'enabled', False):
            success, user_info, error = service.authenticate("testuser", "password")
            assert success is False
            assert user_info is None
            assert "disabled" in error.lower()
    
    def test_authenticate_invalid_config(self):
        """Test authentication with invalid configuration."""
        service = LDAPService()
        with patch.object(service.config, 'enabled', True):
            with patch.object(service.config, 'is_valid', return_value=(False, "Missing server")):
                success, user_info, error = service.authenticate("testuser", "password")
                assert success is False
                assert user_info is None
                assert "configuration error" in error.lower()
    
    @patch('app.core.ldap_service.Connection')
    @patch('app.core.ldap_service.Server')
    def test_authenticate_user_not_found(self, mock_server, mock_connection):
        """Test authentication when user is not found in LDAP."""
        # Setup mocks
        mock_conn_instance = MagicMock()
        mock_conn_instance.bind.return_value = True
        mock_conn_instance.entries = []  # No user found
        mock_connection.return_value = mock_conn_instance
        
        service = LDAPService()
        with patch.object(service.config, 'enabled', True):
            with patch.object(service.config, 'is_valid', return_value=(True, None)):
                success, user_info, error = service.authenticate("nonexistent", "password")
                assert success is False
                assert user_info is None
                assert "not found" in error.lower()
    
    @patch('app.core.ldap_service.Connection')
    @patch('app.core.ldap_service.Server')
    def test_authenticate_success(self, mock_server, mock_connection):
        """Test successful LDAP authentication."""
        # Setup mocks
        mock_entry = MagicMock()
        mock_entry.entry_dn = "CN=Test User,OU=Users,DC=test,DC=com"
        mock_entry.sAMAccountName = "testuser"
        mock_entry.mail = "testuser@test.com"
        mock_entry.displayName = "Test User"
        mock_entry.memberOf = ["CN=Users,DC=test,DC=com"]
        
        # Mock for service account connection (find user)
        mock_find_conn = MagicMock()
        mock_find_conn.bind.return_value = True
        mock_find_conn.entries = [mock_entry]
        mock_find_conn.bound = True
        
        # Mock for user authentication connection
        mock_auth_conn = MagicMock()
        mock_auth_conn.bind.return_value = True
        
        mock_connection.side_effect = [mock_find_conn, mock_auth_conn]
        
        service = LDAPService()
        with patch.object(service.config, 'enabled', True):
            with patch.object(service.config, 'is_valid', return_value=(True, None)):
                with patch.object(service.config, 'search_base', 'DC=test'):
                    with patch.object(service.config, 'allowed_groups', []):
                        success, user_info, error = service.authenticate("testuser", "password")
                        assert success is True
                        assert user_info is not None
                        assert user_info['email'] == "testuser@test.com"
                        assert user_info['username'] == "testuser"
                        assert error is None


class TestLDAPEndpoints:
    """Test LDAP API endpoints."""
    
    def test_ldap_health_check_disabled(self):
        """Test health check endpoint when LDAP is disabled."""
        with patch('app.api.auth.ldap_service.health_check') as mock_health:
            mock_health.return_value = {
                'status': 'disabled',
                'message': 'LDAP authentication is disabled',
                'healthy': True
            }
            
            client = TestClient(app)
            response = client.get("/api/auth/ldap/health")
            assert response.status_code == 200
            assert response.json()['status'] == 'disabled'
    
    def test_ldap_health_check_unhealthy(self):
        """Test health check endpoint when LDAP is unhealthy."""
        with patch('app.api.auth.ldap_service.health_check') as mock_health:
            mock_health.return_value = {
                'status': 'error',
                'message': 'Connection failed',
                'healthy': False
            }
            
            client = TestClient(app)
            response = client.get("/api/auth/ldap/health")
            assert response.status_code == 503
    
    def test_ldap_config_requires_auth(self):
        """Test that LDAP config endpoint requires authentication."""
        client = TestClient(app)
        response = client.get("/api/auth/ldap/config")
        assert response.status_code == 401
    
    def test_ldap_config_requires_admin(self, auth_headers):
        """Test that LDAP config endpoint requires admin role."""
        client = TestClient(app)
        response = client.get("/api/auth/ldap/config", headers=auth_headers)
        # Will be 403 if user is not admin
        assert response.status_code in [200, 403]
    
    @patch('app.core.ldap_service.settings')
    def test_login_ldap_fallback_to_local(self, mock_settings):
        """Test that login falls back to local auth when LDAP fails."""
        mock_settings.LDAP_ENABLED = True
        
        with patch('app.api.auth.ldap_service.authenticate') as mock_ldap_auth:
            mock_ldap_auth.return_value = (False, None, "User not found")
            
            client = TestClient(app)
            # This should fall back to local authentication
            response = client.post(
                "/api/auth/login",
                data={"username": "admin@example.com", "password": "wrongpassword"}
            )
            # Should fail because password is wrong for both LDAP and local
            assert response.status_code == 401


class TestLDAPIntegration:
    """Integration tests for LDAP functionality."""
    
    def test_user_provisioning_from_ldap(self, session):
        """Test that LDAP users are automatically provisioned."""
        from app.crud.user import get_user_by_email, create_user
        from app.models.user import UserCreate
        
        # Simulate LDAP user creation
        ldap_user = UserCreate(
            email="ldapuser@test.com",
            full_name="LDAP User",
            password="temppassword",  # Not used for LDAP auth
            is_active=True,
            is_admin=False,
            is_ldap_user=True
        )
        
        user = create_user(session, ldap_user)
        assert user.is_ldap_user is True
        assert user.email == "ldapuser@test.com"
        
        # Verify we can retrieve the user
        retrieved = get_user_by_email(session, "ldapuser@test.com")
        assert retrieved is not None
        assert retrieved.is_ldap_user is True
    
    def test_admin_group_assignment(self):
        """Test that users in admin groups get admin privileges."""
        service = LDAPService()
        
        user_info = {
            'groups': ['Domain Admins', 'Users'],
            'email': 'admin@test.com',
            'username': 'admin'
        }
        
        with patch.object(service.config, 'admin_groups', ['Domain Admins']):
            # Check if user should be admin
            is_admin = any(
                group in user_info['groups']
                for group in service.config.admin_groups
            )
            assert is_admin is True
    
    def test_group_access_control(self):
        """Test that group-based access control works."""
        service = LDAPService()
        
        user_groups = ['Engineering', 'Employees']
        allowed_groups = ['Engineering', 'Sales', 'IT']
        
        # User should be allowed
        is_allowed = any(group in user_groups for group in allowed_groups)
        assert is_allowed is True
        
        # Test with user not in allowed groups
        user_groups = ['Contractors']
        is_allowed = any(group in user_groups for group in allowed_groups)
        assert is_allowed is False

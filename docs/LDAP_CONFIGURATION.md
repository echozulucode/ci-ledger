# LDAP/Active Directory Configuration Guide

## Overview

This application supports LDAP/Active Directory (AD) authentication, allowing users to log in with their corporate credentials. The system supports:

- **Dual authentication**: LDAP + local database users
- **Automatic user provisioning**: First-time LDAP users are automatically created
- **Group-based role assignment**: AD groups can grant admin privileges
- **Flexible configuration**: Works with various LDAP/AD setups
- **Health monitoring**: Built-in diagnostics for troubleshooting

## Architecture

### Authentication Flow

1. **User Login Request** → System checks if LDAP is enabled
2. **LDAP Authentication** (if enabled):
   - Service account binds to LDAP server
   - Searches for user by username or email
   - Verifies user credentials against LDAP
   - Retrieves user groups and attributes
3. **User Provisioning**:
   - If user exists in local DB: Update info from LDAP
   - If new user: Create local record with LDAP flag
   - Assign admin role based on group membership
4. **Fallback Authentication**: If LDAP fails, try local database
5. **JWT Token Issued**: User receives access token

### User Types

- **Internal Users**: Created directly in the application (e.g., `admin`)
  - Stored with `is_ldap_user = false`
  - Password managed locally
  - Always available (even if LDAP is down)

- **LDAP Users**: Authenticated against Active Directory
  - Stored with `is_ldap_user = true`
  - Password verified via LDAP (not stored locally)
  - Automatically provisioned on first login
  - Roles synced from AD groups

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable LDAP authentication
LDAP_ENABLED=true

# LDAP Server Configuration
LDAP_SERVER=dc.example.com
LDAP_PORT=389
LDAP_USE_SSL=false  # Set to true for LDAPS (port 636)
LDAP_USE_NTLM=false  # Set to true for NTLM auth (Windows AD)

# Service Account (for user lookup)
LDAP_BIND_DN=CN=ServiceAccount,OU=Service Accounts,DC=example,DC=com
LDAP_BIND_PASSWORD=SecurePassword123!

# Search Configuration
LDAP_SEARCH_BASE=OU=Users,DC=example,DC=com
LDAP_USER_SEARCH_FILTER=(sAMAccountName={username})
LDAP_GROUP_SEARCH_FILTER=(member={user_dn})

# Connection Settings
LDAP_TIMEOUT=10

# Role Assignment (comma-separated group names)
LDAP_ADMIN_GROUPS=Domain Admins,Application Admins,IT Administrators
LDAP_ALLOWED_GROUPS=  # Empty = all authenticated users allowed
```

### Configuration Examples

#### Example 1: Basic Active Directory Setup

```bash
LDAP_ENABLED=true
LDAP_SERVER=dc01.contoso.com
LDAP_PORT=389
LDAP_USE_SSL=false
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=contoso,DC=com
LDAP_BIND_PASSWORD=YourServicePassword
LDAP_SEARCH_BASE=DC=contoso,DC=com
LDAP_USER_SEARCH_FILTER=(sAMAccountName={username})
LDAP_ADMIN_GROUPS=Domain Admins
```

#### Example 2: Secure LDAP with SSL

```bash
LDAP_ENABLED=true
LDAP_SERVER=ldaps://dc01.contoso.com
LDAP_PORT=636
LDAP_USE_SSL=true
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=contoso,DC=com
LDAP_BIND_PASSWORD=YourServicePassword
LDAP_SEARCH_BASE=OU=Corporate Users,DC=contoso,DC=com
```

#### Example 3: Restricted Access by Group

```bash
LDAP_ENABLED=true
LDAP_SERVER=dc01.contoso.com
LDAP_PORT=389
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=contoso,DC=com
LDAP_BIND_PASSWORD=YourServicePassword
LDAP_SEARCH_BASE=DC=contoso,DC=com
LDAP_ADMIN_GROUPS=App Administrators
LDAP_ALLOWED_GROUPS=App Users,App Administrators,IT Staff
```

In this example:
- Only members of specified groups can log in
- Members of "App Administrators" group get admin privileges
- Other group members get standard user access

## Service Account Setup

### Creating an LDAP Service Account

1. **Open Active Directory Users and Computers**

2. **Create New User**:
   - Right-click on OU → New → User
   - Username: `svc_fastapi_app`
   - Set a strong password
   - Check "Password never expires"
   - Uncheck "User must change password at next logon"

3. **Set Permissions** (Minimum required):
   ```
   - Read access to user objects
   - Read memberOf attribute
   - Read mail attribute
   - Read displayName attribute
   ```

4. **Get Distinguished Name**:
   - Right-click user → Properties → Attribute Editor
   - Find `distinguishedName` attribute
   - Copy value (e.g., `CN=svc_fastapi_app,OU=Service Accounts,DC=contoso,DC=com`)

### PowerShell Commands

```powershell
# Create service account
New-ADUser -Name "svc_fastapi_app" `
    -SamAccountName "svc_fastapi_app" `
    -UserPrincipalName "svc_fastapi_app@contoso.com" `
    -Path "OU=Service Accounts,DC=contoso,DC=com" `
    -AccountPassword (ConvertTo-SecureString "YourPassword" -AsPlainText -Force) `
    -Enabled $true `
    -PasswordNeverExpires $true

# Verify creation
Get-ADUser -Identity "svc_fastapi_app" -Properties DistinguishedName
```

## Group-Based Access Control

### Admin Groups

Users who are members of groups listed in `LDAP_ADMIN_GROUPS` automatically receive admin privileges in the application.

```bash
LDAP_ADMIN_GROUPS=Domain Admins,Application Admins,IT Administrators
```

### Allowed Groups

To restrict access to specific AD groups, use `LDAP_ALLOWED_GROUPS`:

```bash
# Only these groups can log in
LDAP_ALLOWED_GROUPS=Engineering,Product,Design,IT
```

If `LDAP_ALLOWED_GROUPS` is empty, all authenticated LDAP users can log in.

## Testing and Troubleshooting

### Health Check Endpoint

Check LDAP connectivity:

```bash
curl http://localhost:8000/api/auth/ldap/health
```

Response when healthy:
```json
{
  "status": "ok",
  "message": "LDAP server is reachable and responding",
  "healthy": true,
  "server": "dc01.contoso.com",
  "port": 389,
  "ssl": false,
  "last_check": "2025-11-01T12:00:00"
}
```

Response when unhealthy:
```json
{
  "status": "error",
  "message": "Cannot connect to LDAP server: Connection refused",
  "healthy": false
}
```

### Configuration Endpoint (Admin Only)

View current LDAP configuration:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/auth/ldap/config
```

Response:
```json
{
  "enabled": true,
  "server": "dc01.contoso.com",
  "port": 389,
  "use_ssl": false,
  "use_ntlm": false,
  "bind_dn": "CN=svc_app,OU=Service Accounts,DC=contoso,DC=com",
  "search_base": "DC=contoso,DC=com",
  "user_search_filter": "(sAMAccountName={username})",
  "admin_groups": ["Domain Admins", "Application Admins"],
  "allowed_groups": [],
  "timeout": 10
}
```

### Common Issues and Solutions

#### Issue 1: Cannot Connect to LDAP Server

**Error**: `Cannot connect to LDAP server: Connection refused`

**Solutions**:
- Verify `LDAP_SERVER` is correct and reachable
- Check firewall allows port 389 (LDAP) or 636 (LDAPS)
- Try with IP address instead of hostname
- Verify DNS resolution: `nslookup dc01.contoso.com`

```bash
# Test connectivity
telnet dc01.contoso.com 389
# Or with PowerShell
Test-NetConnection -ComputerName dc01.contoso.com -Port 389
```

#### Issue 2: Service Account Bind Failed

**Error**: `LDAP bind failed (check service account credentials)`

**Solutions**:
- Verify `LDAP_BIND_DN` format is correct (Distinguished Name)
- Check `LDAP_BIND_PASSWORD` is correct
- Ensure service account is not locked or disabled
- Verify account has not expired
- Check password hasn't expired

```powershell
# Check account status
Get-ADUser -Identity svc_fastapi_app -Properties LockedOut, Enabled, PasswordExpired

# Unlock if needed
Unlock-ADAccount -Identity svc_fastapi_app

# Reset password
Set-ADAccountPassword -Identity svc_fastapi_app -Reset
```

#### Issue 3: User Not Found

**Error**: `User not found in directory`

**Solutions**:
- Verify `LDAP_SEARCH_BASE` includes the user's OU
- Check `LDAP_USER_SEARCH_FILTER` matches your AD schema
- Try searching with email instead of username
- Verify user exists in AD: `Get-ADUser -Identity username`

```bash
# Common search filters:
LDAP_USER_SEARCH_FILTER=(sAMAccountName={username})  # For username
LDAP_USER_SEARCH_FILTER=(mail={username})            # For email
LDAP_USER_SEARCH_FILTER=(userPrincipalName={username})  # For UPN
```

#### Issue 4: Invalid Credentials

**Error**: `Invalid credentials`

**Solutions**:
- User is entering wrong password
- User account may be locked in AD
- Password may have expired
- Account may be disabled

```powershell
# Check user status
Get-ADUser -Identity username -Properties Enabled, LockedOut, PasswordExpired

# Unlock user
Unlock-ADAccount -Identity username
```

#### Issue 5: Group Membership Not Working

**Symptom**: User can log in but doesn't get admin privileges

**Solutions**:
- Verify group names in `LDAP_ADMIN_GROUPS` exactly match AD groups
- Check case sensitivity
- Verify user is a direct member of the group
- Check nested groups (currently not supported - user must be direct member)

```powershell
# Check user's groups
Get-ADUser -Identity username -Properties MemberOf | Select-Object -ExpandProperty MemberOf

# Add user to group
Add-ADGroupMember -Identity "Application Admins" -Members username
```

#### Issue 6: SSL/TLS Certificate Errors

**Error**: `SSL certificate verification failed`

**Solutions**:
- Install CA certificate on application server
- For testing only: Disable certificate validation (not recommended for production)
- Use LDAP (port 389) instead of LDAPS if certificate issues persist

### Enabling Debug Logging

Add to your logging configuration:

```python
import logging
logging.getLogger('ldap3').setLevel(logging.DEBUG)
logging.getLogger('app.core.ldap_service').setLevel(logging.DEBUG)
```

Or set environment variable:
```bash
export PYTHONUNBUFFERED=1
export LOG_LEVEL=DEBUG
```

## Testing LDAP Integration

### Manual Test

1. **Enable LDAP**:
   ```bash
   LDAP_ENABLED=true
   ```

2. **Test with ldapsearch** (if available):
   ```bash
   ldapsearch -x -H ldap://dc01.contoso.com \
     -D "CN=svc_app,OU=Service Accounts,DC=contoso,DC=com" \
     -w "password" \
     -b "DC=contoso,DC=com" \
     "(sAMAccountName=testuser)"
   ```

3. **Test through application**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=testuser&password=testpass"
   ```

### Automated Testing

Python test script:

```python
import requests

# Test LDAP health
health = requests.get('http://localhost:8000/api/auth/ldap/health')
print(f"LDAP Health: {health.json()}")

# Test login
login_data = {
    'username': 'testuser',
    'password': 'testpassword'
}
response = requests.post(
    'http://localhost:8000/api/auth/login',
    data=login_data
)
print(f"Login Status: {response.status_code}")
print(f"Response: {response.json()}")
```

## Security Best Practices

### 1. Service Account Security

- ✅ Use a dedicated service account (not a personal account)
- ✅ Grant minimum required permissions (read-only)
- ✅ Use a strong, unique password
- ✅ Rotate service account password regularly
- ✅ Monitor service account for unusual activity
- ✅ Never commit passwords to source control

### 2. Connection Security

- ✅ Use LDAPS (SSL/TLS) for production: `LDAP_USE_SSL=true`
- ✅ Validate SSL certificates
- ✅ Use private network connections when possible
- ✅ Implement connection timeouts
- ✅ Use firewall rules to restrict access

### 3. Access Control

- ✅ Use `LDAP_ALLOWED_GROUPS` to restrict access
- ✅ Regularly review group memberships
- ✅ Implement the principle of least privilege
- ✅ Monitor failed authentication attempts
- ✅ Audit admin group assignments

### 4. Configuration Management

- ✅ Store credentials in environment variables or secrets manager
- ✅ Use different service accounts for dev/staging/prod
- ✅ Implement configuration validation
- ✅ Document your LDAP setup
- ✅ Test LDAP configuration changes in non-production first

## Migration Strategy

### Migrating from Local Auth to LDAP

1. **Enable LDAP alongside local auth** (dual mode):
   ```bash
   LDAP_ENABLED=true
   ```

2. **Test with a pilot group**:
   - Have test users log in with LDAP credentials
   - Verify group memberships work correctly
   - Check admin privileges assignment

3. **User Communication**:
   - Notify users they can now use corporate credentials
   - Provide instructions for first-time login
   - Explain what to do if they have issues

4. **Keep admin account local**:
   - Maintain at least one local admin account
   - Use for emergency access if LDAP is unavailable

5. **Monitor and adjust**:
   - Watch logs for authentication failures
   - Adjust search filters if needed
   - Fine-tune group mappings

### Fallback Strategy

The application automatically falls back to local authentication if:
- LDAP server is unreachable
- LDAP authentication fails
- User exists in local database

This ensures:
- Local admin account always works
- Service remains available during LDAP outages
- Smooth transition during migration

## Performance Considerations

### Connection Pooling

The LDAP service maintains a single server connection that is reused for efficiency.

### Caching (Future Enhancement)

Consider implementing caching for:
- User group memberships (TTL: 5-15 minutes)
- LDAP health check results (TTL: 5 minutes)
- User attributes (TTL: 1 hour)

### Load Balancing

For high availability:
- Configure multiple LDAP servers (round-robin DNS)
- Implement retry logic
- Monitor LDAP server health
- Use LDAP replicas for read operations

## Support and Maintenance

### Regular Tasks

- **Weekly**: Review failed authentication logs
- **Monthly**: Verify service account permissions
- **Quarterly**: Test LDAP failover/fallback
- **Annually**: Rotate service account password

### Monitoring Metrics

Track these metrics:
- LDAP authentication success/failure rate
- LDAP server response time
- Number of active LDAP vs local users
- Failed login attempts by user
- Service account lockout events

### Getting Help

If you encounter issues:

1. Check the health endpoint: `/api/auth/ldap/health`
2. Review application logs (enable DEBUG level)
3. Verify configuration with: `/api/auth/ldap/config`
4. Test LDAP connectivity from server (ldapsearch, telnet)
5. Consult your AD administrator
6. Review this documentation

## References

- [LDAP3 Python Documentation](https://ldap3.readthedocs.io/)
- [Active Directory LDAP Syntax Filters](https://docs.microsoft.com/en-us/windows/win32/adsi/search-filter-syntax)
- [LDAP Distinguished Names](https://ldap.com/ldap-dns-and-rdns/)
- [Active Directory Best Practices](https://docs.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/)

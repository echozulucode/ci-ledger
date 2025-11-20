# LDAP Quick Start Guide

## TL;DR - Get LDAP Working in 5 Minutes

### 1. Configure Environment Variables

Add to your `.env` file:

```bash
# Enable LDAP
LDAP_ENABLED=true

# Your Active Directory server
LDAP_SERVER=dc01.yourcompany.com
LDAP_PORT=389

# Service account for user lookups
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=yourcompany,DC=com
LDAP_BIND_PASSWORD=YourServiceAccountPassword

# Where to search for users
LDAP_SEARCH_BASE=DC=yourcompany,DC=com

# AD groups that grant admin privileges (comma-separated)
LDAP_ADMIN_GROUPS=Domain Admins,Application Admins
```

### 2. Test LDAP Connection

```bash
curl http://localhost:8000/api/auth/ldap/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "LDAP server is reachable and responding",
  "healthy": true
}
```

### 3. Test Login

Users can now log in with their corporate credentials:
- Username: Their AD username (e.g., `jsmith`)
- Password: Their AD password

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=jsmith&password=theirpassword"
```

### 4. Done! 🎉

- LDAP users are automatically created in the local database on first login
- Users in configured admin groups get admin privileges automatically
- Local auth still works as fallback (your admin account is safe)

---

## Common Issues & Quick Fixes

### "Cannot connect to LDAP server"

**Check connectivity:**
```powershell
Test-NetConnection -ComputerName dc01.yourcompany.com -Port 389
```

**Fix:** Update `LDAP_SERVER` or check firewall rules.

### "LDAP bind failed"

**Check service account:**
```powershell
Get-ADUser -Identity svc_app -Properties LockedOut, Enabled
```

**Fix:** Verify `LDAP_BIND_DN` and `LDAP_BIND_PASSWORD` are correct.

### "User not found in directory"

**Check search base:**
```powershell
Get-ADUser -Identity username -Properties DistinguishedName
```

**Fix:** Ensure `LDAP_SEARCH_BASE` includes the user's OU.

### User can log in but isn't admin

**Check group membership:**
```powershell
Get-ADUser -Identity username -Properties MemberOf | Select -ExpandProperty MemberOf
```

**Fix:** 
- Add user to admin group, OR
- Update `LDAP_ADMIN_GROUPS` to include their group

---

## Configuration Templates

### Standard Active Directory Setup

```bash
LDAP_ENABLED=true
LDAP_SERVER=dc01.contoso.com
LDAP_PORT=389
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=contoso,DC=com
LDAP_BIND_PASSWORD=SecurePassword123!
LDAP_SEARCH_BASE=DC=contoso,DC=com
LDAP_ADMIN_GROUPS=Domain Admins
```

### Secure LDAP (SSL) Setup

```bash
LDAP_ENABLED=true
LDAP_SERVER=ldaps://dc01.contoso.com
LDAP_PORT=636
LDAP_USE_SSL=true
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=contoso,DC=com
LDAP_BIND_PASSWORD=SecurePassword123!
LDAP_SEARCH_BASE=DC=contoso,DC=com
```

### Restricted Access by Group

```bash
LDAP_ENABLED=true
LDAP_SERVER=dc01.contoso.com
LDAP_PORT=389
LDAP_BIND_DN=CN=svc_app,OU=Service Accounts,DC=contoso,DC=com
LDAP_BIND_PASSWORD=SecurePassword123!
LDAP_SEARCH_BASE=DC=contoso,DC=com
LDAP_ADMIN_GROUPS=App Administrators
LDAP_ALLOWED_GROUPS=App Users,App Administrators,IT Staff
```

---

## Testing Checklist

- [ ] Health check returns "ok": `/api/auth/ldap/health`
- [ ] Regular user can log in with AD credentials
- [ ] User appears in Users admin page after first login
- [ ] Admin group member gets admin privileges automatically
- [ ] Non-allowed group member is denied (if using ALLOWED_GROUPS)
- [ ] Local admin account still works
- [ ] LDAP users see their full name from AD

---

## Security Checklist

- [ ] Service account has minimum required permissions (read-only)
- [ ] Service account password is strong and unique
- [ ] LDAP credentials are in `.env` file (not committed to git)
- [ ] Using LDAPS (SSL) for production
- [ ] `LDAP_ALLOWED_GROUPS` configured to restrict access
- [ ] Admin groups are reviewed and appropriate
- [ ] Regular password rotation scheduled for service account

---

## Admin Commands Reference

### Check LDAP Status
```bash
curl http://localhost:8000/api/auth/ldap/health
```

### View LDAP Config (requires admin token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/auth/ldap/config
```

### Test User Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=testuser&password=testpass"
```

### Check User's AD Groups
```powershell
Get-ADUser -Identity username -Properties MemberOf | 
  Select -ExpandProperty MemberOf
```

### Verify Service Account
```powershell
Get-ADUser -Identity svc_app -Properties *
```

---

## Support Resources

- **Full Documentation**: See `docs/LDAP_CONFIGURATION.md`
- **Health Endpoint**: `GET /api/auth/ldap/health`
- **Config Endpoint**: `GET /api/auth/ldap/config` (admin only)
- **Application Logs**: Check for `ldap_service` log entries

---

## Key Features

✅ **Dual Authentication**: LDAP + local database users coexist  
✅ **Auto-Provisioning**: LDAP users created automatically on first login  
✅ **Group-Based Roles**: AD groups automatically grant admin privileges  
✅ **Access Control**: Restrict access to specific AD groups  
✅ **Fallback**: Local auth works even if LDAP is down  
✅ **Troubleshooting**: Built-in health checks and diagnostics  
✅ **Secure**: Supports LDAPS, NTLM, and configurable timeouts  

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Test health endpoint
3. ✅ Test with a pilot user
4. 📝 Document your specific AD structure
5. 📝 Train users on new login process
6. 📊 Monitor logs for authentication issues
7. 🔄 Schedule regular service account password rotation

---

**Need Help?** See the full documentation at `docs/LDAP_CONFIGURATION.md` for detailed troubleshooting, configuration examples, and best practices.

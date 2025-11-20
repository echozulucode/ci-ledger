# FastAPI Intranet Demo - Administrator Guide

## Overview

This guide is for system administrators who manage the FastAPI Intranet Demo application. It covers user management, system configuration, security, and maintenance tasks.

## Table of Contents

1. [Admin Access](#admin-access)
2. [User Management](#user-management)
3. [System Configuration](#system-configuration)
4. [Security Management](#security-management)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Admin Access

### Default Admin Account

**Initial Credentials** (configured in `.env`):
- **Email**: Set in `FIRST_SUPERUSER_EMAIL`
- **Password**: Set in `FIRST_SUPERUSER_PASSWORD`

⚠️ **CRITICAL**: Change the default password immediately after initial setup!

### Admin Privileges

Administrators can:
- ✅ View and manage all users
- ✅ Create, edit, and delete user accounts
- ✅ Activate/deactivate users
- ✅ Promote users to admin role
- ✅ View all items (across all users)
- ✅ Access admin-only API endpoints
- ✅ Generate system reports (if implemented)

### Verifying Admin Status

1. Log in to the application
2. Check for "Admin" badge next to your name
3. Verify "Admin" section appears in sidebar navigation
4. Access `/admin/users` endpoint in API documentation

---

## User Management

### Viewing All Users

1. Navigate to **Admin** → **Users**
2. View complete user list with:
   - Full Name
   - Email
   - Status (Active/Inactive)
   - Role (Admin/User)
   - Registration Date

### Creating New Users

**Via Web UI**:
1. Go to **Admin** → **Users**
2. Click **"Add User"** button
3. Fill in required information:
   ```
   - Email (required, must be unique)
   - Password (required, min 8 chars)
   - Full Name (required)
   - Is Active (default: true)
   - Is Admin (default: false)
   ```
4. Click **"Create User"**

**Via API**:
```bash
http POST :8000/api/admin/users \
  "Authorization: Bearer ADMIN_TOKEN" \
  email=newuser@example.com \
  password=SecurePass123! \
  full_name="New User" \
  is_active=true \
  is_admin=false
```

### Editing User Accounts

**Update User Profile**:
1. Find user in list
2. Click **"Edit"** button
3. Modify:
   - Full Name
   - Email
   - Active status
   - Admin role
4. Click **"Save Changes"**

**Reset User Password**:
1. Edit user account
2. Enter new password in password field
3. Leave password field empty to keep existing password
4. Click **"Save"**

**Promote to Admin**:
1. Edit user account
2. Check **"Is Admin"** checkbox
3. Click **"Save Changes"**
4. User immediately gains admin privileges

**Demote from Admin**:
1. Edit user account
2. Uncheck **"Is Admin"** checkbox
3. Click **"Save Changes"**
4. User loses admin privileges

⚠️ **Warning**: Ensure at least one active admin account exists at all times!

### Deactivating/Activating Users

**Deactivate User**:
1. Find user in list
2. Click **"Deactivate"** button
3. User cannot log in but account data is preserved
4. Existing sessions are invalidated

**Reactivate User**:
1. Find deactivated user
2. Click **"Activate"** button
3. User can log in again

### Deleting User Accounts

⚠️ **Warning**: Deletion is permanent and cannot be undone!

1. Find user in list
2. Click **"Delete"** button
3. Confirm deletion in dialog
4. User account and all associated data are permanently removed

**Data Deleted**:
- User account
- Personal access tokens
- User's items
- Session data

### Searching and Filtering

**Search Users**:
- Use search box to filter by name or email
- Search is case-insensitive
- Results update in real-time

**Filter by Status**:
- Active users only
- Inactive users only
- All users (default)

**Filter by Role**:
- Admin users only
- Regular users only
- All users (default)

---

## System Configuration

### Environment Variables

Key configuration settings in `.env` file:

#### Application Settings
```bash
APP_NAME="FastAPI Intranet Demo"
APP_VERSION="1.0.0"
ENVIRONMENT="development"  # or "production"
```

#### Security Settings
```bash
SECRET_KEY="your-secret-key-here"  # Change in production!
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

#### Database
```bash
DATABASE_URL="sqlite:///./app.db"  # Development
# DATABASE_URL="mssql+pyodbc://..." # Production SQL Server
```

#### CORS Settings
```bash
BACKEND_CORS_ORIGINS='["http://localhost:3000","http://localhost:5173"]'
```

#### Admin Account
```bash
FIRST_SUPERUSER_EMAIL="admin@example.com"
FIRST_SUPERUSER_PASSWORD="changethis"  # CHANGE THIS!
```

#### LDAP (Optional)
```bash
LDAP_SERVER="ldap://your-dc.example.com"
LDAP_PORT=389
LDAP_BASE_DN="dc=example,dc=com"
LDAP_SEARCH_BASE="ou=users,dc=example,dc=com"
LDAP_BIND_DN="cn=admin,dc=example,dc=com"
LDAP_BIND_PASSWORD="ldap-password"
LDAP_USER_ATTRIBUTE="sAMAccountName"
```

### Security Configuration

**Update Secret Key**:
```python
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add to `.env`:
```bash
SECRET_KEY="generated-secure-key-here"
```

**Configure Token Expiration**:
```bash
# Shorter = more secure, but users login more frequently
ACCESS_TOKEN_EXPIRE_MINUTES=30  # Default

# For high-security environments
ACCESS_TOKEN_EXPIRE_MINUTES=15

# For convenience (not recommended)
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Database Management

**Development (SQLite)**:
```bash
# Database file location
./app.db

# Backup database
cp app.db app.db.backup

# Reset database (WARNING: Deletes all data)
rm app.db
# Restart application to recreate
```

**Production (SQL Server)**:
```bash
# Configure connection string
DATABASE_URL="mssql+pyodbc://user:password@server/database?driver=ODBC+Driver+17+for+SQL+Server"
```

**Run Migrations**:
```bash
cd backend
alembic upgrade head
```

**Create Migration**:
```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

---

## Security Management

### Password Policies

**Current Requirements**:
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Special characters recommended

**Enforce Stronger Policies** (modify in `app/core/security.py`):
```python
MIN_PASSWORD_LENGTH = 12  # Increase from 8
REQUIRE_SPECIAL_CHARS = True
REQUIRE_NUMBERS = True
```

### Token Management

**Monitor Active Tokens**:
```bash
# Via API - get all users' tokens (admin only)
http GET :8000/api/admin/tokens \
  "Authorization: Bearer ADMIN_TOKEN"
```

**Revoke User's Tokens** (via database):
```sql
-- SQLite
DELETE FROM token WHERE user_id = <user_id>;

-- Or set all to expired
UPDATE token 
SET expires_at = datetime('now') 
WHERE user_id = <user_id>;
```

### Session Management

**Force Logout All Users**:
```bash
# Change SECRET_KEY in .env and restart application
# All existing JWT tokens become invalid
```

**Invalidate Specific User**:
- Deactivate user account
- All their sessions immediately invalidate

### Security Auditing

**Review User Activity**:
1. Check user login times
2. Monitor failed login attempts
3. Review token creation/usage
4. Track administrative actions

**Log Files** (if configured):
```bash
# Application logs
tail -f logs/app.log

# Access logs
tail -f logs/access.log

# Error logs
tail -f logs/error.log
```

---

## Monitoring & Maintenance

### Health Checks

**Application Health**:
```bash
# Basic health check
http GET :8000/health

# Expected response
{
  "status": "healthy",
  "app": "FastAPI Intranet Demo",
  "version": "1.0.0"
}
```

**Database Health**:
```bash
# Test database connection
http GET :8000/api/admin/users?limit=1 \
  "Authorization: Bearer ADMIN_TOKEN"
```

### Backup Procedures

**Database Backups**:
```bash
# SQLite (development)
cp app.db "backups/app_$(date +%Y%m%d_%H%M%S).db"

# SQL Server (production)
# Use SQL Server Management Studio or T-SQL
BACKUP DATABASE [YourDatabase] 
TO DISK = 'C:\Backups\YourDatabase.bak'
WITH COMPRESSION;
```

**Configuration Backups**:
```bash
# Backup environment file (without secrets)
cp .env .env.backup

# Backup entire configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

### Update Procedures

**Application Updates**:
```bash
# 1. Backup database and configuration
cp app.db app.db.backup

# 2. Pull latest code
git pull origin main

# 3. Update backend dependencies
cd backend
pip install -r requirements.txt

# 4. Run database migrations
alembic upgrade head

# 5. Update frontend dependencies
cd ../frontend
npm install
npm run build

# 6. Restart application
docker-compose down
docker-compose up -d
```

**Dependency Updates**:
```bash
# Check for outdated packages
pip list --outdated

# Update specific package
pip install --upgrade package-name

# Update all (careful!)
pip install --upgrade -r requirements.txt
```

### Performance Monitoring

**Key Metrics to Monitor**:
- Response time (target: <200ms)
- Database query time
- CPU usage
- Memory usage
- Disk space
- Active user sessions
- API request rate

**Database Optimization**:
```bash
# SQLite
sqlite3 app.db "VACUUM;"
sqlite3 app.db "ANALYZE;"

# Check database size
ls -lh app.db
```

---

## Troubleshooting

### Common Issues

#### Users Can't Login

**Check**:
1. User account is active
2. Password is correct
3. No database connection issues
4. Logs for failed authentication attempts

**Solution**:
```bash
# Reset user password
http PUT :8000/api/admin/users/{user_id} \
  "Authorization: Bearer ADMIN_TOKEN" \
  password="NewTempPassword123!"
```

#### Database Connection Errors

**Check**:
1. Database server is running
2. Connection string is correct
3. Network connectivity
4. Firewall rules

**Solution**:
```bash
# Test database connection
python -c "from app.core.database import engine; engine.connect()"
```

#### High Memory Usage

**Check**:
1. Number of active sessions
2. Database size
3. Log file sizes
4. Memory leaks

**Solution**:
```bash
# Restart application
docker-compose restart

# Clean up logs
find logs/ -name "*.log" -mtime +30 -delete
```

#### API Errors (500)

**Check**:
1. Application logs
2. Database errors
3. Configuration issues

**Solution**:
```bash
# View recent errors
tail -100 logs/error.log

# Check application status
docker-compose ps
docker-compose logs backend
```

### Emergency Procedures

**Complete System Reset**:
```bash
# 1. Backup everything
cp app.db app.db.emergency_backup
tar -czf emergency_backup.tar.gz .

# 2. Stop application
docker-compose down

# 3. Reset database (WARNING: All data lost!)
rm app.db

# 4. Reset configuration
cp .env.example .env
# Edit .env with correct values

# 5. Restart
docker-compose up -d
```

**Recover from Backup**:
```bash
# 1. Stop application
docker-compose down

# 2. Restore database
cp backups/app_20251101_120000.db app.db

# 3. Restart application
docker-compose up -d
```

---

## Best Practices

### Security

1. ✅ Change default admin password immediately
2. ✅ Use strong, unique SECRET_KEY
3. ✅ Enable HTTPS in production
4. ✅ Regularly update dependencies
5. ✅ Monitor failed login attempts
6. ✅ Regularly audit user accounts
7. ✅ Remove unused admin accounts
8. ✅ Implement regular security audits
9. ✅ Keep only necessary data
10. ✅ Use environment variables for secrets

### User Management

1. ✅ Create users with minimal necessary privileges
2. ✅ Regularly review admin accounts
3. ✅ Deactivate users rather than delete (when appropriate)
4. ✅ Document admin actions
5. ✅ Maintain at least 2 active admin accounts
6. ✅ Use descriptive full names
7. ✅ Validate email addresses
8. ✅ Enforce password policies

### System Maintenance

1. ✅ Schedule regular backups (daily recommended)
2. ✅ Test backup restoration quarterly
3. ✅ Monitor disk space
4. ✅ Rotate log files
5. ✅ Update dependencies monthly
6. ✅ Review performance metrics weekly
7. ✅ Document configuration changes
8. ✅ Maintain change log
9. ✅ Test in staging before production
10. ✅ Have rollback plan ready

### Operations

1. ✅ Document all administrative procedures
2. ✅ Maintain runbooks for common tasks
3. ✅ Log all administrative actions
4. ✅ Communicate maintenance windows
5. ✅ Keep stakeholders informed
6. ✅ Train backup administrators
7. ✅ Document escalation procedures
8. ✅ Maintain vendor contacts
9. ✅ Regular security training
10. ✅ Stay updated on security advisories

---

## Useful Commands

### Docker Management

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart
docker-compose restart backend

# Rebuild containers
docker-compose up -d --build

# Stop all services
docker-compose down

# Remove volumes (WARNING: Data loss)
docker-compose down -v
```

### Database Commands

```bash
# Access database
sqlite3 app.db

# Dump database
sqlite3 app.db .dump > backup.sql

# Restore database
sqlite3 app.db < backup.sql

# Check tables
sqlite3 app.db ".tables"

# Query users
sqlite3 app.db "SELECT id, email, is_admin, is_active FROM user;"
```

### API Testing

```bash
# Test as admin
http GET :8000/api/admin/users \
  "Authorization: Bearer ADMIN_TOKEN"

# Test health
http GET :8000/health

# View API docs
# Open browser to http://localhost:8000/docs
```

---

## Support Contacts

- **Technical Issues**: [Your IT Support]
- **Security Concerns**: [Your Security Team]
- **Application Issues**: [Development Team]
- **Emergency**: [Emergency Contact]

---

## Additional Resources

- **API Documentation**: `/docs` and `/redoc`
- **User Guide**: See `USER_GUIDE.md`
- **API Guide**: See `API_GUIDE.md`
- **Project Repository**: [GitHub/GitLab URL]

---

**Version**: 1.0  
**Last Updated**: 2025-11-01  
**Document Owner**: System Administrator

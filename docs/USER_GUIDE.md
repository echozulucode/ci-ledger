# FastAPI Intranet Demo - User Guide

## Welcome!

This guide will help you navigate and use the FastAPI Intranet Demo application effectively.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Account Management](#user-account-management)
3. [Personal Access Tokens](#personal-access-tokens)
4. [Managing Items](#managing-items)
5. [Admin Features](#admin-features)
6. [Troubleshooting](#troubleshooting)
7. [FAQ](#faq)

---

## Getting Started

### First Time Login

**Default Admin Credentials** (for demo/testing):
- **Email**: `admin@example.com`
- **Password**: `changethis`

⚠️ **Important**: Change the default password immediately after first login!

### Registering a New Account

1. Navigate to the application homepage
2. Click **"Register"** or **"Sign Up"**
3. Fill in the registration form:
   - **Email**: Your valid email address
   - **Password**: Strong password (min 8 characters, includes uppercase, lowercase, and number)
   - **Full Name**: Your display name
4. Click **"Register"**
5. You'll be automatically logged in after successful registration

### Logging In

1. Go to the login page
2. Enter your **email** and **password**
3. Click **"Login"**
4. You'll be redirected to the dashboard

### Logging Out

1. Click your name in the sidebar (top right)
2. Click **"Logout"**
3. Your session will end and you'll return to the login page

---

## User Account Management

### Viewing Your Profile

1. Click **"Profile"** in the sidebar navigation
2. You'll see your account information:
   - Full Name
   - Email
   - Account Status
   - Admin Status

### Updating Your Profile

1. Go to **Profile** page
2. Click **"Edit Profile"** button
3. Update your **Full Name**
4. Click **"Save Changes"**
5. You'll see a success message

### Changing Your Password

1. Go to **Profile** page
2. Scroll to **"Change Password"** section
3. Enter:
   - **Current Password**: Your existing password
   - **New Password**: Your new secure password
   - **Confirm New Password**: Re-enter new password
4. Click **"Change Password"**
5. Your password will be updated immediately

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (recommended)

---

## Personal Access Tokens

Personal Access Tokens (PATs) allow you to access the API programmatically without using your password.

### When to Use PATs

- Automated scripts
- CI/CD pipelines
- API testing tools
- Integration with other applications

### Creating a Token

1. Click **"API Tokens"** in the sidebar
2. Click **"Create New Token"** button
3. Fill in the token details:
   - **Token Name**: Descriptive name (e.g., "CI/CD Pipeline")
   - **Scopes**: Select permissions:
     - **Read**: View data
     - **Write**: Create/update data
     - **Admin**: Administrative operations (admin users only)
   - **Expires In**: Choose expiration period (30, 90, 365 days, or never)
4. Click **"Generate Token"**
5. **IMPORTANT**: Copy the token immediately! It won't be shown again.

### Using Your Token

Once created, use the token to authenticate API requests:

```bash
# Example with HTTPie
http GET http://localhost:8000/api/items \
  "Authorization: Bearer YOUR_TOKEN_HERE"

# Example with curl
curl http://localhost:8000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Managing Tokens

**View Active Tokens**:
1. Go to **"API Tokens"** page
2. See all your active tokens with:
   - Token name
   - Scopes
   - Created date
   - Expiration date
   - Last used date

**Revoke a Token**:
1. Find the token you want to revoke
2. Click **"Revoke"** button
3. Confirm the action
4. The token will be immediately invalidated

⚠️ **Security Best Practices**:
- Never share your tokens
- Use minimal required scopes
- Set expiration dates
- Rotate tokens regularly
- Revoke unused tokens
- Store tokens securely (environment variables, secrets managers)

---

## Managing Items

The Items feature demonstrates a typical CRUD (Create, Read, Update, Delete) workflow.

### Viewing Items

1. Click **"Items"** in the sidebar
2. You'll see your items displayed as cards
3. Each card shows:
   - Title
   - Description
   - Status badge (Active, Completed, Archived)
   - Creation date
   - Last updated date

### Creating an Item

1. Go to **Items** page
2. Click **"Create New Item"** button
3. Fill in the form:
   - **Title**: Item name (required)
   - **Description**: Detailed description (required)
   - **Status**: Active, Completed, or Archived
4. Click **"Create Item"**
5. The new item appears in your list

### Editing an Item

1. Find the item you want to edit
2. Click **"Edit"** button on the item card
3. Modify the fields
4. Click **"Save Changes"**
5. Changes are saved immediately

### Deleting an Item

1. Find the item you want to delete
2. Click **"Delete"** button
3. Confirm the deletion in the popup
4. The item is permanently removed

⚠️ **Note**: You can only manage your own items. Admins can see all items with the "Show All Items" option.

---

## Admin Features

If you're an administrator, you have additional capabilities:

### User Management

1. Click **"Admin"** → **"Users"** in the sidebar
2. You'll see all registered users

**View User List**:
- Search users by name or email
- Filter by status (Active/Inactive)
- Filter by role (Admin/User)

**Create New User**:
1. Click **"Add User"** button
2. Fill in user details:
   - Email
   - Password
   - Full Name
   - Is Active (checkbox)
   - Is Admin (checkbox)
3. Click **"Create User"**

**Edit User**:
1. Find the user in the list
2. Click **"Edit"** button
3. Modify user information
4. Can promote user to admin or change status
5. Click **"Save"**

**Delete User**:
1. Find the user in the list
2. Click **"Delete"** button
3. Confirm deletion
4. User account is permanently removed

**Activate/Deactivate User**:
1. Find the user
2. Click **"Deactivate"** or **"Activate"** button
3. User's status changes immediately
4. Inactive users cannot log in

### Viewing All Items

As an admin, you can view all users' items:

1. Go to **Items** page
2. Toggle **"Show All Items"** switch
3. You'll see items from all users
4. Each item shows the owner's name

---

## Troubleshooting

### Can't Login

**Problem**: Login fails with "Invalid credentials"

**Solutions**:
1. Verify your email and password are correct
2. Check if Caps Lock is on
3. Try resetting your password (if feature is enabled)
4. Contact your administrator if account is deactivated

### Forgot Password

**Problem**: Can't remember password

**Solutions**:
1. Use the "Forgot Password" link on login page (if enabled)
2. Contact your administrator to reset your password
3. Admin can update your password in User Management

### Token Not Working

**Problem**: API requests return 401 Unauthorized

**Solutions**:
1. Verify the token is correctly copied (no extra spaces)
2. Check if token has expired
3. Ensure you're using `Bearer` prefix: `Authorization: Bearer YOUR_TOKEN`
4. Verify the token hasn't been revoked
5. Create a new token if necessary

### Can't Create/Edit Items

**Problem**: Getting permission errors

**Solutions**:
1. Ensure you're logged in
2. Check your account is active
3. Verify you have write scope if using a PAT
4. Contact admin if issues persist

### Page Not Loading

**Problem**: Application not responding

**Solutions**:
1. Refresh the page (F5 or Ctrl+R)
2. Clear browser cache and cookies
3. Try a different browser
4. Check your internet connection
5. Contact IT support if server is down

---

## FAQ

### General Questions

**Q: What browsers are supported?**  
A: Modern browsers including Chrome, Firefox, Safari, and Edge (latest 2 versions).

**Q: Is my data secure?**  
A: Yes! Passwords are hashed using Argon2, and all API communication can use HTTPS in production.

**Q: Can I use the API from mobile apps?**  
A: Yes! Use Personal Access Tokens to authenticate from any application.

**Q: How long do JWT tokens last?**  
A: JWT tokens expire after 30 minutes of inactivity. You'll be automatically logged out.

**Q: How long do Personal Access Tokens last?**  
A: PATs last until their expiration date (30, 90, 365 days, or never) or until manually revoked.

### Account Management

**Q: Can I change my email address?**  
A: Currently, email changes require admin intervention. Contact your administrator.

**Q: What if I forget my password?**  
A: Use the "Forgot Password" feature or contact your administrator.

**Q: Can I have multiple active sessions?**  
A: Yes, you can be logged in from multiple devices simultaneously.

**Q: How do I become an admin?**  
A: Only existing admins can promote users to admin role.

### Personal Access Tokens

**Q: How many tokens can I create?**  
A: There's no hard limit, but it's best practice to create only the tokens you need.

**Q: Can I recover a lost token?**  
A: No. If you lose a token, revoke it and create a new one.

**Q: What's the difference between scopes?**  
A: 
- **Read**: View data only
- **Write**: View and modify data
- **Admin**: Full administrative access (requires admin account)

**Q: Should I set tokens to never expire?**  
A: For security, use expiration dates and rotate tokens regularly.

### Items Management

**Q: Can other users see my items?**  
A: No, unless they are admins. Items are private by default.

**Q: What's the maximum number of items?**  
A: No hard limit, but pagination shows 100 items at a time.

**Q: Can I export my items?**  
A: Currently not directly supported. Use the API to retrieve your data programmatically.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Navigate between form fields |
| Enter | Submit form / Confirm action |
| Escape | Close modal dialogs |
| Alt + D | Go to Dashboard |
| Alt + P | Go to Profile |
| Alt + T | Go to Tokens page |
| Alt + I | Go to Items page |

---

## Getting Help

### Resources

- **API Documentation**: Visit `/docs` for interactive API documentation
- **Administrator**: Contact your system administrator for account issues
- **Support**: Email support or file an issue in the project repository

### Reporting Issues

When reporting issues, please include:
1. What you were trying to do
2. What actually happened
3. Error messages (if any)
4. Browser and version
5. Steps to reproduce

---

## Tips & Best Practices

### Security

1. ✅ Use strong, unique passwords
2. ✅ Enable two-factor authentication (if available)
3. ✅ Log out when finished
4. ✅ Don't share your credentials
5. ✅ Regularly rotate PATs
6. ✅ Review active tokens periodically

### Productivity

1. ✅ Use descriptive names for items and tokens
2. ✅ Set token expiration dates as reminders
3. ✅ Use keyboard shortcuts
4. ✅ Keep your profile information updated
5. ✅ Use the API for bulk operations

### Organization

1. ✅ Use clear, descriptive titles for items
2. ✅ Update item status as work progresses
3. ✅ Archive completed items
4. ✅ Delete unused PATs
5. ✅ Review items regularly

---

**Version**: 1.0  
**Last Updated**: 2025-11-01  
**Need Help?** Contact your administrator

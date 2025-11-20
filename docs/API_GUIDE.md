# FastAPI Intranet Demo - API Guide

## Overview

This document provides comprehensive guidance on using the FastAPI Intranet Demo API. The API follows RESTful principles and uses JSON for request/response payloads.

**Base URL**: `http://localhost:8000` (development) or your deployed URL

**API Documentation**: 
- Swagger UI: `/docs`
- ReDoc: `/redoc`

## Table of Contents

1. [Authentication](#authentication)
2. [Endpoints Overview](#endpoints-overview)
3. [Common Patterns](#common-patterns)
4. [Error Handling](#error-handling)
5. [Code Examples](#code-examples)

---

## Authentication

The API supports two authentication methods:

### 1. JWT Token Authentication (Standard)

**Step 1**: Login to get access token

```bash
# Using HTTPie
http POST :8000/api/auth/login username=admin@example.com password=changethis

# Using curl
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=changethis"
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Step 2**: Use the token in subsequent requests

```bash
# Using HTTPie
http GET :8000/api/users/me "Authorization: Bearer YOUR_TOKEN"

# Using curl
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Personal Access Token (PAT)

Personal Access Tokens are ideal for:
- Automated scripts and CI/CD pipelines
- Long-running integrations
- API testing tools

**Step 1**: Create a PAT (requires JWT authentication first)

```bash
http POST :8000/api/users/me/tokens \
  "Authorization: Bearer YOUR_JWT_TOKEN" \
  name="My API Token" \
  scopes:='["read", "write"]' \
  expires_in_days:=90
```

**Response**:
```json
{
  "id": 1,
  "name": "My API Token",
  "token": "pat_abc123def456...",
  "scopes": ["read", "write"],
  "created_at": "2025-11-01T12:00:00",
  "expires_at": "2026-01-30T12:00:00"
}
```

⚠️ **Important**: Save the token immediately. It won't be shown again!

**Step 2**: Use PAT for API requests

```bash
# Using HTTPie
http GET :8000/api/items "Authorization: Bearer pat_abc123def456..."

# Using curl
curl http://localhost:8000/api/items \
  -H "Authorization: Bearer pat_abc123def456..."
```

---

## Endpoints Overview

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| POST | `/api/auth/logout` | Logout (invalidate token) | Yes |

### User Management

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/users/me` | Get current user profile | Yes | No |
| PUT | `/api/users/me` | Update current user profile | Yes | No |
| PUT | `/api/users/me/password` | Change password | Yes | No |
| GET | `/api/admin/users` | List all users | Yes | Yes |
| POST | `/api/admin/users` | Create a new user | Yes | Yes |
| PUT | `/api/admin/users/{id}` | Update a user | Yes | Yes |
| DELETE | `/api/admin/users/{id}` | Delete a user | Yes | Yes |

### Personal Access Tokens

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/me/tokens` | Create a new PAT | Yes |
| GET | `/api/users/me/tokens` | List user's PATs | Yes |
| DELETE | `/api/users/me/tokens/{id}` | Revoke a PAT | Yes |

### Items (Sample CRUD)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/items` | List items (user's items) | Yes |
| GET | `/api/items?all=true` | List all items (admin only) | Yes (Admin) |
| POST | `/api/items` | Create a new item | Yes |
| GET | `/api/items/{id}` | Get item by ID | Yes |
| PUT | `/api/items/{id}` | Update an item | Yes |
| DELETE | `/api/items/{id}` | Delete an item | Yes |

---

## Common Patterns

### Pagination

List endpoints support pagination:

```bash
http GET :8000/api/items skip==0 limit==10 \
  "Authorization: Bearer YOUR_TOKEN"
```

**Query Parameters**:
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum records to return (default: 100, max: 100)

### Filtering

Admin endpoints support filtering:

```bash
# Get only active users
http GET :8000/api/admin/users is_active==true \
  "Authorization: Bearer YOUR_TOKEN"

# Get only admins
http GET :8000/api/admin/users is_admin==true \
  "Authorization: Bearer YOUR_TOKEN"
```

### Ownership-Based Access

Items are ownership-based:
- Users can only see/edit their own items
- Admins can see all items with `?all=true` parameter

```bash
# As regular user - see only your items
http GET :8000/api/items "Authorization: Bearer USER_TOKEN"

# As admin - see all items
http GET :8000/api/items?all=true "Authorization: Bearer ADMIN_TOKEN"
```

---

## Error Handling

The API uses standard HTTP status codes:

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad Request - validation error |
| 401 | Unauthorized - missing or invalid token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - e.g., email already exists |
| 422 | Unprocessable Entity - validation error |
| 500 | Internal Server Error |

**Error Response Format**:
```json
{
  "detail": "Error message description"
}
```

**Validation Error Format**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## Code Examples

### Python (requests)

```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={
        "username": "admin@example.com",
        "password": "changethis"
    }
)
token = response.json()["access_token"]

# Create an item
headers = {"Authorization": f"Bearer {token}"}
response = requests.post(
    "http://localhost:8000/api/items",
    headers=headers,
    json={
        "title": "My Project",
        "description": "Project description",
        "status": "active"
    }
)
item = response.json()
print(f"Created item: {item['title']}")

# List items
response = requests.get(
    "http://localhost:8000/api/items",
    headers=headers,
    params={"limit": 10}
)
items = response.json()
```

### JavaScript (fetch)

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    username: 'admin@example.com',
    password: 'changethis'
  })
});
const { access_token } = await loginResponse.json();

// Create an item
const createResponse = await fetch('http://localhost:8000/api/items', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'My Project',
    description: 'Project description',
    status: 'active'
  })
});
const item = await createResponse.json();
console.log('Created item:', item.title);

// List items
const listResponse = await fetch('http://localhost:8000/api/items?limit=10', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const items = await listResponse.json();
```

### HTTPie Examples

```bash
# Register a new user
http POST :8000/api/auth/register \
  email=newuser@example.com \
  password=SecurePassword123! \
  full_name="New User"

# Login
http POST :8000/api/auth/login \
  username=newuser@example.com \
  password=SecurePassword123!

# Get current user profile
http GET :8000/api/users/me \
  "Authorization: Bearer YOUR_TOKEN"

# Update profile
http PUT :8000/api/users/me \
  "Authorization: Bearer YOUR_TOKEN" \
  full_name="Updated Name"

# Change password
http PUT :8000/api/users/me/password \
  "Authorization: Bearer YOUR_TOKEN" \
  current_password=SecurePassword123! \
  new_password=NewSecurePassword456!

# Create a PAT
http POST :8000/api/users/me/tokens \
  "Authorization: Bearer YOUR_TOKEN" \
  name="CI/CD Token" \
  scopes:='["read", "write"]' \
  expires_in_days:=365

# Create an item
http POST :8000/api/items \
  "Authorization: Bearer YOUR_TOKEN" \
  title="My First Item" \
  description="This is a test item" \
  status=active

# Update an item
http PUT :8000/api/items/1 \
  "Authorization: Bearer YOUR_TOKEN" \
  title="Updated Title" \
  status=completed

# Delete an item
http DELETE :8000/api/items/1 \
  "Authorization: Bearer YOUR_TOKEN"
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","password":"SecurePassword123!","full_name":"New User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=newuser@example.com&password=SecurePassword123!"

# Get profile
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create item
curl -X POST http://localhost:8000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Item","description":"Description","status":"active"}'
```

---

## Best Practices

### Security

1. **Never commit tokens**: Keep tokens out of version control
2. **Use HTTPS**: Always use HTTPS in production
3. **Rotate tokens**: Regularly rotate PATs
4. **Minimal scopes**: Use minimal required scopes for PATs
5. **Environment variables**: Store tokens in environment variables

### Performance

1. **Use pagination**: Always use `limit` parameter for list endpoints
2. **Cache tokens**: Cache JWT tokens until they expire
3. **Connection pooling**: Use HTTP connection pooling for multiple requests
4. **Batch operations**: Combine multiple operations when possible

### Error Handling

1. **Check status codes**: Always check HTTP status codes
2. **Parse error details**: Extract error messages from response body
3. **Retry logic**: Implement retry logic for transient errors
4. **Logging**: Log API errors for debugging

---

## Rate Limiting

Currently, the API does not enforce rate limiting. This may be added in future versions.

---

## Support

For additional help:
- Review the interactive API docs at `/docs`
- Check the ReDoc documentation at `/redoc`
- Refer to the project README
- Report issues on the project repository

---

**Last Updated**: 2025-11-01  
**API Version**: 1.0.0

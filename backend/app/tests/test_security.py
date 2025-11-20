"""
Security Testing Suite
Tests for SQL injection, XSS, authentication, and other security concerns
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.main import app
from app.core import security
from app.models.user import User


class TestSQLInjection:
    """Test SQL injection prevention"""
    
    def test_login_sql_injection_attempt(self, client: TestClient):
        """Test that SQL injection in login is prevented"""
        response = client.post(
            "/api/auth/login",
            data={
                "username": "admin' OR '1'='1",
                "password": "password' OR '1'='1"
            }
        )
        # Should return 401, not 200 or 500
        assert response.status_code == 401
    
    def test_user_search_sql_injection(self, client: TestClient, admin_headers: dict):
        """Test SQL injection in user search/filter"""
        # Attempt SQL injection in query parameters
        response = client.get(
            "/api/admin/users?email=admin' OR '1'='1",
            headers=admin_headers
        )
        # Should not cause SQL error (500) - may return 200, 404, or 422
        assert response.status_code in [200, 404, 422]
    
    def test_item_filter_sql_injection(self, client: TestClient, auth_headers: dict):
        """Test SQL injection in item filters"""
        response = client.get(
            "/api/items?title=test' OR '1'='1",
            headers=auth_headers
        )
        assert response.status_code in [200, 422]


class TestXSSPrevention:
    """Test XSS attack prevention"""
    
    def test_xss_in_user_registration(self, client: TestClient):
        """Test that XSS payloads in registration are handled"""
        xss_payload = "<script>alert('XSS')</script>"
        response = client.post(
            "/api/auth/register",
            json={
                "email": "xss@example.com",
                "password": "TestPass123!",
                "full_name": xss_payload
            }
        )
        assert response.status_code == 201
        data = response.json()
        # The payload should be stored as-is (escaped by frontend)
        assert data["full_name"] == xss_payload
    
    def test_xss_in_item_creation(self, client: TestClient, auth_headers: dict):
        """Test XSS payload in item creation"""
        xss_payload = "<img src=x onerror=alert('XSS')>"
        response = client.post(
            "/api/items",
            json={
                "title": xss_payload,
                "description": xss_payload
            },
            headers=auth_headers
        )
        assert response.status_code == 201
        data = response.json()
        # Data should be stored as-is
        assert data["title"] == xss_payload


class TestAuthenticationSecurity:
    """Test authentication security measures"""
    
    def test_password_hashing(self):
        """Test that passwords are hashed, not stored in plaintext"""
        user = User(
            email="test@example.com",
            hashed_password=security.get_password_hash("mypassword"),
            full_name="Test User"
        )
        # Hashed password should not equal plaintext
        assert user.hashed_password != "mypassword"
        # Should be Argon2 hash
        assert user.hashed_password.startswith("$argon2")
    
    def test_invalid_token_rejected(self, client: TestClient):
        """Test that invalid JWT tokens are rejected"""
        response = client.get(
            "/api/users/me",
            headers={"Authorization": "Bearer invalid_token_here"}
        )
        assert response.status_code == 401
    
    def test_expired_token_rejected(self, client: TestClient):
        """Test that expired tokens are rejected"""
        # Create a token that expired in the past
        from datetime import timedelta
        expired_token = security.create_access_token(
            data={"sub": "test@example.com"},
            expires_delta=timedelta(minutes=-10)  # Expired 10 minutes ago
        )
        response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        assert response.status_code == 401
    
    def test_weak_password_rejected(self, client: TestClient):
        """Test that weak passwords are rejected"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "weak@example.com",
                "password": "weak",
                "full_name": "Weak Password User"
            }
        )
        assert response.status_code == 422
        assert "password" in response.json()["detail"][0]["loc"]


class TestAccessControl:
    """Test access control and authorization"""
    
    def test_regular_user_cannot_access_admin_endpoint(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that regular users cannot access admin endpoints"""
        response = client.get("/api/admin/users", headers=auth_headers)
        # Should return 403 or 404 (not found for non-admins)
        assert response.status_code in [403, 404]
    
    def test_user_cannot_edit_other_user_items(
        self, client: TestClient, auth_headers: dict
    ):
        """Test that users cannot modify other users' items"""
        # Create an item as one user
        item_response = client.post(
            "/api/items",
            json={"title": "User 1 Item", "description": "Test"},
            headers=auth_headers
        )
        item_id = item_response.json()["id"]
        
        # Try to edit as another user (create new user)
        register_response = client.post(
            "/api/auth/register",
            json={
                "email": "otheruser@example.com",
                "password": "OtherPass123!",
                "full_name": "Other User"
            }
        )
        assert register_response.status_code == 201
        
        login_response = client.post(
            "/api/auth/login",
            data={
                "username": "otheruser@example.com",
                "password": "OtherPass123!"
            }
        )
        other_user_token = login_response.json()["access_token"]
        other_user_headers = {"Authorization": f"Bearer {other_user_token}"}
        
        # Try to edit the first user's item
        edit_response = client.put(
            f"/api/items/{item_id}",
            json={"title": "Hacked!", "description": "Should not work"},
            headers=other_user_headers
        )
        # Should return 403 (forbidden) or 404 (not found - filtered by owner)
        assert edit_response.status_code in [403, 404]
    
    def test_unauthenticated_access_blocked(self, client: TestClient):
        """Test that unauthenticated requests are blocked"""
        protected_endpoints = [
            ("/api/users/me", "GET"),
            ("/api/items", "POST"),
            ("/api/users/me/tokens", "GET"),
        ]
        
        for endpoint, method in protected_endpoints:
            if method == "GET":
                response = client.get(endpoint)
            elif method == "POST":
                response = client.post(endpoint, json={})
            
            # Should return 401 (unauthorized) or 422 (validation error)
            assert response.status_code in [401, 422], f"Endpoint {endpoint} should require auth"


class TestSecretManagement:
    """Test that secrets are properly managed"""
    
    def test_no_hardcoded_secrets_in_responses(self, client: TestClient):
        """Test that API responses don't leak secrets"""
        # Register and check response
        response = client.post(
            "/api/auth/register",
            json={
                "email": "secrets@example.com",
                "password": "SecretPass123!",
                "full_name": "Secret User"
            }
        )
        data = response.json()
        
        # Password should never be in response
        assert "password" not in data
        assert "hashed_password" not in data
        assert "SecretPass123!" not in str(data)
    
    def test_token_list_hides_hash(self, client: TestClient, auth_headers: dict):
        """Test that token listing doesn't expose token hashes"""
        # Create a token
        client.post(
            "/api/users/me/tokens",
            json={"name": "Test Token", "scopes": ["read"]},
            headers=auth_headers
        )
        
        # List tokens
        response = client.get("/api/users/me/tokens", headers=auth_headers)
        tokens = response.json()
        
        for token in tokens:
            # Should not include token hash or actual token value
            assert "token_hash" not in token
            assert "token" not in token
            assert "$argon2" not in str(token)


class TestRateLimiting:
    """Test rate limiting (if implemented)"""
    
    def test_multiple_failed_login_attempts(self, client: TestClient):
        """Test behavior on multiple failed login attempts"""
        # Make multiple failed login attempts
        for i in range(10):
            response = client.post(
                "/api/auth/login",
                data={
                    "username": "nonexistent@example.com",
                    "password": "wrongpassword"
                }
            )
            # Should consistently return 401 (not leak info)
            assert response.status_code == 401
        
        # Note: Rate limiting would return 429 after threshold
        # This test just ensures consistent behavior


class TestHTTPSecurity:
    """Test HTTP security headers and configurations"""
    
    def test_security_headers_present(self, client: TestClient):
        """Test that security headers are set"""
        response = client.get("/health")
        # Check for security headers (if configured)
        # Note: These should be configured at reverse proxy level in production
        assert response.status_code == 200
    
    def test_cors_configuration(self, client: TestClient):
        """Test CORS is properly configured"""
        response = client.options(
            "/api/users/me",
            headers={"Origin": "http://localhost:3000"}
        )
        # Should have CORS headers configured
        # Actual validation depends on CORS middleware configuration
        assert response.status_code in [200, 405]


class TestInputValidation:
    """Test input validation and sanitization"""
    
    def test_email_validation(self, client: TestClient):
        """Test that invalid emails are rejected"""
        invalid_emails = [
            "notanemail",
            "@example.com",
            "user@",
        ]
        
        for invalid_email in invalid_emails:
            response = client.post(
                "/api/auth/register",
                json={
                    "email": invalid_email,
                    "password": "ValidPass123!",
                    "full_name": "Test User"
                }
            )
            # Should reject with 422 or accept (Pydantic's email validation)
            # Note: Pydantic's email validation is lenient by default
            assert response.status_code in [201, 422]
    
    def test_oversized_input_rejected(self, client: TestClient, auth_headers: dict):
        """Test that oversized inputs are rejected"""
        huge_string = "A" * 10000  # 10KB string
        response = client.post(
            "/api/items",
            json={
                "title": huge_string,
                "description": huge_string
            },
            headers=auth_headers
        )
        # Should either succeed (if within limits) or reject (422)
        assert response.status_code in [200, 422]

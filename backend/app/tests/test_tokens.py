"""
Tests for Personal Access Token (PAT) endpoints.
"""
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.token import PersonalAccessToken


class TestPATCreation:
    """Test PAT creation functionality."""

    def test_create_pat(self, client: TestClient, auth_headers: dict):
        """Test creating a personal access token."""
        response = client.post(
            "/api/users/me/tokens",
            headers=auth_headers,
            json={
                "name": "Test Token",
                "scopes": "read,write",
                "expires_in_days": 30
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["name"] == "Test Token"
        assert "read" in data["scopes"]
        assert "write" in data["scopes"]
        assert "token" in data
        assert len(data["token"]) > 20

    def test_create_pat_with_expiry(self, client: TestClient, auth_headers: dict):
        """Test creating PAT with custom expiry."""
        response = client.post(
            "/api/users/me/tokens",
            headers=auth_headers,
            json={
                "name": "Short Lived Token",
                "scopes": "read",
                "expires_in_days": 7
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["expires_at"] is not None

    def test_create_pat_no_expiry(self, client: TestClient, auth_headers: dict):
        """Test creating PAT without expiry."""
        response = client.post(
            "/api/users/me/tokens",
            headers=auth_headers,
            json={
                "name": "Never Expires",
                "scopes": "read",
                "expires_in_days": None
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["expires_at"] is None

    def test_create_pat_without_auth(self, client: TestClient):
        """Test creating PAT without authentication fails."""
        response = client.post(
            "/api/users/me/tokens",
            json={"name": "Should Fail", "scopes": ["read"]}
        )
        assert response.status_code == 401


class TestPATListing:
    """Test PAT listing functionality."""

    def test_list_user_tokens(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test listing user's tokens."""
        # Create a token
        token = PersonalAccessToken(
            user_id=test_user.id,
            name="Test Token",
            token_hash="hashed_token",
            scopes="read",
            is_active=True
        )
        session.add(token)
        session.commit()

        response = client.get("/api/users/me/tokens", headers=auth_headers)
        assert response.status_code == 200
        tokens = response.json()
        assert isinstance(tokens, list)
        assert len(tokens) >= 1
        assert any(t["name"] == "Test Token" for t in tokens)

    def test_list_tokens_hides_hash(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test that token listing doesn't expose token hash."""
        token = PersonalAccessToken(
            user_id=test_user.id,
            name="Secret Token",
            token_hash="should_not_be_visible",
            scopes="read",
            is_active=True
        )
        session.add(token)
        session.commit()

        response = client.get("/api/users/me/tokens", headers=auth_headers)
        assert response.status_code == 200
        tokens = response.json()
        for token in tokens:
            assert "token_hash" not in token
            assert "token" not in token


class TestPATRevocation:
    """Test PAT revocation functionality."""

    def test_revoke_token(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test revoking a token."""
        token = PersonalAccessToken(
            user_id=test_user.id,
            name="To Revoke",
            token_hash="hashed",
            scopes="read",
            is_active=True
        )
        session.add(token)
        session.commit()
        session.refresh(token)

        response = client.delete(
            f"/api/users/me/tokens/{token.id}",
            headers=auth_headers
        )
        assert response.status_code in [200, 204]

    def test_revoke_nonexistent_token(self, client: TestClient, auth_headers: dict):
        """Test revoking non-existent token fails."""
        response = client.delete(
            "/api/users/me/tokens/99999",
            headers=auth_headers
        )
        assert response.status_code == 404

    def test_revoke_other_user_token(self, client: TestClient, auth_headers: dict, session: Session, test_admin: User):
        """Test user cannot revoke another user's token."""
        token = PersonalAccessToken(
            user_id=test_admin.id,
            name="Admin Token",
            token_hash="hashed",
            scopes="read",
            is_active=True
        )
        session.add(token)
        session.commit()
        session.refresh(token)

        response = client.delete(
            f"/api/users/me/tokens/{token.id}",
            headers=auth_headers
        )
        assert response.status_code in [403, 404]

    def test_deactivate_token(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test deactivating a token."""
        token = PersonalAccessToken(
            user_id=test_user.id,
            name="To Deactivate",
            token_hash="hashed",
            scopes="read",
            is_active=True
        )
        session.add(token)
        session.commit()
        session.refresh(token)

        response = client.patch(
            f"/api/users/me/tokens/{token.id}/deactivate",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["is_active"] is False


class TestPATAuthentication:
    """Test authentication using PAT."""

    def test_authenticate_with_pat(self, client: TestClient, session: Session, test_user: User):
        """Test using PAT for authentication."""
        # Create a token via API to get the actual token value
        # First login to get auth headers
        login_response = client.post(
            "/api/auth/login",
            data={"username": test_user.email, "password": "testpassword123"}
        )
        auth_headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}

        # Create PAT
        pat_response = client.post(
            "/api/users/me/tokens",
            headers=auth_headers,
            json={
                "name": "API Token",
                "scopes": "read,write",
                "expires_in_days": 30
            }
        )
        assert pat_response.status_code in [200, 201]
        pat_token = pat_response.json()["token"]

        # Use PAT to access protected endpoint
        response = client.get(
            "/api/users/me",
            headers={"Authorization": f"Bearer {pat_token}"}
        )
        assert response.status_code == 200
        assert response.json()["email"] == test_user.email

    def test_expired_pat_rejected(self, client: TestClient, session: Session, test_user: User):
        """Test that expired PAT is rejected."""
        # Create expired token
        expired_token = PersonalAccessToken(
            user_id=test_user.id,
            name="Expired Token",
            token_hash="hashed",
            scopes="read",
            is_active=True,
            expires_at=datetime.utcnow() - timedelta(days=1)
        )
        session.add(expired_token)
        session.commit()

        response = client.get(
            "/api/users/me",
            headers={"Authorization": "Bearer expired_pat_token"}
        )
        assert response.status_code == 401

    def test_inactive_pat_rejected(self, client: TestClient, session: Session, test_user: User):
        """Test that inactive PAT is rejected."""
        inactive_token = PersonalAccessToken(
            user_id=test_user.id,
            name="Inactive Token",
            token_hash="hashed",
            scopes="read",
            is_active=False
        )
        session.add(inactive_token)
        session.commit()

        response = client.get(
            "/api/users/me",
            headers={"Authorization": "Bearer inactive_pat_token"}
        )
        assert response.status_code == 401

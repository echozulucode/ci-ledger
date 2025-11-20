"""
Tests for user management endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User


class TestUserProfile:
    """Test user profile management."""

    def test_update_profile(self, client: TestClient, auth_headers: dict, test_user: User):
        """Test updating user profile."""
        response = client.put(
            "/api/users/me",
            headers=auth_headers,
            json={"full_name": "Updated Name"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Updated Name"
        assert data["email"] == test_user.email

    def test_change_password(self, client: TestClient, auth_headers: dict):
        """Test changing password."""
        response = client.post(
            "/api/users/me/password",
            headers=auth_headers,
            params={
                "current_password": "testpassword123",
                "new_password": "NewSecurePass456"
            }
        )
        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()

        # Test login with new password
        response = client.post(
            "/api/auth/login",
            data={
                "username": "testuser@example.com",
                "password": "NewSecurePass456"
            }
        )
        assert response.status_code == 200

    def test_change_password_wrong_current(self, client: TestClient, auth_headers: dict):
        """Test changing password with wrong current password fails."""
        response = client.post(
            "/api/users/me/password",
            headers=auth_headers,
            params={
                "current_password": "wrongpassword",
                "new_password": "NewSecurePass456"
            }
        )
        assert response.status_code == 400

    def test_change_password_weak_new(self, client: TestClient, auth_headers: dict):
        """Test changing to weak password fails."""
        response = client.post(
            "/api/users/me/password",
            headers=auth_headers,
            params={
                "current_password": "testpassword123",
                "new_password": "weak"
            }
        )
        assert response.status_code == 400


class TestAdminUserManagement:
    """Test admin user management endpoints."""

    def test_list_users_as_admin(self, client: TestClient, admin_headers: dict):
        """Test admin can list all users."""
        response = client.get("/api/users/", headers=admin_headers)
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) >= 1  # At least one user (could be just admin in fresh test)

    def test_list_users_as_regular_user(self, client: TestClient, auth_headers: dict):
        """Test regular user cannot list all users."""
        response = client.get("/api/users/", headers=auth_headers)
        assert response.status_code == 403

    def test_create_user_via_register(self, client: TestClient):
        """Test creating users via register endpoint (no admin restriction on current implementation)."""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser2@example.com",
                "password": "SecurePass123",
                "full_name": "New User 2"
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["email"] == "newuser2@example.com"
        assert data["is_admin"] is False

    def test_update_user_as_admin(self, client: TestClient, admin_headers: dict, test_user: User):
        """Test admin can update users."""
        response = client.put(
            f"/api/users/{test_user.id}",
            headers=admin_headers,
            json={
                "full_name": "Admin Updated Name",
                "is_admin": True
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["full_name"] == "Admin Updated Name"
        assert data["is_admin"] is True

    def test_activate_deactivate_user_as_admin(self, client: TestClient, admin_headers: dict, test_user: User):
        """Test admin can activate/deactivate users via update."""
        # Deactivate
        response = client.put(
            f"/api/users/{test_user.id}",
            headers=admin_headers,
            json={"is_active": False}
        )
        assert response.status_code == 200
        assert response.json()["is_active"] is False

        # Reactivate
        response = client.put(
            f"/api/users/{test_user.id}",
            headers=admin_headers,
            json={"is_active": True}
        )
        assert response.status_code == 200
        assert response.json()["is_active"] is True

    def test_delete_user_as_admin(self, client: TestClient, admin_headers: dict, session: Session):
        """Test admin can delete users."""
        from app.core.security import get_password_hash
        # Create a user to delete
        user = User(
            email="todelete@example.com",
            hashed_password=get_password_hash("Password123"),
            full_name="To Delete"
        )
        session.add(user)
        session.commit()
        session.refresh(user)

        response = client.delete(
            f"/api/users/{user.id}",
            headers=admin_headers
        )
        assert response.status_code == 200
        assert "deleted" in response.json()["message"].lower()

    def test_delete_user_as_regular_user(self, client: TestClient, auth_headers: dict, test_admin: User):
        """Test regular user cannot delete users."""
        response = client.delete(
            f"/api/users/{test_admin.id}",
            headers=auth_headers
        )
        assert response.status_code == 403

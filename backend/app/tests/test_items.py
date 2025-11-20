"""
Tests for Items CRUD endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.models.user import User
from app.models.item import Item


class TestItemCreation:
    """Test item creation functionality."""

    def test_create_item(self, client: TestClient, auth_headers: dict):
        """Test creating an item."""
        response = client.post(
            "/api/items",
            headers=auth_headers,
            json={
                "title": "Test Item",
                "description": "Test description",
                "status": "active"
            }
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["title"] == "Test Item"
        assert data["description"] == "Test description"
        assert data["status"] == "active"
        assert "id" in data
        assert "owner_id" in data

    def test_create_item_without_auth(self, client: TestClient):
        """Test creating item without authentication fails."""
        response = client.post(
            "/api/items",
            json={"title": "Should Fail", "description": "No auth"}
        )
        assert response.status_code == 401

    def test_create_item_minimal(self, client: TestClient, auth_headers: dict):
        """Test creating item with minimal data."""
        response = client.post(
            "/api/items",
            headers=auth_headers,
            json={"title": "Minimal Item"}
        )
        assert response.status_code in [200, 201]
        data = response.json()
        assert data["title"] == "Minimal Item"
        assert data["status"] == "active"  # Default status


class TestItemListing:
    """Test item listing functionality."""

    def test_list_user_items(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test listing user's items."""
        # Create items
        item1 = Item(title="Item 1", description="Desc 1", owner_id=test_user.id)
        item2 = Item(title="Item 2", description="Desc 2", owner_id=test_user.id)
        session.add(item1)
        session.add(item2)
        session.commit()

        response = client.get("/api/items", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()
        assert isinstance(items, list)
        assert len(items) >= 2
        assert all(item["owner_id"] == test_user.id for item in items)

    def test_list_items_isolation(self, client: TestClient, auth_headers: dict, admin_headers: dict, session: Session, test_user: User, test_admin: User):
        """Test users only see their own items."""
        # Create items for different users
        user_item = Item(title="User Item", owner_id=test_user.id)
        admin_item = Item(title="Admin Item", owner_id=test_admin.id)
        session.add(user_item)
        session.add(admin_item)
        session.commit()

        # Test user sees only their items
        response = client.get("/api/items", headers=auth_headers)
        assert response.status_code == 200
        items = response.json()
        assert all(item["owner_id"] == test_user.id for item in items)
        assert not any(item["title"] == "Admin Item" for item in items)

    def test_admin_list_all_items(self, client: TestClient, admin_headers: dict, session: Session, test_user: User, test_admin: User):
        """Test admin can list all items with query param."""
        # Create items for different users
        user_item = Item(title="User Item", owner_id=test_user.id)
        admin_item = Item(title="Admin Item", owner_id=test_admin.id)
        session.add(user_item)
        session.add(admin_item)
        session.commit()

        response = client.get("/api/items?all=true", headers=admin_headers)
        assert response.status_code == 200
        items = response.json()
        assert len(items) >= 2
        user_items = [i for i in items if i["owner_id"] == test_user.id]
        admin_items = [i for i in items if i["owner_id"] == test_admin.id]
        assert len(user_items) >= 1
        assert len(admin_items) >= 1


class TestItemRetrieval:
    """Test item retrieval functionality."""

    def test_get_item(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test getting a specific item."""
        item = Item(title="Get Me", description="Test", owner_id=test_user.id)
        session.add(item)
        session.commit()
        session.refresh(item)

        response = client.get(f"/api/items/{item.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Get Me"
        assert data["id"] == item.id

    def test_get_nonexistent_item(self, client: TestClient, auth_headers: dict):
        """Test getting non-existent item fails."""
        response = client.get("/api/items/99999", headers=auth_headers)
        assert response.status_code == 404

    def test_get_other_user_item(self, client: TestClient, auth_headers: dict, session: Session, test_admin: User):
        """Test user cannot get another user's item."""
        item = Item(title="Admin Item", owner_id=test_admin.id)
        session.add(item)
        session.commit()
        session.refresh(item)

        response = client.get(f"/api/items/{item.id}", headers=auth_headers)
        assert response.status_code in [403, 404]  # Either forbidden or not found


class TestItemUpdate:
    """Test item update functionality."""

    def test_update_item(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test updating an item."""
        item = Item(title="Old Title", description="Old Desc", owner_id=test_user.id)
        session.add(item)
        session.commit()
        session.refresh(item)

        response = client.put(
            f"/api/items/{item.id}",
            headers=auth_headers,
            json={
                "title": "New Title",
                "description": "New Desc",
                "status": "completed"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "New Title"
        assert data["description"] == "New Desc"
        assert data["status"] == "completed"

    def test_update_other_user_item(self, client: TestClient, auth_headers: dict, session: Session, test_admin: User):
        """Test user cannot update another user's item."""
        item = Item(title="Admin Item", owner_id=test_admin.id)
        session.add(item)
        session.commit()
        session.refresh(item)

        response = client.put(
            f"/api/items/{item.id}",
            headers=auth_headers,
            json={"title": "Hacked"}
        )
        assert response.status_code in [403, 404]  # Either forbidden or not found

    def test_update_nonexistent_item(self, client: TestClient, auth_headers: dict):
        """Test updating non-existent item fails."""
        response = client.put(
            "/api/items/99999",
            headers=auth_headers,
            json={"title": "Doesn't Exist"}
        )
        assert response.status_code == 404


class TestItemDeletion:
    """Test item deletion functionality."""

    def test_delete_item(self, client: TestClient, auth_headers: dict, session: Session, test_user: User):
        """Test deleting an item."""
        item = Item(title="To Delete", owner_id=test_user.id)
        session.add(item)
        session.commit()
        session.refresh(item)

        response = client.delete(f"/api/items/{item.id}", headers=auth_headers)
        assert response.status_code in [200, 204]  # Either OK or No Content
        if response.status_code == 200:
            assert "deleted" in response.json()["message"].lower()

    def test_delete_other_user_item(self, client: TestClient, auth_headers: dict, session: Session, test_admin: User):
        """Test user cannot delete another user's item."""
        item = Item(title="Admin Item", owner_id=test_admin.id)
        session.add(item)
        session.commit()
        session.refresh(item)

        response = client.delete(f"/api/items/{item.id}", headers=auth_headers)
        assert response.status_code in [403, 404]  # Either forbidden or not found

    def test_delete_nonexistent_item(self, client: TestClient, auth_headers: dict):
        """Test deleting non-existent item fails."""
        response = client.delete("/api/items/99999", headers=auth_headers)
        assert response.status_code == 404

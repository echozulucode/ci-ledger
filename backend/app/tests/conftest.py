"""
Test configuration and fixtures for pytest.
"""
import os
from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine, SQLModel
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.deps import get_session
from app.core.security import get_password_hash
from app.models.user import User
from app.models.token import PersonalAccessToken


# Use in-memory SQLite for testing
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(name="engine")
def engine_fixture():
    """Create a test database engine."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture(name="session")
def session_fixture(engine) -> Generator[Session, None, None]:
    """Create a test database session."""
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with overridden dependencies."""
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session: Session) -> User:
    """Create a test user."""
    user = User(
        email="testuser@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        is_active=True,
        is_admin=False
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(name="test_admin")
def test_admin_fixture(session: Session) -> User:
    """Create a test admin user."""
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass123"),
        full_name="Admin User",
        is_active=True,
        is_admin=True
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


@pytest.fixture(name="user_token")
def user_token_fixture(client: TestClient, test_user: User) -> str:
    """Get authentication token for test user."""
    response = client.post(
        "/api/auth/login",
        data={"username": test_user.email, "password": "testpassword123"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(name="admin_token")
def admin_token_fixture(client: TestClient, test_admin: User) -> str:
    """Get authentication token for admin user."""
    response = client.post(
        "/api/auth/login",
        data={"username": test_admin.email, "password": "adminpass123"}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(user_token: str) -> dict:
    """Get authorization headers for test user."""
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture(name="admin_headers")
def admin_headers_fixture(admin_token: str) -> dict:
    """Get authorization headers for admin user."""
    return {"Authorization": f"Bearer {admin_token}"}

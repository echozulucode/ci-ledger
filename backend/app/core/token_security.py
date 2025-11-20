"""Security utilities for Personal Access Tokens."""
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional

# PAT prefix for easy identification
TOKEN_PREFIX = "pat_"
TOKEN_LENGTH = 40  # characters after prefix


def generate_token() -> str:
    """Generate a secure random token."""
    random_part = secrets.token_urlsafe(TOKEN_LENGTH)
    return f"{TOKEN_PREFIX}{random_part}"


def hash_token(token: str) -> str:
    """Hash a token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()


def calculate_expiry(days: Optional[int]) -> Optional[datetime]:
    """Calculate expiration datetime from days."""
    if days is None:
        return None
    return datetime.utcnow() + timedelta(days=days)


def is_token_expired(expires_at: Optional[datetime]) -> bool:
    """Check if token has expired."""
    if expires_at is None:
        return False
    return datetime.utcnow() > expires_at


def parse_scopes(scopes_str: str) -> list[str]:
    """Parse comma-separated scopes string into list."""
    return [s.strip() for s in scopes_str.split(",") if s.strip()]


def validate_scopes(scopes: str) -> bool:
    """Validate that scopes are valid."""
    valid_scopes = {"read", "write", "admin"}
    scope_list = parse_scopes(scopes)
    return all(scope in valid_scopes for scope in scope_list)

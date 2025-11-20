from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class PersonalAccessToken(SQLModel, table=True):
    """Personal Access Token model for API authentication"""
    __tablename__ = "personal_access_tokens"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, description="Human-readable name for the token")
    token_hash: str = Field(index=True, unique=True, description="Hashed token value")
    user_id: int = Field(foreign_key="users.id", index=True)
    scopes: str = Field(default="read", description="Comma-separated list of scopes")
    expires_at: Optional[datetime] = Field(default=None, description="Expiration datetime (None = never)")
    last_used_at: Optional[datetime] = Field(default=None, description="Last time token was used")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True, description="Whether token is active")
    
    # Relationship
    user: Optional["User"] = Relationship(back_populates="tokens")


class TokenCreate(SQLModel):
    """Schema for creating a new Personal Access Token"""
    name: str = Field(min_length=3, max_length=100, description="Name for the token")
    scopes: str = Field(default="read", description="Comma-separated scopes: read, write, admin")
    expires_in_days: Optional[int] = Field(default=None, ge=1, le=365, description="Days until expiration (None = never)")


class TokenResponse(SQLModel):
    """Response when token is created (includes plaintext token)"""
    id: int
    name: str
    token: str = Field(description="Plaintext token - save this, it won't be shown again!")
    scopes: str
    expires_at: Optional[datetime]
    created_at: datetime


class TokenInfo(SQLModel):
    """Information about an existing token (without plaintext value)"""
    id: int
    name: str
    scopes: str
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    created_at: datetime
    is_active: bool

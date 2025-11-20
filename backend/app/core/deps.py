"""FastAPI dependencies for authentication and database."""
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.security import decode_access_token
from app.models.user import User

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    jwt_token: Optional[str] = Depends(oauth2_scheme),
    bearer_credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
    session: Session = Depends(get_session)
) -> User:
    """
    Get current authenticated user from JWT token or Personal Access Token.
    
    Supports two authentication methods:
    1. JWT token (from OAuth2 password flow)
    2. Personal Access Token (PAT) with "pat_" prefix
    
    Args:
        jwt_token: JWT access token (from OAuth2PasswordBearer)
        bearer_credentials: Bearer token credentials (for PAT)
        session: Database session
        
    Returns:
        Current user
        
    Raises:
        HTTPException: If no valid credentials provided
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Try PAT authentication first
    if bearer_credentials and bearer_credentials.credentials.startswith("pat_"):
        user = _authenticate_with_pat(bearer_credentials.credentials, session)
        if user:
            return user
    
    # Fall back to JWT authentication
    if jwt_token:
        user = _authenticate_with_jwt(jwt_token, session)
        if user:
            return user
    
    raise credentials_exception


def _authenticate_with_jwt(token: str, session: Session) -> Optional[User]:
    """Authenticate using JWT token."""
    payload = decode_access_token(token)
    if payload is None:
        return None
    
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        return None
    
    user = session.get(User, user_id)
    if user is None or not user.is_active:
        return None
    
    return user


def _authenticate_with_pat(token: str, session: Session) -> Optional[User]:
    """Authenticate using Personal Access Token."""
    from app.models.token import PersonalAccessToken
    from app.core.token_security import hash_token, is_token_expired
    from datetime import datetime
    
    # Hash and look up token
    token_hash = hash_token(token)
    statement = select(PersonalAccessToken).where(
        PersonalAccessToken.token_hash == token_hash
    )
    db_token = session.exec(statement).first()
    
    if not db_token or not db_token.is_active:
        return None
    
    if is_token_expired(db_token.expires_at):
        return None
    
    # Update last used timestamp
    db_token.last_used_at = datetime.utcnow()
    session.add(db_token)
    session.commit()
    
    # Get user
    user = session.get(User, db_token.user_id)
    if user is None or not user.is_active:
        return None
    
    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    Args:
        current_user: Current user from token
        
    Returns:
        Current user if active
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current user if they are an admin.
    
    Args:
        current_user: Current user from token
        
    Returns:
        Current user if admin
        
    Raises:
        HTTPException: If user is not an admin
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

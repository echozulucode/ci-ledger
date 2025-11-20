"""Security utilities for password hashing and JWT tokens."""
from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session as get_db_session

# Password hashing context (using argon2 instead of bcrypt for Python 3.13 compatibility)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT settings
ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing claims to encode in the token
        expires_delta: Optional expiration time delta
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Decoded token payload dict, or None if invalid
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def validate_password_strength(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    
    Args:
        password: Password to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if len(password) > 100:
        return False, "Password must be less than 100 characters"
    
    # Check for at least one uppercase letter
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter"
    
    # Check for at least one lowercase letter
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter"
    
    # Check for at least one digit
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one number"
    
    return True, ""


# PAT Authentication
security_bearer = HTTPBearer(auto_error=False)


def get_current_user_from_pat(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    session: Session = Depends(None),  # Will be injected
):
    """
    Authenticate user via Personal Access Token.
    
    This is an alternative to JWT authentication for API access.
    Returns user if valid PAT, otherwise returns None.
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    
    # Check if it's a PAT (starts with pat_)
    if not token.startswith("pat_"):
        return None
    
    # Import here to avoid circular dependency
    from app.models.token import PersonalAccessToken
    from app.models.user import User
    from app.core.token_security import hash_token, is_token_expired
    from app.core.database import get_session
    
    if session is None:
        session = next(get_session())
    
    # Hash the token and look it up
    token_hash = hash_token(token)
    statement = select(PersonalAccessToken).where(
        PersonalAccessToken.token_hash == token_hash
    )
    db_token = session.exec(statement).first()
    
    if not db_token:
        return None
    
    # Check if token is active
    if not db_token.is_active:
        return None
    
    # Check if token is expired
    if is_token_expired(db_token.expires_at):
        return None
    
    # Update last used time
    db_token.last_used_at = datetime.utcnow()
    session.add(db_token)
    session.commit()
    
    # Get the user
    user_statement = select(User).where(User.id == db_token.user_id)
    user = session.exec(user_statement).first()
    
    return user

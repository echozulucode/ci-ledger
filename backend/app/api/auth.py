"""Authentication API endpoints."""
from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from app.core.config import settings
from app.core.database import get_session
from app.core.security import create_access_token, validate_password_strength, get_password_hash
from app.core.deps import get_current_user
from app.core.ldap_service import ldap_service
from app.crud import user as crud_user
from app.models.user import User, UserCreate, UserInDB
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str


@router.post("/register", response_model=UserInDB, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Register a new user.
    
    - **email**: Valid email address (must be unique)
    - **full_name**: User's full name
    - **password**: Strong password (min 8 chars, uppercase, lowercase, number)
    - **is_active**: Whether user is active (default: true)
    - **is_admin**: Whether user is admin (default: false)
    """
    # Check if user already exists
    existing_user = crud_user.get_user_by_email(session, user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password strength
    is_valid, error_message = validate_password_strength(user_create.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Create user
    user = crud_user.create_user(session, user_create)
    
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    """
    Login with email and password to get an access token.
    
    Supports both local authentication and LDAP/Active Directory.
    When LDAP is enabled, tries LDAP first, then falls back to local DB.
    
    - **username**: User's email address or username
    - **password**: User's password
    
    Returns JWT access token for authentication.
    """
    user = None
    
    # Try LDAP authentication first (if enabled)
    if settings.LDAP_ENABLED:
        success, ldap_user_info, error = ldap_service.authenticate(
            form_data.username, 
            form_data.password
        )
        
        if success and ldap_user_info:
            # LDAP authentication successful - provision/update user in local DB
            user = crud_user.get_user_by_email(session, ldap_user_info['email'])
            
            if not user:
                # Create new user from LDAP info
                user_create = UserCreate(
                    email=ldap_user_info['email'],
                    full_name=ldap_user_info['full_name'] or ldap_user_info['username'],
                    password=form_data.password,  # Will be hashed but not used for LDAP users
                    is_active=True,
                    is_admin=ldap_user_info.get('is_admin', False),
                    is_ldap_user=True
                )
                user = crud_user.create_user(session, user_create)
            else:
                # Update existing user with LDAP info
                user.full_name = ldap_user_info['full_name'] or user.full_name
                user.is_admin = ldap_user_info.get('is_admin', user.is_admin)
                user.is_ldap_user = True
                session.add(user)
                session.commit()
                session.refresh(user)
    
    # If LDAP auth failed or is disabled, try local authentication
    if not user:
        user = crud_user.authenticate_user(session, form_data.username, form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """
    Logout current user.
    
    Note: With JWT tokens, logout is typically handled client-side
    by removing the token. This endpoint is provided for API completeness.
    """
    return {
        "message": "Successfully logged out",
        "user": current_user.email
    }


@router.get("/me", response_model=UserInDB)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires: Valid JWT token
    """
    return current_user


@router.post("/test-token", response_model=UserInDB)
async def test_token(current_user: User = Depends(get_current_user)):
    """
    Test if the access token is valid.
    
    Returns current user if token is valid.
    """
    return current_user


@router.get("/ldap/health")
async def ldap_health_check():
    """
    Check LDAP server health and connectivity.
    
    Returns status information about LDAP configuration and connection.
    Useful for troubleshooting LDAP authentication issues.
    """
    health = ldap_service.health_check()
    
    # Return appropriate status code based on health
    if not health.get('healthy', False):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=health
        )
    
    return health


@router.get("/ldap/config")
async def ldap_config_info(current_user: User = Depends(get_current_user)):
    """
    Get LDAP configuration information (sanitized).
    
    Requires authentication. Useful for administrators to verify LDAP setup.
    Does not expose sensitive information like passwords.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    config = ldap_service.config
    
    return {
        "enabled": config.enabled,
        "server": config.server,
        "port": config.port,
        "use_ssl": config.use_ssl,
        "use_ntlm": config.use_ntlm,
        "bind_dn": config.bind_dn if config.bind_dn else None,
        "search_base": config.search_base,
        "user_search_filter": config.user_search_filter,
        "admin_groups": config.admin_groups,
        "allowed_groups": config.allowed_groups,
        "timeout": config.timeout
    }

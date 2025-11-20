"""Personal Access Token API endpoints."""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..core.database import get_session
from ..core.deps import get_current_active_user
from ..core.token_security import (
    generate_token,
    hash_token,
    calculate_expiry,
    validate_scopes,
)
from ..models.user import User
from ..models.token import (
    PersonalAccessToken,
    TokenCreate,
    TokenResponse,
    TokenInfo,
)

router = APIRouter()


@router.post("/me/tokens", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def create_personal_access_token(
    token_data: TokenCreate,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Create a new Personal Access Token for the current user.
    
    The plaintext token is returned only once - save it securely!
    """
    # Validate scopes
    if not validate_scopes(token_data.scopes):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid scopes. Valid scopes are: read, write, admin",
        )
    
    # Check if user already has a token with this name
    statement = select(PersonalAccessToken).where(
        PersonalAccessToken.user_id == current_user.id,
        PersonalAccessToken.name == token_data.name,
    )
    existing = session.exec(statement).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You already have a token named '{token_data.name}'",
        )
    
    # Generate token
    plaintext_token = generate_token()
    token_hash = hash_token(plaintext_token)
    
    # Calculate expiry
    expires_at = calculate_expiry(token_data.expires_in_days)
    
    # Create token record
    db_token = PersonalAccessToken(
        name=token_data.name,
        token_hash=token_hash,
        user_id=current_user.id,
        scopes=token_data.scopes,
        expires_at=expires_at,
    )
    session.add(db_token)
    session.commit()
    session.refresh(db_token)
    
    # Return response with plaintext token
    return TokenResponse(
        id=db_token.id,
        name=db_token.name,
        token=plaintext_token,
        scopes=db_token.scopes,
        expires_at=db_token.expires_at,
        created_at=db_token.created_at,
    )


@router.get("/me/tokens", response_model=List[TokenInfo])
def list_personal_access_tokens(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    List all Personal Access Tokens for the current user.
    
    Does not include the plaintext token values.
    """
    statement = select(PersonalAccessToken).where(
        PersonalAccessToken.user_id == current_user.id
    ).order_by(PersonalAccessToken.created_at.desc())
    
    tokens = session.exec(statement).all()
    
    return [
        TokenInfo(
            id=token.id,
            name=token.name,
            scopes=token.scopes,
            expires_at=token.expires_at,
            last_used_at=token.last_used_at,
            created_at=token.created_at,
            is_active=token.is_active,
        )
        for token in tokens
    ]


@router.delete("/me/tokens/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_personal_access_token(
    token_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Revoke (delete) a Personal Access Token.
    
    Can only revoke your own tokens.
    """
    statement = select(PersonalAccessToken).where(
        PersonalAccessToken.id == token_id,
        PersonalAccessToken.user_id == current_user.id,
    )
    token = session.exec(statement).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found",
        )
    
    session.delete(token)
    session.commit()
    
    return None


@router.patch("/me/tokens/{token_id}/deactivate", response_model=TokenInfo)
def deactivate_personal_access_token(
    token_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    """
    Deactivate a Personal Access Token without deleting it.
    
    Deactivated tokens cannot be used but remain in history.
    """
    statement = select(PersonalAccessToken).where(
        PersonalAccessToken.id == token_id,
        PersonalAccessToken.user_id == current_user.id,
    )
    token = session.exec(statement).first()
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found",
        )
    
    token.is_active = False
    session.add(token)
    session.commit()
    session.refresh(token)
    
    return TokenInfo(
        id=token.id,
        name=token.name,
        scopes=token.scopes,
        expires_at=token.expires_at,
        last_used_at=token.last_used_at,
        created_at=token.created_at,
        is_active=token.is_active,
    )

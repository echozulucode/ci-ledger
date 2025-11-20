"""User management API endpoints."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.database import get_session
from app.core.deps import get_current_user, get_current_admin_user
from app.crud import user as crud_user
from app.models.user import User, UserUpdate, UserInDB

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserInDB)
async def read_user_me(current_user: User = Depends(get_current_user)):
    """
    Get current user profile.
    
    Requires: Valid JWT token
    """
    return current_user


@router.put("/me", response_model=UserInDB)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update current user profile.
    
    - **email**: New email address (optional)
    - **full_name**: New full name (optional)
    - **password**: New password (optional)
    
    Requires: Valid JWT token
    """
    # Prevent non-admins from changing admin status
    if user_update.is_admin is not None and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify admin status"
        )
    
    # If email is being changed, check it's not already in use
    if user_update.email and user_update.email != current_user.email:
        existing_user = crud_user.get_user_by_email(session, user_update.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    updated_user = crud_user.update_user(session, current_user, user_update)
    return updated_user


@router.post("/me/password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Change current user's password.
    
    - **current_password**: Current password for verification
    - **new_password**: New password
    
    Requires: Valid JWT token
    """
    from app.core.security import verify_password, validate_password_strength
    
    # Verify current password
    if not verify_password(current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )
    
    # Validate new password
    is_valid, error_message = validate_password_strength(new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_message
        )
    
    # Update password
    user_update = UserUpdate(password=new_password)
    crud_user.update_user(session, current_user, user_update)
    
    return {"message": "Password updated successfully"}


@router.get("/", response_model=List[UserInDB])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    List all users (admin only).
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    
    Requires: Admin JWT token
    """
    statement = select(User).offset(skip).limit(limit)
    users = session.exec(statement).all()
    return users


@router.get("/{user_id}", response_model=UserInDB)
async def read_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Get a specific user by ID (admin only).
    
    Requires: Admin JWT token
    """
    user = crud_user.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Update a user (admin only).
    
    Requires: Admin JWT token
    """
    user = crud_user.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    updated_user = crud_user.update_user(session, user, user_update)
    return updated_user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_admin: User = Depends(get_current_admin_user)
):
    """
    Delete a user (admin only).
    
    Requires: Admin JWT token
    """
    user = crud_user.get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting yourself
    if user.id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    crud_user.delete_user(session, user)
    return {"message": "User deleted successfully"}

"""CRUD operations for users."""
from typing import Optional
from datetime import datetime
from sqlmodel import Session, select

from app.models.user import User, UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Get a user by email.
    
    Args:
        session: Database session
        email: User email
        
    Returns:
        User if found, None otherwise
    """
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user


def get_user_by_id(session: Session, user_id: int) -> Optional[User]:
    """
    Get a user by ID.
    
    Args:
        session: Database session
        user_id: User ID
        
    Returns:
        User if found, None otherwise
    """
    return session.get(User, user_id)


def create_user(session: Session, user_create: UserCreate) -> User:
    """
    Create a new user.
    
    Args:
        session: Database session
        user_create: User creation data
        
    Returns:
        Created user
    """
    # Hash password
    hashed_password = get_password_hash(user_create.password)
    
    # Create user instance
    db_user = User(
        email=user_create.email,
        full_name=user_create.full_name,
        hashed_password=hashed_password,
        is_active=user_create.is_active,
        is_admin=user_create.is_admin,
        is_ldap_user=getattr(user_create, 'is_ldap_user', False),
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return db_user


def update_user(session: Session, user: User, user_update: UserUpdate) -> User:
    """
    Update a user.
    
    Args:
        session: Database session
        user: User to update
        user_update: Update data
        
    Returns:
        Updated user
    """
    update_data = user_update.model_dump(exclude_unset=True)
    
    # Handle password update separately
    if "password" in update_data:
        password = update_data.pop("password")
        update_data["hashed_password"] = get_password_hash(password)
    
    # Update fields
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


def authenticate_user(session: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password.
    
    Args:
        session: Database session
        email: User email
        password: Plain text password
        
    Returns:
        User if authentication successful, None otherwise
    """
    user = get_user_by_email(session, email)
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user


def delete_user(session: Session, user: User) -> None:
    """
    Delete a user.
    
    Args:
        session: Database session
        user: User to delete
    """
    session.delete(user)
    session.commit()

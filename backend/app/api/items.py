from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user
from app.models.user import User
from app.models.item import Item, ItemCreate, ItemUpdate, ItemRead
from app.crud import item as crud_item


router = APIRouter(prefix="/api/items", tags=["items"])


@router.post("", response_model=ItemRead, status_code=201)
def create_item(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    item_in: ItemCreate
):
    """Create a new item owned by the current user"""
    item = crud_item.create_item(session=session, item=item_in, owner_id=current_user.id)
    return item


@router.get("", response_model=List[ItemRead])
def list_items(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=100),
    all: bool = Query(default=False, description="Admin only: list all items")
):
    """
    List items. Regular users see only their own items.
    Admins can use ?all=true to see all items.
    """
    owner_id = None if (all and current_user.is_admin) else current_user.id
    items = crud_item.get_items(session=session, owner_id=owner_id, skip=skip, limit=limit)
    return items


@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    item_id: int
):
    """Get a specific item"""
    item = crud_item.get_item(session=session, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Users can only view their own items unless they are admin
    if item.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this item")
    
    return item


@router.put("/{item_id}", response_model=ItemRead)
def update_item(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    item_id: int,
    item_in: ItemUpdate
):
    """Update an item"""
    item = crud_item.get_item(session=session, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Users can only update their own items
    if item.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this item")
    
    item = crud_item.update_item(session=session, db_item=item, item_update=item_in)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
    item_id: int
):
    """Delete an item"""
    item = crud_item.get_item(session=session, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Users can only delete their own items
    if item.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this item")
    
    crud_item.delete_item(session=session, db_item=item)
    return None

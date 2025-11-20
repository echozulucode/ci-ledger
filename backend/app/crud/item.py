from typing import List, Optional
from datetime import datetime
from sqlmodel import Session, select
from app.models.item import Item, ItemCreate, ItemUpdate


def create_item(session: Session, item: ItemCreate, owner_id: int) -> Item:
    """Create a new item"""
    item_dict = item.model_dump()
    db_item = Item(**item_dict, owner_id=owner_id)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def get_item(session: Session, item_id: int) -> Optional[Item]:
    """Get an item by ID"""
    return session.get(Item, item_id)


def get_items(
    session: Session, 
    owner_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100
) -> List[Item]:
    """Get items with optional owner filtering and pagination"""
    statement = select(Item)
    if owner_id is not None:
        statement = statement.where(Item.owner_id == owner_id)
    statement = statement.offset(skip).limit(limit).order_by(Item.created_at.desc())
    return list(session.exec(statement).all())


def update_item(session: Session, db_item: Item, item_update: ItemUpdate) -> Item:
    """Update an item"""
    item_data = item_update.model_dump(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    db_item.updated_at = datetime.utcnow()
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item


def delete_item(session: Session, db_item: Item) -> None:
    """Delete an item"""
    session.delete(db_item)
    session.commit()


def get_items_count(session: Session, owner_id: Optional[int] = None) -> int:
    """Get count of items with optional owner filtering"""
    statement = select(Item)
    if owner_id is not None:
        statement = statement.where(Item.owner_id == owner_id)
    return len(list(session.exec(statement).all()))

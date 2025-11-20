from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship


class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: str = Field(default="active", max_length=50)


class Item(ItemBase, table=True):
    __tablename__ = "items"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    status: Optional[str] = Field(default=None, max_length=50)


class ItemRead(ItemBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

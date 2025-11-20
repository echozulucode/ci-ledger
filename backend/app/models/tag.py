from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel


class Tag(SQLModel, table=True):
    __tablename__ = "tags"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)

    event_links: List["EventTag"] = Relationship(back_populates="tag")


class EventTag(SQLModel, table=True):
    __tablename__ = "event_tags"
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", index=True)
    tag_id: int = Field(foreign_key="tags.id", index=True)

    event: Optional["Event"] = Relationship(back_populates="tag_links")
    tag: Optional[Tag] = Relationship(back_populates="event_links")

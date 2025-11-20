from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models.enums import EventSeverity, EventSource, EventType


class EventBase(SQLModel):
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    timestamp: datetime = Field(index=True)
    event_type: EventType = Field(max_length=50, index=True)
    severity: EventSeverity = Field(default=EventSeverity.INFO, max_length=50, index=True)
    source: EventSource = Field(default=EventSource.MANUAL, max_length=50, index=True)
    metadata: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
        description="Optional structured payload"
    )


class Event(EventBase, table=True):
    __tablename__ = "events"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    agent_links: List["EventAgent"] = Relationship(back_populates="event")
    tool_links: List["EventTool"] = Relationship(back_populates="event")
    tag_links: List["EventTag"] = Relationship(back_populates="event")


class EventCreate(EventBase):
    agent_ids: Optional[List[int]] = None
    tool_versions: Optional[List[Dict[str, Optional[str]]]] = None  # [{tool_id, version_from, version_to}]
    tag_ids: Optional[List[int]] = None


class EventUpdate(SQLModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=4000)
    timestamp: Optional[datetime] = None
    event_type: Optional[EventType] = Field(default=None, max_length=50)
    severity: Optional[EventSeverity] = Field(default=None, max_length=50)
    source: Optional[EventSource] = Field(default=None, max_length=50)
    metadata: Optional[Dict[str, Any]] = None
    agent_ids: Optional[List[int]] = None
    tool_versions: Optional[List[Dict[str, Optional[str]]]] = None
    tag_ids: Optional[List[int]] = None


class EventRead(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime

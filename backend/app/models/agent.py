from datetime import datetime
from typing import List, Optional
from sqlalchemy import Column, JSON
from sqlmodel import Field, Relationship, SQLModel

from app.models.enums import AgentStatus


class AgentBase(SQLModel):
    name: str = Field(index=True, max_length=255)
    vm_hostname: Optional[str] = Field(default=None, max_length=255)
    labels: Optional[List[str]] = Field(
        default=None,
        sa_column=Column(JSON, nullable=True),
        description="List of labels/tags for agent selection"
    )
    os_type: Optional[str] = Field(default=None, max_length=100)
    architecture: Optional[str] = Field(default=None, max_length=50)
    status: AgentStatus = Field(default=AgentStatus.ACTIVE, max_length=50)


class Agent(AgentBase, table=True):
    __tablename__ = "agents"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    event_links: List["EventAgent"] = Relationship(back_populates="agent")


class AgentCreate(AgentBase):
    pass


class AgentUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    vm_hostname: Optional[str] = Field(default=None, max_length=255)
    labels: Optional[List[str]] = Field(default=None)
    os_type: Optional[str] = Field(default=None, max_length=100)
    architecture: Optional[str] = Field(default=None, max_length=50)
    status: Optional[AgentStatus] = Field(default=None, max_length=50)


class AgentRead(AgentBase):
    id: int
    created_at: datetime
    updated_at: datetime


class EventAgent(SQLModel, table=True):
    __tablename__ = "event_agents"
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", index=True)
    agent_id: int = Field(foreign_key="agents.id", index=True)

    event: Optional["Event"] = Relationship(back_populates="agent_links")
    agent: Optional[Agent] = Relationship(back_populates="event_links")

from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

from app.models.enums import ToolType, ToolCategory


class ToolBase(SQLModel):
    name: str = Field(index=True, max_length=255)
    type: ToolType = Field(default=ToolType.OTHER, max_length=50)
    category: ToolCategory = Field(default=ToolCategory.OTHER, max_length=50)


class Tool(ToolBase, table=True):
    __tablename__ = "tools"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    event_links: List["EventTool"] = Relationship(back_populates="tool")
    toolchains: List["ToolchainTool"] = Relationship(back_populates="tool")


class ToolCreate(ToolBase):
    pass


class ToolUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    type: Optional[ToolType] = Field(default=None, max_length=50)
    category: Optional[ToolCategory] = Field(default=None, max_length=50)


class ToolRead(ToolBase):
    id: int
    created_at: datetime
    updated_at: datetime


class EventTool(SQLModel, table=True):
    __tablename__ = "event_tools"
    id: Optional[int] = Field(default=None, primary_key=True)
    event_id: int = Field(foreign_key="events.id", index=True)
    tool_id: int = Field(foreign_key="tools.id", index=True)
    version_from: Optional[str] = Field(default=None, max_length=100)
    version_to: Optional[str] = Field(default=None, max_length=100)

    event: Optional["Event"] = Relationship(back_populates="tool_links")
    tool: Optional[Tool] = Relationship(back_populates="event_links")

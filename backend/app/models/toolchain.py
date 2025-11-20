from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel


class ToolchainBase(SQLModel):
    name: str = Field(index=True, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)


class Toolchain(ToolchainBase, table=True):
    __tablename__ = "toolchains"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    tools: List["ToolchainTool"] = Relationship(back_populates="toolchain")


class ToolchainCreate(ToolchainBase):
    pass


class ToolchainUpdate(SQLModel):
    name: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = Field(default=None, max_length=2000)


class ToolchainRead(ToolchainBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ToolchainTool(SQLModel, table=True):
    __tablename__ = "toolchain_tools"
    id: Optional[int] = Field(default=None, primary_key=True)
    toolchain_id: int = Field(foreign_key="toolchains.id", index=True)
    tool_id: int = Field(foreign_key="tools.id", index=True)

    toolchain: Optional[Toolchain] = Relationship(back_populates="tools")
    tool: Optional["Tool"] = Relationship(back_populates="toolchains")

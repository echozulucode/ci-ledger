"""CRUD helpers for tools."""
from typing import List, Optional
from sqlmodel import Session, select

from app.models.tool import Tool, ToolCreate, ToolUpdate


def create_tool(session: Session, tool_in: ToolCreate) -> Tool:
    db_tool = Tool(**tool_in.model_dump())
    session.add(db_tool)
    session.commit()
    session.refresh(db_tool)
    return db_tool


def get_tool(session: Session, tool_id: int) -> Optional[Tool]:
    return session.get(Tool, tool_id)


def list_tools(
    session: Session,
    *,
    category: Optional[str] = None,
    tool_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Tool]:
    statement = select(Tool).offset(skip).limit(limit).order_by(Tool.name)
    if category:
        statement = statement.where(Tool.category == category)
    if tool_type:
        statement = statement.where(Tool.type == tool_type)
    return list(session.exec(statement).all())


def update_tool(session: Session, db_tool: Tool, tool_in: ToolUpdate) -> Tool:
    data = tool_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_tool, key, value)
    session.add(db_tool)
    session.commit()
    session.refresh(db_tool)
    return db_tool


def delete_tool(session: Session, db_tool: Tool) -> None:
    session.delete(db_tool)
    session.commit()

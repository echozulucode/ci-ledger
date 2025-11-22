from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user, get_current_admin_user
from app.crud import tool as crud_tool
from app.models.tool import Tool, ToolCreate, ToolUpdate, ToolRead

router = APIRouter(prefix="/api/tools", tags=["tools"])


@router.get("", response_model=List[ToolRead])
def list_tools(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    category: Optional[str] = Query(default=None),
    tool_type: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
):
    tools = crud_tool.list_tools(session, category=category, tool_type=tool_type, skip=skip, limit=limit)
    return tools


@router.get("/{tool_id}", response_model=ToolRead)
def get_tool(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    tool_id: int,
):
    tool = crud_tool.get_tool(session, tool_id)
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    return tool


@router.post("", response_model=ToolRead, status_code=201)
def create_tool(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    tool_in: ToolCreate,
):
    tool = crud_tool.create_tool(session, tool_in)
    return tool


@router.put("/{tool_id}", response_model=ToolRead)
def update_tool(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    tool_id: int,
    tool_in: ToolUpdate,
):
    db_tool = crud_tool.get_tool(session, tool_id)
    if not db_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    tool = crud_tool.update_tool(session, db_tool, tool_in)
    return tool


@router.delete("/{tool_id}", status_code=204)
def delete_tool(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    tool_id: int,
):
    db_tool = crud_tool.get_tool(session, tool_id)
    if not db_tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    crud_tool.delete_tool(session, db_tool)
    return None

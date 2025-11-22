from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user, get_current_admin_user
from app.crud import toolchain as crud_toolchain
from app.crud import tool as crud_tool
from app.models.toolchain import Toolchain, ToolchainCreate, ToolchainUpdate, ToolchainRead

router = APIRouter(prefix="/api/toolchains", tags=["toolchains"])


class ToolchainToolsUpdate(BaseModel):
    tool_ids: List[int]


@router.get("", response_model=List[ToolchainRead])
def list_toolchains(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
):
    return crud_toolchain.list_toolchains(session, skip=skip, limit=limit)


@router.get("/{toolchain_id}", response_model=ToolchainRead)
def get_toolchain(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    toolchain_id: int,
):
    tc = crud_toolchain.get_toolchain(session, toolchain_id)
    if not tc:
        raise HTTPException(status_code=404, detail="Toolchain not found")
    return tc


@router.post("", response_model=ToolchainRead, status_code=201)
def create_toolchain(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    tc_in: ToolchainCreate,
):
    return crud_toolchain.create_toolchain(session, tc_in)


@router.put("/{toolchain_id}", response_model=ToolchainRead)
def update_toolchain(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    toolchain_id: int,
    tc_in: ToolchainUpdate,
):
    db_tc = crud_toolchain.get_toolchain(session, toolchain_id)
    if not db_tc:
        raise HTTPException(status_code=404, detail="Toolchain not found")
    return crud_toolchain.update_toolchain(session, db_tc, tc_in)


@router.put("/{toolchain_id}/tools", response_model=ToolchainRead)
def set_toolchain_tools(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    toolchain_id: int,
    payload: ToolchainToolsUpdate,
):
    db_tc = crud_toolchain.get_toolchain(session, toolchain_id)
    if not db_tc:
        raise HTTPException(status_code=404, detail="Toolchain not found")

    # Validate tools exist to avoid FK errors
    for tool_id in payload.tool_ids:
        if not crud_tool.get_tool(session, tool_id):
            raise HTTPException(status_code=400, detail=f"Tool {tool_id} not found")

    return crud_toolchain.set_toolchain_tools(session, db_tc, payload.tool_ids)


@router.delete("/{toolchain_id}", status_code=204)
def delete_toolchain(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    toolchain_id: int,
):
    db_tc = crud_toolchain.get_toolchain(session, toolchain_id)
    if not db_tc:
        raise HTTPException(status_code=404, detail="Toolchain not found")
    crud_toolchain.delete_toolchain(session, db_tc)
    return None

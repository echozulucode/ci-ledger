"""CRUD helpers for toolchains."""
from typing import List, Optional
from sqlalchemy import delete
from sqlmodel import Session, select

from app.models.toolchain import Toolchain, ToolchainCreate, ToolchainUpdate, ToolchainTool


def create_toolchain(session: Session, tc_in: ToolchainCreate) -> Toolchain:
    db_tc = Toolchain(**tc_in.model_dump())
    session.add(db_tc)
    session.commit()
    session.refresh(db_tc)
    return db_tc


def get_toolchain(session: Session, toolchain_id: int) -> Optional[Toolchain]:
    return session.get(Toolchain, toolchain_id)


def list_toolchains(session: Session, *, skip: int = 0, limit: int = 100) -> List[Toolchain]:
    statement = select(Toolchain).offset(skip).limit(limit).order_by(Toolchain.name)
    return list(session.exec(statement).all())


def update_toolchain(session: Session, db_tc: Toolchain, tc_in: ToolchainUpdate) -> Toolchain:
    data = tc_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_tc, key, value)
    session.add(db_tc)
    session.commit()
    session.refresh(db_tc)
    return db_tc


def delete_toolchain(session: Session, db_tc: Toolchain) -> None:
    session.delete(db_tc)
    session.commit()


def set_toolchain_tools(session: Session, db_tc: Toolchain, tool_ids: List[int]) -> Toolchain:
    session.exec(delete(ToolchainTool).where(ToolchainTool.toolchain_id == db_tc.id))
    session.flush()
    for tool_id in tool_ids:
        session.add(ToolchainTool(toolchain_id=db_tc.id, tool_id=tool_id))
    session.commit()
    session.refresh(db_tc)
    return db_tc

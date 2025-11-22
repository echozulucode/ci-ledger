from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user, get_current_admin_user
from app.crud import tag as crud_tag
from app.models.tag import Tag

router = APIRouter(prefix="/api/tags", tags=["tags"])


class TagCreate(BaseModel):
    name: str


@router.get("", response_model=List[Tag])
def list_tags(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    skip: int = 0,
    limit: int = 100,
):
    return crud_tag.list_tags(session, skip=skip, limit=limit)


@router.post("", response_model=Tag, status_code=201)
def create_tag(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    payload: TagCreate,
):
    existing = session.query(Tag).filter(Tag.name == payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already exists")
    return crud_tag.create_tag(session, payload.name)


@router.delete("/{tag_id}", status_code=204)
def delete_tag(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    tag_id: int,
):
    db_tag = crud_tag.get_tag(session, tag_id)
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    crud_tag.delete_tag(session, db_tag)
    return None

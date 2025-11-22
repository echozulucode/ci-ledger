"""CRUD helpers for tags."""
from typing import List, Optional
from sqlmodel import Session, select

from app.models.tag import Tag


def create_tag(session: Session, name: str) -> Tag:
    db_tag = Tag(name=name)
    session.add(db_tag)
    session.commit()
    session.refresh(db_tag)
    return db_tag


def get_tag(session: Session, tag_id: int) -> Optional[Tag]:
    return session.get(Tag, tag_id)


def get_tag_by_name(session: Session, name: str) -> Optional[Tag]:
    return session.exec(select(Tag).where(Tag.name == name)).first()


def list_tags(session: Session, *, skip: int = 0, limit: int = 100) -> List[Tag]:
    statement = select(Tag).offset(skip).limit(limit).order_by(Tag.name)
    return list(session.exec(statement).all())


def delete_tag(session: Session, db_tag: Tag) -> None:
    session.delete(db_tag)
    session.commit()

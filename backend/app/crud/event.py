"""CRUD helpers for events."""
from datetime import datetime
from typing import List, Optional
from sqlalchemy import delete, or_
from sqlmodel import Session, select

from app.models.event import Event, EventCreate, EventUpdate
from app.models.agent import EventAgent
from app.models.tool import EventTool
from app.models.tag import EventTag


def create_event(session: Session, event_in: EventCreate) -> Event:
    base_data = event_in.model_dump(exclude={"agent_ids", "tool_versions", "tag_ids"})
    db_event = Event(**base_data, created_at=datetime.utcnow(), updated_at=datetime.utcnow())
    session.add(db_event)
    session.flush()

    _sync_agents(session, db_event, event_in.agent_ids or [])
    _sync_tools(session, db_event, event_in.tool_versions or [])
    _sync_tags(session, db_event, event_in.tag_ids or [])

    session.commit()
    session.refresh(db_event)
    return db_event


def get_event(session: Session, event_id: int) -> Optional[Event]:
    return session.get(Event, event_id)


def list_events(
    session: Session,
    *,
    start: Optional[datetime] = None,
    end: Optional[datetime] = None,
    agent_id: Optional[int] = None,
    tool_id: Optional[int] = None,
    event_type: Optional[str] = None,
    severity: Optional[str] = None,
    source: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[Event]:
    statement = select(Event)

    if agent_id:
        statement = statement.join(EventAgent).where(EventAgent.agent_id == agent_id)
    if tool_id:
        statement = statement.join(EventTool).where(EventTool.tool_id == tool_id)
    if start:
        statement = statement.where(Event.timestamp >= start)
    if end:
        statement = statement.where(Event.timestamp <= end)
    if event_type:
        statement = statement.where(Event.event_type == event_type)
    if severity:
        statement = statement.where(Event.severity == severity)
    if source:
        statement = statement.where(Event.source == source)
    if search:
        like = f"%{search}%"
        statement = statement.where(or_(Event.title.ilike(like), Event.description.ilike(like)))

    statement = statement.order_by(Event.timestamp.desc()).offset(skip).limit(limit)
    return list(session.exec(statement).all())


def update_event(session: Session, db_event: Event, event_in: EventUpdate) -> Event:
    data = event_in.model_dump(exclude_unset=True)
    agent_ids = data.pop("agent_ids", None)
    tool_versions = data.pop("tool_versions", None)
    tag_ids = data.pop("tag_ids", None)

    for key, value in data.items():
        setattr(db_event, key, value)
    db_event.updated_at = datetime.utcnow()

    if agent_ids is not None:
        _sync_agents(session, db_event, agent_ids)
    if tool_versions is not None:
        _sync_tools(session, db_event, tool_versions)
    if tag_ids is not None:
        _sync_tags(session, db_event, tag_ids)

    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    return db_event


def delete_event(session: Session, db_event: Event) -> None:
    session.delete(db_event)
    session.commit()


def _sync_agents(session: Session, event: Event, agent_ids: List[int]):
    session.exec(delete(EventAgent).where(EventAgent.event_id == event.id))
    session.flush()
    for agent_id in agent_ids:
        session.add(EventAgent(event_id=event.id, agent_id=agent_id))


def _sync_tools(session: Session, event: Event, tool_versions: List[dict]):
    session.exec(delete(EventTool).where(EventTool.event_id == event.id))
    session.flush()
    for tool_data in tool_versions:
        session.add(EventTool(
            event_id=event.id,
            tool_id=tool_data.get("tool_id"),
            version_from=tool_data.get("version_from"),
            version_to=tool_data.get("version_to"),
        ))


def _sync_tags(session: Session, event: Event, tag_ids: List[int]):
    session.exec(delete(EventTag).where(EventTag.event_id == event.id))
    session.flush()
    for tag_id in tag_ids:
        session.add(EventTag(event_id=event.id, tag_id=tag_id))

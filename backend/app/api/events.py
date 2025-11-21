from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user, get_current_admin_user
from app.crud import event as crud_event
from app.models.event import Event, EventCreate, EventUpdate, EventRead
from app.models.agent import Agent
from app.models.tool import Tool
from app.models.tag import Tag

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=List[EventRead])
def list_events(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
    start: Optional[datetime] = Query(default=None),
    end: Optional[datetime] = Query(default=None),
    agent_id: Optional[int] = Query(default=None),
    tool_id: Optional[int] = Query(default=None),
    event_type: Optional[str] = Query(default=None),
    severity: Optional[str] = Query(default=None),
    source: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
):
    events = crud_event.list_events(
        session,
        start=start,
        end=end,
        agent_id=agent_id,
        tool_id=tool_id,
        event_type=event_type,
        severity=severity,
        source=source,
        search=search,
        skip=skip,
        limit=limit,
    )
    _attach_relations(session, events)
    return events


@router.get("/{event_id}", response_model=EventRead)
def get_event(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
    event_id: int,
):
    event = crud_event.get_event(session, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    _attach_relations(session, [event])
    return event


@router.post("", response_model=EventRead, status_code=201)
def create_event(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    event_in: EventCreate,
):
    _ensure_related_entities_exist(session, event_in.agent_ids, event_in.tool_versions, event_in.tag_ids)
    event = crud_event.create_event(session, event_in)
    return event


@router.put("/{event_id}", response_model=EventRead)
def update_event(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    event_id: int,
    event_in: EventUpdate,
):
    db_event = crud_event.get_event(session, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    _ensure_related_entities_exist(session, event_in.agent_ids, event_in.tool_versions, event_in.tag_ids)
    event = crud_event.update_event(session, db_event, event_in)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    event_id: int,
):
    db_event = crud_event.get_event(session, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    crud_event.delete_event(session, db_event)
    return None


def _attach_relations(session: Session, events: List[Event]) -> None:
    """Attach agents/tools/tags to event read models."""
    from app.models.agent import Agent
    from app.models.tool import Tool
    from app.models.tag import Tag, EventTag
    from app.models.tool import EventTool
    from app.models.agent import EventAgent
    from sqlmodel import select

    event_ids = [e.id for e in events]
    if not event_ids:
        return

    agent_links = session.exec(select(EventAgent).where(EventAgent.event_id.in_(event_ids))).all()
    tool_links = session.exec(select(EventTool).where(EventTool.event_id.in_(event_ids))).all()
    tag_links = session.exec(select(EventTag).where(EventTag.event_id.in_(event_ids))).all()

    agents_map = {a.id: a for a in session.exec(select(Agent).where(Agent.id.in_([l.agent_id for l in agent_links]))).all()}
    tools_map = {t.id: t for t in session.exec(select(Tool).where(Tool.id.in_([l.tool_id for l in tool_links]))).all()}
    tags_map = {t.id: t for t in session.exec(select(Tag).where(Tag.id.in_([l.tag_id for l in tag_links]))).all()}

    by_id: dict[int, Event] = {e.id: e for e in events}
    for link in agent_links:
        evt = by_id.get(link.event_id)
        agent = agents_map.get(link.agent_id)
        if evt and agent:
            if not hasattr(evt, "__dict__"):
                continue
            current = evt.__dict__.get("agents") or []
            evt.__dict__["agents"] = current + [{"id": agent.id, "name": agent.name}]

    for link in tool_links:
        evt = by_id.get(link.event_id)
        tool = tools_map.get(link.tool_id)
        if evt and tool:
            if not hasattr(evt, "__dict__"):
                continue
            current = evt.__dict__.get("tools") or []
            evt.__dict__["tools"] = current + [
                {
                    "id": tool.id,
                    "name": tool.name,
                    "version_from": link.version_from,
                    "version_to": link.version_to,
                }
            ]

    for link in tag_links:
        evt = by_id.get(link.event_id)
        tag = tags_map.get(link.tag_id)
        if evt and tag:
            if not hasattr(evt, "__dict__"):
                continue
            current = evt.__dict__.get("tags") or []
            evt.__dict__["tags"] = current + [{"id": tag.id, "name": tag.name}]


def _ensure_related_entities_exist(
    session: Session,
    agent_ids: Optional[List[int]],
    tool_versions: Optional[List[dict]],
    tag_ids: Optional[List[int]],
):
    """Validate referenced entities to avoid FK errors."""
    if agent_ids:
        for agent_id in agent_ids:
            if not session.get(Agent, agent_id):
                raise HTTPException(status_code=400, detail=f"Agent {agent_id} not found")
    if tool_versions:
        for tool_data in tool_versions:
            tool_id = tool_data.get("tool_id")
            if tool_id and not session.get(Tool, tool_id):
                raise HTTPException(status_code=400, detail=f"Tool {tool_id} not found")
    if tag_ids:
        for tag_id in tag_ids:
            if not session.get(Tag, tag_id):
                raise HTTPException(status_code=400, detail=f"Tag {tag_id} not found")

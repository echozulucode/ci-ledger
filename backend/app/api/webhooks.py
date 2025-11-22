from datetime import datetime
import hashlib
import hmac
import json
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlmodel import Session, select

from app.core.config import settings
from app.core.database import get_session
from app.crud import event as crud_event
from app.crud import agent as crud_agent
from app.crud import tool as crud_tool
from app.crud import tag as crud_tag
from app.models.agent import Agent
from app.models.tool import Tool
from app.models.tag import Tag
from app.models.event import EventCreate, EventRead
from app.models.enums import EventSeverity, EventSource, EventType

from pydantic import BaseModel, Field


router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])


class JenkinsToolPayload(BaseModel):
    name: str
    version: Optional[str] = None
    previous_version: Optional[str] = None


class JenkinsWebhookPayload(BaseModel):
    job_name: str = Field(..., description="Jenkins job name")
    build_number: int = Field(..., description="Build/run number")
    status: str = Field(..., description="SUCCESS|FAILURE|ABORTED|UNSTABLE|STARTED")
    full_url: Optional[str] = None
    message: Optional[str] = None
    agent: Optional[str] = Field(default=None, description="Agent/worker name")
    tools: Optional[List[JenkinsToolPayload]] = None
    tags: Optional[List[str]] = None
    timestamp: Optional[datetime] = None
    raw: Optional[dict] = None


def _verify_signature(body: bytes, signature: Optional[str]) -> None:
    secret = settings.WEBHOOK_HMAC_SECRET
    if not secret:
        return
    if not signature:
        raise HTTPException(status_code=401, detail="Missing webhook signature")
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    sig_value = signature.replace("sha256=", "")
    if not hmac.compare_digest(expected, sig_value):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")


def _status_to_type_and_severity(status: str) -> tuple[EventType, EventSeverity]:
    normalized = status.lower()
    if normalized in ["success", "fixed", "stable"]:
        return EventType.ROLLOUT, EventSeverity.INFO
    if normalized in ["failure", "failed", "broken"]:
        return EventType.OUTAGE, EventSeverity.CRITICAL
    if normalized in ["aborted", "unstable"]:
        return EventType.CONFIG_CHANGE, EventSeverity.WARNING
    return EventType.CONFIG_CHANGE, EventSeverity.INFO


def _get_or_create_agent(session: Session, name: str) -> Agent:
    agent = crud_agent.get_agent_by_name(session, name)
    if agent:
        return agent
    agent = Agent(name=name, status="active")
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent


def _get_or_create_tool(session: Session, name: str) -> Tool:
    tool = crud_tool.get_tool_by_name(session, name)
    if tool:
        return tool
    tool = Tool(name=name)
    session.add(tool)
    session.commit()
    session.refresh(tool)
    return tool


def _get_or_create_tag(session: Session, name: str) -> Tag:
    tag = crud_tag.get_tag_by_name(session, name)
    if tag:
        return tag
    tag = Tag(name=name)
    session.add(tag)
    session.commit()
    session.refresh(tag)
    return tag


@router.post("/jenkins", response_model=EventRead, status_code=202)
async def jenkins_webhook(
    request: Request,
    session: Session = Depends(get_session),
    x_hub_signature_256: Optional[str] = Header(default=None),
):
    """Ingest Jenkins build notifications into CI Ledger events.

    If `WEBHOOK_HMAC_SECRET` is set, the request must include header
    `X-Hub-Signature-256: sha256=<digest>`.
    """
    raw_body = await request.body()
    _verify_signature(raw_body, x_hub_signature_256)

    try:
        payload = JenkinsWebhookPayload.model_validate_json(raw_body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    event_type, severity = _status_to_type_and_severity(payload.status)
    title = f"Jenkins {payload.job_name} #{payload.build_number} {payload.status.lower()}"
    description_parts = [payload.message, payload.full_url]
    description = "\n".join([p for p in description_parts if p]) or None
    timestamp = payload.timestamp or datetime.utcnow()

    agent_ids: List[int] = []
    if payload.agent:
        agent = _get_or_create_agent(session, payload.agent)
        agent_ids.append(agent.id)

    tag_ids: List[int] = []
    for tag_name in payload.tags or []:
        tag = _get_or_create_tag(session, tag_name)
        tag_ids.append(tag.id)

    tool_versions = []
    for tool_payload in payload.tools or []:
        tool = _get_or_create_tool(session, tool_payload.name)
        tool_versions.append(
            {
                "tool_id": tool.id,
                "version_from": tool_payload.previous_version,
                "version_to": tool_payload.version,
            }
        )

    event_in = EventCreate(
        title=title,
        description=description,
        timestamp=timestamp,
        event_type=event_type,
        severity=severity,
        source=EventSource.WEBHOOK,
        details=json.dumps({"jenkins": payload.model_dump(mode="json")}),
        agent_ids=agent_ids or None,
        tool_versions=tool_versions or None,
        tag_ids=tag_ids or None,
    )

    event = crud_event.create_event(session, event_in)
    # Attach relations for response parity with other event endpoints
    from app.api.events import _attach_relations
    _attach_relations(session, [event])

    return event

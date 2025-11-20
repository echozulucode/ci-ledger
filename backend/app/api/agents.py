from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.core.database import get_session
from app.core.deps import get_current_user, get_current_admin_user
from app.crud import agent as crud_agent
from app.models.agent import Agent, AgentCreate, AgentUpdate, AgentRead

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("", response_model=List[AgentRead])
def list_agents(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
    status: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
):
    agents = crud_agent.list_agents(session, status=status, skip=skip, limit=limit)
    return agents


@router.get("/{agent_id}", response_model=AgentRead)
def get_agent(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_user),
    agent_id: int,
):
    agent = crud_agent.get_agent(session, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@router.post("", response_model=AgentRead, status_code=201)
def create_agent(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    agent_in: AgentCreate,
):
    agent = crud_agent.create_agent(session, agent_in)
    return agent


@router.put("/{agent_id}", response_model=AgentRead)
def update_agent(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    agent_id: int,
    agent_in: AgentUpdate,
):
    db_agent = crud_agent.get_agent(session, agent_id)
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    agent = crud_agent.update_agent(session, db_agent, agent_in)
    return agent


@router.delete("/{agent_id}", status_code=204)
def delete_agent(
    *,
    session: Session = Depends(get_session),
    current_user=Depends(get_current_admin_user),
    agent_id: int,
):
    db_agent = crud_agent.get_agent(session, agent_id)
    if not db_agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    crud_agent.delete_agent(session, db_agent)
    return None

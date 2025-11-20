"""CRUD helpers for agents."""
from typing import List, Optional
from sqlmodel import Session, select

from app.models.agent import Agent, AgentCreate, AgentUpdate


def create_agent(session: Session, agent_in: AgentCreate) -> Agent:
    db_agent = Agent(**agent_in.model_dump())
    session.add(db_agent)
    session.commit()
    session.refresh(db_agent)
    return db_agent


def get_agent(session: Session, agent_id: int) -> Optional[Agent]:
    return session.get(Agent, agent_id)


def list_agents(session: Session, *, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Agent]:
    statement = select(Agent).offset(skip).limit(limit).order_by(Agent.name)
    if status:
        statement = statement.where(Agent.status == status)
    return list(session.exec(statement).all())


def update_agent(session: Session, db_agent: Agent, agent_in: AgentUpdate) -> Agent:
    data = agent_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_agent, key, value)
    session.add(db_agent)
    session.commit()
    session.refresh(db_agent)
    return db_agent


def delete_agent(session: Session, db_agent: Agent) -> None:
    session.delete(db_agent)
    session.commit()

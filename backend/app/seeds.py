"""Seed helpers for local dev and tests."""
from datetime import datetime, timedelta
from sqlmodel import Session, select

from app.models import (
    Agent,
    AgentStatus,
    Tool,
    ToolType,
    ToolCategory,
    Toolchain,
    Event,
    EventAgent,
    EventTool,
    ToolchainTool,
    Tag,
    EventTag,
    EventType,
    EventSeverity,
    EventSource,
)


def seed_sample_data(session: Session) -> None:
    """Seed a minimal dataset for timeline UI and API tests."""
    if session.exec(select(Event)).first():
        return

    agent_a = Agent(name="build-agent-1", vm_hostname="build-agent-1.corp", os_type="linux", architecture="amd64")
    agent_b = Agent(
        name="build-agent-2",
        vm_hostname="build-agent-2.corp",
        os_type="linux",
        architecture="arm64",
        status=AgentStatus.MAINTENANCE,
    )
    tool_python = Tool(name="Python", type=ToolType.PYTHON_PACKAGE, category=ToolCategory.LANGUAGE_RUNTIME)
    tool_node = Tool(name="Node.js", type=ToolType.BINARY, category=ToolCategory.LANGUAGE_RUNTIME)
    toolchain_ci = Toolchain(name="default-ci", description="Core CI toolchain")
    tag_outage = Tag(name="outage")
    tag_rollout = Tag(name="rollout")

    session.add_all([agent_a, agent_b, tool_python, tool_node, toolchain_ci, tag_outage, tag_rollout])
    session.commit()
    session.refresh(agent_a)
    session.refresh(agent_b)
    session.refresh(tool_python)
    session.refresh(tool_node)
    session.refresh(toolchain_ci)

    session.add(ToolchainTool(toolchain_id=toolchain_ci.id, tool_id=tool_python.id))
    session.add(ToolchainTool(toolchain_id=toolchain_ci.id, tool_id=tool_node.id))

    now = datetime.utcnow()
    event1 = Event(
        title="Python upgraded on build-agent-1",
        description="Applied 3.11.2 runtime upgrade",
        timestamp=now - timedelta(hours=6),
        event_type=EventType.TOOL_UPDATE,
        severity=EventSeverity.WARNING,
        source=EventSource.AUTOMATED,
        details='{"job": "runtime-upgrade", "version_from": "3.10.8", "version_to": "3.11.2"}',
    )
    event2 = Event(
        title="Bitbucket connectivity lost",
        description="SCM checkout failures across agents",
        timestamp=now - timedelta(hours=2),
        event_type=EventType.OUTAGE,
        severity=EventSeverity.CRITICAL,
        source=EventSource.MANUAL,
        details='{"duration_minutes": 45, "suspected": true}',
    )

    session.add_all([event1, event2])
    session.commit()
    session.refresh(event1)
    session.refresh(event2)

    session.add(EventAgent(event_id=event1.id, agent_id=agent_a.id))
    session.add(EventTool(event_id=event1.id, tool_id=tool_python.id, version_from="3.10.8", version_to="3.11.2"))
    session.add(EventTag(event_id=event1.id, tag_id=tag_rollout.id))

    session.add(EventAgent(event_id=event2.id, agent_id=agent_a.id))
    session.add(EventAgent(event_id=event2.id, agent_id=agent_b.id))
    session.add(EventTag(event_id=event2.id, tag_id=tag_outage.id))

    session.commit()

# High-Level Design Plan: Jenkins Infrastructure Change Tracker

## Overview

A timeline-based change tracking system to correlate infrastructure changes with issues, making debugging and root cause analysis faster.

---

## 1. Data Model Design

### Core Entities

**Events Table** (Main entity)

- `id`, `timestamp`, `event_type` (enum: tool_install, tool_update, tool_removal, outage, patch, rollout, config_change)
- `title`, `description`
- `severity` (info, warning, critical)
- `source` (manual, automated, webhook)
- `metadata` (JSONB field for flexible additional data)

**Agents Table**

- `id`, `name`, `vm_hostname`, `labels[]`, `os_type`, `architecture`
- `status` (active, inactive, maintenance)

**Tools Table**

- `id`, `name`, `type` (docker_image, python_package, binary, sdk)
- `category` (language_runtime, build_tool, container, custom)

**Toolchains Table**

- `id`, `name`, `description`
- Many-to-many with Tools

**EventAgents** (junction)

- Links Events to one or more Agents

**EventTools** (junction)

- Links Events to Tools with version information
- `version_from`, `version_to`

**Tags Table** (optional)

- For flexible categorization (e.g., "suspected", "confirmed", "rollback")

---

## 2. Backend Architecture (FastAPI)

### API Endpoints Structure

```
/api/v1/
├── events/
│   ├── GET / (list with filtering)
│   ├── POST / (create)
│   ├── GET /{id}
│   ├── PUT /{id}
│   ├── DELETE /{id}
│   └── GET /timeline (optimized for timeline view)
├── agents/
│   ├── CRUD endpoints
│   └── GET /{id}/events (agent's event history)
├── tools/
│   └── CRUD endpoints
├── toolchains/
│   └── CRUD endpoints
└── webhooks/
    ├── POST /jenkins (receive Jenkins notifications)
    └── POST /generic (flexible webhook receiver)
```

### Key Backend Components

**Query Service**

- Complex filtering logic (date range, agent, label, tool, toolchain, event type)
- Efficient timeline aggregation queries
- Search functionality across descriptions

**Webhook Processors**

- Parse incoming data from Jenkins, Docker registries, package repositories
- Transform to internal event format
- Queue for processing (could use background tasks)

**Collection Scripts** (separate from API)

- Scheduled polling of Jenkins API for agent configurations
- Docker image change detection
- Python package version tracking
- Store as automated events

---

## 3. Frontend Architecture (React + Vite)

### Main Views

**1. Timeline View** (Primary interface)

- Horizontal timeline with swimlanes per agent/VM
- Color-coded by event type and severity
- Zoom controls (hour/day/week/month views)
- Click events for details
- Library suggestion: `react-chrono` or `vis-timeline-react`

**2. Filter Panel**

- Multi-select for Agents, Labels, Tools, Toolchains
- Date range picker
- Event type checkboxes
- Severity filter
- Search text input
- "Save filter" for common queries

**3. Event List View** (Alternative to timeline)

- Sortable table view
- Better for detailed review
- Export to CSV functionality

**4. Event Detail Modal/Page**

- Full event information
- Related events (same agent, same tool, same timeframe)
- Add comments/notes
- Link to external resources (Jenkins job, Jira ticket)

**5. Data Entry Forms**

- Quick-add for outages
- Detailed form for manual change records
- Bulk import from CSV

**6. Dashboard** (Optional Phase 2)

- Change frequency metrics
- Most active agents
- Recent critical events

### State Management

- React Query for server state (caching, refetching)
- Zustand or Context for UI state (filters, selected items)

---

## 4. Data Collection Strategy

### Automated Collection

**Phase 1: Polling Scripts**

```python
# Separate container or scheduled jobs
- jenkins_agent_poller.py (query agent configs daily)
- docker_image_tracker.py (check image updates)
- package_version_checker.py (scan agent environments)
```

**Phase 2: Webhooks**

- Configure Jenkins to send notifications on:
  - Agent configuration changes
  - Plugin updates
  - System restarts
- Docker registry webhooks for image pushes
- Integration with deployment tools

### Manual Entry

- Web form for historical data
- Outage reports
- Upgrade schedules
- CSV import for bulk historical data

---

## 5. Docker Compose Architecture

```yaml
services:
  backend:
    # FastAPI app
    # Expose port 8000
    # Mount SQLite volume

  frontend:
    # nginx serving built React app
    # Proxy /api to backend

  collector:
    # Scheduled polling scripts
    # Cron jobs or use APScheduler
    # Shares database with backend

  db-backup:
    # Periodic SQLite backups
```

**SQLite Configuration**

- Use WAL mode for better concurrency
- Regular backups to separate volume
- Consider size limits and archiving strategy

---

## 6. Implementation Phases

### Phase 1: MVP (2-3 weeks)

- [ ] Database schema and migrations (Alembic)
- [ ] Basic CRUD API for events, agents, tools
- [ ] Simple timeline visualization
- [ ] Filter by agent and date range
- [ ] Manual event entry form
- [ ] Docker compose setup

### Phase 2: Automation (1-2 weeks)

- [ ] Jenkins API polling script
- [ ] Docker image tracking
- [ ] Webhook endpoint implementation
- [ ] Automated event creation

### Phase 3: Enhanced UX (1-2 weeks)

- [ ] Advanced filtering (labels, toolchains)
- [ ] Search functionality
- [ ] Event relationships and correlation
- [ ] Export capabilities
- [ ] Improved timeline features (zoom, grouping)

### Phase 4: Intelligence (Future)

- [ ] Pattern detection (similar events before issues)
- [ ] Notifications for critical changes
- [ ] Integration with monitoring systems
- [ ] Correlation with issue tracking (Jira)

---

## 7. Key Technical Decisions

**Timeline Library Selection**

- Evaluate: react-chrono, vis-timeline, react-calendar-timeline
- Criteria: performance with 1000+ events, customization, mobile support

**Query Performance**

- Index on timestamp, agent_id, event_type
- Consider read replicas if query load grows
- May need PostgreSQL if SQLite becomes limiting

**Data Retention**

- Policy for archiving old events (>2 years?)
- Summary tables for long-term trends

**Security**

- Leverage existing auth system
- Role-based access (viewer, editor, admin)
- Audit log for manual changes

---

## 8. Sample Event Scenarios

```json
// Tool Update Event
{
  "event_type": "tool_update",
  "title": "Python upgraded on build-agent-5",
  "timestamp": "2024-03-15T14:30:00Z",
  "agents": ["build-agent-5"],
  "tools": [{
    "name": "Python",
    "version_from": "3.9.7",
    "version_to": "3.11.2"
  }],
  "source": "automated",
  "severity": "warning"
}

// Network Outage
{
  "event_type": "outage",
  "title": "Bitbucket connectivity lost",
  "timestamp": "2024-03-16T09:15:00Z",
  "agents": ["all"],
  "description": "SCM checkout failures across all agents",
  "source": "manual",
  "severity": "critical",
  "metadata": {
    "duration_minutes": 45,
    "suspected": true
  }
}
```

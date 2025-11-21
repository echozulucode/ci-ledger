import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./EventsPage.css";
import React from "react";

interface EventItem {
  id: number;
  title: string;
  description?: string | null;
  event_type: string;
  severity: string;
  source: string;
  timestamp: string;
  details?: string | null;
  agents?: { id: number; name: string }[];
  tools?: { id: number; name: string; version_from?: string | null; version_to?: string | null }[];
  tags?: { id: number; name: string }[];
  tag_ids?: number[];
}

interface Agent {
  id: number;
  name: string;
}

interface Tool {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function EventsPage() {
  const { user } = useAuth();
  const isAdmin = user?.is_admin;
  const [events, setEvents] = useState<EventItem[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
const [filters, setFilters] = useState({
    agentId: "",
    toolId: "",
    tagId: "",
    eventType: "",
    severity: "",
    source: "",
    start: "",
    end: "",
    page: 0,
    limit: 20,
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<EventItem[]>("/api/events", {
        params: {
          search: search || undefined,
          agent_id: filters.agentId || undefined,
          tool_id: filters.toolId || undefined,
          tag_id: filters.tagId || undefined,
          event_type: filters.eventType || undefined,
          severity: filters.severity || undefined,
          source: filters.source || undefined,
          start: filters.start ? new Date(filters.start).toISOString() : undefined,
          end: filters.end ? new Date(filters.end).toISOString() : undefined,
          skip: filters.page * filters.limit,
          limit: filters.limit,
        },
      });
      setEvents(response.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [agentsRes, toolsRes, tagsRes] = await Promise.all([
        api.get<Agent[]>("/api/agents"),
        api.get<Tool[]>("/api/tools"),
        api.get<Tag[]>("/api/tags"),
      ]);
      setAgents(agentsRes.data);
      setTools(toolsRes.data);
      setTags(tagsRes.data);
    } catch (err) {
      console.warn("Warning: could not load agents/tools for filters", err);
    }
  };

  useEffect(() => {
    const savedFilters = localStorage.getItem("ci-ledger-event-filters");
    const savedSearch = localStorage.getItem("ci-ledger-event-search");
    if (savedFilters) setFilters(JSON.parse(savedFilters));
    if (savedSearch) setSearch(savedSearch);
  }, []);

  useEffect(() => {
    loadFilters();
  }, []);

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.agentId, filters.toolId, filters.eventType, filters.severity, filters.source, filters.start, filters.end, search]);

  useEffect(() => {
    localStorage.setItem("ci-ledger-event-filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("ci-ledger-event-search", search);
  }, [search]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }));
  };

  const getTagNames = (evt: EventItem): string[] => {
    if (evt.tags && evt.tags.length > 0) return evt.tags.map((t) => t.name);
    if (evt.tag_ids && evt.tag_ids.length > 0) {
      return evt.tag_ids
        .map((id: number) => tags.find((t) => t.id === id)?.name)
        .filter((name): name is string => Boolean(name));
    }
    return [];
  };

  const clearFilters = () => {
    setFilters({
      agentId: "",
      toolId: "",
      tagId: "",
      eventType: "",
      severity: "",
      source: "",
      start: "",
      end: "",
      page: 0,
      limit: 20,
    });
    setSearch("");
  };

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    event_type: "outage",
    severity: "info",
    source: "manual",
    timestamp: new Date().toISOString().slice(0, 16),
    agentIds: [] as string[],
    toolId: "",
    versionFrom: "",
    versionTo: "",
    tagIds: [] as string[],
    details: "",
  });

  const handleCreateChange = (key: keyof typeof createForm, value: any) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    try {
      await api.post("/api/events", {
        title: createForm.title,
        description: createForm.description || null,
        event_type: createForm.event_type,
        severity: createForm.severity,
        source: createForm.source,
        timestamp: new Date(createForm.timestamp).toISOString(),
        details: createForm.details || null,
        agent_ids: createForm.agentIds.map((id) => Number(id)),
        tool_versions: createForm.toolId
          ? [{ tool_id: Number(createForm.toolId), version_from: createForm.versionFrom || null, version_to: createForm.versionTo || null }]
          : [],
        tag_ids: createForm.tagIds.map((id) => Number(id)),
      });
      setShowCreate(false);
      setCreateForm((prev) => ({ ...prev, title: "", description: "", details: "" }));
      loadEvents();
    } catch (err) {
      console.error("Failed to create event", err);
      alert("Failed to create event");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleString();

  return (
    <Layout>
      <div className="events-page">
        <div className="page-header">
          <div>
            <h1>Change Events</h1>
            <p className="muted">Recent CI infrastructure changes with agent/tool context.</p>
          </div>
          <div className="actions">
            <input
              type="search"
              placeholder="Search title/description"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button className="btn-primary" onClick={loadEvents} disabled={loading}>
              Refresh
            </button>
            {isAdmin && (
              <button className="btn-secondary" onClick={() => setShowCreate(true)}>
                New Event
              </button>
            )}
          </div>
        </div>

        <div className="view-toggle">
          <button
            className={`btn-secondary ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            List
          </button>
          <button
            className={`btn-secondary ${viewMode === "timeline" ? "active" : ""}`}
            onClick={() => setViewMode("timeline")}
          >
            Timeline
          </button>
        </div>

        <div className="filters">
          <select
            value={filters.agentId}
            onChange={(e) => handleFilterChange("agentId", e.target.value)}
          >
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select
            value={filters.agentId}
            onChange={(e) => handleFilterChange("agentId", e.target.value)}
          >
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          <select
            value={filters.toolId}
            onChange={(e) => handleFilterChange("toolId", e.target.value)}
          >
            <option value="">All tools</option>
            {tools.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={filters.tagId}
            onChange={(e) => handleFilterChange("tagId", e.target.value)}
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>

          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange("eventType", e.target.value)}
          >
            <option value="">All types</option>
            {["tool_install", "tool_update", "tool_removal", "outage", "patch", "rollout", "config_change"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange("severity", e.target.value)}
          >
            <option value="">All severities</option>
            {["info", "warning", "critical"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={filters.source}
            onChange={(e) => handleFilterChange("source", e.target.value)}
          >
            <option value="">All sources</option>
            {["manual", "automated", "webhook"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="date-range">
            <label>
              From
              <input
                type="datetime-local"
                value={filters.start}
                onChange={(e) => handleFilterChange("start", e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="datetime-local"
                value={filters.end}
                onChange={(e) => handleFilterChange("end", e.target.value)}
              />
            </label>
          </div>

          <button className="btn-secondary" onClick={loadEvents} disabled={loading}>
            Apply
          </button>
          <button className="btn-secondary" onClick={clearFilters} disabled={loading}>
            Clear
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading events...</div>}

        {!loading && events.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">⌛</div>
            <h3>No events yet</h3>
            <p>Add agents/tools and post events via the API to see them here.</p>
          </div>
        )}

        {!loading && events.length > 0 && viewMode === "list" && (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const tagNames = getTagNames(evt);
                  return (
                    <tr key={evt.id} onClick={() => setSelectedEvent(evt)} className="clickable-row">
                      <td className="mono">{formatDate(evt.timestamp)}</td>
                      <td>{evt.title}</td>
                      <td><span className="pill subtle">{evt.event_type}</span></td>
                      <td><span className={`badge badge-${evt.severity.toLowerCase()}`}>{evt.severity}</span></td>
                      <td>{evt.source}</td>
                      <td>
                        <div className="chips">
                          {tagNames.slice(0, 3).map((name) => (
                            <span key={name} className="pill subtle">{name}</span>
                          ))}
                          {tagNames.length > 3 && <span className="pill subtle">+{tagNames.length - 3}</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && events.length > 0 && viewMode === "timeline" && (
          <div className="timeline">
            {Object.entries(
              events.reduce((acc: Record<string, EventItem[]>, evt) => {
                const key = new Date(evt.timestamp).toISOString().slice(0, 10);
                acc[key] = acc[key] || [];
                acc[key].push(evt);
                return acc;
              }, {})
            ).map(([day, dayEvents]) => (
              <div key={day} className="timeline-day">
                <div className="timeline-date">{day}</div>
                <div className="timeline-items">
                  {dayEvents
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((evt) => (
                      <div key={evt.id} className="timeline-card" onClick={() => setSelectedEvent(evt)}>
                        <div className="timeline-header">
                          <span className={`badge badge-${evt.severity.toLowerCase()}`}>{evt.severity}</span>
                          <span className="event-type">{evt.event_type}</span>
                          <span className="timestamp">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="timeline-title">{evt.title}</div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="pagination">
            <button
              className="btn-secondary"
              disabled={filters.page === 0 || loading}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(prev.page - 1, 0) }))}
            >
              Prev
            </button>
            <span>Page {filters.page + 1}</span>
            <button
              className="btn-secondary"
              disabled={events.length < filters.limit || loading}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </button>
          </div>
        )}

        {selectedEvent && (
          <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <div className="modal-subhead">
                    <span className={`badge badge-${selectedEvent.severity.toLowerCase()}`}>{selectedEvent.severity}</span>
                    <span className="pill">{selectedEvent.event_type}</span>
                    <span className="pill">Source: {selectedEvent.source}</span>
                  </div>
                  <h3>{selectedEvent.title}</h3>
                  <div className="timestamp">{formatDate(selectedEvent.timestamp)}</div>
                </div>
                <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
              </div>
              {selectedEvent.description && <p className="description">{selectedEvent.description}</p>}
              {selectedEvent.agents && selectedEvent.agents.length > 0 && (
                <div className="modal-subhead">
                  {selectedEvent.agents.map((a) => (
                    <span key={a.id} className="pill">Agent: {a.name}</span>
                  ))}
                </div>
              )}
              {selectedEvent.tools && selectedEvent.tools.length > 0 && (
                <div className="modal-subhead">
                  {selectedEvent.tools.map((t) => (
                    <span key={t.id} className="pill">
                      {t.name} {t.version_from || t.version_to ? `(${t.version_from || "?"}→${t.version_to || "?"})` : ""}
                    </span>
                  ))}
                </div>
              )}
              {selectedEvent.tag_ids && selectedEvent.tag_ids.length > 0 && (
                <div className="modal-subhead">
                  {selectedEvent.tag_ids
                    .map((id: number) => tags.find((t) => t.id === id)?.name)
                    .filter((name): name is string => Boolean(name))
                    .map((name) => (
                      <span key={name} className="pill">{name}</span>
                    ))}
                </div>
              )}
              {selectedEvent.details && (
                <pre className="details-block">{selectedEvent.details}</pre>
              )}
              <div className="form-actions" style={{ marginTop: 8 }}>
                <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>
                  Close
                </button>
                {isAdmin && (
                  <button
                    className="btn-danger"
                    onClick={async () => {
                      const ok = window.confirm("Delete this event?");
                      if (!ok) return;
                      try {
                        await api.delete(`/api/events/${selectedEvent.id}`);
                        setSelectedEvent(null);
                        loadEvents();
                      } catch (err) {
                        console.error("Failed to delete event", err);
                        alert("Failed to delete event");
                      }
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {showCreate && isAdmin && (
          <div className="modal-overlay" onClick={() => setShowCreate(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h3>Create Event</h3>
                  <p className="muted">Admins only: record a change event.</p>
                </div>
                <button className="modal-close" onClick={() => setShowCreate(false)}>×</button>
              </div>
              <form className="form-grid" onSubmit={handleCreateSubmit}>
                <label>
                  Title
                  <input
                    required
                    value={createForm.title}
                    onChange={(e) => handleCreateChange("title", e.target.value)}
                    maxLength={255}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={createForm.description}
                    onChange={(e) => handleCreateChange("description", e.target.value)}
                    rows={3}
                    maxLength={4000}
                  />
                </label>
                <div className="form-row">
                  <label>
                    Type
                    <select value={createForm.event_type} onChange={(e) => handleCreateChange("event_type", e.target.value)}>
                      {["tool_install", "tool_update", "tool_removal", "outage", "patch", "rollout", "config_change"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Severity
                    <select value={createForm.severity} onChange={(e) => handleCreateChange("severity", e.target.value)}>
                      {["info", "warning", "critical"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Source
                    <select value={createForm.source} onChange={(e) => handleCreateChange("source", e.target.value)}>
                      {["manual", "automated", "webhook"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Timestamp
                    <input
                      type="datetime-local"
                      value={createForm.timestamp}
                      onChange={(e) => handleCreateChange("timestamp", e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Agents
                    <select
                      multiple
                      value={createForm.agentIds}
                      onChange={(e) => handleCreateChange("agentIds", Array.from(e.target.selectedOptions, o => o.value))}
                    >
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Tool
                    <select
                      value={createForm.toolId}
                      onChange={(e) => handleCreateChange("toolId", e.target.value)}
                    >
                      <option value="">None</option>
                      {tools.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Version from
                    <input
                      value={createForm.versionFrom}
                      onChange={(e) => handleCreateChange("versionFrom", e.target.value)}
                      placeholder="e.g. 1.2.3"
                    />
                  </label>
                  <label>
                    Version to
                    <input
                      value={createForm.versionTo}
                      onChange={(e) => handleCreateChange("versionTo", e.target.value)}
                      placeholder="e.g. 1.2.4"
                    />
                  </label>
                </div>
                <label>
                  Tags
                  <select
                    multiple
                    value={createForm.tagIds}
                    onChange={(e) => handleCreateChange("tagIds", Array.from(e.target.selectedOptions, o => o.value))}
                  >
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Metadata (JSON text)
                  <textarea
                    value={createForm.details}
                    onChange={(e) => handleCreateChange("details", e.target.value)}
                    rows={4}
                    placeholder='{"key": "value"}'
                  />
                </label>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={createSubmitting}>
                    {createSubmitting ? "Saving..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

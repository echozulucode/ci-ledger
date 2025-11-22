import { useEffect, useState, useMemo } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import "./EventsPage.css";
import React from "react";
import SectionHeader from "../components/SectionHeader";
import FilterBar, { FilterItem } from "../components/FilterBar";
import DisplayPopover from "../components/DisplayPopover";
import classNames from "../utils/classNames";
import Chip from "../components/Chip";
import ToastContainer from "../components/ToastContainer";

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

interface EventCreatePayload {
  title: string;
  description: string | null;
  event_type: string;
  severity: string;
  source: string;
  timestamp: string;
  details: string | null;
  agent_ids: number[];
  tool_versions: { tool_id: number; version_from: string | null; version_to: string | null }[];
  tag_ids: number[];
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
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [visibleColumns, setVisibleColumns] = useState<string[]>(["event_type", "severity", "source", "timestamp", "tags"]);
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" | "info"; actionLabel?: string; onAction?: () => void }[]
  >([]);
  const [undoPayload, setUndoPayload] = useState<EventCreatePayload | null>(null);
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const addToast = (toast: { message: string; type: "success" | "error" | "info"; actionLabel?: string; onAction?: () => void }) => {
    setToasts((prev) => [...prev, { id: Date.now(), ...toast }]);
  };

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const buildPayloadFromEvent = (evt: EventItem): EventCreatePayload => ({
    title: evt.title,
    description: evt.description ?? null,
    event_type: evt.event_type,
    severity: evt.severity,
    source: evt.source,
    timestamp: evt.timestamp,
    details: evt.details ?? null,
    agent_ids: evt.agents?.map((a) => a.id) ?? [],
    tool_versions:
      evt.tools?.map((t) => ({
        tool_id: t.id,
        version_from: t.version_from ?? null,
        version_to: t.version_to ?? null,
      })) ?? [],
    tag_ids: evt.tag_ids ?? evt.tags?.map((t) => t.id) ?? [],
  });

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

  const removeFilter = (key: keyof typeof filters | "search") => {
    if (key === "search") {
      setSearch("");
      return;
    }
    handleFilterChange(key, "");
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCreateChange = (key: keyof typeof createForm, value: any) => {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  };

  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");
  const activeFilters: FilterItem[] = useMemo(() => {
    const entries: FilterItem[] = [];
    if (search) entries.push({ key: "search", label: `Search: ${search}` });
    if (filters.agentId) {
      const agentName = agents.find((a) => String(a.id) === filters.agentId)?.name || "Agent";
      entries.push({ key: "agentId", label: `Agent: ${agentName}` });
    }
    if (filters.toolId) {
      const toolName = tools.find((t) => String(t.id) === filters.toolId)?.name || "Tool";
      entries.push({ key: "toolId", label: `Tool: ${toolName}` });
    }
    if (filters.tagId) {
      const tagName = tags.find((t) => String(t.id) === filters.tagId)?.name || "Tag";
      entries.push({ key: "tagId", label: `Tag: ${tagName}` });
    }
    if (filters.eventType) entries.push({ key: "eventType", label: `Type: ${filters.eventType}` });
    if (filters.severity) entries.push({ key: "severity", label: `Severity: ${filters.severity}` });
    if (filters.source) entries.push({ key: "source", label: `Source: ${filters.source}` });
    if (filters.start) entries.push({ key: "start", label: `From: ${filters.start}` });
    if (filters.end) entries.push({ key: "end", label: `To: ${filters.end}` });
    return entries;
  }, [search, filters, agents, tools, tags]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const savedViews = [
    { label: "Recent", description: "Reset filters", onSelect: () => clearFilters() },
    { label: "Critical", description: "Show critical severity", onSelect: () => handleFilterChange("severity", "critical") },
    { label: "Manual source", description: "Events created manually", onSelect: () => handleFilterChange("source", "manual") },
  ];

  const columnDefs = [
    {
      key: "event_type",
      label: "Type",
      render: (evt: EventItem) => <span className="pill subtle">{evt.event_type}</span>,
    },
    {
      key: "severity",
      label: "Severity",
      render: (evt: EventItem) => <span className={`pill ${evt.severity === "critical" ? "badge-critical" : evt.severity === "warning" ? "badge-warning" : "badge-info"}`}>{evt.severity}</span>,
    },
    {
      key: "source",
      label: "Source",
      render: (evt: EventItem) => <span className="pill subtle">{evt.source}</span>,
    },
    {
      key: "timestamp",
      label: "Timestamp",
      render: (evt: EventItem) => new Date(evt.timestamp).toLocaleString(),
    },
    {
      key: "tags",
      label: "Tags",
      render: (evt: EventItem) => (
        <div className="chips">
          {getTagNames(evt).map((tag) => (
            <Chip key={tag} label={tag} tone="ghost" />
          ))}
        </div>
      ),
    },
  ];

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

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
      addToast({ message: "Event created", type: "success" });
    } catch (err) {
      console.error("Failed to create event", err);
      addToast({ message: "Failed to create event", type: "error" });
    } finally {
      setCreateSubmitting(false);
    }
  };

  const formatDate = (value: string) => new Date(value).toLocaleString();
  const handleDeleteEvent = async (evt: EventItem) => {
    const ok = window.confirm("Delete this event?");
    if (!ok) return;
    const payload = buildPayloadFromEvent(evt);
    try {
      await api.delete(`/api/events/${evt.id}`);
      setSelectedEvent(null);
      setUndoPayload(payload);
      loadEvents();
      const toastId = Date.now();
      setToasts((prev) => [
        ...prev,
        { id: toastId, message: "Event deleted", type: "info", actionLabel: "Undo", onAction: () => handleUndoDelete(toastId) },
      ]);
    } catch (err) {
      console.error("Failed to delete event", err);
      addToast({ message: "Failed to delete event", type: "error" });
    }
  };
  const handleUndoDelete = async (toastId?: number) => {
    if (toastId) removeToast(toastId);
    if (!undoPayload) return;
    try {
      await api.post("/api/events", undoPayload);
      setUndoPayload(null);
      loadEvents();
      addToast({ message: "Event restored", type: "success" });
    } catch (err) {
      console.error("Failed to undo delete", err);
      addToast({ message: "Failed to restore event", type: "error" });
    }
  };

  return (
    <Layout>
      <div className="events-page">
        <SectionHeader
          title="Change Events"
          count={events.length}
          meta="Recent CI infrastructure changes with agent/tool context."
          actions={
            <div className="actions">
              <input
                type="search"
                placeholder="Search title/description"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                aria-label="Search events"
                ref={searchInputRef}
              />
              <DisplayPopover
                density={density}
                onDensityChange={setDensity}
                columns={columnDefs.map((col) => ({ key: col.key, label: col.label, visible: visibleColumns.includes(col.key) }))}
                onToggleColumn={toggleColumn}
              />
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
              <button className="btn-primary" onClick={loadEvents} disabled={loading}>
                Refresh
              </button>
              {isAdmin && (
                <button className="btn-secondary" onClick={() => setShowCreate(true)}>
                  New Event
                </button>
              )}
            </div>
          }
        />

        <FilterBar activeFilters={activeFilters} onRemoveFilter={(key) => removeFilter(key as any)} onClearAll={clearFilters} savedViews={savedViews}>
          <select value={filters.agentId} onChange={(e) => handleFilterChange("agentId", e.target.value)}>
            <option value="">All agents</option>
            {agents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <select value={filters.toolId} onChange={(e) => handleFilterChange("toolId", e.target.value)}>
            <option value="">All tools</option>
            {tools.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select value={filters.tagId} onChange={(e) => handleFilterChange("tagId", e.target.value)}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          <select value={filters.eventType} onChange={(e) => handleFilterChange("eventType", e.target.value)}>
            <option value="">All types</option>
            {["tool_install", "tool_update", "tool_removal", "outage", "patch", "rollout", "config_change"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select value={filters.severity} onChange={(e) => handleFilterChange("severity", e.target.value)}>
            <option value="">All severities</option>
            {["info", "warning", "critical"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select value={filters.source} onChange={(e) => handleFilterChange("source", e.target.value)}>
            <option value="">All sources</option>
            {["manual", "automated", "webhook"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
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

        </FilterBar>

        {error && <div className="error-message">{error}</div>}
        {loading && (
          <div className="table-card">
            <div style={{ padding: 12, display: "grid", gap: 10 }}>
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="skeleton-row" />
              ))}
            </div>
          </div>
        )}

        {!loading && events.length === 0 && !error && (
          <div className="empty-state">
            <div className="empty-icon">⌛</div>
            <h3>No events yet</h3>
            <p>Add agents/tools and post events via the API to see them here.</p>
          </div>
        )}

        {!loading && events.length > 0 && viewMode === "list" && (
          <div className="table-card">
            <table className={classNames("data-table", density === "compact" && "density-compact")}>
              <thead>
                <tr>
                  <th>Event</th>
                  {columnDefs
                    .filter((col) => visibleColumns.includes(col.key))
                    .map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const tagNames = getTagNames(evt);
                  return (
                    <tr key={evt.id} onClick={() => setSelectedEvent(evt)} className="clickable-row">
                      <td>
                        <div className="row-title">{evt.title}</div>
                        <div className="row-meta">
                          <span className="mono">{formatDate(evt.timestamp)}</span>
                          <Chip label={evt.event_type} tone="ghost" />
                          <Chip label={evt.source} tone="ghost" />
                          {tagNames.slice(0, 2).map((name) => (
                            <Chip key={name} label={name} tone="ghost" />
                          ))}
                          {tagNames.length > 2 && <Chip label={`+${tagNames.length - 2}`} tone="ghost" />}
                        </div>
                      </td>
                      {columnDefs
                        .filter((col) => visibleColumns.includes(col.key))
                        .map((col) => (
                          <td key={col.key}>{col.render(evt)}</td>
                        ))}
                      <td className="row-actions-cell">
                        <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}>
                          Open
                        </button>
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
              <div className="sheet-actions">
                <div className="muted small-text">Esc closes • Delete supports undo</div>
                <div className="actions">
                  <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>
                    Close
                  </button>
                  {isAdmin && (
                    <button
                      className="btn-danger"
                      onClick={() => selectedEvent && handleDeleteEvent(selectedEvent)}
                    >
                      Delete
                    </button>
                  )}
                </div>
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
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ justifySelf: "start" }}
                  onClick={() => setShowAdvanced((prev) => !prev)}
                >
                  {showAdvanced ? "Hide advanced" : "Show advanced"}
                </button>
                {showAdvanced && (
                  <>
                    <div className="form-row">
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
                      Metadata (JSON text)
                      <textarea
                        value={createForm.details}
                        onChange={(e) => handleCreateChange("details", e.target.value)}
                        rows={4}
                        placeholder='{"key": "value"}'
                      />
                    </label>
                  </>
                )}
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
                <div className="sheet-actions">
                  <div className="muted small-text">Enter to save • Esc to close</div>
                  <div className="actions">
                    <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={createSubmitting}>
                      {createSubmitting ? "Saving..." : "Create"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </Layout>
  );
}


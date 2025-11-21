import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";
import "./EventsPage.css";

interface EventItem {
  id: number;
  title: string;
  description?: string | null;
  event_type: string;
  severity: string;
  source: string;
  timestamp: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<EventItem[]>("/api/events", {
        params: {
          search: search || undefined,
          limit: 50,
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

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Loading events...</div>}

        {!loading && events.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">⌛</div>
            <h3>No events yet</h3>
            <p>Add agents/tools and post events via the API to see them here.</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="events-list">
            {events.map((evt) => (
              <div key={evt.id} className="event-card">
                <div className="event-card__header">
                  <div>
                    <span className={`badge badge-${evt.severity.toLowerCase()}`}>{evt.severity}</span>
                    <span className="event-type">{evt.event_type}</span>
                  </div>
                  <span className="timestamp">{formatDate(evt.timestamp)}</span>
                </div>
                <h3>{evt.title}</h3>
                {evt.description && <p className="description">{evt.description}</p>}
                <div className="meta">
                  <span className="pill">Source: {evt.source}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

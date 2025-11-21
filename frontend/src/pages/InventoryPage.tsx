import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './InventoryPage.css';

type Resource = 'agents' | 'tools' | 'tags';

type Agent = { id: number; name: string; os_type?: string };
type Tool = { id: number; name: string; type?: string; category?: string };
type Tag = { id: number; name: string };

type ResourceItem = Agent | Tool | Tag;

const emptyForms = {
  agents: { name: '', os_type: '' },
  tools: { name: '', type: 'other', category: 'other' },
  tags: { name: '' },
};

const endpoints: Record<Resource, string> = {
  agents: '/api/agents',
  tools: '/api/tools',
  tags: '/api/tags',
};

export default function InventoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.is_admin;
  const [resource, setResource] = useState<Resource>('agents');
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForms[resource]);

  useEffect(() => {
    setForm(emptyForms[resource]);
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(endpoints[resource]);
      setItems(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(endpoints[resource], form);
      setForm(emptyForms[resource]);
      loadItems();
    } catch (err) {
      console.error(err);
      alert('Create failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      setLoading(true);
      await api.delete(`${endpoints[resource]}/${id}`);
      setItems((prev) => prev.filter((i: any) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="inventory-page">
          <h1>Inventory</h1>
          <p>Admin access required.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="inventory-page">
        <div className="page-header">
          <div>
            <h1>Inventory</h1>
            <p className="muted">Manage agents, tools, and tags.</p>
          </div>
          <div className="view-toggle">
            {(['agents','tools','tags'] as Resource[]).map((res) => (
              <button
                key={res}
                className={`btn-secondary ${resource === res ? 'active' : ''}`}
                onClick={() => setResource(res)}
              >
                {res.charAt(0).toUpperCase() + res.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="inventory-grid">
          <form className="form-grid" onSubmit={handleCreate}>
            <h3>Create {resource.slice(0, -1)}</h3>
            <label>
              Name
              <input
                required
                value={form.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </label>
            {resource === 'agents' && (
              <label>
                OS
                <input
                  value={form.os_type || ''}
                  onChange={(e) => handleChange('os_type', e.target.value)}
                />
              </label>
            )}
            {resource === 'tools' && (
              <div className="form-row">
                <label>
                  Type
                  <input
                    value={form.type || ''}
                    onChange={(e) => handleChange('type', e.target.value)}
                  />
                </label>
                <label>
                  Category
                  <input
                    value={form.category || ''}
                    onChange={(e) => handleChange('category', e.target.value)}
                  />
                </label>
              </div>
            )}
            <div className="form-actions">
              <button className="btn-secondary" type="submit" disabled={loading}>
                Create
              </button>
            </div>
          </form>

          <div className="inventory-table">
            <div className="table-header">
              <h3>{resource.charAt(0).toUpperCase() + resource.slice(1)}</h3>
              <button className="btn-secondary" onClick={loadItems} disabled={loading}>
                Refresh
              </button>
            </div>
            {loading && <div className="loading">Loading...</div>}
            {!loading && items.length === 0 && <div className="empty-state">No entries yet.</div>}
            {!loading && items.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    {resource === 'agents' && <th>OS</th>}
                    {resource === 'tools' && <th>Type</th>}
                    {resource === 'tools' && <th>Category</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      {resource === 'agents' && <td>{item.os_type || '-'}</td>}
                      {resource === 'tools' && <td>{item.type || '-'}</td>}
                      {resource === 'tools' && <td>{item.category || '-'}</td>}
                      <td>
                        <button className="btn-secondary" onClick={() => handleDelete(item.id)} disabled={loading}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

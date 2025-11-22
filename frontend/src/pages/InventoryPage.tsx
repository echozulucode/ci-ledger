import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './InventoryPage.css';
import SectionHeader from '../components/SectionHeader';
import FilterBar, { FilterItem } from '../components/FilterBar';
import DisplayPopover from '../components/DisplayPopover';
import Chip from '../components/Chip';
import classNames from '../utils/classNames';

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
  const [filters, setFilters] = useState<{ search: string }>({ search: '' });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['type', 'category', 'os_type']);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

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

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
        <SectionHeader
          title="Inventory"
          meta="Manage agents, tools, and tags."
          actions={
            <div className="actions">
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
              <DisplayPopover
                density={density}
                onDensityChange={setDensity}
                columns={[
                  { key: 'type', label: 'Type', visible: visibleColumns.includes('type') },
                  { key: 'category', label: 'Category', visible: visibleColumns.includes('category') },
                  { key: 'os_type', label: 'OS', visible: visibleColumns.includes('os_type') },
                ]}
                onToggleColumn={(key) =>
                  setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]))
                }
              />
            </div>
          }
        />

        <FilterBar
          activeFilters={
            filters.search
              ? ([{ key: 'search', label: `Search: ${filters.search}` }] as FilterItem[])
              : []
          }
          onRemoveFilter={(key) => key === 'search' && handleFilterChange('search', '')}
          onClearAll={() => handleFilterChange('search', '')}
        >
          <input
            type="search"
            placeholder={`Search ${resource}`}
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </FilterBar>

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
              <div className="actions">
                <button className="btn-secondary" onClick={loadItems} disabled={loading}>
                  Refresh
                </button>
              </div>
            </div>
            {loading && <div className="loading">Loading...</div>}
            {!loading && items.length === 0 && <div className="empty-state">No entries yet.</div>}
            {!loading && items.length > 0 && (
              <table className={classNames("data-table", density === "compact" && "density-compact")}>
                <thead>
                  <tr>
                    <th>Name</th>
                    {resource === 'agents' && visibleColumns.includes('os_type') && <th>OS</th>}
                    {resource === 'tools' && visibleColumns.includes('type') && <th>Type</th>}
                    {resource === 'tools' && visibleColumns.includes('category') && <th>Category</th>}
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((item: any) => item.name.toLowerCase().includes((filters.search || '').toLowerCase()))
                    .map((item: any) => (
                      <tr key={item.id}>
                        <td>
                          <div className="row-title">{item.name}</div>
                          <div className="row-meta">
                            {resource === 'agents' && (item as Agent).os_type ? <Chip label={(item as Agent).os_type!} tone="ghost" /> : null}
                            {resource === 'tools' && visibleColumns.includes('type') && (item as Tool).type ? <Chip label={(item as Tool).type!} tone="ghost" /> : null}
                            {resource === 'tools' && visibleColumns.includes('category') && (item as Tool).category ? <Chip label={(item as Tool).category!} tone="ghost" /> : null}
                          </div>
                        </td>
                        {resource === 'agents' && visibleColumns.includes('os_type') && <td>{(item as Agent).os_type || '-'}</td>}
                        {resource === 'tools' && visibleColumns.includes('type') && <td>{(item as Tool).type || '-'}</td>}
                        {resource === 'tools' && visibleColumns.includes('category') && <td>{(item as Tool).category || '-'}</td>}
                        {resource === 'tags' && <td></td>}
                        <td style={{ textAlign: 'right' }}>
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

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import './ItemsPage.css';

interface Item {
  id: number;
  title: string;
  description: string | null;
  status: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

interface ItemFormData {
  title: string;
  description: string;
  status: string;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    status: 'active'
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setError('Failed to fetch items');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', status: 'active' });
    setShowModal(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = async (item: Item) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchItems();
      } else {
        alert('Failed to delete item');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('access_token');
      const url = editingItem 
        ? `http://localhost:8000/api/items/${editingItem.id}`
        : 'http://localhost:8000/api/items';
      
      const response = await fetch(url, {
        method: editingItem ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchItems();
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to save item');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-badge status-active';
      case 'completed': return 'status-badge status-completed';
      case 'archived': return 'status-badge status-archived';
      default: return 'status-badge';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading items...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="items-page">
      <div className="page-header">
        <h1>My Items</h1>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="icon">➕</span>
          Create Item
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No items yet</h2>
          <p>Create your first item to get started</p>
          <button className="btn-primary" onClick={handleCreate}>
            Create Item
          </button>
        </div>
      ) : (
        <div className="items-grid">
          {items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-header">
                <h3>{item.title}</h3>
                <span className={getStatusBadgeClass(item.status)}>
                  {item.status}
                </span>
              </div>
              
              {item.description && (
                <p className="item-description">{item.description}</p>
              )}
              
              <div className="item-meta">
                <span className="item-date">
                  Created: {formatDate(item.created_at)}
                </span>
              </div>
              
              <div className="item-actions">
                <button 
                  className="btn-secondary btn-sm" 
                  onClick={() => handleEdit(item)}
                >
                  ✏️ Edit
                </button>
                <button 
                  className="btn-danger btn-sm" 
                  onClick={() => handleDelete(item)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Create New Item'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={200}
                  placeholder="Enter item title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={2000}
                  rows={4}
                  placeholder="Enter item description (optional)"
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update Item' : 'Create Item'}
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

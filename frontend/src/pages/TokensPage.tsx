import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import './TokensPage.css';
import SectionHeader from '../components/SectionHeader';
import FilterBar, { FilterItem } from '../components/FilterBar';
import DisplayPopover from '../components/DisplayPopover';
import Chip from '../components/Chip';
import classNames from '../utils/classNames';

interface Token {
  id: number;
  name: string;
  scopes: string;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  is_active: boolean;
}

interface NewToken {
  id: number;
  name: string;
  token: string;
  scopes: string;
  expires_at: string | null;
  created_at: string;
}

function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTokenData, setNewTokenData] = useState<NewToken | null>(null);
  
  // Form state
  const [tokenName, setTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['read']);
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [filters, setFilters] = useState<{ search: string }>({ search: '' });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['status', 'last_used_at', 'expires_at', 'created_at']);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/users/me/tokens', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tokens');
      }

      const data = await response.json();
      setTokens(data);
    } catch (err) {
      console.error('TokensPage failed:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/users/me/tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tokenName,
          scopes: selectedScopes.join(','),
          expires_in_days: expiresInDays || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create token');
      }

      const newToken: NewToken = await response.json();
      setNewTokenData(newToken);
      setShowCreateModal(false);
      setTokenName('');
      setSelectedScopes(['read']);
      setExpiresInDays('');
      fetchTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRevokeToken = async (tokenId: number, tokenName: string) => {
    if (!confirm(`Are you sure you want to revoke the token "${tokenName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8000/api/users/me/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke token');
      }

      fetchTokens();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('TokensPage failed:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy token:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handleScopeToggle = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const activeFilters: FilterItem[] = filters.search ? [{ key: 'search', label: `Search: ${filters.search}` }] : [];

  if (loading) {
    return (
      <Layout>
        <div className="tokens-page">
          <div className="loading">Loading tokens...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="tokens-page">
        <SectionHeader
          title="Personal Access Tokens"
          meta="Scope-based API credentials. Copy tokens immediately after creation."
          actions={
            <div className="actions">
              <DisplayPopover
                density={density}
                onDensityChange={setDensity}
                columns={[
                  { key: 'status', label: 'Status', visible: visibleColumns.includes('status') },
                  { key: 'last_used_at', label: 'Last Used', visible: visibleColumns.includes('last_used_at') },
                  { key: 'expires_at', label: 'Expires', visible: visibleColumns.includes('expires_at') },
                  { key: 'created_at', label: 'Created', visible: visibleColumns.includes('created_at') },
                ]}
                onToggleColumn={(key) =>
                  setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]))
                }
              />
              <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                <span className="icon">+</span> Create New Token
              </button>
            </div>
          }
        />

        <FilterBar
          activeFilters={activeFilters}
          onRemoveFilter={(key) => key === 'search' && setFilters({ search: '' })}
          onClearAll={() => setFilters({ search: '' })}
        >
          <input
            type="search"
            placeholder="Search tokens"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="search-input"
          />
        </FilterBar>

        <div className="tokens-info">
          <p className="info-text">
            Personal access tokens function like passwords for API authentication.
            Keep them secure and never share them.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

      {/* New Token Display Modal */}
      {newTokenData && (
        <div className="modal-overlay" onClick={() => setNewTokenData(null)}>
          <div className="modal-content token-display-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Token Created Successfully</h2>
              <button className="btn-close" onClick={() => setNewTokenData(null)}>×</button>
            </div>
            
            <div className="token-display-box">
              <div className="warning-box">
                <strong>⚠️ Important:</strong> Copy this token now. You won&apos;t be able to see it again!
              </div>
              
              <div className="token-value-container">
                <code className="token-value">{newTokenData.token}</code>
                <button 
                  className="btn-copy" 
                  onClick={() => copyToClipboard(newTokenData.token)}
                >
                  📋 Copy
                </button>
              </div>
              
              <div className="token-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{newTokenData.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Scopes:</span>
                  <span className="detail-value">{newTokenData.scopes}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Expires:</span>
                  <span className="detail-value">{formatDate(newTokenData.expires_at)}</span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setNewTokenData(null)}>
                I&apos;ve saved the token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Token Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Personal Access Token</h2>
              <button className="btn-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateToken}>
              <div className="form-group">
                <label>Token Name *</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={e => setTokenName(e.target.value)}
                  placeholder="e.g., CI/CD Pipeline"
                  required
                  minLength={3}
                  maxLength={100}
                />
                <small>A descriptive name for this token</small>
              </div>

              <div className="form-group">
                <label>Scopes *</label>
                <div className="scopes-container">
                  <label className="scope-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes('read')}
                      onChange={() => handleScopeToggle('read')}
                    />
                    <span>
                      <strong>read</strong> - Read access to resources
                    </span>
                  </label>
                  <label className="scope-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes('write')}
                      onChange={() => handleScopeToggle('write')}
                    />
                    <span>
                      <strong>write</strong> - Write access to resources
                    </span>
                  </label>
                  <label className="scope-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes('admin')}
                      onChange={() => handleScopeToggle('admin')}
                    />
                    <span>
                      <strong>admin</strong> - Administrative access
                    </span>
                  </label>
                </div>
                {selectedScopes.length === 0 && (
                  <small className="error-text">Select at least one scope</small>
                )}
              </div>

              <div className="form-group">
                <label>Expiration (optional)</label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={e => setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Days until expiration"
                  min={1}
                  max={365}
                />
                <small>Leave empty for no expiration (1-365 days)</small>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={selectedScopes.length === 0}
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="tokens-list">
        {tokens.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <h3>No tokens yet</h3>
            <p>Create a personal access token to use with the API</p>
          </div>
        ) : (
          <div className="tokens-table-container">
            <table className={classNames("tokens-table", density === "compact" && "density-compact")}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scopes</th>
                  {visibleColumns.includes('status') && <th>Status</th>}
                  {visibleColumns.includes('last_used_at') && <th>Last Used</th>}
                  {visibleColumns.includes('expires_at') && <th>Expires</th>}
                  {visibleColumns.includes('created_at') && <th>Created</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tokens
                  .filter((t) => t.name.toLowerCase().includes(filters.search.toLowerCase()))
                  .map(token => (
                    <tr key={token.id} className={!token.is_active || isExpired(token.expires_at) ? 'inactive' : ''}>
                      <td className="token-name">
                        <div className="row-title">{token.name}</div>
                        <div className="row-meta">
                          {token.scopes.split(',').slice(0, 3).map(scope => (
                            <Chip key={scope} label={scope.trim()} tone="ghost" />
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="scopes-badges">
                          {token.scopes.split(',').map(scope => (
                            <span key={scope} className={`scope-badge scope-${scope.trim()}`}>
                              {scope.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                      {visibleColumns.includes('status') && (
                        <td>
                          {!token.is_active ? (
                            <span className="status-badge status-inactive">Inactive</span>
                          ) : isExpired(token.expires_at) ? (
                            <span className="status-badge status-expired">Expired</span>
                          ) : (
                            <span className="status-badge status-active">Active</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('last_used_at') && <td className="date-cell">{formatDate(token.last_used_at)}</td>}
                      {visibleColumns.includes('expires_at') && <td className="date-cell">{formatDate(token.expires_at)}</td>}
                      {visibleColumns.includes('created_at') && <td className="date-cell">{formatDate(token.created_at)}</td>}
                      <td>
                        <button
                          className="btn-revoke"
                          onClick={() => handleRevokeToken(token.id, token.name)}
                          title="Revoke token"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default TokensPage;




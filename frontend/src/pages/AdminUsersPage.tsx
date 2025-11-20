/**
 * Admin Users Management Page
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import api from '../services/api';
import { User } from '../services/api';
import UserModal, { UserFormData } from '../components/UserModal';
import './AdminUsersPage.css';

const AdminUsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<User[]>('/api/users/');
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData: UserFormData) => {
    try {
      await api.post('/api/auth/register', userData);
      setSuccess('User created successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditUser = async (userData: UserFormData) => {
    if (!selectedUser) return;

    try {
      await api.put(`/api/users/${selectedUser.id}`, userData);
      setSuccess('User updated successfully!');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      await api.put(`/api/users/${userId}`, {
        is_active: !currentStatus
      });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await api.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentUser?.is_admin) {
    return (
      <Layout>
        <div className="access-denied">
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-users-page">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage all users in the system</p>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner">
          {success}
        </div>
      )}

      <div className="users-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="control-buttons">
          <button className="btn-primary" onClick={openCreateModal}>
            ➕ Create User
          </button>
          <button className="btn-secondary" onClick={fetchUsers}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="user-name">
                        {user.full_name}
                        {user.id === currentUser.id && (
                          <span className="you-badge">You</span>
                        )}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.is_admin ? 'admin' : 'user'}`}>
                        {user.is_admin ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(user)}
                          title="Edit user"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          disabled={user.id === currentUser.id}
                        >
                          {user.is_active ? '🚫' : '✅'}
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => deleteUser(user.id)}
                          title="Delete user"
                          disabled={user.id === currentUser.id}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="table-footer">
            <p>Showing {filteredUsers.length} of {users.length} users</p>
          </div>
        </div>
      )}

      <UserModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={modalMode === 'create' ? handleCreateUser : handleEditUser}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
    </Layout>
  );
};

export default AdminUsersPage;

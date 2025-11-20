/**
 * User Profile Page
 */
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userAPI } from '../services/api';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await userAPI.updateProfile({ full_name: fullName });
      setMessage('Profile updated successfully!');
      setEditing(false);
      // Refresh user data
      if (user) {
        await login(user.email, currentPassword);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await userAPI.changePassword(currentPassword, newPassword);
      setMessage('Password changed successfully!');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information</p>
      </div>

      {message && (
        <div className="success-banner">
          {message}
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="profile-grid">
        {/* Profile Information Card */}
        <div className="profile-card">
          <h2>Profile Information</h2>

          {!editing ? (
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Full Name:</span>
                <span className="info-value">{user?.full_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Role:</span>
                <span className="info-value">
                  {user?.is_admin ? '👑 Admin' : '👤 User'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className={`info-value ${user?.is_active ? 'active' : 'inactive'}`}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <button
                className="btn-secondary"
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (read-only)</label>
                <input
                  id="email"
                  type="email"
                  value={user?.email}
                  disabled
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditing(false);
                    setFullName(user?.full_name || '');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Change Password Card */}
        <div className="profile-card">
          <h2>Change Password</h2>

          {!changingPassword ? (
            <div className="password-info">
              <p>Keep your account secure by using a strong password.</p>
              <button
                className="btn-secondary"
                onClick={() => setChangingPassword(true)}
              >
                🔒 Change Password
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="edit-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Update Password
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

/**
 * User Create/Edit Modal Component
 */
import React, { useState, useEffect } from 'react';
import { User } from '../services/api';
import './UserModal.css';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserFormData) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit';
}

export interface UserFormData {
  email: string;
  full_name: string;
  password?: string;
  is_admin: boolean;
  is_active: boolean;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, mode }) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    password: '',
    is_admin: false,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        password: '',
        is_admin: user.is_admin,
        is_active: user.is_active,
      });
    } else if (mode === 'create') {
      setFormData({
        email: '',
        full_name: '',
        password: '',
        is_admin: false,
        is_active: true,
      });
    }
    setError('');
  }, [mode, user, isOpen]);

  const validatePassword = (pwd: string): string | null => {
    if (mode === 'create' && pwd.length === 0) {
      return 'Password is required';
    }
    if (pwd.length > 0 && pwd.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (pwd.length > 0 && !/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (pwd.length > 0 && !/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (pwd.length > 0 && !/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.email || !formData.full_name) {
      setError('Email and full name are required');
      return;
    }

    // Validate password
    const passwordError = validatePassword(formData.password || '');
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    try {
      // For edit mode, only include password if it's being changed
      const dataToSend = { ...formData };
      if (mode === 'edit' && !dataToSend.password) {
        delete dataToSend.password;
      }

      await onSave(dataToSend);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Create New User' : 'Edit User'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="modal-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="user@example.com"
              required
              disabled={mode === 'edit'}
            />
            {mode === 'edit' && (
              <small className="form-hint">Email cannot be changed</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={mode === 'create' ? 'Enter password' : 'Leave blank to keep current'}
              required={mode === 'create'}
            />
            <small className="form-hint">
              Min 8 characters, 1 uppercase, 1 lowercase, 1 number
            </small>
          </div>

          <div className="form-group-row">
            <div className="form-checkbox">
              <input
                id="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
              />
              <label htmlFor="is_active">Active</label>
            </div>

            <div className="form-checkbox">
              <input
                id="is_admin"
                type="checkbox"
                checked={formData.is_admin}
                onChange={(e) => handleChange('is_admin', e.target.checked)}
              />
              <label htmlFor="is_admin">Administrator</label>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;

/**
 * Dashboard Page Component
 * Protected page that shows user information
 */
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="dashboard-container">
        <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome, {user?.full_name}!</h2>
          <p>You are successfully logged in.</p>
        </div>

        <div className="user-info-card">
          <h3>Your Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">{user?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Full Name:</span>
              <span className="info-value">{user?.full_name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Status:</span>
              <span className={`info-value ${user?.is_active ? 'active' : 'inactive'}`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Role:</span>
              <span className="info-value">
                {user?.is_admin ? '👑 Admin' : '👤 User'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">User ID:</span>
              <span className="info-value">{user?.id}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="api-info-card">
          <h3>Backend API</h3>
          <p>✅ Connected to: <code>http://localhost:8000</code></p>
          <p>📚 API Docs: <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer">http://localhost:8000/docs</a></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;

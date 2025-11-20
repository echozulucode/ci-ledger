/**
 * Top Navigation Bar Component
 * Displays logo, navigation, and user menu
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './TopBar.css';

const TopBar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-container">
        {/* Logo and Brand */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="topbar-brand">
          <span className="topbar-logo">🚀</span>
          <span className="topbar-title">FastAPI Demo</span>
        </Link>

        {/* Navigation Links (for authenticated users) */}
        {isAuthenticated && (
          <nav className="topbar-nav">
            <Link 
              to="/dashboard" 
              className={`topbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/items" 
              className={`topbar-link ${location.pathname === '/items' ? 'active' : ''}`}
            >
              Items
            </Link>
            <Link 
              to="/tokens" 
              className={`topbar-link ${location.pathname === '/tokens' ? 'active' : ''}`}
            >
              API Tokens
            </Link>
            {user?.is_admin && (
              <Link 
                to="/admin/users" 
                className={`topbar-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
              >
                Users
              </Link>
            )}
          </nav>
        )}

        {/* Right side: Login button or User menu */}
        <div className="topbar-actions">
          {!isAuthenticated ? (
            <Link to="/login" className="topbar-login-btn">
              Login
            </Link>
          ) : (
            <div className="topbar-user-menu" ref={menuRef}>
              <button 
                className="topbar-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="user-name">{user?.full_name}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{user?.full_name}</div>
                    <div className="dropdown-user-email">{user?.email}</div>
                    {user?.is_admin && (
                      <span className="dropdown-admin-badge">Admin</span>
                    )}
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="dropdown-icon">👤</span>
                    Profile
                  </Link>
                  <Link 
                    to="/tokens" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <span className="dropdown-icon">🔑</span>
                    API Tokens
                  </Link>
                  {user?.is_admin && (
                    <Link 
                      to="/admin/users" 
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="dropdown-icon">👥</span>
                      User Management
                    </Link>
                  )}
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item dropdown-logout"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

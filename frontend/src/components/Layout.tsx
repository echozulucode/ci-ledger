/**
 * Main Layout Component with Top Navigation
 */
import React from 'react';
import TopBar from './TopBar';
import './Layout.css';
import CommandPalette, { CommandItem } from './CommandPalette';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPalette, setShowPalette] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
      if (key === 'escape') {
        setShowPalette(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const commands: CommandItem[] = React.useMemo(() => {
    if (!isAuthenticated) return [];
    const items: CommandItem[] = [
      { label: 'Dashboard', description: 'Go to dashboard', shortcut: 'G D', action: () => navigate('/dashboard'), group: 'Navigate' },
      { label: 'Events', description: 'View change events', shortcut: 'G E', action: () => navigate('/events'), group: 'Navigate' },
      { label: 'API Tokens', description: 'Manage personal access tokens', shortcut: 'G T', action: () => navigate('/tokens'), group: 'Navigate' },
      { label: 'Profile', description: 'View your profile', shortcut: 'G P', action: () => navigate('/profile'), group: 'Navigate' },
      { label: 'Log out', description: 'Sign out', shortcut: '⌘/Ctrl + L', action: () => logout(), group: 'Account' },
    ];
    if (user?.is_admin) {
      items.push(
        { label: 'Inventory', description: 'Agents, tools, tags', shortcut: 'G I', action: () => navigate('/inventory'), group: 'Navigate' },
        { label: 'User Management', description: 'Admin users', shortcut: 'G U', action: () => navigate('/admin/users'), group: 'Navigate' },
      );
    }
    return items;
  }, [isAuthenticated, navigate, user, logout]);

  return (
    <div className="layout">
      <TopBar />
      <main className="main-content">
        {children}
      </main>
      <CommandPalette open={showPalette} onClose={() => setShowPalette(false)} commands={commands} />
    </div>
  );
};

export default Layout;

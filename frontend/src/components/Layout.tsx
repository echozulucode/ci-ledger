/**
 * Main Layout Component with Top Navigation
 */
import React from 'react';
import TopBar from './TopBar';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <TopBar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

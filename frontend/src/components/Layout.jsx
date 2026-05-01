import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
    <span className="nav-icon">{icon}</span>
    <span className="nav-label">{label}</span>
  </NavLink>
);

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">TaskFlow</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-label">Main</div>
            <NavItem to="/dashboard" icon="◫" label="Dashboard" />
            <NavItem to="/projects" icon="⬡" label="Projects" />
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar avatar-lg">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className={`user-role ${isAdmin ? 'admin' : 'member'}`}>
                {isAdmin ? '⬆ Admin' : '◎ Member'}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm logout-btn" onClick={handleLogout}>
            ⇥ Sign out
          </button>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <button className="btn btn-ghost btn-icon mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <div className="topbar-right">
            <div className="avatar">{initials}</div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

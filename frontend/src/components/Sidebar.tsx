import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Send, 
  BookOpen, 
  History, 
  BarChart3, 
  User,
  Sparkles,
  LogOut,
  LogIn
} from 'lucide-react';
import type { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  profile, 
  onOpenAuth, 
  onLogout 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assistant', label: 'Networking Assistant', icon: MessageSquarePlus },
    { id: 'follow-up', label: 'Follow-Up Assistant', icon: Send },
    { id: 'topic-ref', label: 'Topic Reference', icon: BookOpen },
    { id: 'history', label: 'Networking History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  const isAuthenticated = profile.name && profile.name !== "Guest User" && profile.name.trim() !== "";

  return (
    <aside className="sidebar">
      <div className="brand-title">
        <div className="brand-logo-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-text-name">AI Networking</div>
          <div className="brand-text-tag">COMPANION v2.2</div>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="sidebar-user" onClick={() => isAuthenticated ? setActiveTab('profile') : onOpenAuth()} style={{ cursor: 'pointer' }}>
          <div className="user-avatar" style={{ background: isAuthenticated ? '#2563eb' : '#64748b' }}>
            {isAuthenticated ? profile.name.charAt(0) : 'G'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="user-name" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {isAuthenticated ? profile.name : 'Guest User'}
            </div>
            <div className="user-status" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: isAuthenticated ? '#94a3b8' : '#cbd5e1' }}>
              {isAuthenticated ? (profile.status || 'Active Member') : 'Not Signed In'}
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <button
            className="btn btn-secondary"
            onClick={onLogout}
            style={{ width: '100%', padding: '8px', fontSize: '12px', gap: '6px' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onOpenAuth}
            style={{ width: '100%', padding: '8px', fontSize: '12px', gap: '6px' }}
          >
            <LogIn size={14} /> Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
};

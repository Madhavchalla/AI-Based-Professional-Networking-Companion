import React from 'react';
import { 
  LayoutDashboard, 
  MessageSquarePlus, 
  Users, 
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
    { id: 'person-matcher', label: 'Smart Person Matcher', icon: Users },
    { id: 'follow-up', label: 'Follow-Up Assistant', icon: Send },
    { id: 'topic-ref', label: 'Topic Reference', icon: BookOpen },
    { id: 'history', label: 'Networking History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-title">
        <div className="brand-logo-icon">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="brand-text-name">AI Networking</div>
          <div className="brand-text-tag">COMPANION v2.1</div>
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
        <div className="sidebar-user" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
          <div className="user-avatar">
            {profile.name ? profile.name.charAt(0) : 'C'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="user-name" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {profile.name || 'Challa Madhav'}
            </div>
            <div className="user-status" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {profile.status || 'AI Engineer'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-secondary"
            onClick={onOpenAuth}
            style={{ flex: 1, padding: '6px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <LogIn size={12} /> Account
          </button>
          <button
            className="btn btn-secondary"
            onClick={onLogout}
            style={{ padding: '6px 10px', fontSize: '11px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
            title="Log Out"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </aside>
  );
};

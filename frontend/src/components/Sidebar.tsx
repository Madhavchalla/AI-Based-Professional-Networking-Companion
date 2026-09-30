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
  Sparkles
} from 'lucide-react';
import type { UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, profile }) => {
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
          <Sparkles size={22} />
        </div>
        <div>
          <div className="brand-text-name">AI Networking</div>
          <div className="brand-text-tag">COMPANION v2.0</div>
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

      <div className="sidebar-user" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
        <div className="user-avatar">
          {profile.name ? profile.name.charAt(0) : 'A'}
        </div>
        <div>
          <div className="user-name">{profile.name || 'Alex Morgan'}</div>
          <div className="user-status">{profile.status || 'AI Researcher'}</div>
        </div>
      </div>
    </aside>
  );
};

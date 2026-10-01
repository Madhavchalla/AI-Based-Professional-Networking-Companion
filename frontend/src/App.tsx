import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Assistant } from './components/Assistant';
import { PersonMatcher } from './components/PersonMatcher';
import { FollowUpAssistant } from './components/FollowUpAssistant';
import { TopicReference } from './components/TopicReference';
import { HistoryPage } from './components/HistoryPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { UserProfileView } from './components/UserProfile';
import { AuthModal } from './components/AuthModal';
import type { UserProfile } from './types';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    status: 'Not Signed In',
    skills: [],
    interests: [],
    career_goals: 'Set your career goals in the User Profile tab or Sign In.',
    preferred_goals: [],
    conversation_style: 'Balanced (Technical + Professional)'
  });

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    api.getProfile().then((res) => {
      if (res) setProfile(res);
    });
  }, [refreshKey]);

  const handleLogout = async () => {
    await api.logout();
    setProfile({
      name: '',
      status: 'Not Signed In',
      skills: [],
      interests: [],
      career_goals: '',
      preferred_goals: [],
      conversation_style: 'Balanced (Technical + Professional)'
    });
    handleDataChange();
    setIsAuthOpen(true);
  };

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard profile={profile} setActiveTab={setActiveTab} refreshKey={refreshKey} />
        </div>
        <div style={{ display: activeTab === 'assistant' ? 'block' : 'none' }}>
          <Assistant profile={profile} onDataChange={handleDataChange} />
        </div>
        <div style={{ display: activeTab === 'person-matcher' ? 'block' : 'none' }}>
          <PersonMatcher profile={profile} onDataChange={handleDataChange} refreshKey={refreshKey} />
        </div>
        <div style={{ display: activeTab === 'follow-up' ? 'block' : 'none' }}>
          <FollowUpAssistant />
        </div>
        <div style={{ display: activeTab === 'topic-ref' ? 'block' : 'none' }}>
          <TopicReference />
        </div>
        <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
          <HistoryPage profile={profile} onOpenAuth={() => setIsAuthOpen(true)} refreshKey={refreshKey} />
        </div>
        <div style={{ display: activeTab === 'analytics' ? 'block' : 'none' }}>
          <AnalyticsPage profile={profile} refreshKey={refreshKey} />
        </div>
        <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
          <UserProfileView profile={profile} setProfile={setProfile} onDataChange={handleDataChange} />
        </div>
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(updatedProfile) => setProfile(updatedProfile)}
        onDataChange={handleDataChange}
      />
    </div>
  );
}

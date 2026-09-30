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
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    status: 'Not Signed In',
    skills: [],
    interests: [],
    career_goals: 'Set your career goals in the User Profile tab or Sign In.',
    preferred_goals: [],
    conversation_style: 'Balanced (Technical + Professional)'
  });

  useEffect(() => {
    api.getProfile().then((res) => {
      if (res) setProfile(res);
    });
  }, []);

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
        {activeTab === 'dashboard' && <Dashboard profile={profile} setActiveTab={setActiveTab} />}
        {activeTab === 'assistant' && <Assistant profile={profile} />}
        {activeTab === 'person-matcher' && <PersonMatcher profile={profile} />}
        {activeTab === 'follow-up' && <FollowUpAssistant />}
        {activeTab === 'topic-ref' && <TopicReference />}
        {activeTab === 'history' && <HistoryPage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'profile' && <UserProfileView profile={profile} setProfile={setProfile} />}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(updatedProfile) => setProfile(updatedProfile)}
      />
    </div>
  );
}

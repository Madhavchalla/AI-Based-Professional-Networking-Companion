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
    name: 'Challa Madhav',
    status: 'AI Engineer & Researcher',
    skills: ['Machine Learning', 'Python', 'React', 'Data Ethics', 'FastAPI'],
    interests: ['Artificial Intelligence', 'Generative AI', 'Career Growth', 'Patient Safety', 'Data Ethics'],
    career_goals: 'Targeting AI Research & Machine Learning Engineering roles at top tech companies.',
    preferred_goals: ['Find a mentor', 'Explore career opportunities', 'Meet researchers'],
    conversation_style: 'Balanced (Technical + Professional)'
  });

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setProfile({
      name: 'Guest User',
      status: 'Not Signed In',
      skills: ['Artificial Intelligence'],
      interests: ['AI', 'Networking'],
      career_goals: 'Please sign in to personalize career goals.',
      preferred_goals: ['Build professional connections'],
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

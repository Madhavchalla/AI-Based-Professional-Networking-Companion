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
import type { UserProfile } from './types';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Alex Morgan',
    status: 'Final Year AI & CS Student',
    skills: ['Machine Learning', 'Python', 'React', 'Data Ethics', 'FastAPI'],
    interests: ['Artificial Intelligence', 'Generative AI', 'Career Growth', 'Patient Safety', 'Data Ethics'],
    career_goals: 'Targeting AI Research & Machine Learning Engineering roles at top tech companies.',
    preferred_goals: ['Find a mentor', 'Explore career opportunities', 'Meet researchers'],
    conversation_style: 'Balanced (Technical + Professional)'
  });

  useEffect(() => {
    api.getProfile().then(setProfile);
  }, []);

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />

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
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Target, 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  BookOpen,
  ThumbsUp,
  UserCheck
} from 'lucide-react';
import type { UserProfile, AnalyticsData, ConversationSession, MatchedPerson } from '../types';
import { api } from '../api';

interface DashboardProps {
  profile: UserProfile;
  setActiveTab: (tab: string) => void;
  refreshKey?: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, setActiveTab, refreshKey }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSessions, setRecentSessions] = useState<ConversationSession[]>([]);
  const [recentPeople, setRecentPeople] = useState<MatchedPerson[]>([]);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
    api.getHistory().then((data) => setRecentSessions(data.slice(0, 3)));
    api.getPeople().then((data) => setRecentPeople(data.slice(0, 3)));
  }, [profile, refreshKey]);

  const userName = profile.name ? profile.name.split(' ')[0] : 'there';

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">COMPREHENSIVE DASHBOARD</span>
        <h1 className="header-title">Welcome back{profile.name ? `, ${userName}` : ''}! 🤝</h1>
        <p className="header-subtitle">
          Your AI-powered networking assistant is ready. Analyze upcoming events, discover matching attendees, 
          and prepare multi-step conversation flows tailored to your goals.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="metric-value">{analytics?.total_events ?? 0}</div>
            <div className="metric-label">Events Analyzed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Users size={22} />
          </div>
          <div>
            <div className="metric-value">{analytics?.total_people ?? 0}</div>
            <div className="metric-label">People Matched</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="metric-value">{analytics?.total_conversations ?? 0}</div>
            <div className="metric-label">Conversations Generated</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            <ThumbsUp size={22} />
          </div>
          <div>
            <div className="metric-value">{analytics?.positive_rate ?? 0}%</div>
            <div className="metric-label">Positive Feedback</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <div className="card">
            <h3 className="card-title">
              <Sparkles size={18} color="#2563eb" /> Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('assistant')}>
                <MessageSquare size={16} /> Create Session
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('person-matcher')}>
                <UserCheck size={16} /> Find Person Match
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('follow-up')}>
                <TrendingUp size={16} /> Write Follow-Up
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('topic-ref')}>
                <BookOpen size={16} /> Wikipedia Reference
              </button>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                <Calendar size={18} color="#2563eb" /> Recent Networking Sessions
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setActiveTab('history')}>
                View All <ArrowRight size={12} />
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0' }}>
                No recent networking sessions. Click <strong>Create Session</strong> to analyze your first event!
              </div>
            ) : (
              recentSessions.map((session, idx) => (
                <div key={idx} style={{ padding: '12px 0', borderBottom: idx !== recentSessions.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 700 }}>{session.event_name || 'Networking Event'}</h4>
                    <span className="tag-badge-emerald">{session.goal || 'Build connections'}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    {session.event_description.length > 80 ? session.event_description.substring(0, 80) + '...' : session.event_description}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {session.topics?.map((t, i) => (
                      <span key={i} className="tag-badge" style={{ fontSize: '11px', padding: '2px 8px' }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="card">
            <h3 className="card-title">
              <Target size={18} color="#4f46e5" /> Your Active Goals
            </h3>
            {profile.preferred_goals && profile.preferred_goals.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {profile.preferred_goals.map((g, i) => (
                  <span key={i} className="tag-badge-indigo">{g}</span>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                No active goals set. Configure goals in <strong>User Profile</strong>.
              </div>
            )}
            
            <h4 style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '6px', fontWeight: 600 }}>Interests:</h4>
            {profile.interests && profile.interests.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.interests.map((int, i) => (
                  <span key={i} className="tag-badge">
                    {int}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                Add your interests in User Profile.
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                <Users size={18} color="#2563eb" /> Matched People
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setActiveTab('person-matcher')}>
                Add Person
              </button>
            </div>

            {recentPeople.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '10px 0' }}>
                No contacts saved yet. Click <strong>Add Person</strong> to match a contact!
              </div>
            ) : (
              recentPeople.map((person, i) => (
                <div key={i} style={{ padding: '10px 0', borderBottom: i !== recentPeople.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '14px' }}>{person.name}</span>
                    <span className="tag-badge-emerald" style={{ fontSize: '11px' }}>{person.match_percentage}% match</span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{person.title}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

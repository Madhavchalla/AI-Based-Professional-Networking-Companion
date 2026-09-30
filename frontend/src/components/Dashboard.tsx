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
}

export const Dashboard: React.FC<DashboardProps> = ({ profile, setActiveTab }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentSessions, setRecentSessions] = useState<ConversationSession[]>([]);
  const [recentPeople, setRecentPeople] = useState<MatchedPerson[]>([]);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
    api.getHistory().then((data) => setRecentSessions(data.slice(0, 3)));
    api.getPeople().then((data) => setRecentPeople(data.slice(0, 3)));
  }, []);

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">COMPREHENSIVE DASHBOARD</span>
        <h1 className="header-title">Welcome back, {profile.name.split(' ')[0]}! 🤝</h1>
        <p className="header-subtitle">
          Your AI-powered networking assistant is ready. Analyze upcoming events, discover matching attendees, 
          and prepare multi-step conversation flows tailored to your goals.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(255, 94, 58, 0.15)', color: '#ff5e3a' }}>
            <Calendar size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics?.total_events || 3}</div>
            <div className="metric-label">Events Analyzed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(0, 255, 208, 0.15)', color: '#00ffd0' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics?.total_people || 6}</div>
            <div className="metric-label">People Matched</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics?.total_conversations || 14}</div>
            <div className="metric-label">Conversations Generated</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics?.positive_rate || 92}%</div>
            <div className="metric-label">Positive Feedback</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
          <div className="card">
            <h3 className="card-title">
              <Sparkles size={20} color="#ff5e3a" /> Quick Actions
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
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
                <Calendar size={20} color="#00ffd0" /> Recent Networking Sessions
              </h3>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setActiveTab('history')}>
                View All <ArrowRight size={12} />
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '20px 0' }}>
                No recent networking sessions. Click <strong>Create Session</strong> to prepare for your first event!
              </div>
            ) : (
              recentSessions.map((session, idx) => (
                <div key={idx} style={{ padding: '14px 0', borderBottom: idx !== recentSessions.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 700 }}>{session.event_name || 'AI Healthcare Summit'}</h4>
                    <span className="tag-badge-emerald">{session.goal || 'Find a mentor'}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    {session.event_description.length > 80 ? session.event_description.substring(0, 80) + '...' : session.event_description}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
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
              <Target size={20} color="#818cf8" /> Your Active Goals
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {profile.preferred_goals.map((g, i) => (
                <span key={i} className="tag-badge-indigo">{g}</span>
              ))}
            </div>
            <h4 style={{ color: 'var(--text-sub)', fontSize: '13px', marginBottom: '8px' }}>Interests:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.interests.map((int, i) => (
                <span key={i} className="tag-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {int}
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 className="card-title" style={{ margin: 0 }}>
                <Users size={20} color="#ff5e3a" /> Matched People
              </h3>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setActiveTab('person-matcher')}>
                Add Person
              </button>
            </div>

            {recentPeople.map((person, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i !== recentPeople.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{person.name}</span>
                  <span className="tag-badge-emerald" style={{ fontSize: '11px' }}>{person.match_percentage}% match</span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{person.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

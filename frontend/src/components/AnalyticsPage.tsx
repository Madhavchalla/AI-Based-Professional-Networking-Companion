import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ThumbsUp, Award, PieChart, Zap } from 'lucide-react';
import type { AnalyticsData, UserProfile } from '../types';
import { api } from '../api';

interface AnalyticsPageProps {
  profile?: UserProfile;
  refreshKey?: number;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ profile, refreshKey }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
  }, [profile, refreshKey]);

  if (!analytics) return <div style={{ color: 'var(--text-muted)', padding: '20px' }}>Loading analytics...</div>;

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">PERFORMANCE METRICS & PERSONALIZATION</span>
        <h1 className="header-title">📈 Networking Analytics</h1>
        <p className="header-subtitle">
          Track engagement statistics, top discussed topics, goal distribution, and inspect how your 
          feedback (👍/👎) continuously tunes AI conversation personalization weights.
        </p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.total_events}</div>
            <div className="metric-label">Events Analyzed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.total_people}</div>
            <div className="metric-label">People Matched</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <Zap size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.total_conversations}</div>
            <div className="metric-label">Conversations Generated</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            <ThumbsUp size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.positive_rate}%</div>
            <div className="metric-label">Positive Feedback Rate</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 className="card-title">
            <TrendingUp size={20} color="#2563eb" /> Top Discussed Topics
          </h3>
          <div style={{ marginTop: '16px' }}>
            {analytics.top_topics.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No session topics recorded yet.</div>
            ) : (
              analytics.top_topics.map(([topic, count], i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600 }}>{topic}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} sessions</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (count / Math.max(1, analytics.total_events)) * 100)}%`,
                        background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">
            <PieChart size={20} color="#16a34a" /> AI Personalization Preference Weights
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Dynamically updated based on your 👍 / 👎 feedback on technical vs career questions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Technical & Architecture Depth</span>
                <span style={{ color: '#2563eb', fontWeight: 700 }}>{Math.round(analytics.preferences.technical_weight * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.preferences.technical_weight * 100}%`, background: '#2563eb', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Career Growth & Mentorship Focus</span>
                <span style={{ color: '#4f46e5', fontWeight: 700 }}>{Math.round(analytics.preferences.career_weight * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.preferences.career_weight * 100}%`, background: '#4f46e5', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>Research & Ethics Exploration</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>{Math.round(analytics.preferences.research_weight * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.preferences.research_weight * 100}%`, background: '#16a34a', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


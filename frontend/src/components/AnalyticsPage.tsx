import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, ThumbsUp, Award, PieChart, Zap } from 'lucide-react';
import type { AnalyticsData } from '../types';
import { api } from '../api';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.getAnalytics().then(setAnalytics);
  }, []);

  if (!analytics) return <div style={{ color: '#fff', padding: '20px' }}>Loading analytics...</div>;

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
          <div className="metric-icon" style={{ background: 'rgba(255, 94, 58, 0.15)', color: '#ff5e3a' }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.total_events}</div>
            <div className="metric-label">Events Analyzed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(0, 255, 208, 0.15)', color: '#00ffd0' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.total_people}</div>
            <div className="metric-label">People Matched</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Zap size={24} />
          </div>
          <div>
            <div className="metric-value">{analytics.total_conversations}</div>
            <div className="metric-label">Conversations Generated</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>
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
            <TrendingUp size={20} color="#ff5e3a" /> Top Discussed Topics
          </h3>
          <div style={{ marginTop: '16px' }}>
            {analytics.top_topics.map(([topic, count], i) => (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                  <span>{topic}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{count} sessions</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, (count / 5) * 100)}%`,
                      background: 'linear-gradient(90deg, #ff5e3a 0%, #ff8a00 100%)',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">
            <PieChart size={20} color="#00ffd0" /> AI Personalization Preference Weights
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Dynamically updated based on your 👍 / 👎 feedback on technical vs career questions.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                <span>Technical & Architecture Depth</span>
                <span style={{ color: '#00ffd0' }}>{Math.round(analytics.preferences.technical_weight * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.preferences.technical_weight * 100}%`, background: '#00ffd0', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                <span>Career Growth & Mentorship Focus</span>
                <span style={{ color: '#818cf8' }}>{Math.round(analytics.preferences.career_weight * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.preferences.career_weight * 100}%`, background: '#6366f1', borderRadius: '4px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                <span>Research & Ethics Exploration</span>
                <span style={{ color: '#ff7856' }}>{Math.round(analytics.preferences.research_weight * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${analytics.preferences.research_weight * 100}%`, background: '#ff5e3a', borderRadius: '4px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

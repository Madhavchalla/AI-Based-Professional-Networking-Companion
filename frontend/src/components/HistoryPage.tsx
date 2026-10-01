import React, { useEffect, useState } from 'react';
import { History, LogIn, Lock } from 'lucide-react';
import type { ConversationSession, UserProfile } from '../types';
import { api } from '../api';

interface HistoryPageProps {
  profile?: UserProfile;
  onOpenAuth?: () => void;
  refreshKey?: number;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ profile, onOpenAuth, refreshKey }) => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const isAuthenticated = profile?.name && profile.name !== "Guest User" && profile.name.trim() !== "";

  useEffect(() => {
    if (isAuthenticated) {
      api.getHistory().then(setSessions);
    } else {
      setSessions([]);
    }
  }, [isAuthenticated, refreshKey]);

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">SESSION LOGS</span>
        <h1 className="header-title">📜 Networking History</h1>
        <p className="header-subtitle">
          Review previous networking activities, goals, extracted topics, multi-step starters, 
          and post-event notes saved to your private history.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">
          <History size={18} color="#2563eb" /> Saved Networking Sessions ({sessions.length})
        </h3>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <Lock size={32} color="#64748b" style={{ marginBottom: '12px' }} />
            <h4 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 700 }}>Private Networking History</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px', maxWidth: '440px', margin: '4px auto 16px' }}>
              You are currently using Guest Mode. Sign in or create an account to securely save and access your past networking sessions.
            </p>
            {onOpenAuth && (
              <button className="btn btn-primary" onClick={onOpenAuth}>
                <LogIn size={14} /> Sign In / Register
              </button>
            )}
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>
            No sessions saved yet. Run the <strong>Networking Assistant</strong> to generate and save your first session.
          </div>
        ) : (
          <div className="timeline-flow" style={{ marginTop: '16px' }}>
            {sessions.map((s, idx) => (
              <div key={idx} className="timeline-step">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 700 }}>{s.event_name || 'Networking Event'}</h4>
                  <span className="tag-badge-emerald">{s.goal || 'Build connections'}</span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                  {s.event_description}
                </p>

                <div style={{ display: 'flex', gap: '6px', margin: '10px 0' }}>
                  {s.topics?.map((t, i) => (
                    <span key={i} className="tag-badge" style={{ fontSize: '11px' }}>{t}</span>
                  ))}
                </div>

                {s.multi_step_flow && s.multi_step_flow.length > 0 && (
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginBottom: '4px' }}>
                      Key Icebreaker Starter:
                    </div>
                    <div style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                      "{typeof s.multi_step_flow[0] === 'string' ? s.multi_step_flow[0] : (s.multi_step_flow[0]?.question || (s.multi_step_flow[0] as any)?.options?.[0])}"
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

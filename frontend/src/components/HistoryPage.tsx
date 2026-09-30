import React, { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import type { ConversationSession } from '../types';
import { api } from '../api';

export const HistoryPage: React.FC = () => {
  const [sessions, setSessions] = useState<ConversationSession[]>([]);

  useEffect(() => {
    api.getHistory().then(setSessions);
  }, []);

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">SESSION LOGS</span>
        <h1 className="header-title">📜 Networking History</h1>
        <p className="header-subtitle">
          Review previous networking activities, goals, extracted topics, multi-step starters, 
          and post-event notes saved to your persistent history.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">
          <History size={20} color="#ff5e3a" /> Saved Networking Sessions ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', padding: '20px 0' }}>
            No sessions saved yet. Run the <strong>Networking Assistant</strong> to generate and save your first session.
          </div>
        ) : (
          <div className="timeline-flow" style={{ marginTop: '16px' }}>
            {sessions.map((s, idx) => (
              <div key={idx} className="timeline-step" style={{ borderLeftColor: '#00ffd0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: '#fff', fontSize: '18px', fontWeight: 800 }}>{s.event_name || 'Networking Event'}</h4>
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
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginTop: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#ff5e3a', fontWeight: 700, marginBottom: '6px' }}>
                      Key Icebreaker Starter:
                    </div>
                    <div style={{ color: '#fff', fontSize: '13px' }}>
                      "{typeof s.multi_step_flow[0] === 'string' ? s.multi_step_flow[0] : s.multi_step_flow[0]?.question}"
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

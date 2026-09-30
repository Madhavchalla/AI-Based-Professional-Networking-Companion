import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';
import type { WikiReference } from '../types';
import { api } from '../api';

export const TopicReference: React.FC = () => {
  const [query, setQuery] = useState('Blockchain in Healthcare');
  const [wikiData, setWikiData] = useState<WikiReference | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.getWikiReference(query);
      setWikiData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sampleTopics = [
    'Blockchain in Healthcare',
    'Generative AI',
    'Data Ethics',
    'Machine Learning',
    'Patient Safety',
    'Smart Cities'
  ];

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">KNOWLEDGE PREPARATION</span>
        <h1 className="header-title">📖 Topic Information / Wikipedia Reference</h1>
        <p className="header-subtitle">
          Quickly verify concept definitions, background history, and technical terminology 
          via the Wikipedia API to build confidence before walking into your networking events.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">
          <Search size={20} color="#ff5e3a" /> Search Topic or Technology
        </h3>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            className="input-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Generative AI, Data Ethics, Quantum Computing..."
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching Wikipedia...' : '🔍 Search Reference'}
          </button>
        </form>

        <div style={{ marginTop: '16px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px' }}>Popular Topics:</span>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {sampleTopics.map((t, idx) => (
              <span
                key={idx}
                className="tag-badge-emerald"
                onClick={() => { setQuery(t); api.getWikiReference(t).then(setWikiData); }}
                style={{ cursor: 'pointer' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {wikiData && (
        <div className="card" style={{ borderLeft: '4px solid #00ffd0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ color: '#fff', fontSize: '22px', fontWeight: 800 }}>{wikiData.query}</h3>
            <span className="tag-badge-emerald" style={{ fontSize: '11px' }}>Wikipedia API Summary</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ color: 'var(--text-sub)', fontSize: '15px', lineHeight: '1.7' }}>
              {wikiData.reference_summary}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
            <Info size={14} color="#00ffd0" />
            <span>This reference provides objective background context to support your networking discussions.</span>
          </div>
        </div>
      )}
    </div>
  );
};

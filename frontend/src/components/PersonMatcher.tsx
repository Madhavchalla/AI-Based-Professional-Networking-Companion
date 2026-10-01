import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, UserCheck, AlertCircle } from 'lucide-react';
import type { UserProfile, MatchedPerson } from '../types';
import { api } from '../api';

interface PersonMatcherProps {
  profile: UserProfile;
  onDataChange?: () => void;
  refreshKey?: number;
}

export const PersonMatcher: React.FC<PersonMatcherProps> = ({ profile, onDataChange, refreshKey }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [personInterests, setPersonInterests] = useState('');
  const [notes, setNotes] = useState('');
  const [matchedResult, setMatchedResult] = useState<MatchedPerson | null>(null);
  const [savedPeople, setSavedPeople] = useState<MatchedPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.getPeople().then(setSavedPeople);
  }, [profile, refreshKey]);

  const handleMatch = async () => {
    setErrorMsg('');
    if (!name.trim() || !title.trim() || !personInterests.trim()) {
      setErrorMsg("⚠️ Please enter the contact's name, title/organization, and known interests.");
      return;
    }
    setLoading(true);
    setMatchedResult(null);
    try {
      const interestsArray = personInterests.split(',').map((i) => i.trim()).filter(Boolean);
      const res = await api.matchPerson({
        name: name.trim(),
        title: title.trim(),
        person_interests: interestsArray,
        notes: notes.trim()
      });
      setMatchedResult(res);
      const updated = await api.getPeople();
      setSavedPeople(updated);
      if (onDataChange) onDataChange();
    } catch (e: any) {
      setErrorMsg(e.message || 'Matching failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">SMART MATCHING ENGINE</span>
        <h1 className="header-title">👥 Person & Interest Matcher</h1>
        <p className="header-subtitle">
          Calculate interest overlaps, discover mutual synergies, and generate customized icebreakers 
          before reaching out to researchers, mentors, or potential collaborators.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 className="card-title">
            <UserPlus size={18} color="#2563eb" /> Target Contact Details
          </h3>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name (Required)</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrorMsg(''); }}
              placeholder="e.g. Dr. Rahul Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Title / Role / Organization (Required)</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrorMsg(''); }}
              placeholder="e.g. Senior AI Researcher at BioHealth AI"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Known Interests / Topics (Required, comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={personInterests}
              onChange={(e) => { setPersonInterests(e.target.value); setErrorMsg(''); }}
              placeholder="e.g. Generative AI, Patient Safety, Healthcare AI"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Context / Met At Notes</label>
            <textarea
              className="textarea-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spoke about LLM safety in clinical diagnosis."
              style={{ minHeight: '70px' }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleMatch} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Calculating Overlaps...' : '🔍 Calculate Synergies & Opener'}
          </button>
        </div>

        <div>
          {matchedResult ? (
            <div className="card" style={{ borderColor: '#bbf7d0', background: '#f0fdf4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 700 }}>{matchedResult.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{matchedResult.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>
                    {matchedResult.match_percentage}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overlap Match</div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Common Interests Identified:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {matchedResult.common_interests.map((ci, idx) => (
                    <span key={idx} className="tag-badge-emerald">{ci}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '14px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Why You Should Connect:
                </h4>
                <p style={{ color: 'var(--text-main)', fontSize: '14px', marginTop: '4px', lineHeight: '1.5' }}>
                  {matchedResult.reason_to_connect}
                </p>
              </div>

              <div style={{ marginTop: '14px', background: '#ffffff', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #2563eb', border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>
                  💬 Suggested Opening Icebreaker:
                </h4>
                <p style={{ color: 'var(--text-main)', fontSize: '13px', marginTop: '4px', fontStyle: 'italic' }}>
                  "{matchedResult.suggested_opener}"
                </p>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Sparkles size={36} color="#2563eb" style={{ opacity: 0.6, marginBottom: '12px' }} />
              <h4>Enter details on the left</h4>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                The AI engine will cross-reference your interests {profile.interests && profile.interests.length > 0 ? `(${profile.interests.join(', ')})` : ''} to compute customized connection strategies.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title">
          <UserCheck size={18} color="#16a34a" /> Your Networking Contact Roster ({savedPeople.length})
        </h3>
        {savedPeople.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No saved contacts yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', marginTop: '14px' }}>
            {savedPeople.map((person, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{person.name}</span>
                  <span className="tag-badge-emerald" style={{ fontSize: '10px' }}>{person.match_percentage || 85}% Match</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{person.title}</div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-sub)' }}>
                  Opener: <em>"{person.suggested_opener}"</em>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

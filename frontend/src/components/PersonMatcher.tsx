import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, UserCheck } from 'lucide-react';
import type { UserProfile, MatchedPerson } from '../types';
import { api } from '../api';

interface PersonMatcherProps {
  profile: UserProfile;
}

export const PersonMatcher: React.FC<PersonMatcherProps> = ({ profile }) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [personInterests, setPersonInterests] = useState('');
  const [notes, setNotes] = useState('');
  const [matchedResult, setMatchedResult] = useState<MatchedPerson | null>(null);
  const [savedPeople, setSavedPeople] = useState<MatchedPerson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getPeople().then(setSavedPeople);
  }, []);

  const handleMatch = async () => {
    if (!name || !title) return;
    setLoading(true);
    try {
      const interestsArray = personInterests.split(',').map((i) => i.trim()).filter(Boolean);
      const res = await api.matchPerson({
        name,
        title,
        person_interests: interestsArray.length ? interestsArray : ['Generative AI', 'Machine Learning'],
        notes
      });
      setMatchedResult(res);
      const updated = await api.getPeople();
      setSavedPeople(updated);
    } catch (e) {
      console.error(e);
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
            <UserPlus size={20} color="#ff5e3a" /> Target Contact Details
          </h3>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dr. Rahul Sharma"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Title / Role / Organization</label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior AI Researcher at BioHealth AI"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Known Interests / Topics (Comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={personInterests}
              onChange={(e) => setPersonInterests(e.target.value)}
              placeholder="e.g. Generative AI, Patient Safety, Healthcare AI"
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
            <div className="card" style={{ borderColor: 'rgba(0, 255, 208, 0.3)', background: 'rgba(0, 255, 208, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>{matchedResult.name}</h3>
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{matchedResult.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#00ffd0', lineHeight: 1 }}>
                    {matchedResult.match_percentage}%
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overlap Match</div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Common Interests Identified:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {matchedResult.common_interests.map((ci, idx) => (
                    <span key={idx} className="tag-badge-emerald">{ci}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Why You Should Connect:
                </h4>
                <p style={{ color: '#fff', fontSize: '14px', marginTop: '4px', lineHeight: '1.5' }}>
                  {matchedResult.reason_to_connect}
                </p>
              </div>

              <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px', borderLeft: '3px solid #ff5e3a' }}>
                <h4 style={{ fontSize: '12px', color: '#ff5e3a', fontWeight: 800, textTransform: 'uppercase' }}>
                  💬 Suggested Opening Icebreaker:
                </h4>
                <p style={{ color: '#fff', fontSize: '14px', marginTop: '6px', fontStyle: 'italic' }}>
                  "{matchedResult.suggested_opener}"
                </p>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Sparkles size={40} color="#ff5e3a" style={{ opacity: 0.5, marginBottom: '12px' }} />
              <h4>Enter details on the left</h4>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                The AI engine will cross-reference your interests ({profile.interests.join(', ')}) to compute 
                customized connection strategies.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title">
          <UserCheck size={20} color="#00ffd0" /> Your Networking Contact Roster ({savedPeople.length})
        </h3>
        {savedPeople.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No saved contacts yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {savedPeople.map((person, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{person.name}</span>
                  <span className="tag-badge-emerald" style={{ fontSize: '10px' }}>{person.match_percentage || 85}% Match</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{person.title}</div>
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-sub)' }}>
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

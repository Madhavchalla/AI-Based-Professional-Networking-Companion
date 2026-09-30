import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  Check, 
  Save, 
  Layers
} from 'lucide-react';
import type { UserProfile, WikiReference } from '../types';
import { api } from '../api';

interface AssistantProps {
  profile: UserProfile;
}

export const Assistant: React.FC<AssistantProps> = ({ profile }) => {
  const [eventName, setEventName] = useState('AI in Public Health & Clinical Safety Summit');
  const [eventDesc, setEventDesc] = useState(
    'Exploring Generative AI, machine learning applications, and patient safety data ethics in healthcare.'
  );
  const [interests, setInterests] = useState(profile.interests.join(', '));
  const [selectedGoal, setSelectedGoal] = useState('Find a mentor');
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [wikiData, setWikiData] = useState<WikiReference | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, 'like' | 'dislike'>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const goalOptions = [
    'Find a mentor',
    'Learn about a technology',
    'Find internship opportunities',
    'Explore career opportunities',
    'Meet researchers',
    'Learn about industry trends',
    'Build professional connections'
  ];

  const handleGenerate = async () => {
    if (!eventDesc.trim()) return;
    setLoading(true);
    setSavedSuccess(false);
    setWikiData(null);
    try {
      const res = await api.generateConversation({
        event_description: eventDesc,
        interests: interests,
        networking_goal: selectedGoal
      });
      setSessionData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleWikiLookup = async (topic: string) => {
    try {
      const res = await api.getWikiReference(topic);
      setWikiData(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedback = (stepIdx: number, text: string, action: 'like' | 'dislike') => {
    setFeedbackState((prev) => ({ ...prev, [stepIdx]: action }));
    api.logFeedback(text, action, selectedGoal);
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveSession = async () => {
    if (!sessionData) return;
    await api.saveSession({
      event_name: eventName,
      event_description: eventDesc,
      interests: interests,
      goal: selectedGoal,
      topics: sessionData.topics || [],
      starters: sessionData.multi_step_flow || []
    });
    setSavedSuccess(true);
  };

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">STEP-BY-STEP CONVERSATION GENERATOR</span>
        <h1 className="header-title">🤝 Networking Assistant</h1>
        <p className="header-subtitle">
          Input an event, select your networking goal, extract key themes using DistilBERT, 
          and generate a structured multi-step conversation sequence.
        </p>
      </div>

      <div className="card">
        <h3 className="card-title">
          <Layers size={18} color="#2563eb" /> 1. Event & Goals Configuration
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Event Name / Title</label>
            <input
              type="text"
              className="input-field"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Annual AI & Healthcare Conference"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Goals / Target Role</label>
            <select
              className="select-field"
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
            >
              {goalOptions.map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Event Description (Used for DistilBERT Theme Extraction)</label>
          <textarea
            className="textarea-field"
            value={eventDesc}
            onChange={(e) => setEventDesc(e.target.value)}
            placeholder="Paste event description or agenda summary..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Your Specific Interests (Comma-separated)</label>
          <input
            type="text"
            className="input-field"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. data ethics, patient safety, machine learning"
          />
        </div>

        <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Analyzing with DistilBERT & Generating Flows...' : '✨ Analyze Event & Generate Multi-Step Flow'}
        </button>
      </div>

      {sessionData && (
        <div>
          <div className="card" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ color: '#16a34a', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🧠 DistilBERT Extracted Event Themes:
                </h4>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {sessionData.topics.map((t: string, i: number) => (
                    <button
                      key={i}
                      className="tag-badge-emerald"
                      onClick={() => handleWikiLookup(t)}
                      style={{ cursor: 'pointer' }}
                      title="Click for Wikipedia Quick Reference"
                    >
                      <BookOpen size={12} /> {t} (Wiki Reference)
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-secondary" onClick={handleSaveSession}>
                <Save size={16} /> {savedSuccess ? 'Saved to History!' : 'Save Session'}
              </button>
            </div>

            {wikiData && (
              <div style={{ marginTop: '16px', padding: '16px', background: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #16a34a', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>📖 Fact Reference: {wikiData.query}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{wikiData.source}</span>
                </div>
                <p style={{ color: 'var(--text-sub)', fontSize: '13px', lineHeight: '1.5' }}>
                  {wikiData.reference_summary}
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="card-title">
              <Sparkles size={18} color="#2563eb" /> 2. Multi-Step Natural Conversation Sequence
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              A natural sequence designed around your selected goal: <strong style={{ color: 'var(--text-main)' }}>{selectedGoal}</strong>
            </p>

            <div className="timeline-flow">
              {sessionData.multi_step_flow.map((item: any, idx: number) => (
                <div key={idx} className="timeline-step">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="step-num">STEP {item.step} • {item.stage}</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn-icon-only"
                        onClick={() => handleFeedback(idx, item.question, 'like')}
                        style={{ color: feedbackState[idx] === 'like' ? '#16a34a' : 'var(--text-muted)' }}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        className="btn-icon-only"
                        onClick={() => handleFeedback(idx, item.question, 'dislike')}
                        style={{ color: feedbackState[idx] === 'dislike' ? '#dc2626' : 'var(--text-muted)' }}
                      >
                        <ThumbsDown size={14} />
                      </button>
                      <button className="btn-icon-only" onClick={() => handleCopy(item.question, idx)}>
                        {copiedIndex === idx ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                  <div className="step-question">"{item.question}"</div>
                  <div className="step-explain">💡 <strong>Why this works:</strong> {item.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

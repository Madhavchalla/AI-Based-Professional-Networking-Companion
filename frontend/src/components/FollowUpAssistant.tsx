import React, { useState } from 'react';
import { Send, Copy, Check, Edit3, Mail } from 'lucide-react';
import { api } from '../api';

export const FollowUpAssistant: React.FC = () => {
  const [personName, setPersonName] = useState('Rahul Sharma');
  const [eventName, setEventName] = useState('AI in Public Health Summit');
  const [notes, setNotes] = useState('Works in Generative AI clinical safety research and discussed LLM evaluation frameworks.');
  const [followupResult, setFollowupResult] = useState<any>(null);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleGenerate = async () => {
    if (!personName || !eventName) return;
    setLoading(true);
    try {
      const res = await api.generateFollowUp({
        person_name: personName,
        event_name: eventName,
        notes: notes
      });
      setFollowupResult(res);
      setEditableSubject(res.email_subject);
      setEditableBody(res.followup_message);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySubject = () => {
    navigator.clipboard.writeText(editableSubject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(editableBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">POST-EVENT ENGAGEMENT</span>
        <h1 className="header-title">✉️ Post-Conversation Follow-Up Assistant</h1>
        <p className="header-subtitle">
          Transform brief notes from a networking conversation into a polished, professional email 
          or LinkedIn connection request in seconds.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Note Entry Form */}
        <div className="card">
          <h3 className="card-title">
            <Edit3 size={20} color="#ff5e3a" /> Conversation Note Input
          </h3>

          <div className="form-group">
            <label className="form-label">Person's Name</label>
            <input
              type="text"
              className="input-field"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Name</label>
            <input
              type="text"
              className="input-field"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. AI Conference 2026"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Conversation Highlights / Key Notes</label>
            <textarea
              className="textarea-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Met Rahul at AI Conference. He works in Generative AI and is interested in research."
              style={{ minHeight: '120px' }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Drafting Message...' : '✉️ Generate Professional Follow-Up Message'}
          </button>
        </div>

        {/* Drafted Email / Message Output */}
        <div>
          {followupResult ? (
            <div className="card" style={{ borderLeft: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  <Mail size={20} color="#818cf8" /> Drafted Message Preview
                </h3>
                <span className="tag-badge-indigo">Ready to Send</span>
              </div>

              {/* Subject Line Input */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label">Subject Line:</label>
                  <button className="btn-icon-only" onClick={handleCopySubject}>
                    {copiedSubject ? <Check size={14} color="#00ffd0" /> : <Copy size={14} />}
                  </button>
                </div>
                <input
                  type="text"
                  className="input-field"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                />
              </div>

              {/* Message Body Textarea */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label">Message Content (Editable):</label>
                  <button className="btn-icon-only" onClick={handleCopyBody}>
                    {copiedBody ? <Check size={14} color="#00ffd0" /> : <Copy size={14} />}
                  </button>
                </div>
                <textarea
                  className="textarea-field"
                  value={editableBody}
                  onChange={(e) => setEditableBody(e.target.value)}
                  style={{ minHeight: '220px', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleCopyBody} style={{ flex: 1 }}>
                  {copiedBody ? 'Copied Message!' : 'Copy Full Message'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Send size={40} color="#6366f1" style={{ opacity: 0.5, marginBottom: '12px' }} />
              <h4>Enter notes on the left</h4>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>
                The AI assistant will synthesize your notes into a personalized follow-up email or LinkedIn outreach.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

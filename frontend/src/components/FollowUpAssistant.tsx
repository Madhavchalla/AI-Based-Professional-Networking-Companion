import React, { useState } from 'react';
import { Send, Copy, Check, Edit3, Mail, AlertCircle } from 'lucide-react';
import { api } from '../api';

export const FollowUpAssistant: React.FC = () => {
  const [personName, setPersonName] = useState('');
  const [eventName, setEventName] = useState('');
  const [notes, setNotes] = useState('');
  const [followupResult, setFollowupResult] = useState<any>(null);
  const [editableSubject, setEditableSubject] = useState('');
  const [editableBody, setEditableBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const handleGenerate = async () => {
    setErrorMsg('');
    if (!personName.trim() || !eventName.trim() || !notes.trim()) {
      setErrorMsg("⚠️ Please enter the contact's name, event name, and your conversation notes before generating.");
      return;
    }

    setLoading(true);
    setFollowupResult(null);
    try {
      const res = await api.generateFollowUp({
        person_name: personName.trim(),
        event_name: eventName.trim(),
        notes: notes.trim()
      });
      setFollowupResult(res);
      setEditableSubject(res.email_subject);
      setEditableBody(res.followup_message);
    } catch (e: any) {
      setErrorMsg(e.message || 'Generation failed. Please check your inputs.');
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
        <div className="card">
          <h3 className="card-title">
            <Edit3 size={18} color="#2563eb" /> Conversation Note Input
          </h3>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Person's Name (Required)</label>
            <input
              type="text"
              className="input-field"
              value={personName}
              onChange={(e) => { setPersonName(e.target.value); setErrorMsg(''); }}
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Name (Required)</label>
            <input
              type="text"
              className="input-field"
              value={eventName}
              onChange={(e) => { setEventName(e.target.value); setErrorMsg(''); }}
              placeholder="e.g. AI Conference 2026"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Conversation Highlights / Key Notes (Required)</label>
            <textarea
              className="textarea-field"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setErrorMsg(''); }}
              placeholder="e.g. Met Rahul at AI Conference. He works in Generative AI and discussed LLM safety in clinical diagnosis."
              style={{ minHeight: '120px' }}
              required
            />
          </div>

          <button className="btn btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Drafting Message...' : '✉️ Generate Professional Follow-Up Message'}
          </button>
        </div>

        <div>
          {followupResult ? (
            <div className="card" style={{ borderLeft: '4px solid #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="card-title" style={{ margin: 0 }}>
                  <Mail size={18} color="#2563eb" /> Drafted Message Preview
                </h3>
                <span className="tag-badge-indigo">Ready to Send</span>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label">Subject Line:</label>
                  <button className="btn-icon-only" onClick={handleCopySubject}>
                    {copiedSubject ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  </button>
                </div>
                <input
                  type="text"
                  className="input-field"
                  value={editableSubject}
                  onChange={(e) => setEditableSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label className="form-label">Message Content (Editable):</label>
                  <button className="btn-icon-only" onClick={handleCopyBody}>
                    {copiedBody ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
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
              <Send size={36} color="#2563eb" style={{ opacity: 0.6, marginBottom: '12px' }} />
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

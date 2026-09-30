import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import type { UserProfile as UserProfileType } from '../types';
import { api } from '../api';

interface UserProfileProps {
  profile: UserProfileType;
  setProfile: (p: UserProfileType) => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ profile, setProfile }) => {
  const [name, setName] = useState(profile.name);
  const [status, setStatus] = useState(profile.status);
  const [skills, setSkills] = useState(profile.skills.join(', '));
  const [interests, setInterests] = useState(profile.interests.join(', '));
  const [careerGoals, setCareerGoals] = useState(profile.career_goals);
  const [style, setStyle] = useState(profile.conversation_style);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfileType = {
      name,
      status,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      interests: interests.split(',').map((i) => i.trim()).filter(Boolean),
      career_goals: careerGoals,
      preferred_goals: profile.preferred_goals,
      conversation_style: style
    };

    const res = await api.updateProfile(updated);
    setProfile(res);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div>
      <div className="header-banner">
        <span className="header-category">PERSONALIZATION & SETTINGS</span>
        <h1 className="header-title">👤 User Profile & Preferences</h1>
        <p className="header-subtitle">
          Configure your professional identity, skills, interests, and preferred conversation styles 
          to customize AI recommendations across all networking sessions.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <h3 className="card-title">
          <User size={20} color="#ff5e3a" /> Profile Details
        </h3>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status / Role</label>
              <input
                type="text"
                className="input-field"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (Comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Interests (Comma-separated)</label>
            <input
              type="text"
              className="input-field"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Career Goals & Aspirations</label>
            <textarea
              className="textarea-field"
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              style={{ minHeight: '90px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Conversation Style</label>
            <select
              className="select-field"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="Balanced (Technical + Professional)">Balanced (Technical + Professional)</option>
              <option value="Deep Technical & Research Focus">Deep Technical & Research Focus</option>
              <option value="Casual Icebreakers & Networking">Casual Icebreakers & Networking</option>
              <option value="Executive & Career Strategy">Executive & Career Strategy</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            <Save size={16} /> {savedSuccess ? 'Profile Saved Successfully!' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

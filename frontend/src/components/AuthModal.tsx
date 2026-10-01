import React, { useState } from 'react';
import { LogIn, UserPlus, X } from 'lucide-react';
import type { UserProfile } from '../types';
import { api } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
  onDataChange?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, onDataChange }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('AI Engineer & Researcher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.login({ email, password });
        onSuccess(res);
        if (onDataChange) onDataChange();
        onClose();
      } else {
        const res = await api.register({ name, email, password, status });
        onSuccess(res);
        if (onDataChange) onDataChange();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            {isLogin ? <LogIn size={24} /> : <UserPlus size={24} />}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
            {isLogin ? 'Sign In to Your Account' : 'Create New Account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {isLogin ? 'Access your saved networking sessions & contacts' : 'Join the AI Professional Networking Platform'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '4px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              background: isLogin ? '#ffffff' : 'transparent',
              color: isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: isLogin ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '4px',
              border: 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              background: !isLogin ? '#ffffff' : 'transparent',
              color: !isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              boxShadow: !isLogin ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Challa Madhav"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Professional Status / Role</label>
              <input
                type="text"
                className="input-field"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="e.g. AI Engineer & Researcher"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          {isLogin ? (
            <span>Demo account: <strong>challa@example.com</strong> / <strong>password123</strong></span>
          ) : (
            <span>By registering, your custom AI preferences will be saved.</span>
          )}
        </div>
      </div>
    </div>
  );
};

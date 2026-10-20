import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Key,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle,
  X
} from 'lucide-react';
import { authService } from '../../services/authService';
import type { UserAccount } from '../../services/authService';
import { soundService } from '../../services/soundService';
import type { CEFRLevel } from '../../types/learning';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthenticated: (account: UserAccount) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
  allowClose = false
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A1');
  const [error, setError] = useState<string | null>(null);

  const existingAccounts = authService.getAllAccounts();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = userId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (!cleanId) {
      setError('Please enter a username / ID (e.g. akash, learner1)');
      return;
    }

    soundService.playClick();

    if (tab === 'register') {
      const cleanName = name.trim() || cleanId.charAt(0).toUpperCase() + cleanId.slice(1);
      const account = authService.register(cleanId, cleanName, password || '123456');
      soundService.playFanfare();
      onAuthenticated(account);
    } else {
      const account = authService.login(cleanId, password || '123456');
      soundService.playCorrect();
      onAuthenticated(account);
    }
  };

  const handleSelectExisting = (acc: UserAccount) => {
    soundService.playClick();
    const logged = authService.login(acc.userId, acc.password);
    onAuthenticated(logged);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        padding: 20
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          boxShadow: '0 25px 65px rgba(0, 0, 0, 0.7)',
          padding: 32,
          position: 'relative'
        }}
      >
        {allowClose && onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: 12
            }}
          >
            <Sparkles size={28} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Welcome to FluentMate
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Personalized AI English Teacher • Free & Unlimited
          </p>
        </div>

        {/* Auth Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            marginBottom: 20
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: tab === 'register' ? 'var(--primary)' : 'transparent',
              color: tab === 'register' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: tab === 'login' ? 'var(--primary)' : 'transparent',
              color: tab === 'login' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            Sign In
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--rose-subtle)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--rose)',
              fontSize: '0.84rem',
              marginBottom: 16
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* User ID / Handle */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5 }}>
              User ID / Handle <span style={{ color: 'var(--primary-light)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="e.g. akash, learner_1, alex"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoFocus
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
              <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-subtle)', fontWeight: 700 }}>
                @
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: 3, display: 'block' }}>
              Your unique ID isolates your learning progress, mistakes, and vocabulary.
            </span>
          </div>

          {/* Name (for register) */}
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5 }}>
                Your Name (Tutor will call you this)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="e.g. Akash Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 36px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                />
                <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-subtle)' }} />
              </div>
            </div>
          )}

          {/* Password (Optional / Simple) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Password
              </label>
              <span style={{ fontSize: '0.72rem', color: 'var(--mint)' }}>
                Frictionless (any password)
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                placeholder="Enter any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem'
                }}
              />
              <Key size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-subtle)' }} />
            </div>
          </div>

          {/* Level Selector (for register) */}
          {tab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5 }}>
                Starting English Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {(['A1', 'A2', 'B1'] as CEFRLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: level === lvl ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      border: level === lvl ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      color: level === lvl ? 'var(--primary-light)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.82rem'
                    }}
                  >
                    {lvl} {lvl === 'A1' ? 'Beginner' : lvl === 'A2' ? 'Elementary' : 'Intermediate'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '12px',
              fontSize: '0.94rem',
              fontWeight: 700,
              marginTop: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <span>{tab === 'register' ? 'Create Account & Start' : 'Sign In to Account'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Existing Local Accounts Quick Select */}
        {existingAccounts.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Users size={13} />
              <span>Or 1-Click Switch Saved Account</span>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {existingAccounts.map((acc) => (
                <button
                  key={acc.userId}
                  type="button"
                  onClick={() => handleSelectExisting(acc)}
                  className="btn-secondary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--mint)' }} />
                  <span>@{acc.userId}</span>
                  <span style={{ color: 'var(--text-subtle)' }}>({acc.name})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

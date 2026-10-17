import React, { useState } from 'react';
import {
  User,
  Settings,
  Sparkles,
  Key,
  Volume2,
  Trash2,
  Shield,
  Save,
  CheckCircle,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';
import type { UserProfile, CEFRLevel, LearningGoal, ExplanationLanguage, DailyTimeTarget } from '../../types/user';
import type { TutorPersona } from '../../types/tutor';
import { Avatar } from '../common/Avatar';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetProgress: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  onUpdateProfile,
  onResetProgress
}) => {
  const [profile, setProfile] = useState<UserProfile>({ ...userProfile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    onUpdateProfile(profile);
    setSavedSuccess(true);
    soundService.playCorrect();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestSpeech = () => {
    speechService.speak("Hello! This is how your FluentMate English teacher sounds.", {
      rate: profile.voiceSpeed,
      pitch: profile.voicePitch
    });
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar mood="idle" size={62} showStatusBadge={true} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{profile.name}</h2>
              <span className="badge badge-primary">Level {profile.level}</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 4 }}>
              FluentMate Learner • 100% Free Lifetime Account
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ padding: '10px 22px', fontSize: '0.92rem' }}
        >
          <Save size={16} />
          <span>Save Preferences</span>
        </button>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--mint-subtle)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: 'var(--mint)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: '0.9rem',
            fontWeight: 600
          }}
        >
          <CheckCircle size={18} />
          <span>Settings successfully updated!</span>
        </div>
      )}

      {/* 1. Learning Preferences */}
      <div className="card">
        <h3 style={{ fontSize: '1.18rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Settings size={20} color="var(--primary)" />
          <span>Learning & Pedagogy Settings</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Display Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Learner Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            />
          </div>

          {/* CEFR Level */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Current English Level
            </label>
            <select
              value={profile.level}
              onChange={(e) => setProfile({ ...profile, level: e.target.value as CEFRLevel })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            >
              <option value="A1">Level A1 — Beginner</option>
              <option value="A2">Level A2 — Elementary</option>
              <option value="B1">Level B1 — Intermediate</option>
              <option value="B2">Level B2 — Upper Intermediate</option>
            </select>
          </div>

          {/* Primary Goal */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Primary Goal
            </label>
            <select
              value={profile.goal}
              onChange={(e) => setProfile({ ...profile, goal: e.target.value as LearningGoal })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            >
              <option value="daily_conversation">Daily Conversation</option>
              <option value="job_interviews">Job Interviews</option>
              <option value="workplace_english">Workplace English</option>
              <option value="travel">Travel & Hospitality</option>
              <option value="exams">Exams & Certifications</option>
              <option value="general_fluency">General Fluency</option>
            </select>
          </div>

          {/* Preferred Explanation Language */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Grammar Explanation Language
            </label>
            <select
              value={profile.explanationLanguage}
              onChange={(e) => setProfile({ ...profile, explanationLanguage: e.target.value as ExplanationLanguage })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            >
              <option value="hindi">Hindi (हिंदी)</option>
              <option value="english">English (Immersive)</option>
              <option value="spanish">Spanish (Español)</option>
              <option value="french">French (Français)</option>
              <option value="german">German (Deutsch)</option>
            </select>
          </div>

          {/* Daily Minutes Target */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              Daily Study Target
            </label>
            <select
              value={profile.dailyMinutesTarget}
              onChange={(e) => setProfile({ ...profile, dailyMinutesTarget: Number(e.target.value) as DailyTimeTarget })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            >
              <option value={5}>5 Minutes / day (Casual)</option>
              <option value={10}>10 Minutes / day (Regular)</option>
              <option value={15}>15 Minutes / day (Recommended)</option>
              <option value={20}>20 Minutes / day (Intensive)</option>
            </select>
          </div>

          {/* Tutor Persona */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              AI Tutor Persona
            </label>
            <select
              value={profile.tutorPersona}
              onChange={(e) => setProfile({ ...profile, tutorPersona: e.target.value as TutorPersona })}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.92rem'
              }}
            >
              <option value="patient">🌱 Patient & Gentle</option>
              <option value="encouraging">⚡ Encouraging Coach</option>
              <option value="professional">💼 Professional & Direct</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Speech Synthesis & Voice Playback */}
      <div className="card">
        <h3 style={{ fontSize: '1.18rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Volume2 size={20} color="var(--mint)" />
          <span>Speech & Audio Synthesis</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Voice Speed: {profile.voiceSpeed}x
            </label>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              value={profile.voiceSpeed}
              onChange={(e) => setProfile({ ...profile, voiceSpeed: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
              Slightly slower (0.85x - 0.95x) is ideal for clarity and pronunciation analysis.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
              Voice Pitch: {profile.voicePitch}
            </label>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={profile.voicePitch}
              onChange={(e) => setProfile({ ...profile, voicePitch: parseFloat(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--primary)' }}
            />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
              Adjusts the natural tone of the speaking tutor.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.88rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={profile.autoSpeakTutor}
              onChange={(e) => setProfile({ ...profile, autoSpeakTutor: e.target.checked })}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
            />
            <span>Automatically read aloud tutor responses</span>
          </label>

          <button onClick={handleTestSpeech} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
            <Volume2 size={15} />
            <span>Test Voice</span>
          </button>
        </div>
      </div>

      {/* 3. Gemini API Integration */}
      <div className="card">
        <h3 style={{ fontSize: '1.18rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={20} color="var(--violet)" />
          <span>Gemini AI Tutor Integration</span>
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          FluentMate comes with a powerful built-in pedagogical grammar rule engine that works 100% offline. To enable live multimodal Gemini 2.5 Flash / 1.5 Flash reasoning, you can optionally provide your Gemini API key. Keys are stored locally in your browser and never sent to any external server.
        </p>

        <div>
          <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
            Google Gemini API Key (Optional)
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={profile.geminiApiKey || ''}
            onChange={(e) => setProfile({ ...profile, geminiApiKey: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.92rem'
            }}
          />
          <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', display: 'block', marginTop: 4 }}>
            Get a free Gemini API key from Google AI Studio (aistudio.google.com).
          </span>
        </div>
      </div>

      {/* 4. Danger Zone: Reset Learning Progress */}
      <div className="card" style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
        <h3 style={{ fontSize: '1.18rem', color: 'var(--rose)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Trash2 size={20} />
          <span>Reset Learning Progress</span>
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Resetting will clear your completed lessons, streak count, XP, and mistake memory to start fresh.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="btn-secondary"
            style={{ color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.3)' }}
          >
            <span>Reset All Progress...</span>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--rose-subtle)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--rose)', fontWeight: 600 }}>
              Are you sure? This action cannot be undone.
            </span>
            <button
              onClick={() => {
                onResetProgress();
                setShowResetConfirm(false);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--rose)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              Yes, Reset Everything
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

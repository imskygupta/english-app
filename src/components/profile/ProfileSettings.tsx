import React, { useState, useEffect } from 'react';
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
  Sun,
  Database,
  RefreshCw,
  Copy,
  ExternalLink
} from 'lucide-react';
import type { UserProfile, CEFRLevel, LearningGoal, ExplanationLanguage, DailyTimeTarget } from '../../types/user';
import type { TutorPersona } from '../../types/tutor';
import { Avatar } from '../common/Avatar';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';
import { storageService } from '../../services/storageService';
import { supabaseService } from '../../services/supabaseService';

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
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; tablesFound: boolean; message: string }>({
    connected: false,
    tablesFound: false,
    message: 'Checking Supabase connection...'
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    supabaseService.checkConnection().then(setSupabaseStatus);
  }, []);

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

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    soundService.playClick();
    const res = await storageService.syncAllToCloud();
    setIsSyncing(false);
    if (res.success) {
      soundService.playCorrect();
    }
    const status = await supabaseService.checkConnection();
    setSupabaseStatus(status);
  };

  const handleCopySchema = () => {
    const schemaSql = `-- FluentMate Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/vmtjhfoiuxrsclxkxwjc/sql/new

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Learner',
  level TEXT DEFAULT 'A1',
  goal TEXT DEFAULT 'daily_conversation',
  explanation_language TEXT DEFAULT 'hindi',
  daily_minutes_target INTEGER DEFAULT 15,
  confidence TEXT DEFAULT 'somewhat_hesitant',
  tutor_persona TEXT DEFAULT 'patient',
  streak_days INTEGER DEFAULT 1,
  last_active_date TEXT,
  total_xp INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 30,
  completed_chapters JSONB DEFAULT '[]'::jsonb,
  voice_speed NUMERIC DEFAULT 0.95,
  voice_pitch NUMERIC DEFAULT 1.0,
  auto_speak_tutor BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.mistakes (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default_user',
  category TEXT NOT NULL,
  original_phrase TEXT NOT NULL,
  corrected_phrase TEXT NOT NULL,
  explanation TEXT,
  occurrences INTEGER DEFAULT 1,
  last_occurred BIGINT,
  practiced_count INTEGER DEFAULT 0,
  is_improved BOOLEAN DEFAULT false,
  recommended_topic TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.vocabulary (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default_user',
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  part_of_speech TEXT,
  example_sentence TEXT,
  difficulty TEXT DEFAULT 'good',
  interval_days INTEGER DEFAULT 1,
  next_review_date BIGINT,
  repetitions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.learning_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default_user',
  lessons_completed_count INTEGER DEFAULT 0,
  total_quizzes_taken INTEGER DEFAULT 0,
  quiz_accuracy_percentage INTEGER DEFAULT 0,
  speaking_duration_seconds INTEGER DEFAULT 0,
  weekly_activity JSONB DEFAULT '[]'::jsonb,
  mistakes_count_by_category JSONB DEFAULT '{}'::jsonb,
  completed_roleplay_ids JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for mistakes" ON public.mistakes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for vocabulary" ON public.vocabulary FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for learning_stats" ON public.learning_stats FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(schemaSql);
    setCopiedSchema(true);
    soundService.playClick();
    setTimeout(() => setCopiedSchema(false), 3000);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Google Gemini API Key
            </label>
            <span className="badge badge-mint" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
              ✓ Default Active (Gemini 2.5 Flash)
            </span>
          </div>
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
          <span style={{ fontSize: '0.74rem', color: 'var(--mint)', display: 'block', marginTop: 4 }}>
            Pre-configured with free Gemini API key and automatic fallback to Flash-Lite & intelligent educational rule engine.
          </span>
        </div>
      </div>

      {/* 4. Supabase Cloud Database & Vercel Sync */}
      <div className="card" style={{ borderColor: 'rgba(99, 102, 241, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: '1.18rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={20} color="var(--primary)" />
            <span>Supabase Cloud Database & Vercel Sync</span>
          </h3>
          <span
            className={`badge ${supabaseStatus.connected ? 'badge-mint' : 'badge-amber'}`}
            style={{ fontSize: '0.74rem', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: supabaseStatus.connected ? 'var(--mint)' : 'var(--amber)' }} className="animate-pulse" />
            <span>{supabaseStatus.connected ? (supabaseStatus.tablesFound ? 'Cloud Synced' : 'Connected (Setup Needed)') : 'Local Offline Mode'}</span>
          </span>
        </div>

        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: 14 }}>
          Connected to your project: <code style={{ color: 'var(--lavender)', backgroundColor: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>{supabaseService.getUrl()}</code>.
          {supabaseStatus.tablesFound
            ? ' Your learning profile, mistakes memory, vocabulary, and stats are saved to Supabase Postgres in real-time, ready for GitHub & Vercel deployments.'
            : ' Run the 1-click schema below in your Supabase SQL editor to create the cloud tables.'}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing to Supabase...' : 'Sync All Progress to Supabase'}</span>
          </button>

          <button
            onClick={handleCopySchema}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem' }}
          >
            {copiedSchema ? <CheckCircle size={14} color="var(--mint)" /> : <Copy size={14} />}
            <span>{copiedSchema ? 'SQL Copied to Clipboard!' : 'Copy Supabase SQL Schema'}</span>
          </button>

          <a
            href="https://supabase.com/dashboard/project/vmtjhfoiuxrsclxkxwjc/sql/new"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.84rem', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>Open Supabase SQL Editor</span>
          </a>
        </div>
      </div>

      {/* 5. Danger Zone: Reset Learning Progress */}
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

import React from 'react';
import { Flame, Zap, Award, Sun, Moon, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import type { UserProfile } from '../../types/user';
import type { NavigationTab } from './Sidebar';

import { authService } from '../../services/authService';

interface NavbarProps {
  currentTab: NavigationTab;
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  userProfile,
  onUpdateProfile,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  onOpenAuth
}) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'home':
        return 'Dashboard';
      case 'learn':
        return 'Structured Curriculum';
      case 'tutor':
        return 'AI Speaking Tutor';
      case 'roleplays':
        return 'Real-Life Roleplays';
      case 'flashcards':
        return 'AI Flashcards & Vocabulary';
      case 'progress':
        return 'Learning Progress & Mistake Review';
      case 'profile':
        return 'Settings & Preferences';
      default:
        return 'FluentMate';
    }
  };

  const toggleTheme = () => {
    const nextTheme = userProfile.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    onUpdateProfile({ ...userProfile, theme: nextTheme });
  };

  // Calculate daily goal progress (e.g. 8 of 15 minutes)
  const todayMinutes = 11;
  const progressPercent = Math.min(100, Math.round((todayMinutes / userProfile.dailyMinutesTarget) * 100));

  return (
    <header
      style={{
        height: 'var(--navbar-height)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-app)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Current Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{getTabTitle()}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              Level {userProfile.level}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              100% Free & Unlimited
            </span>
          </div>
        </div>
      </div>

      {/* Action / Stats Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Daily Goal Progress Ring */}
        <div
          title={`Daily Goal: ${todayMinutes} / ${userProfile.dailyMinutesTarget} mins`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--bg-card)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <ProgressRing progress={progressPercent} size={28} strokeWidth={3} color="var(--mint)">
            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--mint)' }}>
              {progressPercent}%
            </span>
          </ProgressRing>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>
              {todayMinutes}/{userProfile.dailyMinutesTarget}m
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Daily Goal</span>
          </div>
        </div>

        {/* Streak Counter */}
        <div
          title={`${userProfile.streakDays}-Day Learning Streak!`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--amber-subtle)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(245, 158, 11, 0.25)'
          }}
        >
          <Flame size={18} color="var(--amber)" fill="var(--amber)" />
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--amber)' }}>
            {userProfile.streakDays}
          </span>
        </div>

        {/* Total XP Counter */}
        <div
          title={`${userProfile.totalXP} Total Experience Points`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--primary-subtle)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}
        >
          <Zap size={18} color="var(--primary)" fill="var(--primary)" />
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary-light)' }}>
            {userProfile.totalXP} XP
          </span>
        </div>

        {/* User Account Pill / Switcher */}
        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="btn-secondary"
            title="Switch User Account"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'var(--mint)' }} />
            <span>@{authService.getActiveUserId()}</span>
          </button>
        )}

        {/* Sound toggle button */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)'
          }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)'
          }}
        >
          {userProfile.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
};

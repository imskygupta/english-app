import {
  Home,
  BookOpen,
  Bot,
  Theater,
  BarChart3,
  User,
  Flame,
  Zap,
  Sparkles,
  Layers
} from 'lucide-react';
import type { UserProfile } from '../../types/user';
import { authService } from '../../services/authService';

export type NavigationTab = 'home' | 'learn' | 'tutor' | 'roleplays' | 'flashcards' | 'progress' | 'profile';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  userProfile: UserProfile;
  onStartSpeaking: () => void;
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userProfile,
  onStartSpeaking,
  onOpenAuth
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Curriculum', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, badge: 'Live AI' },
    { id: 'flashcards', label: 'AI Flashcards', icon: Layers, badge: 'Deck' },
    { id: 'roleplays', label: 'Roleplay', icon: Theater },
    { id: 'progress', label: 'Progress & Review', icon: BarChart3 },
    { id: 'profile', label: 'Profile & Settings', icon: User }
  ];

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 50,
        transition: 'width 0.2s ease'
      }}
      className="desktop-sidebar"
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}
        >
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
              FluentMate
            </span>
            <span className="badge badge-mint" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>FREE</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Personal AI English Teacher</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 20, flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavigationTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-subtle)' : 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={20} color={isActive ? 'var(--primary)' : 'currentColor'} />
                <span style={{ fontSize: '0.92rem' }}>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Start Speaking CTA */}
      <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button
          onClick={onStartSpeaking}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.92rem' }}
        >
          <Bot size={18} />
          <span>Start Speaking Now</span>
        </button>

        {/* User Account & Stats in Footer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
              <span style={{ width: 8, height: 8, minWidth: 8, borderRadius: '50%', backgroundColor: 'var(--mint)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                @{authService.getActiveUserId()}
              </span>
            </div>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                style={{ fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
              >
                Switch
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--bg-card)', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Flame size={15} color="var(--amber)" fill="var(--amber)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {userProfile.streakDays}d streak
              </span>
            </div>
            <div style={{ width: 1, height: 14, background: 'var(--border-subtle)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={15} color="var(--primary)" fill="var(--primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {userProfile.totalXP} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

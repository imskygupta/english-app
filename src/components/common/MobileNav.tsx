import React from 'react';
import { Home, BookOpen, Bot, Layers, Theater, BarChart3, User } from 'lucide-react';
import type { NavigationTab } from './Sidebar';

interface MobileNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, isSpecial: true },
    { id: 'flashcards', label: 'Cards', icon: Layers },
    { id: 'roleplays', label: 'Roleplay', icon: Theater },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: 'var(--bg-sidebar)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 8px',
        zIndex: 100,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.3)'
      }}
      className="mobile-bottom-nav"
    >
      <style>{`
        @media (max-width: 900px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
        }
      `}</style>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id as NavigationTab)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: isActive ? 700 : 500,
              background: 'none',
              border: 'none',
              flex: 1
            }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: tab.isSpecial ? 36 : 28,
                height: tab.isSpecial ? 36 : 28,
                borderRadius: '50%',
                background: tab.isSpecial ? 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)' : 'transparent',
                color: tab.isSpecial ? '#ffffff' : 'inherit',
                boxShadow: tab.isSpecial ? 'var(--shadow-glow)' : 'none',
                marginTop: tab.isSpecial ? -14 : 0
              }}
            >
              <Icon size={tab.isSpecial ? 18 : 20} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

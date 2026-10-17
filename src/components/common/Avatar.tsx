import React from 'react';
import { Sparkles, Mic, Volume2 } from 'lucide-react';

export type AvatarMood = 'idle' | 'listening' | 'speaking' | 'thinking' | 'praising';

interface AvatarProps {
  mood?: AvatarMood;
  size?: number;
  showStatusBadge?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  mood = 'idle',
  size = 64,
  showStatusBadge = false
}) => {
  const getMoodAura = () => {
    switch (mood) {
      case 'listening':
        return '0 0 24px rgba(16, 185, 129, 0.5)';
      case 'speaking':
        return '0 0 24px rgba(99, 102, 241, 0.6)';
      case 'thinking':
        return '0 0 24px rgba(139, 92, 246, 0.5)';
      case 'praising':
        return '0 0 28px rgba(245, 158, 11, 0.6)';
      default:
        return '0 0 16px rgba(99, 102, 241, 0.25)';
    }
  };

  const getBorderColor = () => {
    switch (mood) {
      case 'listening':
        return 'var(--mint)';
      case 'speaking':
        return 'var(--primary)';
      case 'thinking':
        return 'var(--violet)';
      case 'praising':
        return 'var(--amber)';
      default:
        return 'rgba(255, 255, 255, 0.15)';
    }
  };

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          border: `2px solid ${getBorderColor()}`,
          boxShadow: getMoodAura(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative'
        }}
      >
        {/* Tutor Face Vector */}
        <svg
          viewBox="0 0 100 100"
          width="82%"
          height="82%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head & Hair Gradient */}
          <circle cx="50" cy="50" r="42" fill="#e0e7ff" />
          {/* Modern Stylized Hair */}
          <path
            d="M20 40 C20 22, 35 15, 50 15 C65 15, 80 22, 80 40 C75 32, 65 30, 50 32 C35 30, 25 32, 20 40 Z"
            fill="#312e81"
          />
          {/* Friendly Smart Glasses */}
          <rect x="26" y="42" width="18" height="13" rx="4" stroke="#4f46e5" strokeWidth="2.5" fill="rgba(255,255,255,0.3)" />
          <rect x="56" y="42" width="18" height="13" rx="4" stroke="#4f46e5" strokeWidth="2.5" fill="rgba(255,255,255,0.3)" />
          <line x1="44" y1="48" x2="56" y2="48" stroke="#4f46e5" strokeWidth="2.5" />

          {/* Eyes */}
          {mood === 'praising' ? (
            <>
              <path d="M 31 50 Q 35 44 39 50" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M 61 50 Q 65 44 69 50" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="35" cy="48" r="3" fill="#1e1b4b" />
              <circle cx="65" cy="48" r="3" fill="#1e1b4b" />
              <circle cx="36" cy="47" r="1" fill="#ffffff" />
              <circle cx="66" cy="47" r="1" fill="#ffffff" />
            </>
          )}

          {/* Cheerful Blush */}
          <circle cx="28" cy="58" r="4" fill="rgba(244, 63, 94, 0.25)" />
          <circle cx="72" cy="58" r="4" fill="rgba(244, 63, 94, 0.25)" />

          {/* Mouth depending on state */}
          {mood === 'speaking' ? (
            <ellipse cx="50" cy="65" rx="5" ry="4" fill="#4338ca" />
          ) : mood === 'listening' ? (
            <path d="M 45 64 Q 50 67 55 64" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          ) : mood === 'praising' ? (
            <path d="M 42 63 Q 50 72 58 63" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" fill="#ffffff" />
          ) : (
            <path d="M 43 64 Q 50 68 57 64" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          )}
        </svg>

        {/* Floating icon indicator when active */}
        {mood === 'listening' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid var(--mint)',
              animation: 'pulseGlow 1.5s infinite'
            }}
          />
        )}
      </div>

      {/* Mini status badge */}
      {showStatusBadge && (
        <div
          style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: size * 0.32,
            height: size * 0.32,
            borderRadius: '50%',
            backgroundColor: mood === 'listening' ? 'var(--mint)' : mood === 'speaking' ? 'var(--primary)' : 'var(--bg-card)',
            border: '2px solid var(--bg-app)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {mood === 'listening' && <Mic size={size * 0.18} />}
          {mood === 'speaking' && <Volume2 size={size * 0.18} />}
          {mood === 'praising' && <Sparkles size={size * 0.18} color="#f59e0b" />}
          {mood === 'idle' && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--mint)' }} />
          )}
        </div>
      )}
    </div>
  );
};

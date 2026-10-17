import React from 'react';

interface WaveformProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  height?: number;
  label?: string;
}

export const Waveform: React.FC<WaveformProps> = ({
  isActive,
  color = 'var(--primary)',
  barCount = 18,
  height = 36,
  label
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          height: height,
          padding: '0 8px'
        }}
      >
        {Array.from({ length: barCount }).map((_, i) => {
          const delay = (i % 5) * 0.12;
          const duration = 0.45 + (i % 3) * 0.15;
          return (
            <div
              key={i}
              style={{
                width: 3,
                height: isActive ? '100%' : '6px',
                backgroundColor: color,
                borderRadius: 99,
                opacity: isActive ? 0.9 : 0.25,
                animation: isActive ? `waveBar ${duration}s ease-in-out infinite alternate` : 'none',
                animationDelay: `${delay}s`,
                transition: 'height 0.2s ease, opacity 0.2s ease'
              }}
            />
          );
        })}
      </div>
      {label && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </span>
      )}
    </div>
  );
};

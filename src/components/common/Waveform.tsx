import React from 'react';

interface WaveformProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  height?: number;
  label?: string;
  liveVolume?: number; // 0.0 to 1.0 real microphone volume
}

export const Waveform: React.FC<WaveformProps> = ({
  isActive,
  color = 'var(--primary)',
  barCount = 18,
  height = 36,
  label,
  liveVolume = 0
}) => {
  const hasLiveVolume = typeof liveVolume === 'number' && liveVolume > 0.01;

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
          // Create natural parabolic / soundwave curve shape across the bars
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const weight = Math.max(0.35, 1 - centerDist * 0.55);

          // If live volume from real microphone is active, scale directly to decibels
          let barHeight = '6px';
          let barOpacity = 0.25;

          if (hasLiveVolume) {
            const calculatedPx = Math.max(6, Math.min(height, height * liveVolume * 2.8 * weight));
            barHeight = `${calculatedPx}px`;
            barOpacity = Math.max(0.4, Math.min(1, liveVolume * 3));
          } else if (isActive) {
            barHeight = '100%';
            barOpacity = 0.85;
          }

          const delay = (i % 5) * 0.12;
          const duration = 0.45 + (i % 3) * 0.15;

          return (
            <div
              key={i}
              style={{
                width: 3,
                height: barHeight,
                backgroundColor: color,
                borderRadius: 99,
                opacity: barOpacity,
                animationName: isActive && !hasLiveVolume ? 'waveBar' : 'none',
                animationDuration: `${duration}s`,
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDirection: 'alternate',
                animationDelay: `${delay}s`,
                transition: hasLiveVolume ? 'height 0.08s ease-out, opacity 0.08s ease-out' : 'height 0.2s ease, opacity 0.2s ease',
                boxShadow: hasLiveVolume && liveVolume > 0.15 ? `0 0 6px ${color}` : 'none'
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

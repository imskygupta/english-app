import React, { useState } from 'react';
import {
  Theater,
  Sparkles,
  ArrowRight,
  Briefcase,
  Coffee,
  ShoppingBag,
  Compass,
  Users,
  Presentation,
  CheckCircle,
  Play
} from 'lucide-react';
import { ROLEPLAY_SCENARIOS } from '../../data/roleplaysData';
import type { RoleplayScenario } from '../../types/tutor';
import type { ProgressStats } from '../../types/user';

interface RoleplayHubProps {
  onStartScenario: (scenario: RoleplayScenario) => void;
  progressStats: ProgressStats;
}

export const RoleplayHub: React.FC<RoleplayHubProps> = ({
  onStartScenario,
  progressStats
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'work' | 'daily' | 'social' | 'travel'>('all');

  const filteredScenarios = selectedCategory === 'all'
    ? ROLEPLAY_SCENARIOS
    : ROLEPLAY_SCENARIOS.filter((s) => s.category === selectedCategory);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'work':
        return Briefcase;
      case 'daily':
        return ShoppingBag;
      case 'social':
        return Users;
      case 'travel':
        return Compass;
      default:
        return Theater;
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(67, 56, 202, 0.6) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '28px 32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="badge badge-mint">Interactive Situations</span>
          <span className="badge badge-primary">10 Scenarios</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: 8 }}>
          Real-Life English Roleplay Studio
        </h1>
        <p style={{ color: 'var(--lavender)', fontSize: '0.94rem', maxWidth: 650, lineHeight: 1.5 }}>
          Practice authentic real-world conversations in a safe, judgment-free environment. Your AI tutor assumes the role of a hiring manager, waiter, colleague, or local guide.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Scenarios (10)' },
          { id: 'work', label: 'Workplace & Career (5)' },
          { id: 'daily', label: 'Everyday Life (2)' },
          { id: 'social', label: 'Social & Friends (2)' },
          { id: 'travel', label: 'Travel & Directions (1)' }
        ].map((tab) => {
          const isSelected = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as typeof selectedCategory)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.86rem',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Scenario Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20 }}>
        {filteredScenarios.map((scenario) => {
          const Icon = getCategoryIcon(scenario.category);
          const isCompleted = progressStats.completedRoleplayIds.includes(scenario.id);

          return (
            <div
              key={scenario.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              {isCompleted && (
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--mint)',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}
                >
                  <CheckCircle size={14} />
                  <span>Practiced</span>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-light)'
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <div>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      Level {scenario.level} • {scenario.difficulty}
                    </span>
                    <h3 style={{ fontSize: '1.1rem', marginTop: 4 }}>{scenario.title}</h3>
                  </div>
                </div>

                {/* Scenario Goal */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
                    Your Objective:
                  </span>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', marginTop: 2, lineHeight: 1.45 }}>
                    {scenario.goal}
                  </p>
                </div>

                {/* Context Description */}
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-app)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginBottom: 14,
                    borderLeft: '3px solid var(--violet)'
                  }}
                >
                  "{scenario.contextDescription}"
                </div>

                {/* Suggested phrases pills */}
                <div style={{ marginBottom: 18 }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Helpful Starter Phrases:
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                    {scenario.suggestedPhrases.slice(0, 2).map((phrase, idx) => (
                      <span key={idx} style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                        💬 {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onStartScenario(scenario)}
                className="btn-primary"
                style={{ width: '100%', padding: '11px', fontSize: '0.92rem' }}
              >
                <Play size={15} fill="currentColor" />
                <span>Start Roleplay Session</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

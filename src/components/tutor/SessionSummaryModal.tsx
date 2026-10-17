import React from 'react';
import {
  Award,
  Sparkles,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import type { SessionLearningSummary } from '../../types/tutor';
import { Avatar } from '../common/Avatar';

interface SessionSummaryModalProps {
  summary: SessionLearningSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  summary,
  isOpen,
  onClose
}) => {
  if (!isOpen || !summary) return null;

  const minutes = Math.floor(summary.durationSeconds / 60);
  const seconds = summary.durationSeconds % 60;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(7, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 640,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          gap: 22
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar mood="praising" size={60} showStatusBadge={true} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-mint">Session Complete</span>
              <span className="badge badge-primary">+{summary.xpEarned} XP</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', margin: 0 }}>Speaking Session Summary</h2>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
            <Clock size={18} color="var(--primary)" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{minutes}m {seconds}s</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Speaking Time</div>
          </div>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
            <MessageSquare size={18} color="var(--mint)" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{summary.messageCount}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Exchanges</div>
          </div>
          <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
            <AlertCircle size={18} color="var(--rose)" style={{ margin: '0 auto 6px' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{summary.correctionsGiven.length}</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Corrections</div>
          </div>
        </div>

        {/* Observed Strengths */}
        {summary.strengths.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.98rem', color: 'var(--mint)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle size={16} />
              <span>Observed Strengths</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {summary.strengths.map((str, i) => (
                <div key={i} style={{ fontSize: '0.88rem', color: 'var(--text-main)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--mint-subtle)' }}>
                  • {str}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specific Corrections Given */}
        {summary.correctionsGiven.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.98rem', color: 'var(--rose)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={16} />
              <span>Key Corrections Saved to Memory</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {summary.correctionsGiven.map((c, i) => (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-app)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    "{c.original}"
                  </div>
                  <div style={{ fontSize: '0.92rem', color: 'var(--mint)', fontWeight: 600, marginTop: 2 }}>
                    ✓ "{c.corrected}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    💡 {c.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vocabulary Introduced */}
        {summary.vocabularyIntroduced.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.98rem', color: 'var(--primary-light)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={16} />
              <span>New Vocabulary Introduced</span>
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {summary.vocabularyIntroduced.map((v, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.88rem' }}>{v.word}</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{v.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '0.98rem', marginTop: 8 }}
        >
          <span>Return to Dashboard</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

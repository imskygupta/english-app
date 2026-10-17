import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Zap,
  Bot,
  CheckCircle,
  AlertCircle,
  BookOpen,
  RotateCcw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers
} from 'lucide-react';
import type { UserProfile, ProgressStats, MistakeRecord, SpacedVocabCard } from '../../types/user';
import { ProgressRing } from '../common/ProgressRing';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';

interface ProgressViewProps {
  userProfile: UserProfile;
  progressStats: ProgressStats;
  mistakes: MistakeRecord[];
  vocabulary: SpacedVocabCard[];
  onOpenVocabReview: () => void;
  onPracticeMistake: (mistake: MistakeRecord) => void;
  onMarkMistakePracticed: (mistakeId: string, resolved: boolean) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  userProfile,
  progressStats,
  mistakes,
  vocabulary,
  onOpenVocabReview,
  onPracticeMistake,
  onMarkMistakePracticed
}) => {
  const [mistakeFilter, setMistakeFilter] = useState<string>('all');

  const filteredMistakes = mistakeFilter === 'all'
    ? mistakes
    : mistakeFilter === 'unmastered'
    ? mistakes.filter((m) => !m.isImproved)
    : mistakes.filter((m) => m.category === mistakeFilter);

  const now = Date.now();
  const dueVocabCount = vocabulary.filter((v) => v.nextReviewDate <= now).length;
  const masteredVocabCount = vocabulary.filter((v) => v.repetitions >= 2).length;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 30 }}>
      {/* Overview Metric Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30,27,75,0.85) 0%, rgba(49,46,129,0.7) 100%)',
          border: '1px solid rgba(99,102,241,0.3)',
          padding: '28px 32px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-mint">Analytics & Memory</span>
              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Grounded Learner Metrics</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: 6 }}>
              Your Fluency & Learning Analytics
            </h1>
            <p style={{ color: 'var(--lavender)', fontSize: '0.92rem', maxWidth: 620, lineHeight: 1.5 }}>
              Track real measured progress: lesson completions, quiz accuracy, speaking practice time, and AI mistake memory.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--mint)' }}>
                {progressStats.quizAccuracyPercentage}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quiz Accuracy</div>
            </div>
            <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-light)' }}>
                {Math.floor(progressStats.speakingDurationSeconds / 60)}m
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Speaking Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={24} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Completed Lessons
            </span>
            <h3 style={{ fontSize: '1.3rem', marginTop: 2 }}>{userProfile.completedChapters.length}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--mint)' }}>Curriculum modules</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'var(--mint-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={24} color="var(--mint)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Mastered Words
            </span>
            <h3 style={{ fontSize: '1.3rem', marginTop: 2 }}>{masteredVocabCount}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vocabulary.length} total in deck</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'var(--amber-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={24} color="var(--amber)" fill="var(--amber)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Current Streak
            </span>
            <h3 style={{ fontSize: '1.3rem', marginTop: 2 }}>{userProfile.streakDays} Days</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--amber)' }}>Consistency score: High</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'var(--rose-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={24} color="var(--rose)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Tracked Mistakes
            </span>
            <h3 style={{ fontSize: '1.3rem', marginTop: 2 }}>{mistakes.length}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {mistakes.filter((m) => m.isImproved).length} resolved
            </span>
          </div>
        </div>
      </div>

      {/* Mistake Categories Breakdown Grid */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>Mistake Frequency by Grammar Category</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Identifies the grammatical areas where you most frequently stumble.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          {[
            { cat: 'tense', label: 'Tense & Verbs', count: progressStats.mistakesCountByCategory.tense || 0, color: '#6366f1' },
            { cat: 'articles', label: 'Articles (A/An/The)', count: progressStats.mistakesCountByCategory.articles || 0, color: '#8b5cf6' },
            { cat: 'prepositions', label: 'Prepositions (In/On/At)', count: progressStats.mistakesCountByCategory.prepositions || 0, color: '#0ea5e9' },
            { cat: 'word_order', label: 'Word Order', count: progressStats.mistakesCountByCategory.word_order || 0, color: '#10b981' },
            { cat: 'grammar', label: 'Subject-Verb Agreement', count: progressStats.mistakesCountByCategory.grammar || 0, color: '#f59e0b' },
            { cat: 'vocabulary', label: 'Word Choice', count: progressStats.mistakesCountByCategory.vocabulary || 0, color: '#f43f5e' }
          ].map((item) => (
            <div
              key={item.cat}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: item.color }}>{item.count}</span>
              </div>
              <div style={{ width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 99, marginTop: 4 }}>
                <div
                  style={{
                    width: `${Math.min(100, item.count * 20)}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: 99
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 9: PERSONAL MISTAKE MEMORY REVIEW */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.25rem' }}>Personal Mistake Memory</h3>
              <span className="badge badge-rose">{mistakes.length} Logged</span>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Your tutor remembers these past errors to re-test them naturally in conversation and exercises.
            </p>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'unmastered', 'tense', 'articles', 'prepositions', 'grammar'].map((f) => (
              <button
                key={f}
                onClick={() => setMistakeFilter(f)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: mistakeFilter === f ? 'var(--primary)' : 'var(--bg-surface)',
                  color: mistakeFilter === f ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Mistake Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredMistakes.map((mistake) => (
            <div
              key={mistake.id}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: mistake.isImproved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 14
              }}
            >
              <div style={{ maxWidth: '68%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    {mistake.category.toUpperCase()}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                    Occurred {mistake.occurrences}x • Practiced {mistake.practicedCount}x
                  </span>
                  {mistake.isImproved && (
                    <span className="badge badge-mint" style={{ fontSize: '0.68rem' }}>
                      ✓ Mastered
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--rose)', textDecoration: 'line-through' }}>
                    "{mistake.originalPhrase}"
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--mint)', fontWeight: 600 }}>
                    "{mistake.correctedPhrase}"
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  💡 {mistake.explanation}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => speechService.speak(mistake.correctedPhrase)}
                  title="Hear pronunciation"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-subtle)',
                    color: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={16} />
                </button>

                <button
                  onClick={() => onPracticeMistake(mistake)}
                  className="btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <RotateCcw size={14} />
                  <span>Practice with AI</span>
                </button>

                <button
                  onClick={() => onMarkMistakePracticed(mistake.id, !mistake.isImproved)}
                  title={mistake.isImproved ? 'Mark unmastered' : 'Mark as mastered'}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: mistake.isImproved ? 'var(--mint-subtle)' : 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    color: mistake.isImproved ? 'var(--mint)' : 'var(--text-muted)',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}
                >
                  {mistake.isImproved ? '✓ Mastered' : 'Mark Mastered'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spaced Repetition Vocabulary Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Vocabulary Spaced Repetition</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Flashcards dynamically scheduled using interval memory theory.
            </p>
          </div>

          <button onClick={onOpenVocabReview} className="btn-primary" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            <span>Review Flashcards ({dueVocabCount} Due)</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {vocabulary.map((vocab) => {
            const isDue = vocab.nextReviewDate <= now;
            return (
              <div
                key={vocab.id}
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  border: isDue ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-main)' }}>{vocab.word}</h4>
                    <span className={`badge ${isDue ? 'badge-amber' : 'badge-mint'}`} style={{ fontSize: '0.65rem' }}>
                      {isDue ? 'Due Today' : `Interval: ${vocab.intervalDays}d`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', fontStyle: 'italic', display: 'block', marginBottom: 4 }}>
                    {vocab.partOfSpeech}
                  </span>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {vocab.meaning}
                  </p>
                  {vocab.hindiMeaning && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--mint)', marginBottom: 8 }}>
                      हिंदी: {vocab.hindiMeaning}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    Repetitions: {vocab.repetitions}
                  </span>
                  <button
                    onClick={() => speechService.speak(vocab.word)}
                    style={{ color: 'var(--primary-light)', padding: 2 }}
                  >
                    <Bot size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

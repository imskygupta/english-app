import React from 'react';
import {
  Flame,
  Zap,
  Bot,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Calendar,
  AlertCircle,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';
import type { UserProfile, ProgressStats, MistakeRecord, SpacedVocabCard } from '../../types/user';
import type { NavigationTab } from '../common/Sidebar';
import { ProgressRing } from '../common/ProgressRing';
import { Avatar } from '../common/Avatar';
import { CURRICULUM_DATA } from '../../data/curriculumData';

interface HomeDashboardProps {
  userProfile: UserProfile;
  progressStats: ProgressStats;
  mistakes: MistakeRecord[];
  vocabulary: SpacedVocabCard[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenLesson: (chapterId: string) => void;
  onOpenMistakeReview: () => void;
  onOpenVocabReview: () => void;
  onStartSpeaking: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  progressStats,
  mistakes,
  vocabulary,
  onNavigate,
  onOpenLesson,
  onOpenMistakeReview,
  onOpenVocabReview,
  onStartSpeaking
}) => {
  // Find current active level & recommended lesson
  const currentLevelCurriculum = CURRICULUM_DATA.find((c) => c.level === userProfile.level) || CURRICULUM_DATA[0];
  const allChapters = currentLevelCurriculum.units.flatMap((u) => u.chapters);

  // Find first uncompleted chapter or fall back to first
  const nextChapter = allChapters.find((ch) => !userProfile.completedChapters.includes(ch.id)) || allChapters[0];

  // Due vocabulary items
  const now = Date.now();
  const dueVocab = vocabulary.filter((v) => v.nextReviewDate <= now);

  // Active unmastered mistakes
  const activeMistakes = mistakes.filter((m) => !m.isImproved);

  // Daily goal calculation
  const todayMinutes = 11;
  const goalProgress = Math.min(100, Math.round((todayMinutes / userProfile.dailyMinutesTarget) * 100));

  // Determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* 1. Hero Greeting Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.95) 0%, rgba(49, 46, 129, 0.85) 60%, rgba(67, 56, 202, 0.7) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '30px 36px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ zIndex: 2, maxWidth: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-mint" style={{ fontSize: '0.72rem' }}>
              Level {userProfile.level} — {currentLevelCurriculum.levelName.split('—')[1]}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Target: {userProfile.dailyMinutesTarget} min/day
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', color: '#ffffff', marginBottom: 10, fontWeight: 800 }}>
            {getGreeting()}, {userProfile.name}! 👋
          </h1>
          <p style={{ color: 'rgba(237, 233, 254, 0.85)', fontSize: '0.96rem', lineHeight: 1.5, marginBottom: 22 }}>
            Ready to speak today? Your AI tutor is waiting to listen, guide your grammar, and help you express yourself with natural ease.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={onStartSpeaking}
              className="btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: '0.96rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)'
              }}
            >
              <Bot size={20} />
              <span>Start Speaking with AI Tutor</span>
            </button>

            <button
              onClick={() => onOpenLesson(nextChapter.id)}
              className="btn-secondary"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff'
              }}
            >
              <Play size={16} fill="currentColor" />
              <span>Continue Lesson</span>
            </button>
          </div>
        </div>

        {/* Floating Avatar Illustration */}
        <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }} className="animate-float">
          <Avatar mood="speaking" size={110} showStatusBadge={true} />
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--lavender)', background: 'rgba(0,0,0,0.3)', padding: '3px 10px', borderRadius: 99 }}>
            FluentMate Tutor Online
          </span>
        </div>
      </div>

      {/* 2. Top Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {/* Daily Goal Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 20 }}>
          <ProgressRing progress={goalProgress} size={58} strokeWidth={5} color="var(--mint)">
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--mint)' }}>
              {goalProgress}%
            </span>
          </ProgressRing>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Today's Goal
            </span>
            <h3 style={{ fontSize: '1.2rem', marginTop: 2 }}>{todayMinutes} / {userProfile.dailyMinutesTarget} min</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--mint)' }}>
              {goalProgress >= 100 ? '🎉 Goal accomplished!' : `${userProfile.dailyMinutesTarget - todayMinutes} min to complete`}
            </span>
          </div>
        </div>

        {/* Streak Flame Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--amber-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Flame size={30} color="var(--amber)" fill="var(--amber)" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Daily Streak
            </span>
            <h3 style={{ fontSize: '1.2rem', marginTop: 2 }}>{userProfile.streakDays} Days Strong</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--amber)' }}>Keep the fire burning!</span>
          </div>
        </div>

        {/* Total XP Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--primary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={30} color="var(--primary)" fill="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Experience
            </span>
            <h3 style={{ fontSize: '1.2rem', marginTop: 2 }}>{userProfile.totalXP} XP</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-light)' }}>Earned across exercises</span>
          </div>
        </div>

        {/* Speaking Practice Duration Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 18, padding: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--mint-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={28} color="var(--mint)" />
          </div>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Speaking Time
            </span>
            <h3 style={{ fontSize: '1.2rem', marginTop: 2 }}>
              {Math.floor(progressStats.speakingDurationSeconds / 60)}m {progressStats.speakingDurationSeconds % 60}s
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--mint)' }}>Active conversational time</span>
          </div>
        </div>
      </div>

      {/* 3. Core Action Rows: Today's Lesson & Personal Mistake Review */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20 }}>
        {/* Next Recommended Lesson Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span className="badge badge-primary">Recommended Curriculum Lesson</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+{nextChapter.xpReward} XP</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', marginBottom: 6 }}>{nextChapter.title}</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              {nextChapter.shortDescription}
            </p>

            {/* Quick overview pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Layers size={15} color="var(--primary)" />
                <span>{nextChapter.assessmentQuestions.length} Interactive Exercises</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <BookOpen size={15} color="var(--mint)" />
                <span>{nextChapter.vocabulary.length} Key Vocabulary Words</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => onOpenLesson(nextChapter.id)}
              className="btn-primary"
              style={{ flex: 1, padding: '12px' }}
            >
              <Play size={16} fill="currentColor" />
              <span>Start Chapter Now</span>
            </button>
            <button
              onClick={() => onNavigate('learn')}
              className="btn-secondary"
              style={{ padding: '12px 16px' }}
            >
              View Full Path
            </button>
          </div>
        </div>

        {/* Review Your Mistakes Card (Requirement 9) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="badge badge-rose" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <AlertCircle size={14} />
                <span>Mistake Memory ({activeMistakes.length})</span>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Weakness Tracker</span>
            </div>

            <h3 style={{ fontSize: '1.15rem', marginBottom: 6 }}>Targeted Revision</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              Your AI tutor tracks repeated errors so you can practice until they become second nature.
            </p>

            {/* Preview top active mistake */}
            {activeMistakes.length > 0 ? (
              <div
                style={{
                  background: 'var(--bg-app)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: 16
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--rose)', fontWeight: 700, marginBottom: 4 }}>
                  <span>Recent Trap: {activeMistakes[0].category.toUpperCase()}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  "{activeMistakes[0].originalPhrase}"
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--mint)', fontWeight: 600, marginTop: 2 }}>
                  ✓ "{activeMistakes[0].correctedPhrase}"
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                🎉 No unmastered mistakes right now! Keep speaking!
              </div>
            )}
          </div>

          <button
            onClick={onOpenMistakeReview}
            className="btn-secondary"
            style={{ width: '100%', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <RotateCcw size={16} />
            <span>Practice Weak Areas</span>
          </button>
        </div>
      </div>

      {/* 4. Vocabulary Due for Revision & Weekly Progress Visualization */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Spaced Repetition Vocabulary Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Spaced Repetition Vocabulary</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {dueVocab.length} words due for memory refresh today
              </p>
            </div>
            <button onClick={onOpenVocabReview} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
              Review All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {vocabulary.slice(0, 3).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                      {item.word}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {item.partOfSpeech}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {item.meaning}
                  </div>
                </div>

                <span
                  className={`badge ${item.nextReviewDate <= now ? 'badge-amber' : 'badge-mint'}`}
                  style={{ fontSize: '0.68rem' }}
                >
                  {item.nextReviewDate <= now ? 'Due Now' : 'Mastered'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity Progress Visualization */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Weekly Study Consistency</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Minutes practiced each day</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-light)' }}>Last 7 Days</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 110, padding: '10px 0 0' }}>
            {progressStats.weeklyActivity.map((day, idx) => {
              const maxMinutes = Math.max(...progressStats.weeklyActivity.map((d) => d.minutesSpent), 15);
              const heightPercent = Math.max(12, Math.round((day.minutesSpent / maxMinutes) * 100));
              const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
              const isToday = idx === progressStats.weeklyActivity.length - 1;

              return (
                <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {day.minutesSpent > 0 ? `${day.minutesSpent}m` : '0'}
                  </span>
                  <div
                    style={{
                      width: 20,
                      height: `${heightPercent}%`,
                      maxHeight: 75,
                      borderRadius: '4px 4px 2px 2px',
                      background: isToday
                        ? 'linear-gradient(180deg, var(--mint) 0%, #059669 100%)'
                        : day.minutesSpent > 0
                        ? 'linear-gradient(180deg, var(--primary) 0%, var(--violet) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <span style={{ fontSize: '0.72rem', color: isToday ? 'var(--mint)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 500 }}>
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

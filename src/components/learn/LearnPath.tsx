import React, { useState } from 'react';
import {
  CheckCircle,
  Play,
  RotateCcw,
  BookOpen,
  Sparkles,
  Zap,
  Lock,
  Compass,
  Layers,
  Award
} from 'lucide-react';
import { CURRICULUM_DATA } from '../../data/curriculumData';
import type { CEFRLevel, LessonChapter, CurriculumUnit } from '../../types/learning';
import type { UserProfile } from '../../types/user';

interface LearnPathProps {
  userProfile: UserProfile;
  onOpenChapter: (chapter: LessonChapter) => void;
  onSelectLevel: (level: CEFRLevel) => void;
}

export const LearnPath: React.FC<LearnPathProps> = ({
  userProfile,
  onOpenChapter,
  onSelectLevel
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(userProfile.level);

  const levelCurriculum = CURRICULUM_DATA.find((c) => c.level === selectedLevel) || CURRICULUM_DATA[0];

  const levels: { id: CEFRLevel; title: string; subtitle: string }[] = [
    { id: 'A1', title: 'A1 Beginner', subtitle: 'Greetings & Basics' },
    { id: 'A2', title: 'A2 Elementary', subtitle: 'Past, Future & Travel' },
    { id: 'B1', title: 'B1 Intermediate', subtitle: 'Workplace & Nuance' },
    { id: 'B2', title: 'B2 Upper Int.', subtitle: 'Fluency & Presentations' }
  ];

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Level Selector Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
        {levels.map((lvl) => {
          const isSelected = selectedLevel === lvl.id;
          return (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 22px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-card)',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                transition: 'all 0.2s ease',
                minWidth: 150
              }}
            >
              <span style={{ fontSize: '0.98rem', fontWeight: 800, color: isSelected ? 'var(--primary-light)' : 'var(--text-main)' }}>
                {lvl.title}
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {lvl.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Level Header Info */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-subtle)',
          padding: '24px 28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="badge badge-primary">{levelCurriculum.levelName}</span>
              <span className="badge badge-mint">All Lessons 100% Free</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', marginBottom: 6 }}>{levelCurriculum.tagline}</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: 640 }}>
              {levelCurriculum.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--mint)' }}>
                {levelCurriculum.units.flatMap((u) => u.chapters).filter((ch) => userProfile.completedChapters.includes(ch.id)).length}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  /{levelCurriculum.units.flatMap((u) => u.chapters).length}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chapters Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Units & Chapters Path */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
        {levelCurriculum.units.map((unit: CurriculumUnit) => (
          <div key={unit.id} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Unit Banner */}
            <div
              style={{
                background: `linear-gradient(135deg, ${unit.color}22 0%, ${unit.color}08 100%)`,
                border: `1px solid ${unit.color}44`,
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: unit.color, letterSpacing: '0.04em' }}>
                  Unit {unit.unitNumber}
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: 2, color: 'var(--text-main)' }}>
                  {unit.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {unit.description}
                </p>
              </div>

              <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: `${unit.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={22} color={unit.color} />
              </div>
            </div>

            {/* Chapters Interactive List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {unit.chapters.map((chapter: LessonChapter, idx: number) => {
                const isCompleted = userProfile.completedChapters.includes(chapter.id);

                return (
                  <div
                    key={chapter.id}
                    className="card"
                    style={{
                      border: isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isCompleted && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          color: 'var(--mint)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        <CheckCircle size={15} />
                        <span>Completed</span>
                      </div>
                    )}

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? 'var(--mint-subtle)' : 'var(--primary-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isCompleted ? 'var(--mint)' : 'var(--primary)'
                          }}
                        >
                          <BookOpen size={18} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            Chapter {idx + 1}
                          </span>
                          <h4 style={{ fontSize: '1.02rem', margin: 0 }}>{chapter.title}</h4>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.45 }}>
                        {chapter.shortDescription}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        <span>⏱ ~{chapter.durationMinutes} min</span>
                        <span>•</span>
                        <span>⚡ +{chapter.xpReward} XP</span>
                        <span>•</span>
                        <span>📝 {chapter.assessmentQuestions.length} Questions</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenChapter(chapter)}
                      className={isCompleted ? 'btn-secondary' : 'btn-primary'}
                      style={{ width: '100%', padding: '10px 16px', fontSize: '0.9rem' }}
                    >
                      {isCompleted ? (
                        <>
                          <RotateCcw size={15} />
                          <span>Review & Practice</span>
                        </>
                      ) : (
                        <>
                          <Play size={15} fill="currentColor" />
                          <span>Start Lesson</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

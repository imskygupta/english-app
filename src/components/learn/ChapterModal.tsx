import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';
import type { LessonChapter, QuizQuestion } from '../../types/learning';
import type { UserProfile } from '../../types/user';
import { QuizEngine } from '../quiz/QuizEngine';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';

interface ChapterModalProps {
  chapter: LessonChapter | null;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onChapterCompleted: (chapterId: string, xpEarned: number) => void;
  onRecordMistakeFromQuiz?: (question: QuizQuestion) => void;
}

type TabMode = 'theory' | 'vocabulary' | 'assessment' | 'summary';

export const ChapterModal: React.FC<ChapterModalProps> = ({
  chapter,
  isOpen,
  onClose,
  userProfile,
  onChapterCompleted,
  onRecordMistakeFromQuiz
}) => {
  const [activeTab, setActiveTab] = useState<TabMode>('theory');
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    mistakes: { question: QuizQuestion; userAnswer: string | string[] }[];
  } | null>(null);

  if (!isOpen || !chapter) return null;

  const handleAssessmentComplete = (result: {
    score: number;
    total: number;
    percentage: number;
    mistakes: { question: QuizQuestion; userAnswer: string | string[] }[];
  }) => {
    setAssessmentResult(result);
    setActiveTab('summary');

    // Reward XP and save completion if >= 60%
    if (result.percentage >= 60) {
      onChapterCompleted(chapter.id, chapter.xpReward);
    }

    // Register any mistakes into memory
    if (result.mistakes.length > 0 && onRecordMistakeFromQuiz) {
      result.mistakes.forEach((m) => onRecordMistakeFromQuiz(m.question));
    }
  };

  const handleRetryAssessment = () => {
    setAssessmentResult(null);
    setActiveTab('assessment');
  };

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
        zIndex: 150,
        padding: 20
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 780,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-card)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-primary">Level {chapter.level}</span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                +{chapter.xpReward} XP Reward
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{chapter.title}</h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            padding: '0 24px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-sidebar)',
            gap: 20
          }}
        >
          {[
            { id: 'theory', label: '1. Lesson & Rules' },
            { id: 'vocabulary', label: `2. Vocabulary (${chapter.vocabulary.length})` },
            { id: 'assessment', label: `3. Practice Quiz (${chapter.assessmentQuestions.length})` },
            ...(assessmentResult ? [{ id: 'summary', label: '4. Summary' }] : [])
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                style={{
                  padding: '14px 4px',
                  borderBottom: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Content Scroll Area */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: THEORY & RULES */}
          {activeTab === 'theory' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Explanation */}
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: 8, color: 'var(--primary-light)' }}>
                  Overview & Core Concept
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {chapter.explanation}
                </p>
              </div>

              {/* Key Rules */}
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: 12, color: 'var(--mint)' }}>
                  Golden Rules to Remember
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chapter.keyRules.map((rule, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <CheckCircle size={18} color="var(--mint)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practical Examples */}
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Practical Examples in Context</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {chapter.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {ex.title}
                        </span>
                        <button
                          onClick={() => speechService.speak(ex.english)}
                          title="Listen to pronunciation"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: '0.78rem',
                            color: 'var(--primary-light)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--primary-subtle)'
                          }}
                        >
                          <Volume2 size={14} />
                          <span>Listen</span>
                        </button>
                      </div>

                      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                        "{ex.english}"
                      </div>

                      {ex.translation && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                          {ex.translation}
                        </div>
                      )}

                      <div style={{ fontSize: '0.82rem', color: 'var(--mint)', lineHeight: 1.4 }}>
                        💡 {ex.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next step CTA */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12 }}>
                <button
                  onClick={() => setActiveTab('vocabulary')}
                  className="btn-primary"
                  style={{ padding: '12px 24px' }}
                >
                  <span>Review Vocabulary</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VOCABULARY */}
          {activeTab === 'vocabulary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {chapter.vocabulary.map((vocab) => (
                  <div
                    key={vocab.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <h4 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--primary-light)' }}>
                          {vocab.word}
                        </h4>
                        <button
                          onClick={() => speechService.speak(vocab.word)}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'var(--primary-subtle)',
                            color: 'var(--primary)'
                          }}
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>

                      {vocab.phonetic && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'block', marginBottom: 6 }}>
                          {vocab.phonetic} • {vocab.partOfSpeech}
                        </span>
                      )}

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: 6 }}>
                        {vocab.meaning}
                      </p>

                      {vocab.hindiMeaning && (
                        <div style={{ fontSize: '0.82rem', color: 'var(--mint)', marginBottom: 10, fontWeight: 500 }}>
                          हिंदी: {vocab.hindiMeaning}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-app)',
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        borderLeft: '3px solid var(--primary)'
                      }}
                    >
                      "{vocab.exampleSentence}"
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16 }}>
                <button onClick={() => setActiveTab('theory')} className="btn-secondary">
                  Back to Theory
                </button>
                <button onClick={() => setActiveTab('assessment')} className="btn-primary" style={{ padding: '12px 24px' }}>
                  <span>Start Practice Quiz</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ASSESSMENT QUIZ */}
          {activeTab === 'assessment' && (
            <QuizEngine
              questions={chapter.assessmentQuestions}
              onComplete={handleAssessmentComplete}
              onExit={() => setActiveTab('theory')}
              soundEnabled={true}
            />
          )}

          {/* TAB 4: COMPLETION SUMMARY */}
          {activeTab === 'summary' && assessmentResult && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '20px 0' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: assessmentResult.percentage >= 70 ? 'var(--mint-subtle)' : 'var(--amber-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Award size={42} color={assessmentResult.percentage >= 70 ? 'var(--mint)' : 'var(--amber)'} />
              </div>

              <div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
                  {assessmentResult.percentage >= 70 ? 'Chapter Mastered! 🎉' : 'Good Effort! Keep Practicing'}
                </h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
                  You scored {assessmentResult.score} out of {assessmentResult.total} ({assessmentResult.percentage}%)
                </p>
                <div style={{ marginTop: 8 }}>
                  <span className="badge badge-mint" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
                    +{chapter.xpReward} XP Earned
                  </span>
                </div>
              </div>

              {/* Mistakes review breakdown */}
              {assessmentResult.mistakes.length > 0 && (
                <div style={{ width: '100%', textAlign: 'left', marginTop: 16 }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--rose)', marginBottom: 12 }}>
                    Questions to Revisit ({assessmentResult.mistakes.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {assessmentResult.mistakes.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid rgba(244, 63, 94, 0.3)'
                        }}
                      >
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                          {m.question.prompt}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--mint)', marginBottom: 4 }}>
                          Correct answer: {Array.isArray(m.question.correctAnswer) ? m.question.correctAnswer.join(' ') : m.question.correctAnswer}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          💡 {m.question.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
                <button onClick={handleRetryAssessment} className="btn-secondary">
                  <RotateCcw size={16} />
                  <span>Retry Quiz</span>
                </button>
                <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px' }}>
                  <span>Back to Curriculum</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { QuizQuestion } from '../../types/learning';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';

interface QuizEngineProps {
  questions: QuizQuestion[];
  onComplete: (results: {
    score: number;
    total: number;
    percentage: number;
    mistakes: { question: QuizQuestion; userAnswer: string | string[] }[];
  }) => void;
  onExit?: () => void;
  soundEnabled?: boolean;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  questions,
  onComplete,
  onExit,
  soundEnabled = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // For word_order questions:
  const [orderedWords, setOrderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

  // For match_pairs questions:
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [left: string]: string }>({});

  // Question state: 'answering' | 'checked'
  const [status, setStatus] = useState<'answering' | 'checked'>('answering');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Score keeping
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<{ question: QuizQuestion; userAnswer: string | string[] }[]>([]);

  const currentQ = questions[currentIndex];

  // Reset state when switching questions
  useEffect(() => {
    setSelectedOption(null);
    setStatus('answering');
    setIsCorrect(false);
    setSelectedLeft(null);

    if (currentQ.type === 'word_order' && currentQ.wordBank) {
      // Shuffle word bank slightly for fun
      setAvailableWords([...currentQ.wordBank]);
      setOrderedWords([]);
    }

    if (currentQ.type === 'match_pairs') {
      setMatchedPairs({});
    }

    // Auto play audio for listening questions
    if (currentQ.type === 'listening' && currentQ.audioText) {
      const timer = setTimeout(() => {
        speechService.speak(currentQ.audioText!);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQ]);

  // Check answer
  const handleCheck = () => {
    if (status === 'checked') {
      // Advance to next or complete
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const finalScore = isCorrect ? correctCount + 1 : correctCount;
        const total = questions.length;
        const percentage = Math.round((finalScore / total) * 100);

        if (percentage >= 70) {
          try {
            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          } catch {}
          if (soundEnabled) soundService.playFanfare();
        }

        onComplete({
          score: finalScore,
          total,
          percentage,
          mistakes
        });
      }
      return;
    }

    // Evaluate answer
    let correct = false;
    let givenAnswer: string | string[] = '';

    if (currentQ.type === 'word_order') {
      givenAnswer = orderedWords;
      const expected = Array.isArray(currentQ.correctAnswer) ? currentQ.correctAnswer : [currentQ.correctAnswer];
      correct = orderedWords.join(' ').trim() === expected.join(' ').trim();
    } else if (currentQ.type === 'match_pairs') {
      correct = currentQ.pairs ? Object.keys(matchedPairs).length === currentQ.pairs.length : true;
      givenAnswer = 'pairs';
    } else {
      givenAnswer = selectedOption || '';
      correct = selectedOption === currentQ.correctAnswer;
    }

    setIsCorrect(correct);
    setStatus('checked');

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      if (soundEnabled) soundService.playCorrect();
    } else {
      setMistakes((prev) => [...prev, { question: currentQ, userAnswer: givenAnswer }]);
      if (soundEnabled) soundService.playWrong();
    }
  };

  // Word order handlers
  const handlePickWord = (word: string, index: number) => {
    if (status === 'checked') return;
    setOrderedWords([...orderedWords, word]);
    const updated = [...availableWords];
    updated.splice(index, 1);
    setAvailableWords(updated);
  };

  const handleReturnWord = (word: string, index: number) => {
    if (status === 'checked') return;
    setAvailableWords([...availableWords, word]);
    const updated = [...orderedWords];
    updated.splice(index, 1);
    setOrderedWords(updated);
  };

  // Match pairs handlers
  const handleLeftClick = (leftText: string) => {
    if (status === 'checked' || matchedPairs[leftText]) return;
    setSelectedLeft(leftText);
  };

  const handleRightClick = (rightText: string) => {
    if (status === 'checked' || !selectedLeft) return;
    const pair = currentQ.pairs?.find((p) => p.left === selectedLeft);
    if (pair && pair.right === rightText) {
      setMatchedPairs({ ...matchedPairs, [selectedLeft]: rightText });
      setSelectedLeft(null);
      if (soundEnabled) soundService.playCorrect();
    } else {
      setSelectedLeft(null);
      if (soundEnabled) soundService.playWrong();
    }
  };

  const canCheck = () => {
    if (status === 'checked') return true;
    if (currentQ.type === 'word_order') return orderedWords.length > 0;
    if (currentQ.type === 'match_pairs') return currentQ.pairs ? Object.keys(matchedPairs).length === currentQ.pairs.length : false;
    return !!selectedOption;
  };

  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Quiz Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, height: 8, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              borderRadius: 99,
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div
        className="card"
        style={{
          padding: '24px 28px',
          border: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        {/* Category Tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
            {currentQ.category.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {currentQ.type.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Reading Passage or Context if present */}
        {currentQ.contextText && (
          <div
            style={{
              background: 'var(--bg-app)',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontStyle: 'italic',
              fontSize: '0.92rem',
              color: 'var(--text-main)',
              lineHeight: 1.55,
              marginBottom: 16
            }}
          >
            "{currentQ.contextText}"
          </div>
        )}

        {/* Question Prompt */}
        <h3 style={{ fontSize: '1.25rem', marginBottom: 18, color: 'var(--text-main)', lineHeight: 1.4 }}>
          {currentQ.prompt}
        </h3>

        {/* Audio Button for Listening Comprehension */}
        {currentQ.type === 'listening' && currentQ.audioText && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => speechService.speak(currentQ.audioText!)}
              className="btn-primary"
              style={{ padding: '12px 20px', borderRadius: 'var(--radius-full)' }}
            >
              <Volume2 size={20} />
              <span>Tap to Listen Again</span>
            </button>
          </div>
        )}

        {/* Question Type: Word Ordering */}
        {currentQ.type === 'word_order' && (
          <div>
            {/* Target Assembly Area */}
            <div
              style={{
                minHeight: 56,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-app)',
                border: '2px dashed var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 18
              }}
            >
              {orderedWords.length === 0 ? (
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.88rem' }}>
                  Tap words below in the correct order...
                </span>
              ) : (
                orderedWords.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleReturnWord(word, i)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Word Bank */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {availableWords.map((word, i) => (
                <button
                  key={i}
                  onClick={() => handlePickWord(word, i)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    fontWeight: 600,
                    fontSize: '0.92rem'
                  }}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question Type: Match Pairs */}
        {currentQ.type === 'match_pairs' && currentQ.pairs && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentQ.pairs.map((p) => {
                const isMatched = !!matchedPairs[p.left];
                const isSelected = selectedLeft === p.left;
                return (
                  <button
                    key={p.left}
                    onClick={() => handleLeftClick(p.left)}
                    disabled={isMatched}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isMatched ? 'var(--mint-subtle)' : isSelected ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                      border: isMatched ? '2px solid var(--mint)' : isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      color: isMatched ? 'var(--mint)' : 'var(--text-main)',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    {p.left} {isMatched && '✓'}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentQ.pairs.map((p) => {
                const isMatched = Object.values(matchedPairs).includes(p.right);
                return (
                  <button
                    key={p.right}
                    onClick={() => handleRightClick(p.right)}
                    disabled={isMatched}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isMatched ? 'var(--mint-subtle)' : 'var(--bg-surface)',
                      border: isMatched ? '2px solid var(--mint)' : '1px solid var(--border-subtle)',
                      color: isMatched ? 'var(--mint)' : 'var(--text-main)',
                      fontWeight: 600,
                      textAlign: 'left'
                    }}
                  >
                    {p.right} {isMatched && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard Options (MCQ, Fill in blank, Sentence correction, Situational, Translation, Listening) */}
        {currentQ.type !== 'word_order' && currentQ.type !== 'match_pairs' && currentQ.options && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              let border = '1px solid var(--border-subtle)';
              let bg = 'var(--bg-surface)';
              let textCol = 'var(--text-main)';

              if (status === 'checked') {
                if (option === currentQ.correctAnswer) {
                  border = '2px solid var(--mint)';
                  bg = 'var(--mint-subtle)';
                  textCol = 'var(--mint)';
                } else if (isSelected && !isCorrect) {
                  border = '2px solid var(--rose)';
                  bg = 'var(--rose-subtle)';
                  textCol = 'var(--rose)';
                }
              } else if (isSelected) {
                border = '2px solid var(--primary)';
                bg = 'var(--primary-subtle)';
                textCol = 'var(--primary-light)';
              }

              return (
                <button
                  key={idx}
                  onClick={() => status === 'answering' && setSelectedOption(option)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: bg,
                    border: border,
                    textAlign: 'left',
                    fontWeight: 600,
                    color: textCol,
                    fontSize: '0.94rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{option}</span>
                  {status === 'checked' && option === currentQ.correctAnswer && (
                    <CheckCircle size={18} color="var(--mint)" />
                  )}
                  {status === 'checked' && isSelected && !isCorrect && (
                    <XCircle size={18} color="var(--rose)" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Immediate Explanation Banner after Check */}
      {status === 'checked' && (
        <div
          style={{
            padding: '18px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: isCorrect ? 'var(--mint-subtle)' : 'var(--rose-subtle)',
            border: isCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14
          }}
        >
          {isCorrect ? (
            <CheckCircle size={22} color="var(--mint)" style={{ flexShrink: 0, marginTop: 2 }} />
          ) : (
            <XCircle size={22} color="var(--rose)" style={{ flexShrink: 0, marginTop: 2 }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: isCorrect ? 'var(--mint)' : 'var(--rose)' }}>
              {isCorrect ? 'Well done! Exactly right.' : 'Not quite right yet.'}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginTop: 4, lineHeight: 1.45 }}>
              {currentQ.explanation}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        {onExit ? (
          <button onClick={onExit} className="btn-secondary">
            Quit Lesson
          </button>
        ) : <div />}

        <button
          onClick={handleCheck}
          disabled={!canCheck()}
          className={status === 'checked' ? (isCorrect ? 'btn-mint' : 'btn-primary') : 'btn-primary'}
          style={{ padding: '12px 28px', fontSize: '0.98rem' }}
        >
          <span>{status === 'answering' ? 'Check Answer' : currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Assessment'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

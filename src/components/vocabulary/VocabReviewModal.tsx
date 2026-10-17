import React, { useState } from 'react';
import {
  X,
  Volume2,
  CheckCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  AlertTriangle
} from 'lucide-react';
import type { SpacedVocabCard } from '../../types/user';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';

interface VocabReviewModalProps {
  vocabulary: SpacedVocabCard[];
  isOpen: boolean;
  onClose: () => void;
  onRateCard: (cardId: string, rating: 'easy' | 'good' | 'hard') => void;
}

export const VocabReviewModal: React.FC<VocabReviewModalProps> = ({
  vocabulary,
  isOpen,
  onClose,
  onRateCard
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  if (!isOpen || vocabulary.length === 0) return null;

  const currentCard = vocabulary[currentIndex % vocabulary.length];

  const handleRating = (rating: 'easy' | 'good' | 'hard') => {
    onRateCard(currentCard.id, rating);
    soundService.playClick();
    setReviewedCount((prev) => prev + 1);

    if (currentIndex + 1 < vocabulary.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      soundService.playCorrect();
      onClose();
    }
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
        zIndex: 200,
        padding: 20
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 540,
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          padding: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              Spaced Repetition Deck
            </span>
            <h3 style={{ fontSize: '1.25rem', marginTop: 4 }}>
              Card {currentIndex + 1} of {vocabulary.length}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Flashcard Body */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            minHeight: 220,
            padding: '28px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-md)',
            transition: 'transform 0.2s ease, border-color 0.2s ease',
            position: 'relative'
          }}
        >
          <span style={{ position: 'absolute', top: 12, right: 14, fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Tap card to {isFlipped ? 'hide' : 'reveal'} meaning
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h2 style={{ fontSize: '1.9rem', color: 'var(--primary-light)', margin: 0 }}>
              {currentCard.word}
            </h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speechService.speak(currentCard.word);
              }}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Volume2 size={18} />
            </button>
          </div>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 16 }}>
            {currentCard.partOfSpeech}
          </span>

          {/* Flipped details */}
          {isFlipped ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, animation: 'fadeIn 0.2s ease' }}>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>
                {currentCard.meaning}
              </p>
              {currentCard.hindiMeaning && (
                <div style={{ fontSize: '0.92rem', color: 'var(--mint)', fontWeight: 500 }}>
                  हिंदी: {currentCard.hindiMeaning}
                </div>
              )}
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-app)',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  marginTop: 6
                }}
              >
                "{currentCard.exampleSentence}"
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: 12 }}>
              💡 How well do you remember this word?
            </span>
          )}
        </div>

        {/* Rating Actions */}
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>
            Rate your recall confidence to schedule next interval:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <button
              onClick={() => handleRating('hard')}
              className="btn-secondary"
              style={{ borderColor: 'rgba(244,63,94,0.3)', color: 'var(--rose)', flexDirection: 'column', padding: '10px' }}
            >
              <AlertTriangle size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Hard</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Repeat in 12h</span>
            </button>

            <button
              onClick={() => handleRating('good')}
              className="btn-secondary"
              style={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--primary-light)', flexDirection: 'column', padding: '10px' }}
            >
              <ThumbsUp size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Good</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Repeat in 2-3d</span>
            </button>

            <button
              onClick={() => handleRating('easy')}
              className="btn-secondary"
              style={{ borderColor: 'rgba(16,185,129,0.3)', color: 'var(--mint)', flexDirection: 'column', padding: '10px' }}
            >
              <CheckCircle size={16} />
              <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>Easy</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Repeat in 5d</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

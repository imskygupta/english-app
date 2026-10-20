import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Volume2,
  Check,
  Plus,
  RefreshCw,
  Layers,
  Cpu,
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import type { SpacedVocabCard, UserProfile } from '../../types/user';
import { geminiService, AVAILABLE_GEMINI_MODELS } from '../../services/geminiService';
import { speechService } from '../../services/speechService';
import { soundService } from '../../services/soundService';

interface AIFlashcardGeneratorProps {
  userProfile: UserProfile;
  onAddCards: (cards: SpacedVocabCard[]) => void;
  onStartReview: () => void;
}

const PRESET_TOPICS = [
  'Everyday Action Verbs',
  'Irregular Past Tense Verbs',
  'Job Interview & Office Vocabulary',
  'Ordering Food & Restaurant English',
  'Travel, Airport & Directions',
  'High-Frequency English Idioms'
];

export const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  userProfile,
  onAddCards,
  onStartReview
}) => {
  const [topic, setTopic] = useState('Everyday Action Verbs');
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<SpacedVocabCard[]>([]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setSavedSuccess(false);
    soundService.playClick();

    try {
      const cards = await geminiService.generateFlashcardsWithAi(
        topic,
        userProfile.level,
        selectedModel,
        userProfile.geminiApiKey
      );
      setGeneratedCards(cards);
      soundService.playCorrect();
    } catch (e) {
      console.error('Failed generating cards:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = () => {
    if (generatedCards.length === 0) return;
    onAddCards(generatedCards);
    setSavedSuccess(true);
    soundService.playFanfare();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePronounce = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speechService.speak(word, {
      rate: 0.9,
      pitch: 1.0
    });
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 26 }}>
      {/* Header */}
      <div
        className="card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--violet) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}
          >
            <BrainCircuit size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0 }}>AI Flashcard Generator</h2>
              <span className="badge badge-primary">Model Selector</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Instantly generate structured vocabulary and verb flashcards powered by Google Gemini
            </p>
          </div>
        </div>

        <button
          onClick={onStartReview}
          className="btn-secondary"
          style={{ padding: '10px 18px', fontSize: '0.88rem' }}
        >
          <Layers size={16} />
          <span>Review My Deck</span>
        </button>
      </div>

      {/* Generator Controls Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
          {/* Topic Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
              Flashcard Topic or Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Action Verbs, Job Interview, Daily Routine..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontSize: '0.94rem'
              }}
            />
          </div>

          {/* Model Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>
              Gemini Model
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.92rem',
                  cursor: 'pointer'
                }}
              >
                {AVAILABLE_GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} style={{ backgroundColor: '#13192b', color: '#fff' }}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Quick Topic Pills */}
        <div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: 8 }}>
            Popular Learning Topics (Click to select)
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESET_TOPICS.map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setTopic(pt)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: topic === pt ? 'var(--primary-subtle)' : 'var(--bg-surface)',
                  border: topic === pt ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                  color: topic === pt ? 'var(--primary-light)' : 'var(--text-muted)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {pt}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Target Level: <strong style={{ color: 'var(--primary-light)' }}>CEFR {userProfile.level}</strong> • Generates 6 cards with audio and examples
          </span>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary"
            style={{ padding: '10px 24px', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? `Generating with ${selectedModel}...` : 'Generate Flashcards with AI'}</span>
          </button>
        </div>
      </div>

      {/* Generated Cards Display */}
      {generatedCards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="var(--mint)" />
              <span>Generated Cards ({generatedCards.length})</span>
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {savedSuccess ? (
                <span className="badge badge-mint" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} />
                  <span>Added to Your Spaced Repetition Deck!</span>
                </span>
              ) : (
                <button
                  onClick={handleSaveAll}
                  className="btn-primary"
                  style={{ padding: '8px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={16} />
                  <span>Add All to My Deck</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {generatedCards.map((card) => (
              <div
                key={card.id}
                className="card"
                style={{
                  padding: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, fontWeight: 700 }}>
                      {card.word}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: 'var(--lavender)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                      {card.partOfSpeech || 'verb'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handlePronounce(card.word, e)}
                    title="Pronounce word"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-subtle)',
                      color: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
                  {card.meaning}
                </p>

                {card.exampleSentence && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      lineHeight: 1.4
                    }}
                  >
                    "{card.exampleSentence}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

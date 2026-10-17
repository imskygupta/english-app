import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  MessageCircle,
  Briefcase,
  Plane,
  GraduationCap,
  Volume2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import type { UserProfile, CEFRLevel, LearningGoal, ExplanationLanguage, DailyTimeTarget, SpeakingConfidence } from '../../types/user';
import { Avatar } from '../common/Avatar';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (updatedProfile: Partial<UserProfile>) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [name, setName] = useState('');
  const [level, setLevel] = useState<CEFRLevel>('A1');
  const [goal, setGoal] = useState<LearningGoal>('daily_conversation');
  const [explanationLanguage, setExplanationLanguage] = useState<ExplanationLanguage>('hindi');
  const [dailyMinutesTarget, setDailyMinutesTarget] = useState<DailyTimeTarget>(15);
  const [confidence, setConfidence] = useState<SpeakingConfidence>('somewhat_hesitant');

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete({
      name: name.trim() || 'Learner',
      level,
      goal,
      explanationLanguage,
      dailyMinutesTarget,
      confidence,
      onboardingCompleted: true
    });
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
          maxWidth: 580,
          backgroundColor: 'var(--bg-sidebar)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          padding: 32,
          position: 'relative'
        }}
      >
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar mood={step === 5 ? 'praising' : 'idle'} size={42} />
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Step {step} of {totalSteps}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.98rem' }}>Welcome to FluentMate</h4>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 24,
                  height: 4,
                  borderRadius: 99,
                  backgroundColor: i + 1 <= step ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Name and Level */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>What is your current English level?</h2>
            <p style={{ marginBottom: 18, fontSize: '0.9rem' }}>
              We will personalize lessons, vocabulary, and tutor explanations to fit your exact level.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                What should your AI tutor call you?
              </label>
              <input
                type="text"
                placeholder="Enter your name (e.g. Alex, Priya)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { id: 'A1', title: 'Beginner (A1)', desc: 'Starting from scratch or know very basic words' },
                { id: 'A2', title: 'Elementary (A2)', desc: 'Can understand basic phrases & daily sentences' },
                { id: 'B1', title: 'Intermediate (B1)', desc: 'Can speak reasonably well but struggle with grammar' },
                { id: 'B2', title: 'Upper Intermediate (B2)', desc: 'Looking for professional fluency & natural nuance' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id as CEFRLevel)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: level === lvl.id ? 'var(--primary-subtle)' : 'var(--bg-card)',
                    border: level === lvl.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontWeight: 700, color: level === lvl.id ? 'var(--primary-light)' : 'var(--text-main)', fontSize: '0.92rem' }}>
                    {lvl.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {lvl.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Main Goal */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>What is your primary learning goal?</h2>
            <p style={{ marginBottom: 18, fontSize: '0.9rem' }}>
              Your AI tutor will customize conversation topics, roleplays, and vocabulary around this goal.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'daily_conversation', label: 'Daily Conversation & Confidence', icon: MessageCircle, desc: 'Chat naturally with friends, family, and new people' },
                { id: 'job_interviews', label: 'Cracking Job Interviews', icon: Briefcase, desc: 'Excel at HR and technical interviews in international teams' },
                { id: 'workplace_english', label: 'Workplace & Business English', icon: ShieldCheck, desc: 'Lead meetings, write professional emails, and present ideas' },
                { id: 'travel', label: 'Travel & Global Living', icon: Plane, desc: 'Order at restaurants, ask for directions, and navigate airports' },
                { id: 'general_fluency', label: 'General Fluency & Mastery', icon: Sparkles, desc: 'Express complex thoughts effortlessly and sound natural' }
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = goal === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id as LearningGoal)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-card)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={isSelected ? '#fff' : 'var(--text-muted)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>{g.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{g.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Explanation Language */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Preferred Explanation Language</h2>
            <p style={{ marginBottom: 18, fontSize: '0.9rem' }}>
              When explaining tricky grammar rules, what language should the tutor use?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { id: 'hindi', title: 'Hindi (हिंदी)', desc: 'Rules & meanings explained in Hindi alongside English' },
                { id: 'english', title: 'English Only', desc: 'Total English immersion with simplified vocabulary' },
                { id: 'spanish', title: 'Spanish (Español)', desc: 'Explanations and translations in Spanish' },
                { id: 'french', title: 'French (Français)', desc: 'Explanations and translations in French' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setExplanationLanguage(lang.id as ExplanationLanguage)}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: explanationLanguage === lang.id ? 'var(--primary-subtle)' : 'var(--bg-card)',
                    border: explanationLanguage === lang.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, color: explanationLanguage === lang.id ? 'var(--primary-light)' : 'var(--text-main)', fontSize: '0.95rem' }}>
                    {lang.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {lang.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Daily Practice Target */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>How much time can you practice daily?</h2>
            <p style={{ marginBottom: 18, fontSize: '0.9rem' }}>
              Consistency is everything. Small daily sessions lead to rapid fluency.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { minutes: 5, label: 'Casual', badge: 'Light' },
                { minutes: 10, label: 'Regular', badge: 'Popular' },
                { minutes: 15, label: 'Serious', badge: 'Recommended' },
                { minutes: 20, label: 'Intense', badge: 'Fast Track' }
              ].map((item) => (
                <button
                  key={item.minutes}
                  onClick={() => setDailyMinutesTarget(item.minutes as DailyTimeTarget)}
                  style={{
                    padding: '18px 10px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: dailyMinutesTarget === item.minutes ? 'var(--mint-subtle)' : 'var(--bg-card)',
                    border: dailyMinutesTarget === item.minutes ? '2px solid var(--mint)' : '1px solid var(--border-subtle)',
                    textAlign: 'center'
                  }}
                >
                  <Clock size={20} color={dailyMinutesTarget === item.minutes ? 'var(--mint)' : 'var(--text-muted)'} style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {item.minutes}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}> min</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="badge badge-mint" style={{ fontSize: '0.62rem', marginTop: 8 }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Speaking Confidence */}
        {step === 5 && (
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>How confident do you feel when speaking?</h2>
            <p style={{ marginBottom: 18, fontSize: '0.9rem' }}>
              FluentMate is a judgment-free space. Your tutor will adapt its patience and pace to you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'shy', title: 'Shy / Anxious', desc: 'I get nervous or freeze up when asked to speak in English.' },
                { id: 'somewhat_hesitant', title: 'Somewhat Hesitant', desc: 'I translate in my head before speaking and pause often.' },
                { id: 'moderate', title: 'Moderate', desc: 'I can make myself understood, but I know I make grammar mistakes.' },
                { id: 'confident', title: 'Confident', desc: 'I speak comfortably, but want to sound refined, fluent, and professional.' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConfidence(c.id as SpeakingConfidence)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: confidence === c.id ? 'var(--primary-subtle)' : 'var(--bg-card)',
                    border: confidence === c.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {c.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="btn-primary"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-mint"
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              <Sparkles size={18} />
              <span>Generate My Learning Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

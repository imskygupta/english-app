import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Bot,
  User,
  Square,
  Play,
  Languages,
  BookOpen,
  Settings2,
  ArrowRight
} from 'lucide-react';
import type { TutorMessage, TutorPersona, StructuredTutorResponse, CorrectionItem, SessionLearningSummary } from '../../types/tutor';
import type { UserProfile, MistakeRecord } from '../../types/user';
import { Avatar } from '../common/Avatar';
import type { AvatarMood } from '../common/Avatar';
import { Waveform } from '../common/Waveform';
import { speechService } from '../../services/speechService';
import type { MicState } from '../../services/speechService';
import { geminiService } from '../../services/geminiService';
import { soundService } from '../../services/soundService';
import { SessionSummaryModal } from './SessionSummaryModal';

interface AITutorViewProps {
  userProfile: UserProfile;
  mistakes: MistakeRecord[];
  onRecordMistake: (correction: CorrectionItem) => void;
  onSessionComplete: (summary: SessionLearningSummary) => void;
  initialTopic?: string;
  initialRoleplayContext?: string;
}

export const AITutorView: React.FC<AITutorViewProps> = ({
  userProfile,
  mistakes,
  onRecordMistake,
  onSessionComplete,
  initialTopic,
  initialRoleplayContext
}) => {
  // Mode: 'text' or 'voice'
  const [mode, setMode] = useState<'text' | 'voice'>('voice');
  const [persona, setPersona] = useState<TutorPersona>(userProfile.tutorPersona || 'patient');

  // Input & Messaging
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([]);

  // Speech Recognition & Synthesis states
  const [micState, setMicState] = useState<MicState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeakingTutor, setIsSpeakingTutor] = useState(false);

  // Active Session tracking
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionCorrections, setSessionCorrections] = useState<CorrectionItem[]>([]);
  const [sessionVocabulary, setSessionVocabulary] = useState<{ word: string; meaning: string; example_sentence: string }[]>([]);
  const [summaryData, setSummaryData] = useState<SessionLearningSummary | null>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  // Reference for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize first greeting from tutor
  useEffect(() => {
    let initialGreeting = `Hello ${userProfile.name}! I am your personal English teacher. How was your day, and what would you like to talk about today?`;

    if (initialRoleplayContext) {
      initialGreeting = initialTopic
        ? `Welcome to our practice scenario: "${initialTopic}". Whenever you're ready, say hello and we will begin!`
        : `Welcome! Let's practice this real-life scenario together. How can I help you today?`;
    }

    const firstMsg: TutorMessage = {
      id: 'msg_welcome',
      sender: 'tutor',
      timestamp: Date.now(),
      text: initialGreeting,
      structuredData: {
        reply: initialGreeting,
        corrected_sentence: null,
        corrections: [],
        vocabulary: [],
        follow_up_question: "Feel free to type or tap the microphone to speak!",
        suggested_practice: [],
        session_level: userProfile.level
      }
    };
    setMessages([firstMsg]);

    // Speak initial greeting if autoSpeak is on
    if (userProfile.autoSpeakTutor) {
      const timer = setTimeout(() => {
        playTutorAudio(initialGreeting);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, interimTranscript]);

  // Play Speech Synthesis
  const playTutorAudio = (text: string) => {
    speechService.stopSpeaking();
    setIsSpeakingTutor(true);
    speechService.speak(text, {
      rate: userProfile.voiceSpeed || 0.95,
      pitch: userProfile.voicePitch || 1.0,
      onStart: () => setIsSpeakingTutor(true),
      onEnd: () => setIsSpeakingTutor(false),
      onError: () => setIsSpeakingTutor(false)
    });
  };

  // Toggle Microphone
  const toggleListening = () => {
    setMicError(null);
    speechService.stopSpeaking();

    if (micState === 'listening') {
      speechService.stopListening();
      setMicState('idle');
      return;
    }

    const started = speechService.startListening({
      onStart: () => {
        setMicState('listening');
        setInterimTranscript('');
        soundService.playClick();
      },
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onFinal: (text) => {
        setInterimTranscript('');
        setMicState('idle');
        handleSendMessage(text);
      },
      onError: (err) => {
        setMicState('error');
        setMicError(err);
      },
      onEnd: () => {
        setMicState('idle');
      }
    });

    if (!started && !speechService.isRecognitionSupported()) {
      setMicError('Speech recognition is not supported in this browser. Please use text mode or Chrome/Edge.');
    }
  };

  // Send Learner Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isProcessing) return;

    speechService.stopSpeaking();
    setInputText('');
    setInterimTranscript('');

    const userMsg: TutorMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      timestamp: Date.now(),
      text: textToSend
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsProcessing(true);

    try {
      const tutorResponse = await geminiService.getTutorResponse({
        userMessage: textToSend,
        level: userProfile.level,
        persona,
        conversationHistory: updatedHistory.map((m) => ({ sender: m.sender, text: m.text })),
        mistakeHistory: mistakes,
        roleplayContext: initialRoleplayContext,
        explanationLanguage: userProfile.explanationLanguage,
        apiKey: userProfile.geminiApiKey
      });

      const tutorMsg: TutorMessage = {
        id: `msg_t_${Date.now()}`,
        sender: 'tutor',
        timestamp: Date.now(),
        text: tutorResponse.reply,
        structuredData: tutorResponse
      };

      setMessages((prev) => [...prev, tutorMsg]);

      // Record any corrections to memory
      if (tutorResponse.corrections && tutorResponse.corrections.length > 0) {
        tutorResponse.corrections.forEach((c) => {
          onRecordMistake(c);
          setSessionCorrections((prev) => [...prev, c]);
        });
        soundService.playCorrect();
      }

      // Record any vocabulary
      if (tutorResponse.vocabulary && tutorResponse.vocabulary.length > 0) {
        setSessionVocabulary((prev) => [...prev, ...tutorResponse.vocabulary]);
      }

      // Auto-speak tutor response
      if (userProfile.autoSpeakTutor) {
        playTutorAudio(tutorResponse.reply);
      }
    } catch (err) {
      console.error('Tutor response failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Request Simpler Explanation
  const handleAskSimpler = (originalCorrection: CorrectionItem) => {
    handleSendMessage(`Could you please explain why "${originalCorrection.original}" is incorrect in simpler terms?`);
  };

  // Request Translation
  const handleRequestTranslation = (text: string) => {
    const lang = userProfile.explanationLanguage === 'hindi' ? 'Hindi (हिंदी)' : userProfile.explanationLanguage;
    handleSendMessage(`Could you please give me the translation and explanation for "${text}" in ${lang}?`);
  };

  // End Session and Generate Summary
  const handleEndSession = () => {
    speechService.stopSpeaking();
    speechService.stopListening();

    const durationSeconds = Math.max(15, Math.round((Date.now() - sessionStartTime) / 1000));
    const userMessageCount = messages.filter((m) => m.sender === 'user').length;
    const xp = Math.min(100, Math.max(25, userMessageCount * 10 + 15));

    const summary: SessionLearningSummary = {
      sessionId: `sess_${Date.now()}`,
      startTime: sessionStartTime,
      endTime: Date.now(),
      durationSeconds,
      messageCount: userMessageCount,
      correctionsGiven: sessionCorrections,
      vocabularyIntroduced: sessionVocabulary,
      strengths: [
        'Great willingness to practice and express ideas spontaneously',
        'Maintained conversational flow and replied promptly to questions'
      ],
      areasToImprove: sessionCorrections.map((c) => `${c.category.toUpperCase()}: ${c.explanation}`),
      xpEarned: xp
    };

    setSummaryData(summary);
    setIsSummaryOpen(true);
    onSessionComplete(summary);
  };

  // Determine current Avatar Mood
  const getAvatarMood = (): AvatarMood => {
    if (isSpeakingTutor) return 'speaking';
    if (micState === 'listening') return 'listening';
    if (isProcessing) return 'thinking';
    return 'idle';
  };

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '20px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - var(--navbar-height))',
        boxSizing: 'border-box'
      }}
    >
      {/* Session Top Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        {/* Tutor Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar mood={getAvatarMood()} size={46} showStatusBadge={true} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>FluentMate AI Teacher</h3>
              <span className="badge badge-mint" style={{ fontSize: '0.68rem' }}>Active</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Adapting to {userProfile.level} • {persona.toUpperCase()} mode
            </span>
          </div>
        </div>

        {/* Personality & Mode Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Persona Picker */}
          <select
            value={persona}
            onChange={(e) => setPersona(e.target.value as TutorPersona)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}
          >
            <option value="patient">🌱 Patient & Gentle</option>
            <option value="encouraging">⚡ Encouraging Coach</option>
            <option value="professional">💼 Professional & Direct</option>
          </select>

          {/* Mode Toggle (Voice vs Text) */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', padding: 3, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setMode('voice')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: mode === 'voice' ? 'var(--primary)' : 'transparent',
                color: mode === 'voice' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Mic size={14} />
              <span>Voice</span>
            </button>
            <button
              onClick={() => setMode('text')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: mode === 'text' ? 'var(--primary)' : 'transparent',
                color: mode === 'text' ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Bot size={14} />
              <span>Text</span>
            </button>
          </div>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.82rem', color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.3)' }}
          >
            <Square size={13} fill="currentColor" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Voice Visualizer Banner when in Voice Mode */}
      {mode === 'voice' && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(30,27,75,0.7) 0%, rgba(49,46,129,0.5) 100%)',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '14px 20px',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={toggleListening}
              className={micState === 'listening' ? 'btn-mint animate-pulse-glow' : 'btn-primary'}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: micState === 'listening' ? '0 0 20px var(--mint)' : 'var(--shadow-glow)'
              }}
              title={micState === 'listening' ? 'Tap to finish speaking' : 'Tap to start speaking'}
            >
              {micState === 'listening' ? <Mic size={22} color="#ffffff" /> : <Mic size={22} />}
            </button>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                {micState === 'listening'
                  ? 'Listening... Speak naturally!'
                  : isSpeakingTutor
                  ? 'Tutor is speaking...'
                  : 'Tap microphone to speak'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {interimTranscript ? `"${interimTranscript}"` : 'Practice sentence by sentence at your own pace'}
              </div>
            </div>
          </div>

          <Waveform
            isActive={micState === 'listening' || isSpeakingTutor}
            color={micState === 'listening' ? 'var(--mint)' : 'var(--primary)'}
            barCount={16}
            height={28}
          />
        </div>
      )}

      {/* Error alert for microphone if any */}
      {micError && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--rose-subtle)',
            border: '1px solid rgba(244,63,94,0.3)',
            color: 'var(--rose)',
            fontSize: '0.84rem',
            marginBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            <span>{micError}</span>
          </div>
          <button onClick={() => setMicError(null)} style={{ color: 'var(--rose)', fontSize: '0.8rem', fontWeight: 600 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          padding: '8px 4px',
          scrollBehavior: 'smooth'
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const structured = msg.structuredData;

          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                gap: 8
              }}
            >
              {/* Message Bubble Container */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: '82%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {isUser ? (
                    <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={18} color="var(--primary-light)" />
                    </div>
                  ) : (
                    <Avatar mood="idle" size={34} />
                  )}
                </div>

                <div
                  style={{
                    backgroundColor: isUser ? 'var(--primary)' : 'var(--bg-card)',
                    color: isUser ? '#ffffff' : 'var(--text-main)',
                    padding: '14px 18px',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: isUser ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.94rem',
                    lineHeight: 1.5
                  }}
                >
                  <p style={{ margin: 0, color: 'inherit' }}>{msg.text}</p>

                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        onClick={() => playTutorAudio(msg.text)}
                        title="Replay Audio"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.74rem',
                          color: 'var(--primary-light)',
                          fontWeight: 600
                        }}
                      >
                        <Volume2 size={14} />
                        <span>Replay</span>
                      </button>

                      <button
                        onClick={() => handleRequestTranslation(msg.text)}
                        title="Explain in Hindi/Chosen language"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: '0.74rem',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <Languages size={13} />
                        <span>Translate</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Dedicated Structured Feedback Card (Requirement 8) */}
              {!isUser && structured && structured.corrections && structured.corrections.length > 0 && (
                <div
                  style={{
                    maxWidth: '82%',
                    marginLeft: 44,
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                        Tutor Correction
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {structured.corrections[0].category.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() => playTutorAudio(structured.corrected_sentence || structured.corrections[0].corrected)}
                      title="Hear correct pronunciation"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        color: 'var(--mint)',
                        fontWeight: 600
                      }}
                    >
                      <Volume2 size={14} />
                      <span>Hear Correct</span>
                    </button>
                  </div>

                  {/* Original vs Corrected */}
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      "{structured.corrections[0].original}"
                    </div>
                    <div style={{ fontSize: '1rem', color: 'var(--mint)', fontWeight: 700, marginTop: 2 }}>
                      ✓ "{structured.corrected_sentence || structured.corrections[0].corrected}"
                    </div>
                  </div>

                  {/* Plain Language Explanation */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                    💡 {structured.corrections[0].explanation}
                  </div>

                  {/* Micro Practice Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => handleSendMessage(`I would like to repeat the corrected sentence: "${structured.corrected_sentence || structured.corrections[0].corrected}"`)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      🗣 Repeat Correct Sentence
                    </button>

                    <button
                      onClick={() => handleAskSimpler(structured.corrections[0])}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <HelpCircle size={13} />
                      <span>Simpler Explanation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dedicated Vocabulary Card if introduced */}
              {!isUser && structured && structured.vocabulary && structured.vocabulary.length > 0 && (
                <div
                  style={{
                    maxWidth: '82%',
                    marginLeft: 44,
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <BookOpen size={16} color="var(--primary-light)" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.9rem' }}>
                          {structured.vocabulary[0].word}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {structured.vocabulary[0].meaning}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontStyle: 'italic', marginTop: 2 }}>
                        "{structured.vocabulary[0].example_sentence}"
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => speechService.speak(structured.vocabulary[0].word)}
                    style={{ color: 'var(--primary-light)', padding: 4 }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}

              {/* Follow-up question bubble */}
              {!isUser && structured && structured.follow_up_question && (
                <div
                  style={{
                    maxWidth: '82%',
                    marginLeft: 44,
                    color: 'var(--primary-light)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <span>💬 Next step:</span>
                  <span>{structured.follow_up_question}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '80%' }}>
            <Avatar mood="thinking" size={32} />
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span>Tutor is formulating personalized feedback...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div style={{ marginTop: 14 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '8px 12px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Quick Mic Trigger */}
          <button
            type="button"
            onClick={toggleListening}
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: micState === 'listening' ? 'var(--mint)' : 'var(--bg-surface)',
              color: micState === 'listening' ? '#ffffff' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.18s ease'
            }}
            title={micState === 'listening' ? 'Stop listening' : 'Start speaking'}
          >
            {micState === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              micState === 'listening'
                ? 'Listening to you speak...'
                : 'Type your message or ask a grammar question...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.94rem',
              outline: 'none',
              padding: '6px 4px'
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="btn-primary"
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* Learning Summary Modal */}
      <SessionSummaryModal
        summary={summaryData}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
};

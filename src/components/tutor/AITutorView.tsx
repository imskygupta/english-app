import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Bot,
  User,
  Square,
  Languages,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Globe,
  Radio,
  SendHorizontal
} from 'lucide-react';
import type { TutorMessage, TutorPersona, CorrectionItem, SessionLearningSummary } from '../../types/tutor';
import type { UserProfile, MistakeRecord } from '../../types/user';
import { Avatar } from '../common/Avatar';
import type { AvatarMood } from '../common/Avatar';
import { Waveform } from '../common/Waveform';
import { speechService } from '../../services/speechService';
import type { MicState } from '../../services/speechService';
import { geminiService } from '../../services/geminiService';
import { soundService } from '../../services/soundService';
import { audioRecorderService } from '../../services/audioRecorderService';
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
  // Mode: 'voice' (default) or 'text'
  const [mode, setMode] = useState<'voice' | 'text'>('voice');
  const [persona, setPersona] = useState<TutorPersona>(userProfile.tutorPersona || 'patient');

  // Input & Messaging
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Speech Recognition & Synthesis states
  const [micState, setMicState] = useState<MicState>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [capturedQueryText, setCapturedQueryText] = useState('');
  const [autoCutNotice, setAutoCutNotice] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeakingTutor, setIsSpeakingTutor] = useState(false);
  const [activeSpeechLang, setActiveSpeechLang] = useState<string>(() => speechService.getLanguage());
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-lite');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(userProfile.voiceSpeed || 0.95);

  // Real-time audio recording & offline volume metering
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [isVoiceDetected, setIsVoiceDetected] = useState<boolean>(false);

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
        ? `Welcome to our practice scenario: "${initialTopic}". Whenever you're ready, tap the microphone to begin speaking!`
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
        follow_up_question: "Tap the large microphone button and start speaking in English!",
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

  // Cleanup on unmount: ensure mic and audio are aborted
  useEffect(() => {
    return () => {
      speechService.abortContinuousListening();
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, interimTranscript, showHistory]);

  // Handle Speech Accent / Language change
  const handleLanguageChange = (newLang: string) => {
    setActiveSpeechLang(newLang);
    speechService.setLanguage(newLang);
    soundService.playClick();
    // Restart recognition with new dialect if active
    if (speechService.getIsContinuousActive()) {
      speechService.abortContinuousListening();
      setTimeout(() => {
        toggleListening();
      }, 200);
    }
  };

  // Play Speech Synthesis
  const playTutorAudio = (text: string) => {
    speechService.stopSpeaking();
    setIsSpeakingTutor(true);
    setMicState('speaking');

    speechService.speak(text, {
      rate: voiceSpeed,
      pitch: userProfile.voicePitch || 1.0,
      onStart: () => {
        setIsSpeakingTutor(true);
        setMicState('speaking');
      },
      onEnd: () => {
        setIsSpeakingTutor(false);
        speechService.setProcessingAi(false);
        setCapturedQueryText('');
        setAutoCutNotice(null);

        // Turn-by-turn behavior:
        if (handsFreeMode && speechService.getIsContinuousActive()) {
          setMicState('listening');
        } else {
          // Default: Cleanly return to idle ("TAP TO SPEAK"), ready for the next turn
          speechService.stopListening();
          setMicState('idle');
        }
      },
      onError: () => {
        setIsSpeakingTutor(false);
        speechService.setProcessingAi(false);
        setCapturedQueryText('');
        setAutoCutNotice(null);

        if (handsFreeMode && speechService.getIsContinuousActive()) {
          setMicState('listening');
        } else {
          speechService.stopListening();
          setMicState('idle');
        }
      }
    });
  };

  // Send Learner Message to Gemini
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputText || capturedQueryText).trim();
    if (!textToSend || isProcessing) return;

    speechService.setProcessingAi(true);
    setInputText('');
    setInterimTranscript('');
    setCapturedQueryText(textToSend);
    setMicState('processing');

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
        apiKey: selectedModel === 'offline_engine' ? 'DISABLED' : userProfile.geminiApiKey,
        preferredModel: selectedModel === 'offline_engine' ? undefined : selectedModel
      });

      const tutorMsg: TutorMessage = {
        id: `msg_t_${Date.now()}`,
        sender: 'tutor',
        timestamp: Date.now(),
        text: tutorResponse.reply,
        structuredData: tutorResponse
      };

      setMessages((prev) => [...prev, tutorMsg]);

      // Record any corrections to memory (and Supabase)
      if (tutorResponse.corrections && tutorResponse.corrections.length > 0) {
        tutorResponse.corrections.forEach((c) => {
          onRecordMistake(c);
          setSessionCorrections((prev) => [...prev, c]);
        });
        soundService.playCorrect();
      }

      // Record any vocabulary (and Supabase)
      if (tutorResponse.vocabulary && tutorResponse.vocabulary.length > 0) {
        setSessionVocabulary((prev) => [...prev, ...tutorResponse.vocabulary]);
      }

      // Auto-speak tutor response aloud
      if (userProfile.autoSpeakTutor) {
        playTutorAudio(tutorResponse.reply);
      } else {
        speechService.setProcessingAi(false);
        setCapturedQueryText('');
        if (handsFreeMode && speechService.getIsContinuousActive()) {
          setMicState('listening');
          setAutoCutNotice(null);
        } else {
          speechService.stopListening();
          setMicState('idle');
        }
      }
    } catch (err) {
      console.error('Tutor response failed:', err);
      speechService.setProcessingAi(false);
      setCapturedQueryText('');
      speechService.stopListening();
      setMicState('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  // Finish offline voice capture, transcribe with multimodal AI, and respond
  const handleFinishRecordingAndSend = async () => {
    if (isProcessing) return;

    soundService.playChime();
    setMicState('processing');
    setAutoCutNotice('Transcribing your voice offline & analyzing...');
    setIsProcessing(true);

    // Stop recorder & speech service
    const recordResult = await audioRecorderService.stopRecording();
    speechService.stopListening();
    setAudioLevel(0);
    setIsVoiceDetected(false);

    const textFromWebSpeech = (capturedQueryText || interimTranscript).trim();

    // If cloud model is active and audio was recorded, transcribe directly via Gemini Multimodal Audio
    if (recordResult && recordResult.base64 && selectedModel !== 'offline_engine') {
      try {
        const audioResult = await geminiService.transcribeAndRespondAudio({
          audioBase64: recordResult.base64,
          mimeType: recordResult.mimeType,
          level: userProfile.level,
          persona,
          conversationHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
          mistakeHistory: mistakes,
          roleplayContext: initialRoleplayContext,
          explanationLanguage: userProfile.explanationLanguage,
          apiKey: userProfile.geminiApiKey,
          preferredModel: selectedModel
        });

        const userTranscript = (audioResult.userTranscript || textFromWebSpeech || 'Spoken English Voice').trim();
        setCapturedQueryText(userTranscript);
        setInterimTranscript('');
        setAutoCutNotice(null);

        const userMsg: TutorMessage = {
          id: `msg_u_${Date.now()}`,
          sender: 'user',
          timestamp: Date.now(),
          text: userTranscript
        };

        const tutorMsg: TutorMessage = {
          id: `msg_t_${Date.now()}`,
          sender: 'tutor',
          timestamp: Date.now(),
          text: audioResult.tutorResponse.reply,
          structuredData: audioResult.tutorResponse
        };

        setMessages((prev) => [...prev, userMsg, tutorMsg]);

        if (audioResult.tutorResponse.corrections && audioResult.tutorResponse.corrections.length > 0) {
          audioResult.tutorResponse.corrections.forEach((c) => {
            onRecordMistake(c);
            setSessionCorrections((prev) => [...prev, c]);
          });
          soundService.playCorrect();
        }

        if (audioResult.tutorResponse.vocabulary && audioResult.tutorResponse.vocabulary.length > 0) {
          setSessionVocabulary((prev) => [...prev, ...audioResult.tutorResponse.vocabulary]);
        }

        if (userProfile.autoSpeakTutor) {
          playTutorAudio(audioResult.tutorResponse.reply);
        } else {
          speechService.setProcessingAi(false);
          setMicState('idle');
        }
      } catch (err) {
        console.warn('Audio transcription error, falling back:', err);
        if (textFromWebSpeech) {
          await handleSendMessage(textFromWebSpeech);
        } else {
          await handleSendMessage('I want to learn English verbs');
        }
      } finally {
        setIsProcessing(false);
      }
    } else if (textFromWebSpeech) {
      setIsProcessing(false);
      await handleSendMessage(textFromWebSpeech);
    } else {
      setIsProcessing(false);
      setMicState('idle');
      setAutoCutNotice(null);
    }
  };

  // Toggle Microphone (Start / Stop with Offline Recording)
  const toggleListening = async () => {
    setMicError(null);

    // 1. If currently processing AI, avoid double submission
    if (isProcessing) return;

    // 2. If tutor is speaking, tap stops playback and resets to idle
    if (isSpeakingTutor || micState === 'speaking') {
      speechService.stopSpeaking();
      setIsSpeakingTutor(false);
      speechService.setProcessingAi(false);
      setMicState('idle');
      soundService.playClick();
      return;
    }

    // 3. If microphone is currently active/listening: Tapping FINISHES recording and sends!
    if (micState === 'listening' || audioRecorderService.getIsRecording() || speechService.getIsListening()) {
      soundService.playClick();
      if (audioRecorderService.getVoiceDetected() || capturedQueryText.trim().length > 0 || interimTranscript.trim().length > 0) {
        await handleFinishRecordingAndSend();
      } else {
        // Canceled before speaking
        audioRecorderService.cancelRecording();
        speechService.stopListening();
        setMicState('idle');
        setInterimTranscript('');
        setCapturedQueryText('');
        setAudioLevel(0);
        setIsVoiceDetected(false);
        setAutoCutNotice(null);
      }
      return;
    }

    // 4. Otherwise: Microphone is idle -> Turn it ON & start offline recording
    soundService.playClick();
    setAutoCutNotice(null);
    setInterimTranscript('');
    setCapturedQueryText('');
    setAudioLevel(0);
    setIsVoiceDetected(false);

    const recorderStarted = await audioRecorderService.startRecording({
      onAudioLevel: (vol) => {
        setAudioLevel(vol);
      },
      onVoiceDetected: () => {
        setIsVoiceDetected(true);
      },
      onSilenceAutoCut: () => {
        handleFinishRecordingAndSend();
      },
      onError: (err) => {
        setMicError(err);
        setMicState('error');
      }
    });

    if (recorderStarted) {
      setMicState('listening');
    }

    // In parallel, also start Web Speech Recognition for live preview captions (if supported)
    if (speechService.isRecognitionSupported()) {
      speechService.startListening(
        {
          onStart: () => {
            setMicState('listening');
          },
          onInterim: (text) => {
            setInterimTranscript(text);
          },
          onAutoCut: () => {
            handleFinishRecordingAndSend();
          },
          onFinal: (text) => {
            setCapturedQueryText(text);
          },
          onError: () => {
            // Web Speech error handled gracefully because offline recorder is active
          },
          onEnd: () => {
            // Managed by recorder
          }
        },
        handsFreeMode
      );
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
    speechService.abortContinuousListening();
    setMicState('idle');

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

  // Get active voice button visual state
  const getVoiceButtonState = (): 'idle' | 'listening' | 'processing' | 'speaking' => {
    if (isProcessing) return 'processing';
    if (isSpeakingTutor) return 'speaking';
    if (micState === 'listening' || speechService.getIsContinuousActive()) return 'listening';
    return 'idle';
  };

  const voiceState = getVoiceButtonState();
  const isContinuousActive = speechService.getIsContinuousActive() || micState === 'listening';

  // Last tutor message for focused voice display
  const lastTutorMsg = [...messages].reverse().find((m) => m.sender === 'tutor');
  const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: '0 auto',
        padding: '16px 20px 28px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - var(--navbar-height))',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Header Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        {/* Tutor Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar mood={getAvatarMood()} size={42} showStatusBadge={true} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>FluentMate AI Teacher</h3>
              <span className="badge badge-mint" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Gemini 2.5 Active
              </span>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              CEFR {userProfile.level} • {persona.toUpperCase()} mode
            </span>
          </div>
        </div>

        {/* Persona, Speech Accent Selector, Mode & End Session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Speech Accent Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, backgroundColor: 'var(--bg-surface)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <Globe size={13} color="var(--primary-light)" />
            <select
              value={activeSpeechLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              title="Recognition Accent / Dialect"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.76rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en-IN">English (India)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </div>

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
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            <option value="patient">🌱 Patient & Gentle</option>
            <option value="encouraging">⚡ Encouraging Coach</option>
            <option value="professional">💼 Professional & Direct</option>
          </select>

          {/* AI Model / Engine Selector */}
          <select
            value={selectedModel}
            onChange={(e) => {
              setSelectedModel(e.target.value);
              soundService.playClick();
            }}
            title="Select AI Model or 0ms Offline Engine"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--primary-light)',
              fontSize: '0.78rem',
              fontWeight: 700
            }}
          >
            <option value="gemini-2.5-flash-lite">⚡ Flash-Lite (Fastest ~1s)</option>
            <option value="gemini-2.5-flash">🌟 2.5 Flash (Balanced)</option>
            <option value="gemini-1.5-pro">🧠 1.5 Pro (Deep)</option>
            <option value="offline_engine">📦 Offline Engine (0ms Instant)</option>
          </select>

          {/* Voice Speed Toggle */}
          <button
            onClick={() => {
              const speeds = [0.85, 0.95, 1.15];
              const nextIndex = (speeds.indexOf(voiceSpeed) + 1) % speeds.length;
              setVoiceSpeed(speeds[nextIndex]);
              soundService.playClick();
            }}
            className="btn-secondary"
            title="Tutor speaking speed"
            style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Volume2 size={13} />
            <span>{voiceSpeed === 0.85 ? '0.85x' : voiceSpeed === 1.15 ? '1.15x' : '0.95x'}</span>
          </button>

          {/* Mode Switcher */}
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
              onClick={() => {
                speechService.abortContinuousListening();
                setMicState('idle');
                setMode('text');
              }}
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

          {/* Turn Mode Toggle: Tap per Turn vs Hands-Free Auto */}
          <button
            onClick={() => {
              const nextMode = !handsFreeMode;
              setHandsFreeMode(nextMode);
              soundService.playClick();
            }}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.78rem',
              backgroundColor: handsFreeMode ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
              borderColor: handsFreeMode ? 'var(--primary)' : 'var(--border-subtle)',
              color: handsFreeMode ? 'var(--lavender)' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            title={handsFreeMode ? 'Continuous hands-free conversation' : 'Tap to start speaking for each turn'}
          >
            <Radio size={13} className={handsFreeMode ? 'animate-pulse' : ''} />
            <span>{handsFreeMode ? 'Hands-Free: ON' : 'Tap per Turn'}</span>
          </button>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.3)' }}
          >
            <Square size={13} fill="currentColor" />
            <span>End Session</span>
          </button>
        </div>
      </div>

      {/* Error alert for microphone if any */}
      {micError && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--rose-subtle)',
            border: '1px solid rgba(244,63,94,0.3)',
            color: 'var(--rose)',
            fontSize: '0.86rem',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertCircle size={18} />
            <span>{micError}</span>
          </div>
          <button onClick={() => setMicError(null)} style={{ color: 'var(--rose)', fontSize: '0.8rem', fontWeight: 700 }}>
            Dismiss
          </button>
        </div>
      )}

      {/* 2. MODE: VOICE MODE (HERO VOICE BUTTON AS ONLY MAIN BUTTON) */}
      {mode === 'voice' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Hero Voice Arena */}
          <div
            className="card voice-hero-container"
            style={{
              background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              padding: '36px 20px',
              textAlign: 'center'
            }}
          >
            {/* Status Badge with Offline Recording and Decibel Indicator */}
            {voiceState === 'listening' && (
              <div style={{ marginBottom: 12 }}>
                {audioLevel > 5 || isVoiceDetected ? (
                  <span
                    className="badge badge-mint"
                    style={{
                      fontSize: '0.8rem',
                      padding: '5px 18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.55)'
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--mint)', display: 'inline-block' }} className="animate-pulse" />
                    <span>🔊 VOICE DETECTED ({audioLevel}%) • RECORDING AUDIO OFFLINE</span>
                  </span>
                ) : (
                  <span
                    className="badge badge-primary"
                    style={{
                      fontSize: '0.76rem',
                      padding: '4px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Radio size={12} className="animate-pulse" />
                    <span>🎙️ MICROPHONE LIVE • SPEAK NATURALLY (OFFLINE CAPTURE ACTIVE)</span>
                  </span>
                )}
              </div>
            )}

            {/* Auto-cut transition notice */}
            {autoCutNotice && (
              <div style={{ marginBottom: 10 }}>
                <span className="badge badge-amber" style={{ fontSize: '0.76rem', padding: '4px 14px' }}>
                  <Sparkles size={13} className="animate-spin" />
                  <span>{autoCutNotice}</span>
                </span>
              </div>
            )}

            {/* Massive Glowing Voice Orb Button */}
            <div className="voice-orb-wrapper">
              {/* Concentric Dynamic Rings when listening */}
              {voiceState === 'listening' && (
                <>
                  <div className="voice-ring voice-ring-1" style={{ '--ring-color': audioLevel > 5 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(99, 102, 241, 0.4)' } as React.CSSProperties} />
                  <div className="voice-ring voice-ring-2" style={{ '--ring-color': audioLevel > 5 ? 'rgba(16, 185, 129, 0.45)' : 'rgba(99, 102, 241, 0.25)' } as React.CSSProperties} />
                  <div className="voice-ring voice-ring-3" style={{ '--ring-color': audioLevel > 5 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(99, 102, 241, 0.15)' } as React.CSSProperties} />
                </>
              )}

              {/* The Large Voice Button (Hero Button) */}
              <button
                className={`large-voice-btn state-${voiceState}`}
                onClick={toggleListening}
                title={
                  isProcessing
                    ? 'Processing your speech with Gemini AI...'
                    : voiceState === 'listening'
                    ? 'Tap to stop recording & transcribe with AI'
                    : voiceState === 'speaking'
                    ? 'Tap to stop audio playback'
                    : 'Tap to start speaking'
                }
                aria-label="Voice Tutor Microphone"
              >
                {voiceState === 'listening' && (
                  <>
                    <Mic size={48} strokeWidth={2.2} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      ON • TAP TO FINISH
                    </span>
                  </>
                )}
                {voiceState === 'processing' && (
                  <>
                    <Sparkles size={46} strokeWidth={2.2} className="animate-spin" />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      TRANSCRIBING...
                    </span>
                  </>
                )}
                {voiceState === 'speaking' && (
                  <>
                    <Volume2 size={48} strokeWidth={2.2} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      SPEAKING • TAP TO STOP
                    </span>
                  </>
                )}
                {voiceState === 'idle' && (
                  <>
                    <Mic size={48} strokeWidth={2.2} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      START SPEAKING
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Finish & Transcribe Pill while speaking */}
            {voiceState === 'listening' && (
              <div style={{ marginTop: 10, marginBottom: 2 }}>
                <button
                  onClick={() => handleFinishRecordingAndSend()}
                  className="btn-primary"
                  style={{
                    padding: '7px 22px',
                    fontSize: '0.82rem',
                    borderRadius: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
                    backgroundColor: 'var(--mint)',
                    color: '#0f172a',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <SendHorizontal size={14} />
                  <span>Done speaking? Stop & Transcribe with AI ➔</span>
                </button>
              </div>
            )}

            {/* Status Headline */}
            <div style={{ marginTop: 6, marginBottom: 8 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                {voiceState === 'listening' && (audioLevel > 5 ? `🎙️ Hearing your voice (${audioLevel}%) • Recording offline` : '🎙️ Listening... Speak naturally in English')}
                {voiceState === 'processing' && '⚡ Transcribing your voice & analyzing with AI...'}
                {voiceState === 'speaking' && '🔊 FluentMate is speaking... (Tap button to interrupt)'}
                {voiceState === 'idle' && '🎙️ Ready! Tap the microphone to start speaking'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: 4 }}>
                {handsFreeMode
                  ? '✨ Hands-free auto mode: Speak freely. Pausing for ~2s auto-cuts & sends. Mic re-arms automatically.'
                  : '✨ Speak freely in English. Pausing for ~2 seconds automatically auto-cuts, transcribes, and responds.'}
              </div>
            </div>

            {/* Live Audio Waveform Reactivity with real decibel volume */}
            <div style={{ margin: '8px 0 12px' }}>
              <Waveform
                isActive={voiceState === 'listening' || voiceState === 'speaking'}
                liveVolume={voiceState === 'listening' ? Math.max(0.08, audioLevel / 100) : 0}
                color={audioLevel > 5 ? 'var(--mint)' : voiceState === 'speaking' ? '#38bdf8' : 'var(--primary)'}
                barCount={24}
                height={34}
              />
            </div>

            {/* Dedicated Real-Time Live Captions Display */}
            <div
              className={`live-transcript-box ${interimTranscript || audioLevel > 5 ? 'is-hearing' : ''}`}
              style={{
                minHeight: 86,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '16px 24px',
                borderWidth: interimTranscript || audioLevel > 5 ? 2 : 1
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
                <span style={{ fontSize: '0.74rem', color: interimTranscript || audioLevel > 5 ? 'var(--mint)' : 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {interimTranscript || audioLevel > 5 ? <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--mint)' }} className="animate-pulse" /> : null}
                  {interimTranscript
                    ? 'LIVE CAPTIONS (HEARING YOUR VOICE)'
                    : voiceState === 'listening' && audioLevel > 5
                    ? `RECORDING VOICE OFFLINE (${audioLevel}% VOLUME)`
                    : voiceState === 'processing'
                    ? 'TRANSCRIBING AUDIO WITH AI...'
                    : voiceState === 'listening'
                    ? 'AWAITING YOUR VOICE...'
                    : 'LAST SPOKEN QUERY'}
                </span>

                {/* Instant "Send Now" button */}
                {voiceState === 'listening' && (
                  <button
                    onClick={() => handleFinishRecordingAndSend()}
                    className="btn-primary"
                    style={{ padding: '3px 10px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <SendHorizontal size={12} />
                    <span>Send & Transcribe</span>
                  </button>
                )}
              </div>

              <div
                style={{
                  fontSize: '1.08rem',
                  color: interimTranscript ? '#ffffff' : voiceState === 'processing' ? 'var(--lavender)' : 'var(--text-muted)',
                  fontWeight: interimTranscript || voiceState === 'processing' ? 600 : 400,
                  lineHeight: 1.5,
                  textAlign: 'center',
                  width: '100%'
                }}
              >
                {interimTranscript ? (
                  <span style={{ color: '#ffffff', textShadow: '0 0 10px rgba(16, 185, 129, 0.4)' }}>
                    "{interimTranscript}"
                  </span>
                ) : voiceState === 'processing' && capturedQueryText ? (
                  <span>"{capturedQueryText}"</span>
                ) : voiceState === 'listening' ? (
                  <span style={{ color: audioLevel > 5 ? 'var(--mint)' : 'var(--text-subtle)', fontStyle: 'italic', fontWeight: audioLevel > 5 ? 600 : 400 }}>
                    {audioLevel > 5
                      ? `🎙️ Recording voice offline (${audioLevel}% sound level)... Speak freely, then tap 'Done speaking' or pause to transcribe!`
                      : '🎙️ Listening... Speak naturally in English (offline audio recording active)'}
                  </span>
                ) : lastUserMsg ? (
                  <span>Last spoken: "{lastUserMsg.text}"</span>
                ) : (
                  'Say something like: "Hello teacher, I visited my friend yesterday and we talked about books."'
                )}
              </div>
            </div>

            {/* Quick Interactive Lesson Starters */}
            <div style={{ marginTop: 12, width: '100%' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, display: 'block', marginBottom: 6 }}>
                🎯 One-Tap Lesson Starters:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {[
                  { label: '🎯 Start Action Verbs Lesson', text: 'I want to learn English verbs' },
                  { label: '⏰ Past Tense Workout', text: 'Teach me past tense verbs like went and saw' },
                  { label: '☕ Ordering at a Cafe', text: "Let's practice ordering coffee and food at a cafe" },
                  { label: '💼 Job Interview Practice', text: "Let's practice a job interview in English" },
                  { label: '💬 Daily Routine Talk', text: "Let's talk about our daily routine" }
                ].map((ls) => (
                  <button
                    key={ls.label}
                    onClick={() => handleSendMessage(ls.text)}
                    className="btn-secondary"
                    style={{
                      padding: '5px 12px',
                      fontSize: '0.76rem',
                      borderRadius: 16,
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      borderColor: 'rgba(99, 102, 241, 0.22)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>{ls.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Latest Tutor Response & Instant Correction Card */}
          {lastTutorMsg && (
            <div className="card" style={{ padding: '20px 24px', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar mood="speaking" size={32} />
                  <span style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                    Teacher's Latest Response
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => playTutorAudio(lastTutorMsg.text)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                    title="Replay Voice"
                  >
                    <Volume2 size={14} />
                    <span>Replay Audio</span>
                  </button>
                  <button
                    onClick={() => handleRequestTranslation(lastTutorMsg.text)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem', gap: 4 }}
                    title="Explain in chosen language"
                  >
                    <Languages size={13} />
                    <span>Translate</span>
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '1rem', lineHeight: 1.55, color: 'var(--text-main)', margin: '0 0 14px' }}>
                {lastTutorMsg.text}
              </p>

              {/* Structured Grammar Feedback Card if error was present */}
              {lastTutorMsg.structuredData?.corrections && lastTutorMsg.structuredData.corrections.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    marginTop: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                        Tutor Correction
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {lastTutorMsg.structuredData.corrections[0].category.toUpperCase()}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        playTutorAudio(
                          lastTutorMsg.structuredData?.corrected_sentence ||
                            lastTutorMsg.structuredData!.corrections[0].corrected
                        )
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.76rem',
                        color: 'var(--mint)',
                        fontWeight: 700
                      }}
                    >
                      <Volume2 size={14} />
                      <span>Hear Correct</span>
                    </button>
                  </div>

                  {/* Original vs Corrected */}
                  <div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      "{lastTutorMsg.structuredData.corrections[0].original}"
                    </div>
                    <div style={{ fontSize: '1.02rem', color: 'var(--mint)', fontWeight: 700, marginTop: 2 }}>
                      ✓ "{lastTutorMsg.structuredData.corrected_sentence || lastTutorMsg.structuredData.corrections[0].corrected}"
                    </div>
                  </div>

                  {/* Explanation */}
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                    💡 {lastTutorMsg.structuredData.corrections[0].explanation}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `I would like to repeat the corrected sentence: "${
                            lastTutorMsg.structuredData?.corrected_sentence ||
                            lastTutorMsg.structuredData!.corrections[0].corrected
                          }"`
                        )
                      }
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      🗣 Repeat Correct Sentence
                    </button>

                    <button
                      onClick={() => handleAskSimpler(lastTutorMsg.structuredData!.corrections[0])}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <HelpCircle size={13} />
                      <span>Simpler Explanation</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Vocabulary if introduced */}
              {lastTutorMsg.structuredData?.vocabulary && lastTutorMsg.structuredData.vocabulary.length > 0 && (
                <div
                  style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 16px',
                    marginTop: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <BookOpen size={16} color="var(--primary-light)" />
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.9rem' }}>
                        {lastTutorMsg.structuredData.vocabulary[0].word}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 8 }}>
                        — {lastTutorMsg.structuredData.vocabulary[0].meaning}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => speechService.speak(lastTutorMsg.structuredData!.vocabulary[0].word)}
                    style={{ color: 'var(--primary-light)', padding: 4 }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              )}

              {/* Follow-up question indicator */}
              {lastTutorMsg.structuredData?.follow_up_question && (
                <div style={{ marginTop: 12, fontSize: '0.86rem', color: 'var(--primary-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>💬 Prompt:</span>
                  <span>{lastTutorMsg.structuredData.follow_up_question}</span>
                </div>
              )}
            </div>
          )}

          {/* 4. Collapsible Conversation History Toggle */}
          <div style={{ textAlign: 'center', margin: '4px 0' }}>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 16px', gap: 6 }}
            >
              {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{showHistory ? 'Hide Conversation History' : `View Full Conversation History (${messages.length} messages)`}</span>
            </button>
          </div>

          {/* Expanded History List */}
          {showHistory && (
            <div
              className="card"
              style={{
                maxHeight: 320,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '16px 20px',
                backgroundColor: 'var(--bg-app)'
              }}
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    maxWidth: '85%',
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  <div style={{ flexShrink: 0 }}>
                    {m.sender === 'user' ? (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={15} color="var(--primary-light)" />
                      </div>
                    ) : (
                      <Avatar mood="idle" size={28} />
                    )}
                  </div>
                  <div
                    style={{
                      backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-card)',
                      color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                      padding: '10px 14px',
                      borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '0.88rem',
                      lineHeight: 1.45,
                      border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)'
                    }}
                  >
                    <p style={{ margin: 0 }}>{m.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}

      {/* 3. MODE: TEXT MODE (Classic Chat with Input Field) */}
      {mode === 'text' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Scrollable Chat Area */}
          <div
            className="card"
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              padding: '20px',
              minHeight: 360,
              maxHeight: 'calc(100vh - 260px)',
              marginBottom: 14
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

                  {/* Structured Feedback Card */}
                  {!isUser && structured && structured.corrections && structured.corrections.length > 0 && (
                    <div
                      style={{
                        maxWidth: '82%',
                        marginLeft: 44,
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                          Tutor Correction • {structured.corrections[0].category.toUpperCase()}
                        </span>
                        <button
                          onClick={() => playTutorAudio(structured.corrected_sentence || structured.corrections[0].corrected)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--mint)', fontWeight: 600 }}
                        >
                          <Volume2 size={14} />
                          <span>Hear Correct</span>
                        </button>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          "{structured.corrections[0].original}"
                        </div>
                        <div style={{ fontSize: '0.98rem', color: 'var(--mint)', fontWeight: 700, marginTop: 2 }}>
                          ✓ "{structured.corrected_sentence || structured.corrections[0].corrected}"
                        </div>
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                        💡 {structured.corrections[0].explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '80%' }}>
                <Avatar mood="thinking" size={32} />
                <div
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem'
                  }}
                >
                  <span>Tutor is formulating personalized feedback...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
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
              padding: '8px 14px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
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

            <input
              type="text"
              placeholder="Type your message or grammar query here..."
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
      )}

      {/* Learning Summary Modal */}
      <SessionSummaryModal
        summary={summaryData}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
      />
    </div>
  );
};

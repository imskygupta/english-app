// Web Speech Service - Clean, Natural Speech Capture, Auto-Cut & Robust Turn Management

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
      isFinal: boolean;
      length: number;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export type MicState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error' | 'unsupported' | 'denied';

export interface SpeechCallbacks {
  onStart?: () => void;
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  onAutoCut?: (finalTranscript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

class SpeechService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private isContinuousMode = false;
  private isAbortedByUser = true;
  private isSpeakingAudio = false;
  private isProcessingAi = false;
  private currentTranscript = '';
  private selectedLanguage = 'en-US';

  // Natural silence auto-cut timer (~1.8 seconds of silence auto-cuts and sends)
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;

  private activeCallbacks: SpeechCallbacks = {};

  constructor() {
    this.detectPreferredLanguage();
  }

  private detectPreferredLanguage() {
    if (typeof window === 'undefined') return;
    const navLang = navigator.language || 'en-US';
    if (navLang.toLowerCase().includes('in')) {
      this.selectedLanguage = 'en-IN';
    } else {
      this.selectedLanguage = 'en-US';
    }
  }

  public setLanguage(lang: string) {
    this.selectedLanguage = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public getLanguage(): string {
    return this.selectedLanguage;
  }

  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  /**
   * Stops internal recognition instance cleanly and detaches listeners
   */
  private stopInternalRecognition() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
    if (this.recognition) {
      try {
        this.recognition.onstart = null;
        this.recognition.onresult = null;
        this.recognition.onerror = null;
        this.recognition.onend = null;
        this.recognition.stop();
        this.recognition.abort();
      } catch {
        // Ignore abort errors
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Instantiates a clean, fresh SpeechRecognition instance without microphone contention
   */
  private createRecognition(): SpeechRecognitionInstance | null {
    const RecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionConstructor) return null;

    try {
      const rec = new RecognitionConstructor();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = this.selectedLanguage;

      rec.onstart = () => {
        this.isListening = true;
        this.activeCallbacks.onStart?.();
      };

      rec.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' ';
          } else {
            interimChunk += res[0].transcript;
          }
        }

        const combined = (finalChunk + interimChunk).trim();

        if (combined.length > 0) {
          this.currentTranscript = combined;
          this.activeCallbacks.onInterim?.(combined);
          // Restart silence timer on each new speech chunk
          this.resetSilenceTimer();
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEventLike) => {
        // When speech paused or stopped
        if (event.error === 'no-speech') {
          if (this.currentTranscript.trim().length > 0) {
            this.triggerAutoCut();
            return;
          }
          if (this.isContinuousMode && !this.isAbortedByUser && !this.isSpeakingAudio && !this.isProcessingAi) {
            this.scheduleRestart();
            return;
          }
        } else if (event.error === 'not-allowed') {
          this.isContinuousMode = false;
          this.isAbortedByUser = true;
          this.isListening = false;
          this.activeCallbacks.onError?.('Microphone permission was denied. Please allow microphone access in your browser.');
          return;
        }

        // If other error occurred but user spoke words, auto-cut
        if (this.currentTranscript.trim().length > 0) {
          this.triggerAutoCut();
        } else if (this.isContinuousMode && !this.isAbortedByUser && !this.isSpeakingAudio && !this.isProcessingAi) {
          this.scheduleRestart();
        }
      };

      rec.onend = () => {
        this.isListening = false;

        // If user finished speech and Chrome closed recognition, send to AI
        if (this.currentTranscript.trim().length > 0 && !this.isProcessingAi) {
          this.triggerAutoCut();
          return;
        }

        this.activeCallbacks.onEnd?.();

        // If continuous mode active and no speech was finalized, keep listening
        if (this.isContinuousMode && !this.isAbortedByUser && !this.isSpeakingAudio && !this.isProcessingAi) {
          this.scheduleRestart();
        }
      };

      return rec;
    } catch (err) {
      console.warn('Failed creating SpeechRecognition instance:', err);
      return null;
    }
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    // Auto-cut after ~1.9s of natural pause
    this.silenceTimer = setTimeout(() => {
      if (this.currentTranscript.trim().length > 0 && !this.isProcessingAi) {
        this.triggerAutoCut();
      }
    }, 1900);
  }

  /**
   * Finalizes captured speech, stops recognition, and sends to AI
   */
  public triggerAutoCut(): string | null {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    const textToSend = this.currentTranscript.trim();
    if (!textToSend || this.isProcessingAi) return null;

    this.isProcessingAi = true;
    this.isListening = false;

    // Immediately stop recognition so microphone is released while AI processes
    this.stopInternalRecognition();

    // Reset accumulated transcript for next turn
    this.currentTranscript = '';

    // Notify listeners
    this.activeCallbacks.onAutoCut?.(textToSend);
    this.activeCallbacks.onFinal?.(textToSend);

    return textToSend;
  }

  private scheduleRestart() {
    if (!this.isContinuousMode || this.isAbortedByUser || this.isSpeakingAudio || this.isProcessingAi) {
      return;
    }
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
    }
    this.restartTimer = setTimeout(() => {
      if (this.isContinuousMode && !this.isAbortedByUser && !this.isSpeakingAudio && !this.isProcessingAi && !this.isListening) {
        this.performStart();
      }
    }, 200);
  }

  private performStart(): boolean {
    if (!this.isRecognitionSupported()) return false;

    this.stopInternalRecognition();
    this.recognition = this.createRecognition();
    if (!this.recognition) return false;

    try {
      this.currentTranscript = '';
      this.recognition.start();
      return true;
    } catch (err: unknown) {
      console.warn('Speech recognition start note:', err);
      return false;
    }
  }

  /**
   * Starts single-turn or continuous listening
   */
  public startListening(callbacks: SpeechCallbacks, continuous: boolean = false): boolean {
    if (!this.isRecognitionSupported()) {
      callbacks.onError?.('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    this.isContinuousMode = continuous;
    this.isAbortedByUser = false;
    this.isProcessingAi = false;
    this.isSpeakingAudio = false;
    this.currentTranscript = '';
    this.activeCallbacks = callbacks;

    return this.performStart();
  }

  public startContinuousListening(callbacks: SpeechCallbacks): boolean {
    return this.startListening(callbacks, true);
  }

  /**
   * User explicitly turns OFF / aborts the microphone
   */
  public stopListening() {
    this.isContinuousMode = false;
    this.isAbortedByUser = true;
    this.isProcessingAi = false;
    this.isSpeakingAudio = false;
    this.currentTranscript = '';

    this.stopInternalRecognition();
    this.stopSpeaking();

    this.activeCallbacks.onEnd?.();
  }

  public abortContinuousListening() {
    this.stopListening();
  }

  /**
   * Temporarily pauses mic while AI processes or speaks, then resets
   */
  public setProcessingAi(processing: boolean) {
    this.isProcessingAi = processing;
    if (processing) {
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
      this.stopInternalRecognition();
    } else {
      this.currentTranscript = '';
      if (this.isContinuousMode && !this.isAbortedByUser && !this.isSpeakingAudio) {
        this.scheduleRestart();
      }
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsContinuousActive(): boolean {
    return this.isContinuousMode && !this.isAbortedByUser;
  }

  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  public speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!this.isSynthesisSupported()) {
      this.isProcessingAi = false;
      this.isSpeakingAudio = false;
      options?.onError?.();
      return;
    }

    this.stopSpeaking();
    this.isSpeakingAudio = true;
    this.stopInternalRecognition();

    const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
    if (!cleanText) {
      this.isSpeakingAudio = false;
      this.isProcessingAi = false;
      if (this.isContinuousMode && !this.isAbortedByUser) {
        this.scheduleRestart();
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate || 0.95;
    utterance.pitch = options?.pitch || 1.0;
    utterance.lang = options?.lang || 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen'))
      ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeakingAudio = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeakingAudio = false;
      this.isProcessingAi = false; // Guaranteed reset
      options?.onEnd?.();

      if (this.isContinuousMode && !this.isAbortedByUser) {
        this.scheduleRestart();
      }
    };

    utterance.onerror = () => {
      this.isSpeakingAudio = false;
      this.isProcessingAi = false; // Guaranteed reset
      options?.onError?.();

      if (this.isContinuousMode && !this.isAbortedByUser) {
        this.scheduleRestart();
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    this.isSpeakingAudio = false;
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  public isSpeaking(): boolean {
    if (!this.isSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
  }
}

export const speechService = new SpeechService();

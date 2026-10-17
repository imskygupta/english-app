// Type definitions for Web Speech API
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

export type MicState = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported' | 'denied';

class SpeechService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private currentTranscript = '';

  constructor() {
    this.initRecognition();
  }

  // Feature detection
  public isRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  private initRecognition() {
    if (!this.isRecognitionSupported()) return;

    try {
      const RecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (RecognitionConstructor) {
        this.recognition = new RecognitionConstructor();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
      }
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
    }
  }

  public startListening(callbacks: {
    onStart?: () => void;
    onInterim?: (transcript: string) => void;
    onFinal?: (transcript: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }): boolean {
    if (!this.isRecognitionSupported() || !this.recognition) {
      callbacks.onError?.('Speech recognition is not supported in your browser. Please type your message.');
      return false;
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.currentTranscript = '';

    this.recognition.onstart = () => {
      this.isListening = true;
      callbacks.onStart?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (interim) {
        callbacks.onInterim?.(interim);
      }
      if (final) {
        this.currentTranscript = final.trim();
        callbacks.onFinal?.(this.currentTranscript);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      this.isListening = false;
      let errorMsg = 'Could not capture audio.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech was detected. Please try speaking again.';
      } else if (event.error === 'audio-capture') {
        errorMsg = 'No microphone was found on your system.';
      }
      callbacks.onError?.(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      callbacks.onError?.('Failed to start speech recognition.');
      console.warn('Speech recognition start failed:', err);
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
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
      options?.onError?.();
      return;
    }

    this.stopSpeaking();

    // Clean markdown or bracket artifacts from text
    const cleanText = text.replace(/[*_#`~[\]]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = options?.rate || 0.95; // Slightly measured for English learners
    utterance.pitch = options?.pitch || 1.0;
    utterance.lang = options?.lang || 'en-US';

    // Try to pick a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Karen'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = () => {
      options?.onError?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
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

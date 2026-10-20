// Audio Recorder Service - Captures raw microphone audio locally in browser memory
// Provides real-time volume analysis (0-100%), silence detection, and base64 export

export interface AudioRecordResult {
  blob: Blob;
  base64: string;
  mimeType: string;
  durationMs: number;
}

export interface AudioRecorderCallbacks {
  onAudioLevel?: (volume: number) => void; // 0 to 100
  onVoiceDetected?: () => void;
  onSilenceAutoCut?: () => void;
  onError?: (error: string) => void;
}

class AudioRecorderService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  private recordedChunks: Blob[] = [];
  private startTime = 0;
  private isRecordingActive = false;
  private voiceDetected = false;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private mimeType = 'audio/webm';

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window.MediaRecorder !== 'undefined'
    );
  }

  public getIsRecording(): boolean {
    return this.isRecordingActive;
  }

  public getVoiceDetected(): boolean {
    return this.voiceDetected;
  }

  /**
   * Starts capturing voice directly from microphone into local memory
   */
  public async startRecording(callbacks: AudioRecorderCallbacks): Promise<boolean> {
    if (!this.isSupported()) {
      callbacks.onError?.('Audio recording is not supported in this browser.');
      return false;
    }

    try {
      // Clean up any lingering session
      this.cleanup();

      // Request microphone with echo cancellation and auto gain
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      this.mediaStream = stream;

      // Select optimal supported MIME type
      const possibleTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];
      this.mimeType = possibleTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';

      const recorderOptions: MediaRecorderOptions = this.mimeType ? { mimeType: this.mimeType } : {};
      this.mediaRecorder = new MediaRecorder(stream, recorderOptions);
      this.recordedChunks = [];
      this.startTime = Date.now();
      this.voiceDetected = false;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Set up AudioContext + AnalyserNode for live volume metering
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.4;
        source.connect(this.analyser);

        this.startVolumeMonitoring(callbacks);
      }

      // Record in 100ms chunks to ensure continuous data flow
      this.mediaRecorder.start(100);
      this.isRecordingActive = true;
      return true;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn('Failed to start audio recording:', errorMsg);
      if (errorMsg.includes('Permission') || errorMsg.includes('denied') || errorMsg.includes('NotAllowedError')) {
        callbacks.onError?.('Microphone permission was denied. Please allow microphone access in browser settings.');
      } else {
        callbacks.onError?.(`Could not access microphone: ${errorMsg}`);
      }
      this.cleanup();
      return false;
    }
  }

  /**
   * Live decibel / RMS volume monitor (0 to 100)
   */
  private startVolumeMonitoring(callbacks: AudioRecorderCallbacks) {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const checkVolume = () => {
      if (!this.isRecordingActive || !this.analyser) return;

      this.analyser.getByteTimeDomainData(dataArray);

      // Compute RMS amplitude
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      // Map to 0-100 scale
      const volume = Math.min(100, Math.round(rms * 280));

      callbacks.onAudioLevel?.(volume);

      // Detect speech activation (threshold ~6%)
      if (volume >= 6) {
        if (!this.voiceDetected) {
          this.voiceDetected = true;
          callbacks.onVoiceDetected?.();
        }

        // Reset silence auto-cut countdown
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
      } else if (this.voiceDetected) {
        // Voice was previously detected, but volume is now quiet: start silence timer (~1.9s)
        if (!this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            if (this.isRecordingActive && this.voiceDetected) {
              callbacks.onSilenceAutoCut?.();
            }
          }, 1900);
        }
      }

      this.animationFrameId = requestAnimationFrame(checkVolume);
    };

    this.animationFrameId = requestAnimationFrame(checkVolume);
  }

  /**
   * Stops recording and returns the raw audio Blob and base64 string
   */
  public async stopRecording(): Promise<AudioRecordResult | null> {
    if (!this.isRecordingActive || !this.mediaRecorder) {
      this.cleanup();
      return null;
    }

    const durationMs = Math.max(0, Date.now() - this.startTime);
    this.isRecordingActive = false;

    return new Promise((resolve) => {
      if (!this.mediaRecorder) {
        this.cleanup();
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const actualMime = this.recordedChunks[0]?.type || this.mimeType || 'audio/webm';
          const blob = new Blob(this.recordedChunks, { type: actualMime });

          // Convert to base64
          const base64 = await this.blobToBase64(blob);

          this.cleanup();
          resolve({
            blob,
            base64,
            mimeType: actualMime,
            durationMs
          });
        } catch (err) {
          console.warn('Error packaging audio recording:', err);
          this.cleanup();
          resolve(null);
        }
      };

      try {
        if (this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
      } catch {
        this.cleanup();
        resolve(null);
      }
    });
  }

  /**
   * Cancel and discard recording without packaging
   */
  public cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // Ignore
      }
    }
    this.cleanup();
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data:audio/xxx;base64, prefix
        const commaIndex = result.indexOf(',');
        if (commaIndex !== -1) {
          resolve(result.slice(commaIndex + 1));
        } else {
          resolve(result);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private cleanup(): void {
    this.isRecordingActive = false;
    this.voiceDetected = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {
        // Ignore
      }
      this.audioContext = null;
      this.analyser = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore
        }
      });
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
  }
}

export const audioRecorderService = new AudioRecorderService();

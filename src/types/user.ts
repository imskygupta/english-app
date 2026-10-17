import type { CEFRLevel } from './learning';
export type { CEFRLevel };
import type { TutorPersona } from './tutor';

export type LearningGoal =
  | 'daily_conversation'
  | 'job_interviews'
  | 'workplace_english'
  | 'travel'
  | 'exams'
  | 'general_fluency';

export type DailyTimeTarget = 5 | 10 | 15 | 20;

export type SpeakingConfidence = 'shy' | 'somewhat_hesitant' | 'moderate' | 'confident';

export type ExplanationLanguage = 'english' | 'hindi' | 'spanish' | 'french' | 'german';

export interface UserProfile {
  name: string;
  level: CEFRLevel;
  goal: LearningGoal;
  explanationLanguage: ExplanationLanguage;
  dailyMinutesTarget: DailyTimeTarget;
  confidence: SpeakingConfidence;
  tutorPersona: TutorPersona;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalXP: number;
  gems: number;
  completedChapters: string[]; // Chapter IDs
  voiceSpeed: number; // 0.7 to 1.2
  voicePitch: number; // 0.8 to 1.2
  autoSpeakTutor: boolean;
  geminiApiKey?: string;
  theme: 'dark' | 'light';
  onboardingCompleted: boolean;
}

export interface MistakeRecord {
  id: string;
  category: 'grammar' | 'tense' | 'articles' | 'prepositions' | 'word_order' | 'vocabulary';
  originalPhrase: string;
  correctedPhrase: string;
  explanation: string;
  occurrences: number;
  lastOccurred: number; // timestamp
  practicedCount: number;
  isImproved: boolean;
  recommendedTopic: string;
}

export interface SpacedVocabCard {
  id: string;
  word: string;
  partOfSpeech: string;
  meaning: string;
  hindiMeaning?: string;
  exampleSentence: string;
  difficulty: 'easy' | 'good' | 'hard';
  repetitions: number;
  intervalDays: number;
  nextReviewDate: number; // timestamp
  lastReviewedDate?: number;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  minutesSpent: number;
  xpEarned: number;
  lessonsDone: number;
  speakingSeconds: number;
}

export interface ProgressStats {
  lessonsCompletedCount: number;
  totalQuizzesTaken: number;
  quizAccuracyPercentage: number;
  speakingDurationSeconds: number;
  weeklyActivity: DailyActivity[];
  vocabularyMasteredCount: number;
  mistakesCountByCategory: Record<string, number>;
  completedRoleplayIds: string[];
}

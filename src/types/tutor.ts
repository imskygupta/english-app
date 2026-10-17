import type { CEFRLevel } from './learning';

export type TutorPersona = 'patient' | 'encouraging' | 'professional';

export interface CorrectionItem {
  original: string;
  corrected: string;
  explanation: string;
  category: 'grammar' | 'tense' | 'articles' | 'prepositions' | 'word_order' | 'vocabulary' | 'pronunciation_tip';
  priority: 'high' | 'medium' | 'low';
}

export interface TutorVocabularyItem {
  word: string;
  meaning: string;
  example_sentence: string;
}

export interface StructuredTutorResponse {
  reply: string;
  corrected_sentence: string | null;
  corrections: CorrectionItem[];
  vocabulary: TutorVocabularyItem[];
  follow_up_question: string;
  suggested_practice: string[];
  session_level: CEFRLevel;
  encouragement?: string;
  translated_explanation?: string;
}

export interface TutorMessage {
  id: string;
  sender: 'user' | 'tutor';
  timestamp: number;
  text: string;
  structuredData?: StructuredTutorResponse;
  audioSpoken?: boolean;
}

export interface RoleplayScenario {
  id: string;
  title: string;
  category: 'daily' | 'work' | 'social' | 'travel';
  level: CEFRLevel;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  goal: string;
  tutorRole: string;
  userRole: string;
  initialPrompt: string;
  contextDescription: string;
  suggestedPhrases: string[];
}

export interface SessionLearningSummary {
  sessionId: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  messageCount: number;
  correctionsGiven: CorrectionItem[];
  vocabularyIntroduced: TutorVocabularyItem[];
  strengths: string[];
  areasToImprove: string[];
  xpEarned: number;
}

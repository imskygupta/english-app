export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export type QuestionType =
  | 'mcq'
  | 'fill_blank'
  | 'sentence_correction'
  | 'word_order'
  | 'match_pairs'
  | 'listening'
  | 'reading_comprehension'
  | 'translation'
  | 'situational';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  contextText?: string;       // Reading passage or conversation background
  audioText?: string;         // For listening questions: text read aloud via TTS
  options?: string[];         // For MCQ, situational, etc.
  correctAnswer: string | string[]; // Single string or ordered array of strings
  wordBank?: string[];        // For word ordering or fill-in exercises
  pairs?: { left: string; right: string }[]; // For match_pairs
  explanation: string;
  hint?: string;
  category: 'grammar' | 'tense' | 'articles' | 'prepositions' | 'word_order' | 'vocabulary' | 'speaking';
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  meaning: string;
  hindiMeaning?: string;
  exampleSentence: string;
  translation?: string;
}

export interface PracticalExample {
  title: string;
  english: string;
  translation?: string;
  explanation: string;
}

export interface LessonChapter {
  id: string;
  unitId: string;
  level: CEFRLevel;
  title: string;
  shortDescription: string;
  iconName: string;
  xpReward: number;
  durationMinutes: number;
  explanation: string;
  keyRules: string[];
  examples: PracticalExample[];
  vocabulary: VocabularyWord[];
  assessmentQuestions: QuizQuestion[];
}

export interface CurriculumUnit {
  id: string;
  level: CEFRLevel;
  unitNumber: number;
  title: string;
  description: string;
  color: string;
  chapters: LessonChapter[];
}

export interface LevelCurriculum {
  level: CEFRLevel;
  levelName: string;
  tagline: string;
  description: string;
  units: CurriculumUnit[];
}

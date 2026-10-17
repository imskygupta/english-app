import type { UserProfile, MistakeRecord, SpacedVocabCard, ProgressStats, DailyActivity } from '../types/user';
import type { CorrectionItem } from '../types/tutor';
import { INITIAL_VOCABULARY } from '../data/seedVocabulary';

const PROFILE_KEY = 'fluentmate_user_profile';
const MISTAKES_KEY = 'fluentmate_mistakes_memory';
const VOCAB_KEY = 'fluentmate_spaced_vocab';
const STATS_KEY = 'fluentmate_progress_stats';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Learner',
  level: 'A1',
  goal: 'daily_conversation',
  explanationLanguage: 'hindi',
  dailyMinutesTarget: 15,
  confidence: 'somewhat_hesitant',
  tutorPersona: 'patient',
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalXP: 140,
  gems: 45,
  completedChapters: ['ch_a1_greetings'],
  voiceSpeed: 0.95,
  voicePitch: 1.0,
  autoSpeakTutor: true,
  theme: 'dark',
  onboardingCompleted: true
};

const DEFAULT_MISTAKES: MistakeRecord[] = [
  {
    id: 'm_1',
    category: 'tense',
    originalPhrase: 'Yesterday I go to office',
    correctedPhrase: 'Yesterday I went to the office',
    explanation: 'Use past tense "went" for events that happened yesterday.',
    occurrences: 2,
    lastOccurred: Date.now() - 86400000,
    practicedCount: 1,
    isImproved: false,
    recommendedTopic: 'Past Simple Tense'
  },
  {
    id: 'm_2',
    category: 'articles',
    originalPhrase: 'She wants to buy an car',
    correctedPhrase: 'She wants to buy a car',
    explanation: '"Car" starts with a consonant sound /k/, so use "a".',
    occurrences: 1,
    lastOccurred: Date.now() - 172800000,
    practicedCount: 2,
    isImproved: true,
    recommendedTopic: 'Articles (A, An, The)'
  }
];

function generateWeeklyActivity(): DailyActivity[] {
  const days: DailyActivity[] = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Give realistic active values for the past few days
    const isPastActive = i <= 2;
    days.push({
      date: dateStr,
      minutesSpent: isPastActive ? Math.floor(10 + Math.random() * 12) : (i === 4 ? 14 : 0),
      xpEarned: isPastActive ? Math.floor(30 + Math.random() * 40) : (i === 4 ? 40 : 0),
      lessonsDone: isPastActive ? 1 : 0,
      speakingSeconds: isPastActive ? Math.floor(120 + Math.random() * 180) : 0
    });
  }
  return days;
}

const DEFAULT_STATS: ProgressStats = {
  lessonsCompletedCount: 1,
  totalQuizzesTaken: 3,
  quizAccuracyPercentage: 88,
  speakingDurationSeconds: 420,
  weeklyActivity: generateWeeklyActivity(),
  vocabularyMasteredCount: 12,
  mistakesCountByCategory: {
    tense: 3,
    articles: 2,
    prepositions: 1,
    grammar: 2,
    word_order: 1,
    vocabulary: 1
  },
  completedRoleplayIds: ['rp_intro']
};

class StorageService {
  // User Profile
  getUserProfile(): UserProfile {
    try {
      const data = localStorage.getItem(PROFILE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading profile from localStorage', e);
    }
    return DEFAULT_PROFILE;
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed saving profile to localStorage', e);
    }
  }

  // Mistakes Memory System
  getMistakes(): MistakeRecord[] {
    try {
      const data = localStorage.getItem(MISTAKES_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading mistakes from localStorage', e);
    }
    return DEFAULT_MISTAKES;
  }

  saveMistakes(mistakes: MistakeRecord[]): void {
    try {
      localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
    } catch (e) {
      console.warn('Failed saving mistakes to localStorage', e);
    }
  }

  recordMistake(correction: CorrectionItem): void {
    const mistakes = this.getMistakes();
    const existingIndex = mistakes.findIndex(
      (m) => m.originalPhrase.toLowerCase() === correction.original.toLowerCase() ||
             m.correctedPhrase.toLowerCase() === correction.corrected.toLowerCase()
    );

    if (existingIndex >= 0) {
      const existing = mistakes[existingIndex];
      existing.occurrences += 1;
      existing.lastOccurred = Date.now();
      existing.isImproved = false;
      mistakes[existingIndex] = existing;
    } else {
      const newMistake: MistakeRecord = {
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        category: (correction.category === 'pronunciation_tip' ? 'grammar' : correction.category) as MistakeRecord['category'],
        originalPhrase: correction.original,
        correctedPhrase: correction.corrected,
        explanation: correction.explanation,
        occurrences: 1,
        lastOccurred: Date.now(),
        practicedCount: 0,
        isImproved: false,
        recommendedTopic: `${correction.category.toUpperCase()} Review`
      };
      mistakes.unshift(newMistake);
    }

    this.saveMistakes(mistakes);

    // Also update stats category
    const stats = this.getProgressStats();
    stats.mistakesCountByCategory[correction.category] = (stats.mistakesCountByCategory[correction.category] || 0) + 1;
    this.saveProgressStats(stats);
  }

  markMistakePracticed(mistakeId: string, resolved: boolean): void {
    const mistakes = this.getMistakes();
    const item = mistakes.find((m) => m.id === mistakeId);
    if (item) {
      item.practicedCount += 1;
      if (resolved) {
        item.isImproved = true;
      }
      this.saveMistakes(mistakes);
    }
  }

  // Spaced Repetition Vocabulary
  getVocabulary(): SpacedVocabCard[] {
    try {
      const data = localStorage.getItem(VOCAB_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading vocab from localStorage', e);
    }
    return INITIAL_VOCABULARY;
  }

  saveVocabulary(vocab: SpacedVocabCard[]): void {
    try {
      localStorage.setItem(VOCAB_KEY, JSON.stringify(vocab));
    } catch (e) {
      console.warn('Failed saving vocab to localStorage', e);
    }
  }

  updateVocabRating(vocabId: string, rating: 'easy' | 'good' | 'hard'): void {
    const vocab = this.getVocabulary();
    const item = vocab.find((v) => v.id === vocabId);
    if (!item) return;

    item.difficulty = rating;
    item.lastReviewedDate = Date.now();

    const oneDay = 24 * 60 * 60 * 1000;
    if (rating === 'easy') {
      item.repetitions += 1;
      item.intervalDays = Math.max(3, item.intervalDays * 2);
      item.nextReviewDate = Date.now() + item.intervalDays * oneDay;
    } else if (rating === 'good') {
      item.repetitions += 1;
      item.intervalDays = Math.max(1, Math.round(item.intervalDays * 1.5));
      item.nextReviewDate = Date.now() + item.intervalDays * oneDay;
    } else {
      item.repetitions = 0;
      item.intervalDays = 1;
      item.nextReviewDate = Date.now() + 12 * 60 * 60 * 1000; // review in 12 hours
    }

    this.saveVocabulary(vocab);
  }

  // Progress Stats
  getProgressStats(): ProgressStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading stats from localStorage', e);
    }
    return DEFAULT_STATS;
  }

  saveProgressStats(stats: ProgressStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed saving stats to localStorage', e);
    }
  }

  addXP(amount: number): UserProfile {
    const profile = this.getUserProfile();
    profile.totalXP += amount;
    profile.gems += Math.floor(amount / 10);
    this.saveUserProfile(profile);

    // Update today's weekly activity
    const stats = this.getProgressStats();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayActivity = stats.weeklyActivity.find((a) => a.date === todayStr);
    if (todayActivity) {
      todayActivity.xpEarned += amount;
      todayActivity.minutesSpent += 2;
    } else {
      stats.weeklyActivity.push({
        date: todayStr,
        minutesSpent: 2,
        xpEarned: amount,
        lessonsDone: 0,
        speakingSeconds: 0
      });
      if (stats.weeklyActivity.length > 7) {
        stats.weeklyActivity.shift();
      }
    }
    this.saveProgressStats(stats);

    return profile;
  }

  recordSpeakingSeconds(seconds: number): void {
    const stats = this.getProgressStats();
    stats.speakingDurationSeconds += seconds;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayActivity = stats.weeklyActivity.find((a) => a.date === todayStr);
    if (todayActivity) {
      todayActivity.speakingSeconds += seconds;
      todayActivity.minutesSpent += Math.round(seconds / 60);
    }
    this.saveProgressStats(stats);
  }

  completeChapter(chapterId: string, xpEarned: number): UserProfile {
    const profile = this.getUserProfile();
    if (!profile.completedChapters.includes(chapterId)) {
      profile.completedChapters.push(chapterId);
    }
    profile.totalXP += xpEarned;
    this.saveUserProfile(profile);

    const stats = this.getProgressStats();
    stats.lessonsCompletedCount = profile.completedChapters.length;
    this.saveProgressStats(stats);

    return profile;
  }

  // Reset entire learning progress
  resetAllProgress(): void {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(MISTAKES_KEY);
    localStorage.removeItem(VOCAB_KEY);
    localStorage.removeItem(STATS_KEY);
  }
}

export const storageService = new StorageService();

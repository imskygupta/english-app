import type { UserProfile, MistakeRecord, SpacedVocabCard, ProgressStats, DailyActivity } from '../types/user';
import type { CorrectionItem } from '../types/tutor';
import { INITIAL_VOCABULARY } from '../data/seedVocabulary';
import { supabaseService } from './supabaseService';
import { authService } from './authService';

export const DEFAULT_GEMINI_API_KEY = 'AIzaSyDYpWF4Vjv3_2BPI_SSGnmsPf51leyS_0c';

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
  geminiApiKey: DEFAULT_GEMINI_API_KEY,
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
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
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
  private getUid(uid?: string): string {
    return (uid || authService.getActiveUserId() || 'default_user').toLowerCase().trim();
  }

  private getKey(prefix: string, uid?: string): string {
    return `fluentmate_${this.getUid(uid)}_${prefix}`;
  }

  // User Profile
  getUserProfile(uid?: string): UserProfile {
    const activeUid = this.getUid(uid);
    supabaseService.setUserId(activeUid);

    try {
      const data = localStorage.getItem(this.getKey('profile', activeUid)) || localStorage.getItem('fluentmate_user_profile');
      const activeAccount = authService.getActiveUser();

      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          name: activeAccount?.name || parsed.name || DEFAULT_PROFILE.name,
          geminiApiKey: parsed.geminiApiKey || DEFAULT_GEMINI_API_KEY
        };
      } else if (activeAccount) {
        return {
          ...DEFAULT_PROFILE,
          name: activeAccount.name
        };
      }
    } catch (e) {
      console.warn('Failed reading profile from localStorage', e);
    }
    return DEFAULT_PROFILE;
  }

  saveUserProfile(profile: UserProfile, uid?: string): void {
    const activeUid = this.getUid(uid);
    try {
      localStorage.setItem(this.getKey('profile', activeUid), JSON.stringify(profile));
      supabaseService.syncProfile(profile, activeUid).catch((e) => console.debug('Supabase sync note:', e));
    } catch (e) {
      console.warn('Failed saving profile to localStorage', e);
    }
  }

  // Mistakes Memory System
  getMistakes(uid?: string): MistakeRecord[] {
    const activeUid = this.getUid(uid);
    try {
      const data = localStorage.getItem(this.getKey('mistakes', activeUid)) || localStorage.getItem('fluentmate_mistakes_memory');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading mistakes from localStorage', e);
    }
    return DEFAULT_MISTAKES;
  }

  saveMistakes(mistakes: MistakeRecord[], uid?: string): void {
    const activeUid = this.getUid(uid);
    try {
      localStorage.setItem(this.getKey('mistakes', activeUid), JSON.stringify(mistakes));
    } catch (e) {
      console.warn('Failed saving mistakes to localStorage', e);
    }
  }

  recordMistake(correction: CorrectionItem, uid?: string): void {
    const activeUid = this.getUid(uid);
    const mistakes = this.getMistakes(activeUid);
    const existingIndex = mistakes.findIndex(
      (m) =>
        m.originalPhrase.toLowerCase() === correction.original.toLowerCase() ||
        m.correctedPhrase.toLowerCase() === correction.corrected.toLowerCase()
    );

    let targetMistake: MistakeRecord;

    if (existingIndex >= 0) {
      const existing = mistakes[existingIndex];
      existing.occurrences += 1;
      existing.lastOccurred = Date.now();
      existing.isImproved = false;
      mistakes[existingIndex] = existing;
      targetMistake = existing;
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
      targetMistake = newMistake;
    }

    this.saveMistakes(mistakes, activeUid);
    supabaseService.syncSingleMistake(targetMistake, activeUid).catch(() => {});

    // Also update stats category
    const stats = this.getProgressStats(activeUid);
    stats.mistakesCountByCategory[correction.category] = (stats.mistakesCountByCategory[correction.category] || 0) + 1;
    this.saveProgressStats(stats, activeUid);
  }

  markMistakePracticed(mistakeId: string, resolved: boolean, uid?: string): void {
    const activeUid = this.getUid(uid);
    const mistakes = this.getMistakes(activeUid);
    const item = mistakes.find((m) => m.id === mistakeId);
    if (item) {
      item.practicedCount += 1;
      if (resolved) {
        item.isImproved = true;
      }
      this.saveMistakes(mistakes, activeUid);
      supabaseService.syncSingleMistake(item, activeUid).catch(() => {});
    }
  }

  // Spaced Repetition Vocabulary
  getVocabulary(uid?: string): SpacedVocabCard[] {
    const activeUid = this.getUid(uid);
    try {
      const data = localStorage.getItem(this.getKey('vocab', activeUid)) || localStorage.getItem('fluentmate_spaced_vocab');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading vocab from localStorage', e);
    }
    return INITIAL_VOCABULARY;
  }

  saveVocabulary(vocab: SpacedVocabCard[], uid?: string): void {
    const activeUid = this.getUid(uid);
    try {
      localStorage.setItem(this.getKey('vocab', activeUid), JSON.stringify(vocab));
    } catch (e) {
      console.warn('Failed saving vocab to localStorage', e);
    }
  }

  addVocabCards(cards: SpacedVocabCard[], uid?: string): void {
    const activeUid = this.getUid(uid);
    const current = this.getVocabulary(activeUid);
    const existingWords = new Set(current.map((c) => c.word.toLowerCase()));

    const uniqueNew = cards.filter((c) => !existingWords.has(c.word.toLowerCase()));
    const updated = [...uniqueNew, ...current];

    this.saveVocabulary(updated, activeUid);

    for (const card of uniqueNew) {
      supabaseService.syncSingleVocab(card, activeUid).catch(() => {});
    }
  }

  updateVocabRating(vocabId: string, rating: 'easy' | 'good' | 'hard', uid?: string): void {
    const activeUid = this.getUid(uid);
    const vocab = this.getVocabulary(activeUid);
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

    this.saveVocabulary(vocab, activeUid);
    supabaseService.syncSingleVocab(item, activeUid).catch(() => {});
  }

  // Progress Stats
  getProgressStats(uid?: string): ProgressStats {
    const activeUid = this.getUid(uid);
    try {
      const data = localStorage.getItem(this.getKey('stats', activeUid)) || localStorage.getItem('fluentmate_progress_stats');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading stats from localStorage', e);
    }
    return DEFAULT_STATS;
  }

  saveProgressStats(stats: ProgressStats, uid?: string): void {
    const activeUid = this.getUid(uid);
    try {
      localStorage.setItem(this.getKey('stats', activeUid), JSON.stringify(stats));
      supabaseService.syncStats(stats, activeUid).catch(() => {});
    } catch (e) {
      console.warn('Failed saving stats to localStorage', e);
    }
  }

  addXP(amount: number, uid?: string): UserProfile {
    const activeUid = this.getUid(uid);
    const profile = this.getUserProfile(activeUid);
    profile.totalXP += amount;
    profile.gems += Math.floor(amount / 10);
    this.saveUserProfile(profile, activeUid);

    // Update today's weekly activity
    const stats = this.getProgressStats(activeUid);
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
    this.saveProgressStats(stats, activeUid);

    return profile;
  }

  recordSpeakingSeconds(seconds: number, uid?: string): void {
    const activeUid = this.getUid(uid);
    const stats = this.getProgressStats(activeUid);
    stats.speakingDurationSeconds += seconds;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayActivity = stats.weeklyActivity.find((a) => a.date === todayStr);
    if (todayActivity) {
      todayActivity.speakingSeconds += seconds;
      todayActivity.minutesSpent += Math.round(seconds / 60);
    }
    this.saveProgressStats(stats, activeUid);
  }

  completeChapter(chapterId: string, xpEarned: number, uid?: string): UserProfile {
    const activeUid = this.getUid(uid);
    const profile = this.getUserProfile(activeUid);
    if (!profile.completedChapters.includes(chapterId)) {
      profile.completedChapters.push(chapterId);
    }
    profile.totalXP += xpEarned;
    this.saveUserProfile(profile, activeUid);

    const stats = this.getProgressStats(activeUid);
    stats.lessonsCompletedCount = profile.completedChapters.length;
    this.saveProgressStats(stats, activeUid);

    return profile;
  }

  // Reset progress for this user
  resetAllProgress(uid?: string): void {
    const activeUid = this.getUid(uid);
    localStorage.removeItem(this.getKey('profile', activeUid));
    localStorage.removeItem(this.getKey('mistakes', activeUid));
    localStorage.removeItem(this.getKey('vocab', activeUid));
    localStorage.removeItem(this.getKey('stats', activeUid));
  }

  // Initialize and check Supabase cloud sync
  async initCloudSync(uid?: string): Promise<{ synced: boolean; message: string }> {
    const activeUid = this.getUid(uid);
    supabaseService.setUserId(activeUid);

    try {
      const status = await supabaseService.checkConnection();
      if (!status.connected || !status.tablesFound) {
        return { synced: false, message: status.message };
      }

      // Check if remote profile exists
      const cloudProfile = await supabaseService.fetchProfile(activeUid);
      if (cloudProfile) {
        localStorage.setItem(this.getKey('profile', activeUid), JSON.stringify(cloudProfile));
      } else {
        // Push local profile to cloud
        await supabaseService.syncProfile(this.getUserProfile(activeUid), activeUid);
      }

      // Check remote mistakes
      const cloudMistakes = await supabaseService.fetchMistakes(activeUid);
      if (cloudMistakes && cloudMistakes.length > 0) {
        localStorage.setItem(this.getKey('mistakes', activeUid), JSON.stringify(cloudMistakes));
      }

      // Check remote vocabulary
      const cloudVocab = await supabaseService.fetchVocabulary(activeUid);
      if (cloudVocab && cloudVocab.length > 0) {
        localStorage.setItem(this.getKey('vocab', activeUid), JSON.stringify(cloudVocab));
      }

      return { synced: true, message: `Cloud sync active for @${activeUid}!` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Cloud sync error';
      return { synced: false, message: msg };
    }
  }

  // Explicit full manual sync
  async syncAllToCloud(uid?: string): Promise<{ success: boolean; message: string }> {
    const activeUid = this.getUid(uid);
    try {
      const profile = this.getUserProfile(activeUid);
      const mistakes = this.getMistakes(activeUid);
      const vocab = this.getVocabulary(activeUid);
      const stats = this.getProgressStats(activeUid);

      await supabaseService.syncProfile(profile, activeUid);

      for (const m of mistakes.slice(0, 25)) {
        await supabaseService.syncSingleMistake(m, activeUid);
      }

      for (const v of vocab.slice(0, 25)) {
        await supabaseService.syncSingleVocab(v, activeUid);
      }

      await supabaseService.syncStats(stats, activeUid);

      return { success: true, message: `All progress for @${activeUid} successfully synced to Supabase!` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sync failed';
      return { success: false, message: msg };
    }
  }
}

export const storageService = new StorageService();

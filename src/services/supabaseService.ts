import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile, MistakeRecord, SpacedVocabCard, ProgressStats } from '../types/user';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vmtjhfoiuxrsclxkxwjc.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XqD1lUllDKFWBBcTReuJjw__UVEhxZo';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private currentUserId: string = 'default_user';

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        this.client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        });
      }
    } catch (e) {
      console.warn('Supabase initialization notice:', e);
      this.client = null;
    }
  }

  public setUserId(id: string) {
    if (id && id.trim()) {
      this.currentUserId = id.toLowerCase().trim();
    }
  }

  public getUserId(): string {
    return this.currentUserId;
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public getUrl(): string {
    return SUPABASE_URL;
  }

  /**
   * Health check to see if Supabase REST endpoint and tables are reachable
   */
  public async checkConnection(): Promise<{ connected: boolean; tablesFound: boolean; message: string }> {
    if (!this.client) {
      return { connected: false, tablesFound: false, message: 'Supabase client not initialized' };
    }

    try {
      const { data, error } = await this.client.from('profiles').select('id').limit(1);
      if (error) {
        if (error.code === 'PGRST205' || error.message.includes('schema cache')) {
          return {
            connected: true,
            tablesFound: false,
            message: 'Connected to Supabase! Tables need to be initialized via schema.sql in SQL Editor.'
          };
        }
        return { connected: false, tablesFound: false, message: error.message };
      }

      return {
        connected: true,
        tablesFound: true,
        message: 'Connected to Supabase! Cloud sync active.'
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Connection failed';
      return { connected: false, tablesFound: false, message: msg };
    }
  }

  // Profile Sync
  public async fetchProfile(userId?: string): Promise<UserProfile | null> {
    if (!this.client) return null;
    const uid = userId || this.currentUserId;
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error || !data) return null;

      return {
        name: data.name || 'Learner',
        level: data.level || 'A1',
        goal: data.goal || 'daily_conversation',
        explanationLanguage: data.explanation_language || 'hindi',
        dailyMinutesTarget: data.daily_minutes_target || 15,
        confidence: data.confidence || 'somewhat_hesitant',
        tutorPersona: data.tutor_persona || 'patient',
        streakDays: data.streak_days || 1,
        lastActiveDate: data.last_active_date || new Date().toISOString().split('T')[0],
        totalXP: data.total_xp || 100,
        gems: data.gems || 30,
        completedChapters: Array.isArray(data.completed_chapters) ? data.completed_chapters : ['ch_a1_greetings'],
        voiceSpeed: Number(data.voice_speed) || 0.95,
        voicePitch: Number(data.voice_pitch) || 1.0,
        autoSpeakTutor: data.auto_speak_tutor ?? true,
        theme: data.theme || 'dark',
        onboardingCompleted: true
      };
    } catch (e) {
      console.warn('Supabase fetchProfile note:', e);
      return null;
    }
  }

  public async syncProfile(profile: UserProfile, userId?: string): Promise<boolean> {
    if (!this.client) return false;
    const uid = userId || this.currentUserId;
    try {
      const { error } = await this.client.from('profiles').upsert({
        id: uid,
        name: profile.name,
        level: profile.level,
        goal: profile.goal,
        explanation_language: profile.explanationLanguage,
        daily_minutes_target: profile.dailyMinutesTarget,
        confidence: profile.confidence,
        tutor_persona: profile.tutorPersona,
        streak_days: profile.streakDays,
        last_active_date: profile.lastActiveDate,
        total_xp: profile.totalXP,
        gems: profile.gems,
        completed_chapters: profile.completedChapters,
        voice_speed: profile.voiceSpeed,
        voice_pitch: profile.voicePitch,
        auto_speak_tutor: profile.autoSpeakTutor,
        theme: profile.theme,
        updated_at: new Date().toISOString()
      });

      return !error;
    } catch (e) {
      console.warn('Supabase syncProfile note:', e);
      return false;
    }
  }

  // Mistakes Sync
  public async fetchMistakes(userId?: string): Promise<MistakeRecord[] | null> {
    if (!this.client) return null;
    const uid = userId || this.currentUserId;
    try {
      const { data, error } = await this.client
        .from('mistakes')
        .select('*')
        .eq('user_id', uid)
        .order('last_occurred', { ascending: false });

      if (error || !data || data.length === 0) return null;

      return data.map((d) => ({
        id: d.id,
        category: d.category,
        originalPhrase: d.original_phrase,
        correctedPhrase: d.corrected_phrase,
        explanation: d.explanation,
        occurrences: d.occurrences || 1,
        lastOccurred: Number(d.last_occurred) || Date.now(),
        practicedCount: d.practiced_count || 0,
        isImproved: !!d.is_improved,
        recommendedTopic: d.recommended_topic || 'Grammar Review'
      }));
    } catch (e) {
      console.warn('Supabase fetchMistakes note:', e);
      return null;
    }
  }

  public async syncSingleMistake(m: MistakeRecord, userId?: string): Promise<boolean> {
    if (!this.client) return false;
    const uid = userId || this.currentUserId;
    try {
      const { error } = await this.client.from('mistakes').upsert({
        id: m.id,
        user_id: uid,
        category: m.category,
        original_phrase: m.originalPhrase,
        corrected_phrase: m.correctedPhrase,
        explanation: m.explanation,
        occurrences: m.occurrences,
        last_occurred: m.lastOccurred,
        practiced_count: m.practicedCount,
        is_improved: m.isImproved,
        recommended_topic: m.recommendedTopic,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch (e) {
      console.warn('Supabase syncSingleMistake note:', e);
      return false;
    }
  }

  // Vocabulary Sync
  public async fetchVocabulary(userId?: string): Promise<SpacedVocabCard[] | null> {
    if (!this.client) return null;
    const uid = userId || this.currentUserId;
    try {
      const { data, error } = await this.client
        .from('vocabulary')
        .select('*')
        .eq('user_id', uid);

      if (error || !data || data.length === 0) return null;

      return data.map((d) => ({
        id: d.id,
        word: d.word,
        meaning: d.meaning,
        partOfSpeech: d.part_of_speech || 'noun',
        exampleSentence: d.example_sentence || '',
        difficulty: (d.difficulty as 'easy' | 'good' | 'hard') || 'good',
        intervalDays: d.interval_days || 1,
        nextReviewDate: Number(d.next_review_date) || Date.now(),
        repetitions: d.repetitions || 0,
        tags: []
      }));
    } catch (e) {
      console.warn('Supabase fetchVocabulary note:', e);
      return null;
    }
  }

  public async syncSingleVocab(v: SpacedVocabCard, userId?: string): Promise<boolean> {
    if (!this.client) return false;
    const uid = userId || this.currentUserId;
    try {
      const { error } = await this.client.from('vocabulary').upsert({
        id: v.id,
        user_id: uid,
        word: v.word,
        meaning: v.meaning,
        part_of_speech: v.partOfSpeech,
        example_sentence: v.exampleSentence,
        difficulty: v.difficulty,
        interval_days: v.intervalDays,
        next_review_date: v.nextReviewDate,
        repetitions: v.repetitions,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch (e) {
      console.warn('Supabase syncSingleVocab note:', e);
      return false;
    }
  }

  // Learning Stats Sync
  public async fetchStats(userId?: string): Promise<ProgressStats | null> {
    if (!this.client) return null;
    const uid = userId || this.currentUserId;
    try {
      const { data, error } = await this.client
        .from('learning_stats')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error || !data) return null;

      return {
        lessonsCompletedCount: data.lessons_completed_count || 0,
        totalQuizzesTaken: data.total_quizzes_taken || 0,
        quizAccuracyPercentage: data.quiz_accuracy_percentage || 0,
        speakingDurationSeconds: data.speaking_duration_seconds || 0,
        weeklyActivity: Array.isArray(data.weekly_activity) ? data.weekly_activity : [],
        vocabularyMasteredCount: 12,
        mistakesCountByCategory: data.mistakes_count_by_category || {},
        completedRoleplayIds: Array.isArray(data.completed_roleplay_ids) ? data.completed_roleplay_ids : []
      };
    } catch (e) {
      console.warn('Supabase fetchStats note:', e);
      return null;
    }
  }

  public async syncStats(stats: ProgressStats, userId?: string): Promise<boolean> {
    if (!this.client) return false;
    const uid = userId || this.currentUserId;
    try {
      const { error } = await this.client.from('learning_stats').upsert({
        id: uid,
        user_id: uid,
        lessons_completed_count: stats.lessonsCompletedCount,
        total_quizzes_taken: stats.totalQuizzesTaken,
        quiz_accuracy_percentage: stats.quizAccuracyPercentage,
        speaking_duration_seconds: stats.speakingDurationSeconds,
        weekly_activity: stats.weeklyActivity,
        mistakes_count_by_category: stats.mistakesCountByCategory,
        completed_roleplay_ids: stats.completedRoleplayIds,
        updated_at: new Date().toISOString()
      });
      return !error;
    } catch (e) {
      console.warn('Supabase syncStats note:', e);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();

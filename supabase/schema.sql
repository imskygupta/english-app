-- FluentMate Supabase Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/vmtjhfoiuxrsclxkxwjc/sql/new

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT DEFAULT 'Learner',
  level TEXT DEFAULT 'A1',
  goal TEXT DEFAULT 'daily_conversation',
  explanation_language TEXT DEFAULT 'hindi',
  daily_minutes_target INTEGER DEFAULT 15,
  confidence TEXT DEFAULT 'somewhat_hesitant',
  tutor_persona TEXT DEFAULT 'patient',
  streak_days INTEGER DEFAULT 1,
  last_active_date TEXT,
  total_xp INTEGER DEFAULT 100,
  gems INTEGER DEFAULT 30,
  completed_chapters JSONB DEFAULT '[]'::jsonb,
  voice_speed NUMERIC DEFAULT 0.95,
  voice_pitch NUMERIC DEFAULT 1.0,
  auto_speak_tutor BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Mistakes Memory Table
CREATE TABLE IF NOT EXISTS public.mistakes (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default_user',
  category TEXT NOT NULL,
  original_phrase TEXT NOT NULL,
  corrected_phrase TEXT NOT NULL,
  explanation TEXT,
  occurrences INTEGER DEFAULT 1,
  last_occurred BIGINT,
  practiced_count INTEGER DEFAULT 0,
  is_improved BOOLEAN DEFAULT false,
  recommended_topic TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Spaced Repetition Vocabulary Table
CREATE TABLE IF NOT EXISTS public.vocabulary (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default_user',
  word TEXT NOT NULL,
  meaning TEXT NOT NULL,
  part_of_speech TEXT,
  example_sentence TEXT,
  difficulty TEXT DEFAULT 'good',
  interval_days INTEGER DEFAULT 1,
  next_review_date BIGINT,
  repetitions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Learning Stats & Analytics Table
CREATE TABLE IF NOT EXISTS public.learning_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default_user',
  lessons_completed_count INTEGER DEFAULT 0,
  total_quizzes_taken INTEGER DEFAULT 0,
  quiz_accuracy_percentage INTEGER DEFAULT 0,
  speaking_duration_seconds INTEGER DEFAULT 0,
  weekly_activity JSONB DEFAULT '[]'::jsonb,
  mistakes_count_by_category JSONB DEFAULT '{}'::jsonb,
  completed_roleplay_ids JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. Row Level Security (RLS) - Permissive for Client-Side Access with Anon Key
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_stats ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon Full Access (Read/Insert/Update/Delete) for instant frontend sync
DROP POLICY IF EXISTS "Public access for profiles" ON public.profiles;
CREATE POLICY "Public access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for mistakes" ON public.mistakes;
CREATE POLICY "Public access for mistakes" ON public.mistakes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for vocabulary" ON public.vocabulary;
CREATE POLICY "Public access for vocabulary" ON public.vocabulary FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for learning_stats" ON public.learning_stats;
CREATE POLICY "Public access for learning_stats" ON public.learning_stats FOR ALL USING (true) WITH CHECK (true);

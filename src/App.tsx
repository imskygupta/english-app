import React, { useState, useEffect } from 'react';
import type { UserProfile, ProgressStats, MistakeRecord, SpacedVocabCard } from './types/user';
import type { LessonChapter, QuizQuestion } from './types/learning';
import type { RoleplayScenario, CorrectionItem, SessionLearningSummary } from './types/tutor';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { CURRICULUM_DATA } from './data/curriculumData';

import { Sidebar } from './components/common/Sidebar';
import type { NavigationTab } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { MobileNav } from './components/common/MobileNav';

import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { LearnPath } from './components/learn/LearnPath';
import { ChapterModal } from './components/learn/ChapterModal';
import { AITutorView } from './components/tutor/AITutorView';
import { RoleplayHub } from './components/tutor/RoleplayHub';
import { ProgressView } from './components/progress/ProgressView';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { VocabReviewModal } from './components/vocabulary/VocabReviewModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AuthModal } from './components/auth/AuthModal';
import { authService, type UserAccount } from './services/authService';
import { AIFlashcardGenerator } from './components/vocabulary/AIFlashcardGenerator';

export const App: React.FC = () => {
  // Authentication Gate State - No deadlocks, simple gate
  const [activeAccount, setActiveAccount] = useState<UserAccount | null>(() => authService.getActiveUser());
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(() => !authService.getActiveUser());

  // Global User Profile & Preferences (keyed to active user)
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getUserProfile());
  const [progressStats, setProgressStats] = useState<ProgressStats>(() => storageService.getProgressStats());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => storageService.getMistakes());
  const [vocabulary, setVocabulary] = useState<SpacedVocabCard[]>(() => storageService.getVocabulary());

  // Active Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  // Modals & Sub-screens
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [selectedChapter, setSelectedChapter] = useState<LessonChapter | null>(null);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active Tutor context parameters (e.g. from Roleplay or Mistake Review)
  const [tutorTopic, setTutorTopic] = useState<string | undefined>(undefined);
  const [tutorRoleplayContext, setTutorRoleplayContext] = useState<string | undefined>(undefined);

  // Sync theme attribute to HTML element on load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', userProfile.theme || 'dark');
  }, [userProfile.theme]);

  // Check and initialize Supabase cloud sync on mount for active user
  useEffect(() => {
    storageService.initCloudSync(activeAccount?.userId).then((res) => {
      if (res.synced) {
        setUserProfile(storageService.getUserProfile());
        setMistakes(storageService.getMistakes());
        setVocabulary(storageService.getVocabulary());
        setProgressStats(storageService.getProgressStats());
      }
    });
  }, [activeAccount?.userId]);

  // Handle successful login or registration
  const handleAuthenticated = (account: UserAccount) => {
    setActiveAccount(account);
    setIsAuthOpen(false);

    // Refresh state from active user's local and cloud storage
    setUserProfile(storageService.getUserProfile());
    setProgressStats(storageService.getProgressStats());
    setMistakes(storageService.getMistakes());
    setVocabulary(storageService.getVocabulary());

    // Trigger cloud sync for this specific user ID
    storageService.initCloudSync(account.userId).then((res) => {
      if (res.synced) {
        setUserProfile(storageService.getUserProfile());
        setMistakes(storageService.getMistakes());
        setVocabulary(storageService.getVocabulary());
        setProgressStats(storageService.getProgressStats());
      }
    });

    if (soundEnabled) soundService.playCorrect();
  };

  // Add AI-generated flashcards to user vocabulary deck
  const handleAddVocabCards = (newCards: SpacedVocabCard[]) => {
    storageService.addVocabCards(newCards);
    setVocabulary(storageService.getVocabulary());
    setProgressStats(storageService.getProgressStats());
    if (soundEnabled) soundService.playCorrect();
  };

  // Handlers for profile updates
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    storageService.saveUserProfile(updated);
  };

  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...userProfile,
      ...data,
      onboardingCompleted: true
    };
    handleUpdateProfile(updated);
    setIsOnboardingOpen(false);
    if (soundEnabled) soundService.playFanfare();
  };

  // Launch AI speaking tutor
  const handleStartSpeaking = () => {
    setTutorTopic(undefined);
    setTutorRoleplayContext(undefined);
    setCurrentTab('tutor');
  };

  // Open Chapter Lesson Modal
  const handleOpenChapterById = (chapterId: string) => {
    for (const level of CURRICULUM_DATA) {
      for (const unit of level.units) {
        const found = unit.chapters.find((ch) => ch.id === chapterId);
        if (found) {
          setSelectedChapter(found);
          setIsChapterModalOpen(true);
          return;
        }
      }
    }
  };

  const handleOpenChapterDirect = (chapter: LessonChapter) => {
    setSelectedChapter(chapter);
    setIsChapterModalOpen(true);
  };

  const handleChapterCompleted = (chapterId: string, xp: number) => {
    const updatedProfile = storageService.completeChapter(chapterId, xp);
    setUserProfile({ ...updatedProfile });
    setProgressStats(storageService.getProgressStats());
    if (soundEnabled) soundService.playFanfare();
  };

  // Record mistake from quiz
  const handleRecordMistakeFromQuiz = (question: QuizQuestion) => {
    const correction: CorrectionItem = {
      original: `Error in: ${question.prompt.slice(0, 35)}...`,
      corrected: Array.isArray(question.correctAnswer) ? question.correctAnswer.join(' ') : question.correctAnswer,
      explanation: question.explanation,
      category: question.category === 'speaking' ? 'grammar' : question.category,
      priority: 'high'
    };
    storageService.recordMistake(correction);
    setMistakes(storageService.getMistakes());
    setProgressStats(storageService.getProgressStats());
  };

  // Record mistake from live AI Tutor
  const handleRecordMistakeFromTutor = (correction: CorrectionItem) => {
    storageService.recordMistake(correction);
    setMistakes(storageService.getMistakes());
    setProgressStats(storageService.getProgressStats());
  };

  // Practice specific mistake with AI tutor
  const handlePracticeMistakeWithTutor = (mistake: MistakeRecord) => {
    setTutorTopic(`Practicing ${mistake.category.toUpperCase()}: "${mistake.correctedPhrase}"`);
    setTutorRoleplayContext(`Focus specifically on helping the learner practice and master the correction: "${mistake.correctedPhrase}". Original error: "${mistake.originalPhrase}".`);
    setCurrentTab('tutor');
  };

  const handleMarkMistakePracticed = (mistakeId: string, resolved: boolean) => {
    storageService.markMistakePracticed(mistakeId, resolved);
    setMistakes(storageService.getMistakes());
  };

  // Start specific roleplay scenario
  const handleStartScenario = (scenario: RoleplayScenario) => {
    setTutorTopic(scenario.title);
    setTutorRoleplayContext(`${scenario.tutorRole} in this situation: "${scenario.contextDescription}". The learner's role is: "${scenario.userRole}". Initial greeting was: "${scenario.initialPrompt}".`);
    setCurrentTab('tutor');
  };

  // Spaced repetition review rating
  const handleRateVocabCard = (cardId: string, rating: 'easy' | 'good' | 'hard') => {
    storageService.updateVocabRating(cardId, rating);
    setVocabulary(storageService.getVocabulary());
  };

  // Handle Tutor Session complete
  const handleSessionComplete = (summary: SessionLearningSummary) => {
    storageService.recordSpeakingSeconds(summary.durationSeconds);
    const updatedProfile = storageService.addXP(summary.xpEarned);
    setUserProfile({ ...updatedProfile });
    setProgressStats(storageService.getProgressStats());
    if (soundEnabled) soundService.playFanfare();
  };

  // Reset entire progress
  const handleResetProgress = () => {
    storageService.resetAllProgress();
    setUserProfile(storageService.getUserProfile());
    setProgressStats(storageService.getProgressStats());
    setMistakes(storageService.getMistakes());
    setVocabulary(storageService.getVocabulary());
    setIsOnboardingOpen(true);
    setCurrentTab('home');
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* 1. Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userProfile={userProfile}
        onStartSpeaking={handleStartSpeaking}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 2. Main Application Flow Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: 72 }}>
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          onOpenSettings={() => setCurrentTab('profile')}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Tab Content Display */}
        <main style={{ flex: 1 }}>
          {currentTab === 'home' && (
            <HomeDashboard
              userProfile={userProfile}
              progressStats={progressStats}
              mistakes={mistakes}
              vocabulary={vocabulary}
              onNavigate={setCurrentTab}
              onOpenLesson={handleOpenChapterById}
              onOpenMistakeReview={() => setCurrentTab('progress')}
              onOpenVocabReview={() => setIsVocabModalOpen(true)}
              onStartSpeaking={handleStartSpeaking}
            />
          )}

          {currentTab === 'learn' && (
            <LearnPath
              userProfile={userProfile}
              onOpenChapter={handleOpenChapterDirect}
              onSelectLevel={(lvl) => handleUpdateProfile({ ...userProfile, level: lvl })}
            />
          )}

          {currentTab === 'tutor' && (
            <AITutorView
              userProfile={userProfile}
              mistakes={mistakes}
              onRecordMistake={handleRecordMistakeFromTutor}
              onSessionComplete={handleSessionComplete}
              initialTopic={tutorTopic}
              initialRoleplayContext={tutorRoleplayContext}
            />
          )}

          {currentTab === 'flashcards' && (
            <AIFlashcardGenerator
              userProfile={userProfile}
              onAddCards={handleAddVocabCards}
              onStartReview={() => setIsVocabModalOpen(true)}
            />
          )}

          {currentTab === 'roleplays' && (
            <RoleplayHub
              onStartScenario={handleStartScenario}
              progressStats={progressStats}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              userProfile={userProfile}
              progressStats={progressStats}
              mistakes={mistakes}
              vocabulary={vocabulary}
              onOpenVocabReview={() => setIsVocabModalOpen(true)}
              onPracticeMistake={handlePracticeMistakeWithTutor}
              onMarkMistakePracticed={handleMarkMistakePracticed}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileSettings
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
              onResetProgress={handleResetProgress}
            />
          )}
        </main>
      </div>

      {/* 3. Mobile Navigation Bottom Bar */}
      <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* 4. Modals & Drawers */}
      {/* Chapter Lesson Modal */}
      <ChapterModal
        chapter={selectedChapter}
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        userProfile={userProfile}
        onChapterCompleted={handleChapterCompleted}
        onRecordMistakeFromQuiz={handleRecordMistakeFromQuiz}
      />

      {/* Spaced Repetition Vocabulary Review Modal */}
      <VocabReviewModal
        vocabulary={vocabulary}
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        onRateCard={handleRateVocabCard}
      />

      {/* First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      {/* Frictionless Auth Gate (Register & Login) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
        allowClose={!!activeAccount}
      />
    </div>
  );
};

export default App;

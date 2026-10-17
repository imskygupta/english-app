import type { SpacedVocabCard } from '../types/user';

const now = Date.now();
const oneDayMs = 24 * 60 * 60 * 1000;

export const INITIAL_VOCABULARY: SpacedVocabCard[] = [
  {
    id: 'sv_1',
    word: 'Colleague',
    partOfSpeech: 'noun',
    meaning: 'A person with whom one works in a profession or business',
    hindiMeaning: 'सहकर्मी',
    exampleSentence: 'I discussed the project proposal with my colleague.',
    difficulty: 'good',
    repetitions: 1,
    intervalDays: 1,
    nextReviewDate: now - 3600000 // Due for review today!
  },
  {
    id: 'sv_2',
    word: 'Punctual',
    partOfSpeech: 'adjective',
    meaning: 'Doing something at the agreed or proper time; on time',
    hindiMeaning: 'समय का पाबंद',
    exampleSentence: 'Being punctual shows respect for everyone’s schedule.',
    difficulty: 'hard',
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: now - 7200000 // Due for review!
  },
  {
    id: 'sv_3',
    word: 'Accomplish',
    partOfSpeech: 'verb',
    meaning: 'To achieve or complete something successfully',
    hindiMeaning: 'सफलतापूर्वक पूरा करना',
    exampleSentence: 'You can accomplish your fluency goals with 15 minutes of daily practice.',
    difficulty: 'good',
    repetitions: 2,
    intervalDays: 3,
    nextReviewDate: now - 1800000 // Due for review!
  },
  {
    id: 'sv_4',
    word: 'Affordable',
    partOfSpeech: 'adjective',
    meaning: 'Inexpensive and within one’s financial means',
    hindiMeaning: 'किफायती',
    exampleSentence: 'They offer high-quality products at affordable prices.',
    difficulty: 'easy',
    repetitions: 3,
    intervalDays: 5,
    nextReviewDate: now + (2 * oneDayMs)
  },
  {
    id: 'sv_5',
    word: 'Perspective',
    partOfSpeech: 'noun',
    meaning: 'A particular attitude toward or way of regarding something',
    hindiMeaning: 'दृष्टिकोण / नज़रिया',
    exampleSentence: 'Listening to differing perspectives enriches any discussion.',
    difficulty: 'good',
    repetitions: 1,
    intervalDays: 2,
    nextReviewDate: now + (1 * oneDayMs)
  },
  {
    id: 'sv_6',
    word: 'Compelling',
    partOfSpeech: 'adjective',
    meaning: 'Evoking interest, attention, or admiration in a powerful way',
    hindiMeaning: 'प्रभावशाली / सम्मोहक',
    exampleSentence: 'She presented a compelling case during the debate.',
    difficulty: 'hard',
    repetitions: 0,
    intervalDays: 1,
    nextReviewDate: now - 500000 // Due for review!
  }
];

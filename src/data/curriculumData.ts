import type { LevelCurriculum } from '../types/learning';

export const CURRICULUM_DATA: LevelCurriculum[] = [
  // ==========================================
  // LEVEL A1 — BEGINNER
  // ==========================================
  {
    level: 'A1',
    levelName: 'Level A1 — Beginner',
    tagline: 'Build strong foundations for everyday conversations',
    description: 'Start your English journey with greetings, essential verbs, daily nouns, and basic sentence construction.',
    units: [
      {
        id: 'u_a1_1',
        level: 'A1',
        unitNumber: 1,
        title: 'First Steps & Introductions',
        description: 'Master introducing yourself and saying hello with confidence.',
        color: '#6366f1',
        chapters: [
          {
            id: 'ch_a1_greetings',
            unitId: 'u_a1_1',
            level: 'A1',
            title: 'Greetings & Introductions',
            shortDescription: 'Learn natural ways to say hello and introduce yourself.',
            iconName: 'HandMetal',
            xpReward: 30,
            durationMinutes: 7,
            explanation: 'In English, how you greet someone depends on whether the situation is formal (like a job or meeting a teacher) or informal (with friends and family). When meeting someone new, we usually state our name and say "Nice to meet you!"',
            keyRules: [
              'Use "Good morning" until 12:00 PM, "Good afternoon" until 5:00 PM, and "Good evening" after 5:00 PM.',
              'Never say "Good night" as a greeting; it means "goodbye" or "I am going to sleep".',
              'Use "I am [Name]" or "My name is [Name]" to introduce yourself.'
            ],
            examples: [
              {
                title: 'Formal Greeting',
                english: 'Good morning! My name is Rahul. It is a pleasure to meet you.',
                translation: 'शुभ प्रभात! मेरा नाम राहुल है। आपसे मिलकर बहुत खुशी हुई।',
                explanation: 'Polite and appropriate for work, interviews, and official settings.'
              },
              {
                title: 'Casual Meeting',
                english: 'Hey there! I am Sarah. Nice to meet you!',
                translation: 'नमस्ते! मैं सारा हूँ। आपसे मिलकर अच्छा लगा!',
                explanation: 'Friendly and relaxed tone used among peers and friends.'
              }
            ],
            vocabulary: [
              {
                id: 'v_greet_1',
                word: 'Pleasure',
                phonetic: '/ˈpleʒ.ər/',
                partOfSpeech: 'noun',
                meaning: 'A feeling of happy satisfaction or enjoyment',
                hindiMeaning: 'खुशी / आनंद',
                exampleSentence: 'It was a pleasure talking with you today.'
              },
              {
                id: 'v_greet_2',
                word: 'Introduce',
                phonetic: '/ˌɪn.trəˈdjuːs/',
                partOfSpeech: 'verb',
                meaning: 'To tell someone another person’s name or your own name',
                hindiMeaning: 'परिचय कराना',
                exampleSentence: 'Let me introduce my colleague, David.'
              },
              {
                id: 'v_greet_3',
                word: 'Colleague',
                phonetic: '/ˈkɒl.iːɡ/',
                partOfSpeech: 'noun',
                meaning: 'A person that you work with',
                hindiMeaning: 'सहकर्मी',
                exampleSentence: 'I work with three friendly colleagues.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_g1',
                type: 'mcq',
                prompt: 'You arrive at an interview at 10:00 AM. Which greeting is most polite and appropriate?',
                options: ['Good night, Sir!', 'Good morning! It is a pleasure to meet you.', 'See ya later!', 'What is up?'],
                correctAnswer: 'Good morning! It is a pleasure to meet you.',
                explanation: 'At 10:00 AM in a formal setting, "Good morning" paired with "pleasure to meet you" is standard polite English.',
                category: 'speaking'
              },
              {
                id: 'q_a1_g2',
                type: 'word_order',
                prompt: 'Arrange the words to form a polite introduction:',
                wordBank: ['meet', 'Nice', 'to', 'you!'],
                correctAnswer: ['Nice', 'to', 'meet', 'you!'],
                explanation: '"Nice to meet you!" is the standard fixed expression when being introduced.',
                category: 'word_order'
              },
              {
                id: 'q_a1_g3',
                type: 'fill_blank',
                prompt: 'Fill in the blank: "Hello, my name _____ Alex."',
                options: ['are', 'am', 'is', 'be'],
                correctAnswer: 'is',
                explanation: '"My name" is singular third-person, so it takes the verb "is".',
                category: 'grammar'
              },
              {
                id: 'q_a1_g4',
                type: 'sentence_correction',
                prompt: 'Fix the error: "Good night! How are you doing this morning?"',
                options: [
                  'Good morning! How are you doing this morning?',
                  'Good evening! How are you doing this morning?',
                  'Good night! How you do this morning?'
                ],
                correctAnswer: 'Good morning! How are you doing this morning?',
                explanation: '"Good night" cannot be used to greet someone in the morning.',
                category: 'grammar'
              },
              {
                id: 'q_a1_g5',
                type: 'match_pairs',
                prompt: 'Match each greeting with its appropriate time or situation:',
                pairs: [
                  { left: 'Good morning', right: 'Before 12:00 PM' },
                  { left: 'Good afternoon', right: '12:00 PM to 5:00 PM' },
                  { left: 'Good night', right: 'Departing before bed' }
                ],
                correctAnswer: 'matched',
                explanation: 'Time-of-day greetings follow fixed cultural conventions.',
                category: 'vocabulary'
              }
            ]
          },
          {
            id: 'ch_a1_be_verb',
            unitId: 'u_a1_1',
            level: 'A1',
            title: 'Pronouns & the Verb "To Be"',
            shortDescription: 'Master am, is, and are with subject pronouns.',
            iconName: 'UserCheck',
            xpReward: 35,
            durationMinutes: 8,
            explanation: 'The verb "to be" connects a subject to a description, identity, or location. It changes form based on the subject pronoun: I am, He/She/It is, You/We/They are.',
            keyRules: [
              'I + am ("I am a software engineer")',
              'He / She / It + is ("She is very kind")',
              'You / We / They + are ("They are ready for the meeting")',
              'Negative: add "not" after the be-verb ("He is not here").'
            ],
            examples: [
              {
                title: 'Identity & Occupation',
                english: 'I am a student, and she is a doctor.',
                translation: 'मैं एक छात्र हूँ, और वह एक डॉक्टर है।',
                explanation: 'Use "am" with I, and "is" with third person singular.'
              },
              {
                title: 'Location Description',
                english: 'We are at the library right now.',
                translation: 'हम अभी पुस्तकालय में हैं।',
                explanation: '"We are" indicates the current physical state or location.'
              }
            ],
            vocabulary: [
              {
                id: 'v_be_1',
                word: 'Pronoun',
                phonetic: '/ˈprəʊ.naʊn/',
                partOfSpeech: 'noun',
                meaning: 'A word used in place of a noun (I, you, he, she, it, we, they)',
                hindiMeaning: 'सर्वनाम',
                exampleSentence: 'Use the pronoun "she" instead of repeating Maria.'
              },
              {
                id: 'v_be_2',
                word: 'Profession',
                phonetic: '/prəˈfeʃ.ən/',
                partOfSpeech: 'noun',
                meaning: 'A paid occupation or career requiring training',
                hindiMeaning: 'पेशा / व्यवसाय',
                exampleSentence: 'Teaching is a noble profession.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_be1',
                type: 'fill_blank',
                prompt: 'Select the correct verb: "They _____ excited about the new project."',
                options: ['am', 'is', 'are', 'be'],
                correctAnswer: 'are',
                explanation: 'The subject "They" is plural, so we use "are".',
                category: 'grammar'
              },
              {
                id: 'q_a1_be2',
                type: 'listening',
                prompt: 'Listen to the audio and choose the sentence you hear:',
                audioText: 'She is not at home today.',
                options: [
                  'She is not at home today.',
                  'She are not at home today.',
                  'She is at home today.',
                  'He is not at home today.'
                ],
                correctAnswer: 'She is not at home today.',
                explanation: 'The speaker clearly says "She is not at home today."',
                category: 'grammar'
              },
              {
                id: 'q_a1_be3',
                type: 'sentence_correction',
                prompt: 'Identify and fix the mistake: "I is very happy to learn English."',
                options: [
                  'I am very happy to learn English.',
                  'I are very happy to learn English.',
                  'I be very happy to learn English.'
                ],
                correctAnswer: 'I am very happy to learn English.',
                explanation: 'The first person pronoun "I" always pairs with "am" in the present tense.',
                category: 'grammar'
              }
            ]
          },
          {
            id: 'ch_a1_sentence_basics',
            unitId: 'u_a1_1',
            level: 'A1',
            title: 'Basic Sentence Construction',
            shortDescription: 'Understand Subject-Verb-Object (SVO) order.',
            iconName: 'Layers',
            xpReward: 35,
            durationMinutes: 8,
            explanation: 'English sentences follow the S-V-O order: Subject (who does the action), Verb (the action), and Object (who/what receives the action). Getting this order right ensures you are immediately understood.',
            keyRules: [
              'Subject comes first: Rahul / She / The dog',
              'Verb follows directly: drinks / writes / likes',
              'Object comes after verb: coffee / an email / pizza',
              'Unlike Hindi or other languages where the verb is at the end, English puts the verb right after the subject!'
            ],
            examples: [
              {
                title: 'Direct SVO sentence',
                english: 'Rahul drinks fresh coffee every morning.',
                translation: 'राहुल हर सुबह ताज़ी कॉफ़ी पीता है।',
                explanation: 'Rahul (Subject) + drinks (Verb) + coffee (Object).'
              }
            ],
            vocabulary: [
              {
                id: 'v_sent_1',
                word: 'Sentence',
                phonetic: '/ˈsen.təns/',
                partOfSpeech: 'noun',
                meaning: 'A set of words that expresses a complete thought',
                hindiMeaning: 'वाक्य',
                exampleSentence: 'Write a short sentence using the word "happy".'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_sb1',
                type: 'word_order',
                prompt: 'Assemble the words into the correct SVO order:',
                wordBank: ['tea', 'likes', 'She', 'green'],
                correctAnswer: ['She', 'likes', 'green', 'tea'],
                explanation: 'Subject ("She") + Verb ("likes") + Object ("green tea").',
                category: 'word_order'
              },
              {
                id: 'q_a1_sb2',
                type: 'translation',
                prompt: 'Translate into English: "मैं एक किताब पढ़ता हूँ।"',
                options: [
                  'I read a book.',
                  'I a book read.',
                  'A book I read.',
                  'I reading book.'
                ],
                correctAnswer: 'I read a book.',
                explanation: 'In English, the verb "read" comes before the object "a book".',
                category: 'grammar'
              }
            ]
          }
        ]
      },
      {
        id: 'u_a1_2',
        level: 'A1',
        unitNumber: 2,
        title: 'Daily Life & Present Habits',
        description: 'Talk about your routine, articles, questions, and everyday nouns.',
        color: '#8b5cf6',
        chapters: [
          {
            id: 'ch_a1_articles',
            unitId: 'u_a1_2',
            level: 'A1',
            title: 'Articles (A, An, The) & Common Nouns',
            shortDescription: 'Master when to use "a", "an", or "the".',
            iconName: 'FileText',
            xpReward: 35,
            durationMinutes: 8,
            explanation: 'Articles point to nouns. Use "a" before consonant sounds, "an" before vowel sounds (a, e, i, o, u sound), and "the" when talking about something specific or already mentioned.',
            keyRules: [
              'Use "a" before consonant sounds: a book, a university (starts with "y" sound!), a car.',
              'Use "an" before vowel sounds: an apple, an hour (silent "h"!), an umbrella.',
              'Use "the" when both speaker and listener know which one: "Pass me the salt."'
            ],
            examples: [
              {
                title: 'Sound-based rule',
                english: 'I need an hour to finish an interesting article.',
                translation: 'मुझे एक दिलचस्प लेख पूरा करने के लिए एक घंटे की आवश्यकता है।',
                explanation: '"Hour" starts with a vowel sound /aʊər/, so we use "an".'
              }
            ],
            vocabulary: [
              {
                id: 'v_art_1',
                word: 'Specific',
                phonetic: '/spəˈsɪf.ɪk/',
                partOfSpeech: 'adjective',
                meaning: 'Clearly defined or identified',
                hindiMeaning: 'विशिष्ट / खास',
                exampleSentence: 'Is there a specific book you are looking for?'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_art1',
                type: 'fill_blank',
                prompt: 'He arrived _____ hour early for the meeting.',
                options: ['a', 'an', 'the', 'no article'],
                correctAnswer: 'an',
                explanation: '"Hour" begins with a silent "h", producing a vowel sound /aʊər/, requiring "an".',
                category: 'articles'
              },
              {
                id: 'q_a1_art2',
                type: 'sentence_correction',
                prompt: 'Correct the article mistake: "She wants to buy an car."',
                options: [
                  'She wants to buy a car.',
                  'She wants to buy the car only.',
                  'She want to buy an cars.'
                ],
                correctAnswer: 'She wants to buy a car.',
                explanation: '"Car" starts with the consonant sound /k/, so it takes "a".',
                category: 'articles'
              }
            ]
          },
          {
            id: 'ch_a1_present_simple',
            unitId: 'u_a1_2',
            level: 'A1',
            title: 'Present Simple Tense',
            shortDescription: 'Express habits, daily routines, and universal truths.',
            iconName: 'Clock',
            xpReward: 40,
            durationMinutes: 9,
            explanation: 'Use the Present Simple tense for things that happen regularly, habits, or facts. Remember to add "-s" or "-es" to the verb when the subject is he, she, or it!',
            keyRules: [
              'I / You / We / They + base verb (I work, they play)',
              'He / She / It + verb + s/es (He works, she watches)',
              'Common error: Forgetting the "-s" on third-person singular verbs!'
            ],
            examples: [
              {
                title: 'Daily routine',
                english: 'Priya wakes up at 7:00 AM and drinks green tea.',
                translation: 'प्रिया सुबह 7:00 बजे उठती है और ग्रीन टी पीती है।',
                explanation: 'Priya is "she", so wake becomes "wakes" and drink becomes "drinks".'
              }
            ],
            vocabulary: [
              {
                id: 'v_ps_1',
                word: 'Habit',
                phonetic: '/ˈhæb.ɪt/',
                partOfSpeech: 'noun',
                meaning: 'A settled or regular tendency or practice',
                hindiMeaning: 'आदत',
                exampleSentence: 'Reading books is a wonderful habit.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_ps1',
                type: 'fill_blank',
                prompt: 'My brother _____ in an IT company in Bengaluru.',
                options: ['work', 'works', 'working', 'is work'],
                correctAnswer: 'works',
                explanation: '"My brother" is singular (he), so the verb requires "-s" -> "works".',
                category: 'tense'
              },
              {
                id: 'q_a1_ps2',
                type: 'sentence_correction',
                prompt: 'Fix the subject-verb agreement: "He watch movies every Sunday."',
                options: [
                  'He watches movies every Sunday.',
                  'He watching movies every Sunday.',
                  'He are watch movies every Sunday.'
                ],
                correctAnswer: 'He watches movies every Sunday.',
                explanation: 'Verbs ending in -ch add "-es" in third-person singular (watch -> watches).',
                category: 'tense'
              }
            ]
          },
          {
            id: 'ch_a1_questions_negatives',
            unitId: 'u_a1_2',
            level: 'A1',
            title: 'Questions & Negatives (Do / Does)',
            shortDescription: 'Ask questions and make negative statements correctly.',
            iconName: 'HelpCircle',
            xpReward: 40,
            durationMinutes: 9,
            explanation: 'To form questions and negatives in present simple, use the auxiliary verbs "do" and "does". In negative sentences, use "do not" (don’t) or "does not" (doesn’t). When "does" is used, the main verb reverts to its base form!',
            keyRules: [
              'I / You / We / They + do not + base verb ("I don’t like spicy food")',
              'He / She / It + does not + base verb ("She doesn’t eat meat" - NOT doesn’t eats!)',
              'Questions: Do/Does + Subject + base verb? ("Do you speak English?")'
            ],
            examples: [
              {
                title: 'Question and Answer',
                english: 'Do you live in Mumbai? — No, I do not live there; I live in Delhi.',
                translation: 'क्या आप मुंबई में रहते हैं? — नहीं, मैं वहाँ नहीं रहता; मैं दिल्ली में रहता हूँ।',
                explanation: 'Notice how "do" starts the yes/no question.'
              }
            ],
            vocabulary: [
              {
                id: 'v_qn_1',
                word: 'Auxiliary',
                phonetic: '/ɔːɡˈzɪl.jə.ri/',
                partOfSpeech: 'adjective',
                meaning: 'Providing supplementary or additional help (a helping verb)',
                hindiMeaning: 'सहायक (क्रिया)',
                exampleSentence: '"Do" and "does" are auxiliary verbs in present simple.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_qn1',
                type: 'fill_blank',
                prompt: '_____ your sister play the guitar?',
                options: ['Do', 'Does', 'Is', 'Are'],
                correctAnswer: 'Does',
                explanation: '"Your sister" is she (third person singular), so the question starts with "Does".',
                category: 'grammar'
              },
              {
                id: 'q_a1_qn2',
                type: 'sentence_correction',
                prompt: 'Correct this common mistake: "She doesn’t likes coffee."',
                options: [
                  'She doesn’t like coffee.',
                  'She don’t like coffee.',
                  'She not like coffee.'
                ],
                correctAnswer: 'She doesn’t like coffee.',
                explanation: 'Because "does" already carries the third-person marker, the main verb must be in its base form ("like").',
                category: 'grammar'
              }
            ]
          },
          {
            id: 'ch_a1_everyday_vocab',
            unitId: 'u_a1_2',
            level: 'A1',
            title: 'Everyday Vocabulary & Speaking',
            shortDescription: 'Core vocabulary for food, home, time, and basic conversations.',
            iconName: 'MessageSquare',
            xpReward: 40,
            durationMinutes: 10,
            explanation: 'Build your active daily vocabulary around common objects, time expressions, family, and home life.',
            keyRules: [
              'Learn words in short phrases rather than in isolation.',
              'Practice saying the word out loud with correct word stress.',
              'Notice whether the word is a noun, verb, or adjective.'
            ],
            examples: [
              {
                title: 'Morning routine',
                english: 'I brush my teeth, take a shower, and prepare a quick breakfast.',
                translation: 'मैं अपने दाँत साफ करता हूँ, नहाता हूँ, और जल्दी से नाश्ता तैयार करता हूँ।',
                explanation: 'Common daily action collocations.'
              }
            ],
            vocabulary: [
              {
                id: 'v_ev_1',
                word: 'Punctual',
                phonetic: '/ˈpʌŋk.tʃu.əl/',
                partOfSpeech: 'adjective',
                meaning: 'Happening or doing something at the agreed or proper time',
                hindiMeaning: 'समय का पाबंद',
                exampleSentence: 'He is always punctual for his appointments.'
              },
              {
                id: 'v_ev_2',
                word: 'Prepare',
                phonetic: '/prɪˈpeər/',
                partOfSpeech: 'verb',
                meaning: 'Make something ready for use or consideration',
                hindiMeaning: 'तैयार करना',
                exampleSentence: 'I prepare lunch before heading out.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a1_ev1',
                type: 'situational',
                prompt: 'Someone asks you: "What time do you usually have breakfast?" What is the most natural reply?',
                options: [
                  'I usually have breakfast around 8:00 AM.',
                  'Yes, I have food.',
                  'I am eating breakfast tomorrow.',
                  'Breakfast is bread.'
                ],
                correctAnswer: 'I usually have breakfast around 8:00 AM.',
                explanation: 'Direct, polite, and answers the specific question with "around 8:00 AM".',
                category: 'speaking'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL A2 — ELEMENTARY
  // ==========================================
  {
    level: 'A2',
    levelName: 'Level A2 — Elementary',
    tagline: 'Expand your range to past events, future plans, and travel',
    description: 'Talk comfortably about past experiences, future goals, comparisons, prepositions, and shopping.',
    units: [
      {
        id: 'u_a2_1',
        level: 'A2',
        unitNumber: 1,
        title: 'Past & Future Narratives',
        description: 'Learn to recount yesterday and plan tomorrow with confidence.',
        color: '#0ea5e9',
        chapters: [
          {
            id: 'ch_a2_past_simple',
            unitId: 'u_a2_1',
            level: 'A2',
            title: 'Past Simple Tense',
            shortDescription: 'Talk about completed actions in the past with regular and irregular verbs.',
            iconName: 'History',
            xpReward: 45,
            durationMinutes: 10,
            explanation: 'The Past Simple tense describes events that started and finished in the past. Regular verbs add "-ed" (walk -> walked), but many common English verbs are irregular (go -> went, meet -> met, buy -> bought).',
            keyRules: [
              'Regular verbs: add "-ed" (work -> worked, call -> called)',
              'Irregular verbs: must be memorized (go -> went, see -> saw, write -> wrote)',
              'Negative: did not (didn’t) + base verb ("I didn’t go", NOT "I didn’t went")',
              'Past questions: Did + subject + base verb? ("Did you call him?")'
            ],
            examples: [
              {
                title: 'Recounting yesterday',
                english: 'Yesterday, I went to the market and bought fresh vegetables.',
                translation: 'कल मैं बाज़ार गया और ताज़ी सब्ज़ियाँ खरीदीं।',
                explanation: 'Both "went" and "bought" are irregular past tense verbs.'
              }
            ],
            vocabulary: [
              {
                id: 'v_past_1',
                word: 'Yesterday',
                phonetic: '/ˈjes.tə.deɪ/',
                partOfSpeech: 'noun / adverb',
                meaning: 'On the day before today',
                hindiMeaning: 'बीता हुआ कल',
                exampleSentence: 'Yesterday was a productive day.'
              },
              {
                id: 'v_past_2',
                word: 'Decided',
                phonetic: '/dɪˈsaɪ.dɪd/',
                partOfSpeech: 'verb (past)',
                meaning: 'Made a choice from a number of alternatives',
                hindiMeaning: 'निर्णय लिया',
                exampleSentence: 'We decided to watch a film after dinner.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a2_ps1',
                type: 'sentence_correction',
                prompt: 'Fix the error: "Yesterday I go to office and meet my manager."',
                options: [
                  'Yesterday I went to the office and met my manager.',
                  'Yesterday I gone to office and met my manager.',
                  'Yesterday I went to office and meet my manager.'
                ],
                correctAnswer: 'Yesterday I went to the office and met my manager.',
                explanation: 'Past simple of "go" is "went", and past of "meet" is "met". Add "the" before office.',
                category: 'tense'
              },
              {
                id: 'q_a2_ps2',
                type: 'fill_blank',
                prompt: 'She didn’t _____ the email yesterday.',
                options: ['received', 'receive', 'receives', 'receiving'],
                correctAnswer: 'receive',
                explanation: 'After "didn’t", always use the base form of the verb ("receive").',
                category: 'tense'
              }
            ]
          },
          {
            id: 'ch_a2_future_plans',
            unitId: 'u_a2_1',
            level: 'A2',
            title: 'Future Plans (Going to & Will)',
            shortDescription: 'Distinguish between planned intentions and spontaneous decisions.',
            iconName: 'Compass',
            xpReward: 40,
            durationMinutes: 9,
            explanation: 'Use "be going to" for intentions and plans already decided before speaking. Use "will" for instant decisions made at the moment of speaking or future predictions.',
            keyRules: [
              'Intention: "I am going to visit my grandparents this weekend."',
              'Spontaneous decision: "The phone is ringing. I will answer it."',
              'Prediction based on evidence: "Look at those dark clouds! It is going to rain."'
            ],
            examples: [
              {
                title: 'Weekend plan',
                english: 'We are going to start our new fitness routine on Monday.',
                translation: 'हम सोमवार को अपनी नई फिटनेस दिनचर्या शुरू करने जा रहे हैं।',
                explanation: 'A pre-arranged plan uses "going to".'
              }
            ],
            vocabulary: [
              {
                id: 'v_fut_1',
                word: 'Intention',
                phonetic: '/ɪnˈten.ʃən/',
                partOfSpeech: 'noun',
                meaning: 'An aim or plan',
                hindiMeaning: 'इरादा / योजना',
                exampleSentence: 'My intention is to become fluent in six months.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a2_fp1',
                type: 'fill_blank',
                prompt: 'A: "Someone is knocking at the door!" B: "Don’t worry, I _____ open it."',
                options: ['am going to', 'will', 'was', 'am'],
                correctAnswer: 'will',
                explanation: 'Use "will" for a spontaneous decision made on the spot.',
                category: 'grammar'
              }
            ]
          },
          {
            id: 'ch_a2_prepositions',
            unitId: 'u_a2_1',
            level: 'A2',
            title: 'Prepositions of Time & Place (In, On, At)',
            shortDescription: 'Never mix up "in Monday", "at May", or "on 5:00 PM" again.',
            iconName: 'MapPin',
            xpReward: 45,
            durationMinutes: 9,
            explanation: 'Master the triangle of In, On, and At. "In" is for big periods/enclosed areas (months, years, cities). "On" is for days, dates, and surfaces. "At" is for exact clock times and specific points.',
            keyRules: [
              'Time: IN (months, years, centuries) -> ON (days, specific dates) -> AT (exact clock times)',
              'Examples: in July, in 2026, on Tuesday, on October 17th, at 9:30 PM.',
              'Place: in India, in the room, on the table, on Main Street, at the bus stop, at home.'
            ],
            examples: [
              {
                title: 'Time sentence',
                english: 'The interview starts at 10:00 AM on Friday.',
                translation: 'साक्षात्कार शुक्रवार को सुबह 10:00 बजे शुरू होता है।',
                explanation: '"At" for the time (10:00 AM) and "on" for the day (Friday).'
              }
            ],
            vocabulary: [
              {
                id: 'v_prep_1',
                word: 'Appointment',
                phonetic: '/əˈpɔɪnt.mənt/',
                partOfSpeech: 'noun',
                meaning: 'An arrangement to meet someone at a particular time and place',
                hindiMeaning: 'मुलाकात का समय',
                exampleSentence: 'I have a doctor’s appointment at 4:00 PM.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a2_pr1',
                type: 'fill_blank',
                prompt: 'Our team meeting is scheduled _____ Monday morning _____ 9:00 AM.',
                options: ['on / at', 'in / on', 'at / in', 'on / in'],
                correctAnswer: 'on / at',
                explanation: 'Use "on" for days of the week, and "at" for specific clock times.',
                category: 'prepositions'
              },
              {
                id: 'q_a2_pr2',
                type: 'sentence_correction',
                prompt: 'Fix the preposition: "She was born at May in 1998."',
                options: [
                  'She was born in May in 1998.',
                  'She was born on May at 1998.',
                  'She was born at May on 1998.'
                ],
                correctAnswer: 'She was born in May in 1998.',
                explanation: 'Months and years both take the preposition "in".',
                category: 'prepositions'
              }
            ]
          },
          {
            id: 'ch_a2_comparisons',
            unitId: 'u_a2_1',
            level: 'A2',
            title: 'Comparisons & Superlatives',
            shortDescription: 'Compare objects, people, and choices smoothly.',
            iconName: 'TrendingUp',
            xpReward: 40,
            durationMinutes: 9,
            explanation: 'Comparative adjectives compare two things (taller, more expensive than). Superlative adjectives compare three or more (the tallest, the most expensive).',
            keyRules: [
              'Short adjectives (1 syllable): add -er / -est (fast -> faster -> fastest)',
              'Long adjectives (2+ syllables): use more / most (expensive -> more expensive -> most expensive)',
              'Always use "than" after comparatives ("This laptop is faster than my old one").'
            ],
            examples: [
              {
                title: 'Comparing features',
                english: 'Traveling by train is more comfortable than taking the bus.',
                translation: 'ट्रेन से यात्रा करना बस की तुलना में अधिक आरामदायक है।',
                explanation: '"Comfortable" has multiple syllables, so we use "more comfortable than".'
              }
            ],
            vocabulary: [
              {
                id: 'v_comp_1',
                word: 'Affordable',
                phonetic: '/əˈfɔː.də.bəl/',
                partOfSpeech: 'adjective',
                meaning: 'Inexpensive; reasonably priced',
                hindiMeaning: 'किफायती',
                exampleSentence: 'This hotel is much more affordable.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_a2_cp1',
                type: 'fill_blank',
                prompt: 'English grammar is _____ than many people assume.',
                options: ['easier', 'more easy', 'easyer', 'easiest'],
                correctAnswer: 'easier',
                explanation: 'Two-syllable adjectives ending in -y change to -ier (easy -> easier).',
                category: 'grammar'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL B1 — INTERMEDIATE
  // ==========================================
  {
    level: 'B1',
    levelName: 'Level B1 — Intermediate',
    tagline: 'Connect thoughts, express opinions, and handle workplace communication',
    description: 'Master the difference between Present Perfect and Past Simple, modal verbs, conditionals, and workplace conversations.',
    units: [
      {
        id: 'u_b1_1',
        level: 'B1',
        unitNumber: 1,
        title: 'Professional & Fluent Expression',
        description: 'Bridge everyday talk to structured professional discussions.',
        color: '#10b981',
        chapters: [
          {
            id: 'ch_b1_present_perfect',
            unitId: 'u_b1_1',
            level: 'B1',
            title: 'Present Perfect vs. Past Simple',
            shortDescription: 'The biggest hurdle for English learners explained simply.',
            iconName: 'Zap',
            xpReward: 50,
            durationMinutes: 12,
            explanation: 'Use Past Simple when the time is finished or specific (yesterday, in 2020, two hours ago). Use Present Perfect (have/has + past participle) when talking about life experiences or past actions with a direct result in the present, without specifying an exact past time.',
            keyRules: [
              'Past Simple = finished time ("I visited London in 2022.")',
              'Present Perfect = unfinished time / life experience ("I have visited London twice.")',
              'Keywords for Present Perfect: already, yet, ever, never, recently, since, for.'
            ],
            examples: [
              {
                title: 'Life experience vs. Finished time',
                english: 'I have lost my key (I don’t have it now). I lost my key yesterday (yesterday is finished).',
                translation: 'मेरी चाबी खो गई है (अब मेरे पास नहीं है)। मेरी चाबी कल खो गई थी।',
                explanation: 'Present perfect shows relevance to the current moment.'
              }
            ],
            vocabulary: [
              {
                id: 'v_pp_1',
                word: 'Experience',
                phonetic: '/ɪkˈspɪə.ri.əns/',
                partOfSpeech: 'noun / verb',
                meaning: 'Knowledge or practical skill gained over time',
                hindiMeaning: 'अनुभव',
                exampleSentence: 'I have gained valuable experience working here.'
              },
              {
                id: 'v_pp_2',
                word: 'Accomplish',
                phonetic: '/əˈkʌm.plɪʃ/',
                partOfSpeech: 'verb',
                meaning: 'To complete or achieve something successfully',
                hindiMeaning: 'पूरा करना / हासिल करना',
                exampleSentence: 'We have accomplished all our quarterly targets.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_b1_pp1',
                type: 'fill_blank',
                prompt: 'I _____ in this company for three years, and I still love my job.',
                options: ['worked', 'have worked', 'am working', 'was worked'],
                correctAnswer: 'have worked',
                explanation: 'An action that started in the past and continues to the present requires Present Perfect ("have worked for three years").',
                category: 'tense'
              },
              {
                id: 'q_b1_pp2',
                type: 'sentence_correction',
                prompt: 'Identify the error: "I have seen that movie yesterday night."',
                options: [
                  'I saw that movie last night.',
                  'I have seen that movie last night.',
                  'I was seen that movie yesterday.'
                ],
                correctAnswer: 'I saw that movie last night.',
                explanation: 'With a finished time expression like "last night", you must use Past Simple ("saw"), not Present Perfect.',
                category: 'tense'
              }
            ]
          },
          {
            id: 'ch_b1_modals',
            unitId: 'u_b1_1',
            level: 'B1',
            title: 'Modal Verbs (Can, Could, Should, Must)',
            shortDescription: 'Express ability, polite requests, advice, and necessity.',
            iconName: 'Shield',
            xpReward: 45,
            durationMinutes: 10,
            explanation: 'Modal verbs modify the mood of a sentence. Could is more polite than can. Should gives recommendations. Must or have to shows strong necessity.',
            keyRules: [
              'Modal verbs are never followed by "to" (except ought to): "I should go" (NOT "I should to go").',
              'Polite workplace requests: "Could you please send me the presentation?"',
              'Advice: "You should practice speaking 15 minutes a day."'
            ],
            examples: [
              {
                title: 'Polite workplace request',
                english: 'Could you please review this draft when you have a moment?',
                translation: 'जब आपके पास समय हो, तो क्या आप कृपया इस ड्राफ्ट की समीक्षा कर सकते हैं?',
                explanation: '"Could you please" sounds professional, respectful, and polite.'
              }
            ],
            vocabulary: [
              {
                id: 'v_mod_1',
                word: 'Recommend',
                phonetic: '/ˌrek.əˈmend/',
                partOfSpeech: 'verb',
                meaning: 'To advise or suggest something as a good course of action',
                hindiMeaning: 'सिफारिश करना / सलाह देना',
                exampleSentence: 'I highly recommend reading this book.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_b1_mv1',
                type: 'sentence_correction',
                prompt: 'Fix the sentence: "You must to submit the report by 5 PM."',
                options: [
                  'You must submit the report by 5 PM.',
                  'You must submitting the report by 5 PM.',
                  'You must to submitted the report by 5 PM.'
                ],
                correctAnswer: 'You must submit the report by 5 PM.',
                explanation: 'Modal verbs like "must" take the bare infinitive without "to".',
                category: 'grammar'
              }
            ]
          },
          {
            id: 'ch_b1_conditionals',
            unitId: 'u_b1_1',
            level: 'B1',
            title: 'Conditionals (Zero, First, Second)',
            shortDescription: 'Express "If... then..." scenarios for facts, possibilities, and dreams.',
            iconName: 'GitFork',
            xpReward: 50,
            durationMinutes: 11,
            explanation: 'Conditionals express cause and effect. First conditional (If + present simple, will + base verb) handles real future possibilities. Second conditional (If + past simple, would + base verb) handles hypothetical or unreal scenarios.',
            keyRules: [
              'First conditional (likely): "If you practice every day, your fluency will improve dramatically."',
              'Second conditional (hypothetical): "If I had more free time, I would travel across Europe."',
              'Do not put "will" or "would" inside the "if" clause!'
            ],
            examples: [
              {
                title: 'Real future condition',
                english: 'If it rains this evening, we will hold the meeting online.',
                translation: 'यदि आज शाम बारिश होती है, तो हम बैठक ऑनलाइन आयोजित करेंगे।',
                explanation: 'If + present simple (rains), will + base verb (will hold).'
              }
            ],
            vocabulary: [
              {
                id: 'v_cnd_1',
                word: 'Hypothetical',
                phonetic: '/ˌhaɪ.pəˈθet.ɪ.kəl/',
                partOfSpeech: 'adjective',
                meaning: 'Based on a possible situation rather than actual reality',
                hindiMeaning: 'काल्पनिक / अनुमानित',
                exampleSentence: 'Let us examine a hypothetical scenario.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_b1_cd1',
                type: 'fill_blank',
                prompt: 'If she _____ harder, she will definitely pass the exam.',
                options: ['studies', 'will study', 'studied', 'study'],
                correctAnswer: 'studies',
                explanation: 'In the First Conditional, the "if" clause uses the present simple tense ("studies").',
                category: 'grammar'
              }
            ]
          },
          {
            id: 'ch_b1_opinions',
            unitId: 'u_b1_1',
            level: 'B1',
            title: 'Expressing Opinions & Agreeing/Disagreeing',
            shortDescription: 'Share your perspective politely in meetings and social settings.',
            iconName: 'Users',
            xpReward: 45,
            durationMinutes: 10,
            explanation: 'Expressing opinions diplomatically is vital in international workplaces. Learn phrases like "In my perspective...", "I see your point, but...", and "I completely agree with you."',
            keyRules: [
              'Strong agreement: "I couldn’t agree more!" (means 100% agreement)',
              'Polite disagreement: "I see what you mean, however, have we considered X?"',
              'Softening statements: "It seems to me that..." rather than aggressive statements.'
            ],
            examples: [
              {
                title: 'Diplomatic discussion',
                english: 'I understand your concern; however, I believe this strategy saves time.',
                translation: 'मैं आपकी चिंता समझता हूँ; हालाँकि, मेरा मानना है कि यह रणनीति समय बचाती है।',
                explanation: 'Acknowledges the other person first before stating a counter-view.'
              }
            ],
            vocabulary: [
              {
                id: 'v_op_1',
                word: 'Perspective',
                phonetic: '/pəˈspek.tɪv/',
                partOfSpeech: 'noun',
                meaning: 'A particular attitude toward or way of regarding something',
                hindiMeaning: 'दृष्टिकोण',
                exampleSentence: 'From my perspective, quality is our top priority.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_b1_op1',
                type: 'situational',
                prompt: 'In a team meeting, a colleague suggests postponing a deadline. You disagree politely. Which response is best?',
                options: [
                  'That is a completely wrong idea.',
                  'I see your point, but could we perhaps adjust the scope instead?',
                  'No way, I refuse.',
                  'You don’t know what you are talking about.'
                ],
                correctAnswer: 'I see your point, but could we perhaps adjust the scope instead?',
                explanation: 'Constructive, respectful, and suggests a productive compromise.',
                category: 'speaking'
              }
            ]
          }
        ]
      }
    ]
  },

  // ==========================================
  // LEVEL B2 — UPPER INTERMEDIATE
  // ==========================================
  {
    level: 'B2',
    levelName: 'Level B2 — Upper Intermediate',
    tagline: 'Achieve effortless fluency, nuanced idioms, and executive communication',
    description: 'Master advanced sentence structures, collocations, presentations, discussions, and natural idiomatic flow.',
    units: [
      {
        id: 'u_b2_1',
        level: 'B2',
        unitNumber: 1,
        title: 'Executive Fluency & Nuance',
        description: 'Speak and write with precision, impact, and natural cadence.',
        color: '#f59e0b',
        chapters: [
          {
            id: 'ch_b2_collocations',
            unitId: 'u_b2_1',
            level: 'B2',
            title: 'Natural Collocations & Expressions',
            shortDescription: 'Sound like a native speaker by pairing words that naturally go together.',
            iconName: 'Sparkles',
            xpReward: 55,
            durationMinutes: 12,
            explanation: 'Collocations are words that naturally occur together in English. For example, we say "make a decision" (not "do a decision"), "heavy traffic" (not "thick traffic"), and "take a risk".',
            keyRules: [
              'Do vs. Make: "Make an effort, make a mistake, make progress" vs "Do your homework, do business, do a favor".',
              'Strong adjectives + nouns: "a golden opportunity", "a heated debate", "vital role".',
              'Adverb + adjective: "deeply concerned", "highly successful", "starkly contrasting".'
            ],
            examples: [
              {
                title: 'Natural professional phrasing',
                english: 'She made a compelling presentation and gained the client’s trust.',
                translation: 'उसने एक सम्मोहक प्रस्तुति दी और ग्राहक का विश्वास जीता।',
                explanation: '"Make a presentation" and "gain trust" are natural collocations.'
              }
            ],
            vocabulary: [
              {
                id: 'v_col_1',
                word: 'Compelling',
                phonetic: '/kəmˈpel.ɪŋ/',
                partOfSpeech: 'adjective',
                meaning: 'Evoking interest, attention, or admiration in a powerfully irresistible way',
                hindiMeaning: 'प्रभावशाली / सम्मोहक',
                exampleSentence: 'The candidate gave a compelling argument.'
              },
              {
                id: 'v_col_2',
                word: 'Substantial',
                phonetic: '/səbˈstæn.ʃəl/',
                partOfSpeech: 'adjective',
                meaning: 'Of considerable importance, size, or worth',
                hindiMeaning: 'पर्याप्त / महत्वपूर्ण',
                exampleSentence: 'We have made substantial progress this quarter.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_b2_col1',
                type: 'fill_blank',
                prompt: 'We need to _____ a decision before the end of the day.',
                options: ['make', 'do', 'take', 'create'],
                correctAnswer: 'make',
                explanation: 'In natural English, the standard collocation is "make a decision".',
                category: 'vocabulary'
              },
              {
                id: 'q_b2_col2',
                type: 'sentence_correction',
                prompt: 'Fix the awkward phrasing: "He did a big mistake during his talk."',
                options: [
                  'He made a major mistake during his talk.',
                  'He created a big mistake during his talk.',
                  'He put a big mistake during his talk.'
                ],
                correctAnswer: 'He made a major mistake during his talk.',
                explanation: 'We "make a mistake", and "major mistake" sounds far more natural and sophisticated.',
                category: 'vocabulary'
              }
            ]
          },
          {
            id: 'ch_b2_presentations',
            unitId: 'u_b2_1',
            level: 'B2',
            title: 'Presentations & Executive Discussions',
            shortDescription: 'Structure keynote presentations, signpost topics, and handle Q&A.',
            iconName: 'Presentation',
            xpReward: 60,
            durationMinutes: 14,
            explanation: 'Effective business presentations use "signposting" phrases to guide listeners: "First, let us turn our attention to...", "To illustrate this point...", and "In summary, the key takeaway is...".',
            keyRules: [
              'Opening: "Today, I’d like to walk you through our strategic roadmap..."',
              'Transitioning: "Moving on to our key findings..." or "Turning now to the financials..."',
              'Concluding: "To wrap up, I would emphasize that consistency is our greatest asset."'
            ],
            examples: [
              {
                title: 'Signposting in a presentation',
                english: 'To wrap up, let me recap the three primary recommendations we discussed.',
                translation: 'समापन के लिए, आइए हम उन तीन प्राथमिक सिफारिशों को संक्षेप में दोहराएं जिन पर हमने चर्चा की।',
                explanation: 'Signposts signal the end of the presentation clearly.'
              }
            ],
            vocabulary: [
              {
                id: 'v_pres_1',
                word: 'Signpost',
                phonetic: '/ˈsaɪn.pəʊst/',
                partOfSpeech: 'verb / noun',
                meaning: 'To provide a sign or words that indicate what is coming next in a speech',
                hindiMeaning: 'संकेत देना / दिशा दिखाना',
                exampleSentence: 'Good speakers signpost their arguments clearly.'
              }
            ],
            assessmentQuestions: [
              {
                id: 'q_b2_pr1',
                type: 'reading_comprehension',
                prompt: 'Read the excerpt and answer: What is the speaker’s primary objective?',
                contextText: '"Good afternoon everyone. Over the past six months, customer retention has dipped by 4%. Today, I will present two actionable strategies to reverse this trend through personalized onboarding and faster support response times."',
                options: [
                  'To announce staff layoffs',
                  'To present two strategies to improve customer retention',
                  'To praise the current support response time',
                  'To request a budget increase'
                ],
                correctAnswer: 'To present two strategies to improve customer retention',
                explanation: 'The speaker explicitly states their goal is to present two actionable strategies to reverse the retention dip.',
                category: 'vocabulary'
              }
            ]
          }
        ]
      }
    ]
  }
];

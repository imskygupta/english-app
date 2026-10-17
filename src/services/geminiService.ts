import type { StructuredTutorResponse, TutorPersona, CorrectionItem } from '../types/tutor';
import type { CEFRLevel } from '../types/learning';
import type { MistakeRecord } from '../types/user';

interface GeminiRequestParams {
  userMessage: string;
  level: CEFRLevel;
  persona: TutorPersona;
  conversationHistory: { sender: 'user' | 'tutor'; text: string }[];
  mistakeHistory: MistakeRecord[];
  roleplayContext?: string;
  explanationLanguage?: string;
  apiKey?: string;
}

export class GeminiTutorService {
  /**
   * Primary entry point: Generates a validated structured tutor response
   */
  async getTutorResponse(params: GeminiRequestParams): Promise<StructuredTutorResponse> {
    const key = params.apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);

    if (key && key.trim().length > 0) {
      try {
        const liveResponse = await this.callGeminiApi(params, key.trim());
        if (liveResponse) {
          return this.normalizeAndValidate(liveResponse, params.level);
        }
      } catch (error) {
        console.warn('Gemini API request failed, utilizing intelligent grammar fallback:', error);
      }
    }

    // Intelligent educational rule engine fallback
    return this.generateIntelligentFallback(params);
  }

  /**
   * Direct API call to Gemini with structured system prompt
   */
  private async callGeminiApi(
    params: GeminiRequestParams,
    apiKey: string
  ): Promise<StructuredTutorResponse | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemPrompt = `You are FluentMate, a patient, encouraging, and observant personal AI English teacher.
The learner's current CEFR level is ${params.level}.
Your personality mode is: ${params.persona}.
Learner's preferred explanation language: ${params.explanationLanguage || 'English'}.

CRITICAL INSTRUCTIONS:
1. Respond to the learner's actual message conversationally, keeping sentences natural and appropriate for CEFR level ${params.level}.
2. Patiently identify at most 1 or 2 priority grammatical, tense, preposition, article, or word choice errors. Never overwhelm them.
3. If their English is completely correct, set "corrected_sentence" to null and "corrections" to an empty array.
4. If there is a mistake, provide the full corrected sentence in "corrected_sentence" and break down the specific change in "corrections".
5. Distinguish between understandable informal English and genuine errors.
6. Never claim to have assessed pronunciation or audio quality unless specifically asked about a phonetic rule.
7. If the learner has known weak areas from past sessions: ${JSON.stringify(
      params.mistakeHistory.slice(0, 5).map((m) => ({ category: m.category, phrase: m.originalPhrase }))
    )}, gently reinforce good habits if relevant.
${params.roleplayContext ? `ROLEPLAY SCENARIO: Stay in character as: ${params.roleplayContext}` : ''}

YOU MUST RETURN STRICT VALID JSON ONLY. NO MARKDOWN CODE FENCES. NO OTHER TEXT.
The JSON must follow this exact schema:
{
  "reply": "Natural conversational response",
  "corrected_sentence": "Corrected sentence or null",
  "corrections": [
    {
      "original": "Incorrect phrase",
      "corrected": "Correct phrase",
      "explanation": "Simple, encouraging explanation in plain language",
      "category": "grammar" | "tense" | "articles" | "prepositions" | "word_order" | "vocabulary",
      "priority": "high" | "medium" | "low"
    }
  ],
  "vocabulary": [
    {
      "word": "useful word",
      "meaning": "Clear definition",
      "example_sentence": "An example sentence"
    }
  ],
  "follow_up_question": "A relevant follow-up question to keep the conversation going",
  "suggested_practice": ["past_simple"],
  "session_level": "${params.level}"
}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...params.conversationHistory.slice(-6).map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: params.userMessage }]
      }
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.4
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      // Clean any accidental markdown fence
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return parsed as StructuredTutorResponse;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Validates and normalizes the parsed response to avoid UI errors
   */
  private normalizeAndValidate(data: Partial<StructuredTutorResponse>, fallbackLevel: CEFRLevel): StructuredTutorResponse {
    return {
      reply: typeof data.reply === 'string' && data.reply.trim() ? data.reply : "That's very interesting! Tell me more about that.",
      corrected_sentence: typeof data.corrected_sentence === 'string' ? data.corrected_sentence : null,
      corrections: Array.isArray(data.corrections)
        ? data.corrections.filter((c): c is CorrectionItem => !!(c && c.original && c.corrected && c.explanation))
        : [],
      vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : [],
      follow_up_question: typeof data.follow_up_question === 'string' && data.follow_up_question.trim() ? data.follow_up_question : "What do you think about that?",
      suggested_practice: Array.isArray(data.suggested_practice) ? data.suggested_practice : [],
      session_level: data.session_level || fallbackLevel
    };
  }

  /**
   * Highly capable built-in pedagogical rule engine fallback
   * Ensures instant, offline-capable, deterministic grammar corrections
   */
  private generateIntelligentFallback(params: GeminiRequestParams): StructuredTutorResponse {
    const raw = params.userMessage.trim();
    const lower = raw.toLowerCase();
    const corrections: CorrectionItem[] = [];
    let corrected = raw;

    // Rule 1: Past tense with "yesterday" or "last night" + present verbs (go -> went, meet -> met, buy -> bought)
    if (/\b(yesterday|last (night|week|month|year|sunday|monday))\b/i.test(lower)) {
      if (/\b(i|we|they|he|she)\s+go\b/i.test(lower)) {
        corrected = corrected.replace(/\bgo\b/i, 'went');
        corrections.push({
          original: 'go',
          corrected: 'went',
          explanation: 'When talking about the past (like "yesterday"), use the past simple form "went".',
          category: 'tense',
          priority: 'high'
        });
      }
      if (/\bmeet\b/i.test(lower) && !/\bto meet\b/i.test(lower)) {
        corrected = corrected.replace(/\bmeet\b/i, 'met');
        corrections.push({
          original: 'meet',
          corrected: 'met',
          explanation: 'The past tense of "meet" is "met".',
          category: 'tense',
          priority: 'high'
        });
      }
      if (/\bbuy\b/i.test(lower) && !/\bto buy\b/i.test(lower)) {
        corrected = corrected.replace(/\bbuy\b/i, 'bought');
        corrections.push({
          original: 'buy',
          corrected: 'bought',
          explanation: 'The past tense of the irregular verb "buy" is "bought".',
          category: 'tense',
          priority: 'high'
        });
      }
      if (/\bsee\b/i.test(lower) && !/\bto see\b/i.test(lower)) {
        corrected = corrected.replace(/\bsee\b/i, 'saw');
        corrections.push({
          original: 'see',
          corrected: 'saw',
          explanation: 'Use the past tense "saw" for completed events.',
          category: 'tense',
          priority: 'high'
        });
      }
    }

    // Rule 2: Missing article before office / market ("go to office" -> "go to the office")
    if (/\bto office\b/i.test(corrected)) {
      corrected = corrected.replace(/\bto office\b/i, 'to the office');
      corrections.push({
        original: 'to office',
        corrected: 'to the office',
        explanation: 'In English, specific workplaces require the definite article "the" ("to the office").',
        category: 'articles',
        priority: 'medium'
      });
    }

    // Rule 3: Third person singular -s omission ("he like", "she want", "he work")
    const thirdPersonMatches = [
      { regex: /\b(he|she)\s+like\b/i, orig: 'like', rep: 'likes', expl: 'With he/she/it, add -s to the verb: "likes".' },
      { regex: /\b(he|she)\s+want\b/i, orig: 'want', rep: 'wants', expl: 'Third-person singular takes -s: "wants".' },
      { regex: /\b(he|she)\s+work\b/i, orig: 'work', rep: 'works', expl: 'Use "works" when the subject is he or she.' }
    ];
    for (const match of thirdPersonMatches) {
      if (match.regex.test(corrected)) {
        corrected = corrected.replace(new RegExp(`\\b${match.orig}\\b`, 'i'), match.rep);
        corrections.push({
          original: match.orig,
          corrected: match.rep,
          explanation: match.expl,
          category: 'grammar',
          priority: 'high'
        });
        break;
      }
    }

    // Rule 4: Incorrect article before vowels ("a apple", "a hour")
    if (/\ba\s+(apple|orange|egg|hour|urgent|interesting|amazing)\b/i.test(corrected)) {
      corrected = corrected.replace(/\ba\s+(apple|orange|egg|hour|urgent|interesting|amazing)\b/i, 'an $1');
      corrections.push({
        original: 'a',
        corrected: 'an',
        explanation: 'Use "an" before words starting with a vowel sound.',
        category: 'articles',
        priority: 'medium'
      });
    }

    // Rule 5: Double negative or "doesn't likes"
    if (/\bdoesn'?t\s+([a-z]+)s\b/i.test(corrected)) {
      const match = corrected.match(/\bdoesn'?t\s+([a-z]+)s\b/i);
      if (match) {
        const wrongWord = match[1] + 's';
        const baseWord = match[1];
        corrected = corrected.replace(new RegExp(`\\b${wrongWord}\\b`, 'i'), baseWord);
        corrections.push({
          original: wrongWord,
          corrected: baseWord,
          explanation: 'When using "doesn\'t", keep the main verb in its base form without -s.',
          category: 'grammar',
          priority: 'high'
        });
      }
    }

    // Capitalize first letter of corrected sentence
    if (corrected && corrected.length > 0) {
      corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      if (!/[.!?]$/.test(corrected)) {
        corrected += '.';
      }
    }

    // Contextual responses based on user keywords or roleplay
    let reply = "I understand what you mean, and you communicated that idea nicely!";
    let followUp = "Could you tell me a little bit more about what you enjoyed most?";
    const vocabulary = [];

    if (params.roleplayContext) {
      reply = `Thank you for sharing that! As we are practicing: ${params.roleplayContext}, let's build on what you said.`;
      followUp = "What would be your next step or proposal in this situation?";
    } else if (/yesterday|past|went|office|manager|work/i.test(lower)) {
      reply = "That sounds like a meaningful day at work! Discussing plans with your manager is always important.";
      followUp = "What was the most important topic you and your manager discussed?";
      vocabulary.push({
        word: 'Productive',
        meaning: 'Achieving or producing a significant amount or result',
        example_sentence: 'We had a very productive meeting yesterday.'
      });
    } else if (/hello|hi|hey|good morning|good evening/i.test(lower)) {
      reply = "Hello there! It is wonderful to practice English with you today. How are you feeling right now?";
      followUp = "What is one goal you would like to achieve in English today?";
    } else if (/learn|study|practice|improve|speak/i.test(lower)) {
      reply = "Consistent daily speaking is the single fastest way to unlock natural fluency.";
      followUp = "How many minutes do you usually manage to set aside for English practice each day?";
      vocabulary.push({
        word: 'Consistency',
        meaning: 'The quality of always behaving or performing in a similar, positive way',
        example_sentence: 'Consistency in language practice leads to lasting fluency.'
      });
    }

    return {
      reply,
      corrected_sentence: corrections.length > 0 ? corrected : null,
      corrections,
      vocabulary,
      follow_up_question: followUp,
      suggested_practice: corrections.map((c) => c.category),
      session_level: params.level
    };
  }
}

export const geminiService = new GeminiTutorService();

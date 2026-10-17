# FluentMate — Personalized AI English Learning App 🎓✨

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)
[![Free](https://img.shields.io/badge/Price-100%25%20Free-emerald.svg)](#)

> **FluentMate** is a modern, responsive language-learning application inspired by the engagement of Duolingo and cutting-edge conversational AI. Its primary differentiator is a **personal AI English teacher** that listens to learners, corrects grammar in plain language, adapts to weaknesses, and remembers past mistakes.

---

## 🌟 Key Features

### 1. 🤖 Dedicated AI Speaking Tutor (Primary Differentiator)
- **Voice & Text Modes**: Speak directly using your browser's microphone with real-time waveform visualizers, or type your thoughts.
- **Natural Speech Synthesis**: Hear the tutor's response read aloud at customized speeds (0.7x to 1.2x) and pitch.
- **Structured Correction Cards**: Separates friendly conversation from grammar corrections. Highlights the original mistake, the corrected sentence, category tags, and plain explanations.
- **Interactive Practice Triggers**:
  - `🗣 Repeat Correct Sentence`: Repeat corrected phrases to build muscle memory.
  - `❓ Simpler Explanation`: Request simplified breakdowns of tricky rules.
  - `🌐 Translate`: Translate grammar rules into Hindi or your preferred language.
- **End-of-Session Analytics**: Instant summary with speaking time, message exchanges, corrections logged, and XP earned.

### 2. 🧠 Personal Mistake Memory
- Tracks recurring errors across tense, prepositions, articles, word order, and grammar.
- Records occurrence frequency, practice repetitions, and mastery status.
- Re-tests weak areas naturally in subsequent tutor prompts and recommended exercises.

### 3. 📚 Chapter-Based Curriculum (CEFR A1 to B2)
- **A1 Beginner**: Greetings, Verb to be, Sentence construction (SVO), Articles, Present Simple, Questions & Negatives.
- **A2 Elementary**: Past Simple (regular & irregular), Future plans (going to vs will), Prepositions (in/on/at), Comparisons.
- **B1 Intermediate**: Present Perfect vs Past Simple, Modal Verbs, Conditionals, Diplomatic opinions.
- **B2 Upper Intermediate**: Natural collocations, Presentation signposting, and Executive fluency.
- Each chapter contains **Theory & Golden Rules**, **Practical Context Examples with Audio**, **Vocabulary Cards with Hindi Meanings**, and an **Assessment Quiz**.

### 4. 🎯 Reusable Quiz Engine (9 Question Types)
- Multiple-choice questions (MCQ)
- Fill-in-the-blank exercises
- Sentence correction
- Interactive word ordering (word bank tap-to-assemble)
- Pair matching
- Listening comprehension (audio playback via TTS)
- Reading comprehension (passage analysis)
- Translation practice
- Situational conversation choices

### 5. 🎭 10 Real-Life Roleplay Scenarios
- Introducing Yourself at an Event
- Meeting a Friend at a Café
- Ordering at a Restaurant
- Asking for Directions
- Shopping & Inquiring About Sizes
- 1-on-1 Sync with Your Manager
- Attending a Job Interview
- Answering HR Behavioral Questions (STAR Method)
- Participating in an Office Meeting
- Delivering an Executive Business Presentation

### 6. 🗂 Spaced-Repetition Vocabulary System
- Flip-to-reveal flashcards with definitions, Hindi translations, and audio pronunciation.
- Confidence rating buttons: **Hard** (12h), **Good** (2–3d), and **Easy** (5d) that dynamically adjust review intervals.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Celebration Effects**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Audio & Speech**: Web Audio API (gentle procedural feedback), Web Speech Recognition & SpeechSynthesis APIs
- **AI Backend**: Dual-Engine (Gemini 2.5 Flash client + offline intelligent pedagogical rule engine)

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/imskygupta/english-app.git
cd english-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in Google Chrome or Microsoft Edge.

### 4. Build for production
```bash
npm run build
```

---

## 🔑 Optional Gemini API Key
FluentMate is 100% functional out of the box with an intelligent built-in pedagogical rule engine. If you would like live generative reasoning from Google Gemini:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).
2. Open **Profile & Settings** inside FluentMate and paste your API key, or create a `.env` file:
   ```env
   VITE_GEMINI_API_KEY=your_key_here
   ```
*Keys are stored securely in your browser's local storage and never exposed.*

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

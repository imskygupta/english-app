import type { RoleplayScenario } from '../types/tutor';

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'rp_intro',
    title: 'Introducing Yourself at an Event',
    category: 'social',
    level: 'A1',
    difficulty: 'Beginner',
    icon: 'HandMetal',
    goal: 'Introduce your name, where you are from, and what brings you to the community mixer.',
    tutorRole: 'Friendly event organizer named Liam welcoming newcomers',
    userRole: 'A curious newcomer attending your first English community event',
    initialPrompt: "Hi there! Welcome to our English Language Meetup! I'm Liam, one of the coordinators. What's your name, and where are you joining us from?",
    contextDescription: 'You are at a relaxed community café for language learners in Mumbai. Liam is smiling with a name badge.',
    suggestedPhrases: [
      "Hello Liam! My name is...",
      "I am from...",
      "I came here to practice speaking English with new people."
    ]
  },
  {
    id: 'rp_friend',
    title: 'Meeting a New Friend at a Café',
    category: 'social',
    level: 'A1',
    difficulty: 'Beginner',
    icon: 'Coffee',
    goal: 'Chat about weekend hobbies, favorite music, and exchange contact details.',
    tutorRole: 'Emma, a college student reading a book at the next table',
    userRole: 'A friendly student or professional at the local coffee shop',
    initialPrompt: "Excuse me, do you mind if I plug my charger in near your table? By the way, are you reading that novel for a class, or just for fun?",
    contextDescription: 'A cozy coffee shop with soft jazz music playing in the background.',
    suggestedPhrases: [
      "No, go right ahead!",
      "I usually enjoy reading...",
      "What kind of music or hobbies do you enjoy on weekends?"
    ]
  },
  {
    id: 'rp_restaurant',
    title: 'Ordering at a Restaurant',
    category: 'daily',
    level: 'A2',
    difficulty: 'Beginner',
    icon: 'Utensils',
    goal: 'Order food and beverages, request dietary accommodations, and ask for the bill.',
    tutorRole: 'Marco, an attentive Italian bistro waiter in London',
    userRole: 'A diner enjoying an evening meal',
    initialPrompt: "Good evening! Welcome to Bistro Romano. Can I start you off with something sparkling to drink, or would you like to hear today's chef specials?",
    contextDescription: 'Warm candle-lit bistro with aromas of garlic, fresh basil, and espresso.',
    suggestedPhrases: [
      "Could I please see the vegetarian options?",
      "I would like to order...",
      "Could we please get the check when you have a moment?"
    ]
  },
  {
    id: 'rp_directions',
    title: 'Asking for Directions in a New City',
    category: 'travel',
    level: 'A2',
    difficulty: 'Beginner',
    icon: 'Compass',
    goal: 'Ask how to reach the nearest metro station or landmark and clarify walking distance.',
    tutorRole: 'A helpful local commuter on the street in New York',
    userRole: 'A tourist exploring the city whose phone battery just died',
    initialPrompt: "Hey! You look a bit lost with that paper map. Are you trying to find the subway station or Central Park?",
    contextDescription: 'Busy street corner with yellow taxis passing by and pedestrians walking past.',
    suggestedPhrases: [
      "Excuse me! Could you please tell me how to get to...",
      "Is it within walking distance from here?",
      "How many blocks should I walk before turning left?"
    ]
  },
  {
    id: 'rp_shopping',
    title: 'Shopping & Asking for Discounts/Sizes',
    category: 'daily',
    level: 'A2',
    difficulty: 'Beginner',
    icon: 'ShoppingBag',
    goal: 'Inquire about clothing sizes, trial rooms, exchange policies, and payment methods.',
    tutorRole: 'Sophie, a customer service associate at a modern clothing boutique',
    userRole: 'A shopper looking for a jacket for an upcoming trip',
    initialPrompt: "Hello! Welcome to Urban Wardrobe. Are you looking for anything specific today, or just browsing our new autumn collection?",
    contextDescription: 'Bright boutique with organized racks of sweaters, jackets, and accessories.',
    suggestedPhrases: [
      "Do you have this jacket in a medium size?",
      "Where are the fitting rooms located?",
      "Can I pay with credit card or digital wallet?"
    ]
  },
  {
    id: 'rp_manager',
    title: 'Speaking to Your Manager',
    category: 'work',
    level: 'B1',
    difficulty: 'Intermediate',
    icon: 'Briefcase',
    goal: 'Update your manager on project deliverables, address a roadblock, and request feedback.',
    tutorRole: 'Sarah, an encouraging engineering director during a 1-on-1 check-in',
    userRole: 'A software engineer or analyst reporting on current sprint progress',
    initialPrompt: "Hey! Thanks for jumping on our weekly 1-on-1. How did the client demo go yesterday, and what are your main priorities for the rest of this sprint?",
    contextDescription: 'Quiet video conference call during a weekly sync.',
    suggestedPhrases: [
      "The client demo went very smoothly, but we encountered a slight delay with...",
      "I would love to get your input on how to prioritize...",
      "Could we review the timeline for next week's release?"
    ]
  },
  {
    id: 'rp_interview',
    title: 'Attending a Job Interview',
    category: 'work',
    level: 'B1',
    difficulty: 'Intermediate',
    icon: 'UserCheck',
    goal: 'Deliver a concise "Tell me about yourself", highlight your strengths, and answer behavioral questions.',
    tutorRole: 'David Thorne, Senior Hiring Manager at a global tech consultancy',
    userRole: 'A passionate job candidate interviewing for a key team role',
    initialPrompt: "Good morning! It's great to connect with you. We were very impressed by your background. To kick things off, could you walk me through your professional journey and what drew you to this role?",
    contextDescription: 'Formal boardroom interview setting with a panel of senior leaders.',
    suggestedPhrases: [
      "Thank you for having me today. Over the past few years, I have specialized in...",
      "One of my core strengths is communicating complex ideas clearly...",
      "In my previous role, I successfully led..."
    ]
  },
  {
    id: 'rp_hr_questions',
    title: 'Answering HR & Behavioral Questions',
    category: 'work',
    level: 'B1',
    difficulty: 'Intermediate',
    icon: 'HelpCircle',
    goal: 'Answer behavioral prompts using the STAR method (Situation, Task, Action, Result).',
    tutorRole: 'Elena, Human Resources Partner evaluating culture fit and teamwork',
    userRole: 'A candidate being interviewed for workplace collaboration skills',
    initialPrompt: "Welcome! Today we want to understand how you handle challenging workplace scenarios. Could you describe a time when you had a disagreement with a teammate and how you resolved it?",
    contextDescription: 'Friendly HR screening interview focused on communication and adaptability.',
    suggestedPhrases: [
      "In my previous team, we faced a situation where...",
      "To resolve this, I scheduled a private call so we could align on...",
      "As a result, we delivered the project two days ahead of schedule."
    ]
  },
  {
    id: 'rp_meeting',
    title: 'Participating in an Office Meeting',
    category: 'work',
    level: 'B2',
    difficulty: 'Intermediate',
    icon: 'Users',
    goal: 'Share project updates, ask clarifying questions, and diplomatically disagree.',
    tutorRole: 'Alex, the product lead facilitating a cross-functional strategy sync',
    userRole: 'A core team contributor presenting insights to cross-functional peers',
    initialPrompt: "Alright everyone, thanks for joining the Q4 roadmap sync. We are debating whether to launch the mobile app feature first or overhaul the desktop dashboard. What does the team think?",
    contextDescription: 'Virtual boardroom meeting with 6 team members present.',
    suggestedPhrases: [
      "From my perspective, prioritizing the mobile experience gives us higher user retention...",
      "I see your point regarding desktop users, however...",
      "Could we look at the analytics before making a final commitment?"
    ]
  },
  {
    id: 'rp_presentation',
    title: 'Giving a Short Business Presentation',
    category: 'work',
    level: 'B2',
    difficulty: 'Advanced',
    icon: 'Presentation',
    goal: 'Deliver an executive summary, explain data trends, and handle spontaneous stakeholder questions.',
    tutorRole: 'Executive stakeholder asking sharp, clarifying questions on ROI and timeline',
    userRole: 'The lead presenter walking executive leadership through a major initiative',
    initialPrompt: "Good afternoon. We have 15 minutes before the board meeting. Whenever you're ready, please walk us through the executive summary and your recommended next steps.",
    contextDescription: 'Executive boardroom presentation screen with key charts and metrics displayed.',
    suggestedPhrases: [
      "To kick off our presentation today, let us examine our primary objective...",
      "As illustrated on this slide, our user engagement has risen by 28%...",
      "In conclusion, the key takeaway is that investing early will yield substantial long-term benefits."
    ]
  }
];

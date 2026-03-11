// ─────────────────────────────────────────────────────────────
//  Ash App Screen Descriptions (Static Knowledge Base)
// ─────────────────────────────────────────────────────────────

export interface AppScreen {
  id: string;
  name: string;
  description: string;
  uiElements: string[];
  copy: Record<string, string>;
  designIntent: string;
  nextScreens: string[];
}

export const FIRST_SCREEN_ID = 'welcome';

export const APP_SCREENS: AppScreen[] = [
  {
    id: 'welcome',
    name: 'Welcome',
    description:
      'A warm, minimal onboarding screen with a soft gradient background (lavender to white). ' +
      'The Ash logo sits centered at the top — a simple, rounded flame icon in muted purple. ' +
      'Below it, a large heading reads "Hi, I\'m Ash." followed by a subtitle. ' +
      'Two buttons at the bottom: a primary "Get Started" button and a smaller "I already have an account" link. ' +
      'The overall feel is calm and inviting, with generous whitespace.',
    uiElements: [
      'Ash logo (flame icon)',
      '"Get Started" button (primary, rounded, purple)',
      '"I already have an account" text link',
      'Background gradient animation (subtle breathing effect)',
    ],
    copy: {
      heading: "Hi, I'm Ash.",
      subtitle: 'A safe space to reflect, talk, and feel heard. No judgment, no pressure — just you.',
      primaryButton: 'Get Started',
      secondaryLink: 'I already have an account',
    },
    designIntent:
      'Create an immediate sense of safety and warmth. The minimal UI reduces cognitive load. ' +
      'The personified name "Ash" establishes the AI as a companion rather than a tool.',
    nextScreens: ['persona-picker'],
  },

  {
    id: 'persona-picker',
    name: 'Persona Picker',
    description:
      'A selection screen showing 4 AI companion "styles" as illustrated cards in a 2x2 grid. ' +
      'Each card has a unique illustration (abstract, not human faces), a name, and a short tagline. ' +
      'The cards are: "Ember" (warm & nurturing), "Sage" (calm & wise), "Spark" (energetic & motivating), ' +
      'and "River" (gentle & reflective). Each card has a subtle colored border matching its personality. ' +
      'A "Not sure? Let Ash pick for you" link sits below the grid. ' +
      'Header text asks "Who would you like to talk with?"',
    uiElements: [
      'Ember card — warm orange border, sun illustration',
      'Sage card — deep green border, tree illustration',
      'Spark card — bright yellow border, lightning illustration',
      'River card — soft blue border, wave illustration',
      '"Not sure? Let Ash pick for you" link',
      'Back arrow (top-left)',
    ],
    copy: {
      heading: 'Who would you like to talk with?',
      subtitle: 'Each companion has a different style. You can always switch later.',
      ember: 'Ember — Warm & nurturing. Like talking to your favorite person.',
      sage: 'Sage — Calm & wise. Thoughtful questions, no rush.',
      spark: 'Spark — Energetic & motivating. Helps you take action.',
      river: 'River — Gentle & reflective. Sits with you in silence too.',
      fallbackLink: 'Not sure? Let Ash pick for you',
    },
    designIntent:
      'Give users agency over their experience while avoiding clinical language. ' +
      'The persona metaphor makes AI interaction feel personal. ' +
      'The fallback option reduces decision paralysis for overwhelmed users.',
    nextScreens: ['topic-selector'],
  },

  {
    id: 'topic-selector',
    name: 'Topic Selector',
    description:
      'A screen with a friendly header and a scrollable list of rounded "topic pills" that users can tap to select. ' +
      'Topics include: "Stress & anxiety", "Sleep", "Relationships", "Self-worth", "Work/school pressure", ' +
      '"Grief & loss", "Just want to talk", and "Something else". ' +
      'Users can select multiple topics — selected pills get a filled background with a checkmark. ' +
      'A "Continue" button at the bottom becomes active after at least one selection. ' +
      'Small text below reads "You can change these anytime in settings."',
    uiElements: [
      'Topic pills (8 options, multi-select with checkmarks)',
      '"Continue" button (disabled until selection, then purple)',
      '"You can change these anytime" helper text',
      'Back arrow (top-left)',
      'Progress indicator (step 2 of 3, subtle dots)',
    ],
    copy: {
      heading: "What's on your mind lately?",
      subtitle: 'Pick as many as you like. This helps Ash understand where to start.',
      topics: 'Stress & anxiety, Sleep, Relationships, Self-worth, Work/school pressure, Grief & loss, Just want to talk, Something else',
      continueButton: 'Continue',
      helperText: 'You can change these anytime in settings.',
    },
    designIntent:
      'Lightweight intake that respects user privacy. Multi-select reduces pressure to pick "the right one." ' +
      '"Just want to talk" and "Something else" provide escape hatches for users who resist categorization.',
    nextScreens: ['first-chat'],
  },

  {
    id: 'first-chat',
    name: 'First Chat',
    description:
      'A chat interface with the selected companion. The screen opens with the companion\'s first message already visible ' +
      'in a speech bubble: a warm, personalized greeting based on the topics selected. ' +
      'The companion\'s small avatar icon sits next to its message. ' +
      'The text input bar at the bottom has placeholder text "Type anything..." with a send button. ' +
      'Above the chat, a small banner reads "This is a safe space. Nothing leaves this app." ' +
      'The keyboard is not auto-opened — the user must tap the input to start typing.',
    uiElements: [
      'Companion message bubble (left-aligned, with avatar)',
      'Text input field with "Type anything..." placeholder',
      'Send button (arrow icon, purple)',
      'Privacy banner ("This is a safe space...")',
      'Companion avatar (small, matches selected persona)',
      'Back arrow (top-left)',
    ],
    copy: {
      privacyBanner: 'This is a safe space. Nothing leaves this app.',
      companionGreeting: "Hey — thanks for being here. I know it takes courage to try something new. What's been weighing on you?",
      inputPlaceholder: 'Type anything...',
    },
    designIntent:
      'First interaction should feel human and low-pressure. The companion speaks first to model vulnerability. ' +
      'Privacy banner addresses trust concerns immediately. Not auto-opening the keyboard ' +
      'gives the user a moment to read before feeling pressured to respond.',
    nextScreens: ['dashboard'],
  },

  {
    id: 'dashboard',
    name: 'Dashboard',
    description:
      'The home screen after onboarding. Top section shows a gentle greeting with time-of-day context ' +
      '("Good evening, friend"). Below that, a "Continue conversation" card shows a preview of the last chat. ' +
      'A "Daily check-in" card with a simple mood selector (5 emoji faces from sad to happy) sits in the middle. ' +
      'Bottom section has quick-access cards: "Journal", "Breathing exercise", "Talk to Ash". ' +
      'A bottom navigation bar has 3 tabs: Home (active), History, Settings. ' +
      'The overall layout is clean with card-based sections and warm colors.',
    uiElements: [
      'Greeting text (time-of-day aware)',
      '"Continue conversation" card with chat preview',
      'Daily check-in mood selector (5 emoji faces)',
      '"Journal" quick-access card',
      '"Breathing exercise" quick-access card',
      '"Talk to Ash" quick-access card',
      'Bottom nav: Home, History, Settings',
    ],
    copy: {
      greeting: 'Good evening, friend.',
      continueCard: 'Pick up where you left off',
      checkInPrompt: 'How are you feeling right now?',
      journalCard: 'Journal — Write your thoughts',
      breathingCard: 'Breathing Exercise — 2 min calm',
      talkCard: 'Talk to Ash — Start a new conversation',
    },
    designIntent:
      'Low-friction re-engagement. The "continue conversation" card reduces the cold-start problem. ' +
      'Daily check-in creates a micro-habit. Quick-access cards offer multiple entry points ' +
      'so users with different needs can find value immediately.',
    nextScreens: [],
  },
];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
export function getScreen(id: string): AppScreen | undefined {
  return APP_SCREENS.find((s) => s.id === id);
}

export function getNextScreens(currentId: string): AppScreen[] {
  const current = getScreen(currentId);
  if (!current) return [];
  return current.nextScreens
    .map((id) => getScreen(id))
    .filter((s): s is AppScreen => s !== undefined);
}

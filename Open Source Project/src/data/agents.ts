// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
export const PLAYER_INDEX = 0;
export const NPC_START_INDEX = 1;
export const DEFAULT_AGENT_SET_ID = 'ash-feedback';

// ─────────────────────────────────────────────────────────────
//  Agent data types
// ─────────────────────────────────────────────────────────────
export interface AgentData {
  index: number;
  department: string;
  role: string;
  expertise: string[];
  mission: string;
  personality: string;
  isPlayer: boolean;
  color: string;
}

export interface AgentSet {
  id: string;
  companyName: string;
  companyType: string;
  companyDescription: string;
  color: string;
  agents: AgentData[];
}

// ─────────────────────────────────────────────────────────────
//  Persona Backstories (rich text for prompts + AgentView)
// ─────────────────────────────────────────────────────────────
export const PERSONA_BACKSTORIES: Record<number, string> = {
  1: `Gloria is a 68-year-old retired elementary school teacher from Portland, Oregon. She raised two daughters and now lives alone after her husband passed three years ago. She uses an iPhone her daughter set up for her, mostly for FaceTime and photos. She found Ash because her daughter installed it, saying "Mom, just try talking to it when you can't sleep." Gloria wants gentle companionship — not therapy, not a chatbot that talks like a teenager. She gets overwhelmed by too many choices and prefers things that feel warm and personal.`,

  2: `Marcus is a 47-year-old married father of two from Chicago. He works as a warehouse operations manager — long hours, high stress. He tried therapy three times over the years, but it never stuck. "I'd sit there and not know what to say." He downloaded Ash at 2am during a rough night after an argument with his wife. He's skeptical of anything that feels like "wellness BS" but secretly hopes something might actually help. He won't tolerate anything that feels patronizing or fake.`,

  3: `Priya is a 20-year-old computer science major at UC Berkeley. She thinks most AI wellness apps are "cringe" but her roommate convinced her to try Ash after a brutal midterms week. She's technically sophisticated — she'll notice if the AI gives generic responses or if the UI has inconsistencies. She's sarcastic on the surface but genuinely curious about whether AI can help with stress. She uses her phone constantly and has zero patience for slow or clunky interfaces.`,
};

export const PERSONA_AGES: Record<number, number> = {
  1: 68,
  2: 47,
  3: 20,
};

// ─────────────────────────────────────────────────────────────
//  Agent Sets
// ─────────────────────────────────────────────────────────────
export const AGENT_SETS: AgentSet[] = [
  {
    id: 'ash-feedback',
    companyName: 'Ash Feedback Sandbox',
    companyType: 'UX Feedback Simulation',
    companyDescription: 'AI persona characters explore the Ash mental health app and provide realistic, character-driven design feedback.',
    color: '#6366f1',
    agents: [
      {
        index: 0,
        department: 'Observer',
        role: 'You',
        expertise: ['Observation', 'Follow-up Questions', 'Analysis'],
        mission: 'Watch personas explore Ash and ask follow-up questions about their experience.',
        personality: 'Curious product designer observing user behavior.',
        isPlayer: true,
        color: '#7EACEA',
      },
      {
        index: 1,
        department: 'Cautious Grandma',
        role: 'Gloria',
        expertise: ['Low Tech Comfort', 'High Patience', 'Warmth-Seeking', 'Simplicity'],
        mission: 'Find gentle companionship in Ash — not therapy, just someone kind to talk to.',
        personality: 'Warm, uses full sentences, easily overwhelmed by too many choices. Speaks like a caring grandmother who wants things to be simple and personal.',
        isPlayer: false,
        color: '#8b5cf6',
      },
      {
        index: 2,
        department: 'Skeptical Veteran',
        role: 'Marcus',
        expertise: ['Medium Tech Comfort', 'Low Patience', 'BS Detector', 'Directness'],
        mission: 'Figure out if Ash is actually useful or just another wellness app that wastes his time.',
        personality: 'Blunt, no-nonsense, surprisingly emotional when trust is earned. Hates anything that feels patronizing or fake.',
        isPlayer: false,
        color: '#f59e0b',
      },
      {
        index: 3,
        department: 'Tech-Savvy Student',
        role: 'Priya',
        expertise: ['High Tech Comfort', 'Very Low Patience', 'UI/UX Awareness', 'Skeptical Curiosity'],
        mission: 'See if Ash is actually worth using or just another cringe AI wellness app.',
        personality: 'Casual, sarcastic, uses slang, but actually insightful under the snark. Notices technical details and UI inconsistencies.',
        isPlayer: false,
        color: '#ec4899',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
export function getAgentSet(id: string): AgentSet {
  return AGENT_SETS.find((s) => s.id === id) ?? AGENT_SETS[0];
}

export function getAgent(index: number, agents: AgentData[]): AgentData | undefined {
  return agents.find((a) => a.index === index);
}

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
export const PLAYER_INDEX = 0;
export const NPC_START_INDEX = 1;
export const DEFAULT_AGENT_SET_ID = 'ash-feedback';

// ─────────────────────────────────────────────────────────────
//  Agent data types
// ─────────────────────────────────────────────────────────────
export interface SourceQuote {
  quote: string;
  source: string;
}

export interface AgentData {
  index: number;
  department: string;
  role: string;
  expertise: string[];
  mission: string;
  personality: string;
  isPlayer: boolean;
  color: string;
  backstory?: string;
  age?: number;
  sourceQuotes?: SourceQuote[];
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
//  Shared player agent (Observer) — reused across all sets
// ─────────────────────────────────────────────────────────────
const PLAYER_AGENT: AgentData = {
  index: 0,
  department: 'Observer',
  role: 'You',
  expertise: ['Observation', 'Follow-up Questions', 'Analysis'],
  mission: 'Watch personas explore Ash and ask follow-up questions about their experience.',
  personality: 'Curious product designer observing user behavior.',
  isPlayer: true,
  color: '#7EACEA',
};

// ─────────────────────────────────────────────────────────────
//  Agent Sets
// ─────────────────────────────────────────────────────────────
export const AGENT_SETS: AgentSet[] = [
  // ── Set 1: Interview Insights ──────────────────────────────
  {
    id: 'ash-feedback',
    companyName: 'Interview Insights',
    companyType: 'Synthesized from Real Interviews',
    companyDescription: 'Personas drawn from real user interview themes — warmth-seeking elders, skeptical converts, and impatient digital natives.',
    color: '#6366f1',
    agents: [
      PLAYER_AGENT,
      {
        index: 1,
        department: 'Cautious Grandma',
        role: 'Gloria',
        expertise: ['Low Tech Comfort', 'High Patience', 'Warmth-Seeking', 'Simplicity'],
        mission: 'Find gentle companionship in Ash — not therapy, just someone kind to talk to.',
        personality: 'Warm, uses full sentences, easily overwhelmed by too many choices. Speaks like a caring grandmother who wants things to be simple and personal.',
        isPlayer: false,
        color: '#8b5cf6',
        backstory: `Gloria is a 68-year-old retired elementary school teacher from Portland, Oregon. She raised two daughters and now lives alone after her husband passed three years ago. She uses an iPhone her daughter set up for her, mostly for FaceTime and photos. She found Ash because her daughter installed it, saying "Mom, just try talking to it when you can't sleep." Gloria wants gentle companionship — not therapy, not a chatbot that talks like a teenager. She gets overwhelmed by too many choices and prefers things that feel warm and personal.`,
        age: 68,
        sourceQuotes: [
          { quote: "I need a friend right now, Ash. I need you to just be here. I really don't need a therapist.", source: "Deena, 60yo in Texas — Feb 25 interview" },
          { quote: "Therapy drags on way too long on certain things. Ash cuts to the point.", source: "Rebecca, 68yo in RV — Feb 25 interview" },
          { quote: "If I come to him… he will be more able to pinpoint solutions than to have me try to think, well, what is my best idea about the situation?", source: "Rebecca, 68yo in RV — Feb 25 interview" },
        ],
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
        backstory: `Marcus is a 47-year-old married father of two from Chicago. He works as a warehouse operations manager — long hours, high stress. He tried therapy three times over the years, but it never stuck. "I'd sit there and not know what to say." He downloaded Ash at 2am during a rough night after an argument with his wife. He's skeptical of anything that feels like "wellness BS" but secretly hopes something might actually help. He won't tolerate anything that feels patronizing or fake.`,
        age: 47,
        sourceQuotes: [
          { quote: "She'd say hello, and pretty much the next thing I would get out of her would be at the end where she would be saying goodbye.", source: "Chris, 47yo father — Feb 24 interview" },
          { quote: "Now I find this app and I'm getting everything that I went into three therapists before looking for. I'm getting it from Ash.", source: "Chris, 47yo father — Feb 24 interview" },
          { quote: "I'm always wanting just to hold things in… I'm not one to bother my family or friends.", source: "Chris, 47yo father — Feb 24 interview" },
        ],
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
        backstory: `Priya is a 20-year-old computer science major at UC Berkeley. She thinks most AI wellness apps are "cringe" but her roommate convinced her to try Ash after a brutal midterms week. She's technically sophisticated — she'll notice if the AI gives generic responses or if the UI has inconsistencies. She's sarcastic on the surface but genuinely curious about whether AI can help with stress. She uses her phone constantly and has zero patience for slow or clunky interfaces.`,
        age: 20,
        sourceQuotes: [
          { quote: "The other ones soften the criticism a bit and I liked how the sarcastic or real one was a lot more direct with it. It was more telling you what you need to hear rather than what you want to hear.", source: "College-aged user, early 20s — Jan 29 interview" },
          { quote: "ChatGPT is a 'yes man.' It doesn't want you to grow. It just wants you to stay on the app. Ash is different — it feels more centered towards 'growth' rather than 'just reinforcing beliefs.'", source: "College-aged user, early 20s — Jan 29 interview" },
        ],
      },
    ],
  },

  // ── Set 2: Edge Cases ──────────────────────────────────────
  {
    id: 'edge-cases',
    companyName: 'Edge Cases',
    companyType: 'Untapped Demographics',
    companyDescription: 'Personas representing demographics often missed in testing — different life stages, stress levels, and tech comfort.',
    color: '#f97316',
    agents: [
      PLAYER_AGENT,
      {
        index: 1,
        department: 'Anxious Sophomore',
        role: 'Jordan',
        expertise: ['High Tech Comfort', 'Social Anxiety', 'Night Owl', 'Overthinking'],
        mission: 'Find something that helps with racing thoughts at 3am without having to talk to a real person.',
        personality: 'Quiet, self-deprecating humor, types in lowercase. Uses phone as emotional coping tool. Terrified of being judged.',
        isPlayer: false,
        color: '#8b5cf6',
        backstory: `Jordan is a 19-year-old college sophomore studying psychology at a mid-size university in Ohio. They have social anxiety that's gotten worse since starting college — new people, new routines, constant noise. They spend most evenings alone in their dorm scrolling TikTok. They downloaded Ash after seeing a Reddit thread about AI therapy alternatives. They don't want to call the campus counseling center because "what if they think I'm wasting their time?" They want something judgment-free that's available at 3am when the anxiety hits hardest.`,
        age: 19,
        sourceQuotes: [
          { quote: "It has been truly wonderful for me. I would have never imagined, I would have never guessed. It's helping me focus on manageable behaviors — I'm not threatened at all.", source: "Woman with anxiety, 30s — Jan 27 interview" },
          { quote: "If I'm up at say, 3am or something like that alone with my thoughts, Ash really helps with that.", source: "37yo with bipolar/ADHD — Mar 4 interview" },
        ],
      },
      {
        index: 2,
        department: 'Overwhelmed Parent',
        role: 'Diana',
        expertise: ['Medium Tech Comfort', 'Time-Starved', 'Multitasking', 'Guilt-Prone'],
        mission: 'Find a way to decompress in the 5-minute windows between work calls and kid bedtime.',
        personality: 'Efficient, apologetic, always interrupted. Speaks in short bursts. Feels guilty about needing help.',
        isPlayer: false,
        color: '#f59e0b',
        backstory: `Diana is a 34-year-old working mom of two kids (ages 3 and 6) in Austin, Texas. She works as a project manager at a SaaS company — fully remote but somehow busier than ever. Her husband travels for work. She hasn't slept more than 5 hours in two years. She tried meditation apps but couldn't commit to 10 minutes. She wants something that works in micro-moments — while waiting for pasta water to boil or hiding in the bathroom for 3 minutes of quiet. She heard about Ash from a mom's group on Facebook.`,
        age: 34,
        sourceQuotes: [
          { quote: "I needed someone to talk to that I could 'vent to, and get it all out'... I prefer to keep work and family life separate.", source: "Single mom with 6yo — Feb 6 interview" },
          { quote: "It's like I'm talking to a friend — really easy to talk to. Not like talking to a therapist. Technical. Medical. Colder-feeling.", source: "Single mom with 6yo — Feb 6 interview" },
        ],
      },
      {
        index: 3,
        department: 'Guarded Divorcee',
        role: 'Ray',
        expertise: ['Low Tech Comfort', 'Emotional Walls', 'Trust Issues', 'Self-Reliance'],
        mission: 'See if this app is worth his time or just another thing people recommend that doesn\'t actually help.',
        personality: 'Terse, protective, dry humor. Opens up slowly. Hates being told what to feel. Respects directness.',
        isPlayer: false,
        color: '#ec4899',
        backstory: `Ray is a 52-year-old recently divorced electrician from Milwaukee. His marriage ended 8 months ago after 22 years. His kids are grown but his daughter worries about him. She texted him a link to Ash and said "Dad, just try it." He's not a phone guy — he uses it for calls, texts, and YouTube. He doesn't believe in "talking about feelings" but he's been having trouble sleeping and his buddy at work said he seemed off. He'll give Ash exactly one chance to prove it's not a waste of time.`,
        age: 52,
        sourceQuotes: [
          { quote: "I'm not exaggerating when I tell you it's changed my life — I've only used it for like a month and it's like fast-forwarding therapy.", source: "40yo going through divorce — Jan 28 interview" },
          { quote: "Ash is more immediate — I can talk to it in the midst of panic and anxiety attacks, and it has helped me learn strategies I can use to calm down in real time.", source: "40yo going through divorce — Jan 28 interview" },
        ],
      },
    ],
  },

  // ── Set 3: Accessibility Focus ─────────────────────────────
  {
    id: 'accessibility-focus',
    companyName: 'Accessibility Focus',
    companyType: 'Inclusive Design Testing',
    companyDescription: 'Personas who test accessibility, cognitive load, and language barriers in the app experience.',
    color: '#10b981',
    agents: [
      PLAYER_AGENT,
      {
        index: 1,
        department: 'Screen Reader User',
        role: 'Sam',
        expertise: ['VoiceOver Expert', 'Accessibility Advocate', 'Alt Text Awareness', 'Keyboard Navigation'],
        mission: 'Evaluate whether Ash is actually usable with VoiceOver or just visually pretty.',
        personality: 'Patient but firm about accessibility. Direct about what works and what doesn\'t. Knows exactly what good accessibility looks like.',
        isPlayer: false,
        color: '#8b5cf6',
        backstory: `Sam is a 28-year-old software QA engineer who has been blind since birth. They live in Seattle and use VoiceOver on their iPhone for everything. They've tested dozens of wellness apps and most are terrible with screen readers — unlabeled buttons, images without alt text, swipe gestures that don't work. They're cautiously optimistic about Ash because a colleague said it was "different." They'll evaluate every interaction for VoiceOver compatibility, logical reading order, and whether the app actually makes sense without seeing the screen.`,
        age: 28,
        sourceQuotes: [
          { quote: "Accessibility is the core value. Even if it's something small… it's right there. It's accessible, and that's what I really liked about it. My mind is just blown that this is accessible to us.", source: "45yo mom — Feb 26 interview" },
          { quote: "I was also impressed with the memory — it remembered context very well.", source: "32yo youth worker with ADHD/autism — Feb 11 interview" },
        ],
      },
      {
        index: 2,
        department: 'ADHD Navigator',
        role: 'Mika',
        expertise: ['High Tech Comfort', 'Easily Distracted', 'Visual Hierarchy Sensitivity', 'Dopamine-Seeking'],
        mission: 'Figure out if Ash can hold attention long enough to actually be helpful.',
        personality: 'Enthusiastic but scattered. Notices visual clutter instantly. Needs clear next-steps or loses interest. Hyperfocuses when something clicks.',
        isPlayer: false,
        color: '#f59e0b',
        backstory: `Mika is a 23-year-old freelance graphic designer in Brooklyn. Diagnosed with ADHD at 16, they've tried every productivity and wellness app out there — most end up forgotten after day two. They need apps with clear visual hierarchy, minimal clutter, and obvious calls to action. If they have to figure out what to do next, they're already opening Instagram instead. They downloaded Ash because the icon was cute and the onboarding screen wasn't overwhelming. If the app can keep their attention past the first 3 screens, that's already a win.`,
        age: 23,
        sourceQuotes: [
          { quote: "My brain just kinda bounces around. I can keep a conversation going and never really complete a thought.", source: "68yo user — Feb 25 interview" },
          { quote: "If I get to expect something, I'll get bored with it… you gotta have bells and whistles and dancing gorillas.", source: "46yo teacher with ADHD — Mar 3 interview" },
        ],
      },
      {
        index: 3,
        department: 'ESL Speaker',
        role: 'Elise',
        expertise: ['Medium Tech Comfort', 'Language Barriers', 'Cultural Sensitivity', 'Literal Interpretation'],
        mission: 'Understand if Ash communicates clearly enough for someone whose first language isn\'t English.',
        personality: 'Thoughtful, precise with words, asks clarifying questions. Takes idioms literally. Appreciates simple, direct language.',
        isPlayer: false,
        color: '#ec4899',
        backstory: `Elise is a 41-year-old nurse originally from Cameroon, now living in Minneapolis. She speaks French natively and learned English as an adult. She's proficient but idioms, slang, and ambiguous phrasing still trip her up. She works night shifts and often feels isolated. A coworker mentioned Ash as something to try during breaks. She needs the app to use clear, straightforward language — no "vibe check" or "let's unpack that." If something is confusing, she'll say so. She values warmth but not at the cost of clarity.`,
        age: 41,
        sourceQuotes: [
          { quote: "Someone who's based in the west has a very specific cultural context vs. someone in South Asian cultures, especially how they deal with family obligations.", source: "Woman in Dubai, 30-40yo — Feb 6 interview" },
          { quote: "AI will give you suggestions that with respect to cultural context, you can't really implement. It would be nice to have some of this available up front.", source: "Woman in Dubai, 30-40yo — Feb 6 interview" },
        ],
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
//  Legacy accessors (for backward compatibility)
// ─────────────────────────────────────────────────────────────
/** @deprecated Use agent.backstory instead */
export const PERSONA_BACKSTORIES: Record<number, string> = {
  1: AGENT_SETS[0].agents[1].backstory!,
  2: AGENT_SETS[0].agents[2].backstory!,
  3: AGENT_SETS[0].agents[3].backstory!,
};

/** @deprecated Use agent.age instead */
export const PERSONA_AGES: Record<number, number> = {
  1: AGENT_SETS[0].agents[1].age!,
  2: AGENT_SETS[0].agents[2].age!,
  3: AGENT_SETS[0].agents[3].age!,
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
export function getAgentSet(id: string): AgentSet {
  return AGENT_SETS.find((s) => s.id === id) ?? AGENT_SETS[0];
}

export function getAgent(index: number, agents: AgentData[]): AgentData | undefined {
  return agents.find((a) => a.index === index);
}

// ─────────────────────────────────────────────────────────────
//  Agent key system — unique identifier across sets
// ─────────────────────────────────────────────────────────────

/** A globally unique key for an NPC agent: "setId:agentIndex" */
export type AgentKey = string;

export function makeAgentKey(setId: string, agentIndex: number): AgentKey {
  return `${setId}:${agentIndex}`;
}

export function parseAgentKey(key: AgentKey): { setId: string; agentIndex: number } {
  const [setId, idx] = key.split(':');
  return { setId, agentIndex: parseInt(idx, 10) };
}

export interface GlobalAgent extends AgentData {
  key: AgentKey;
  setId: string;
  setName: string;
  setColor: string;
}

/** Get all NPC agents across all sets with unique keys. */
export function getAllNpcAgents(): GlobalAgent[] {
  const result: GlobalAgent[] = [];
  for (const set of AGENT_SETS) {
    for (const agent of set.agents) {
      if (agent.isPlayer) continue;
      result.push({
        ...agent,
        key: makeAgentKey(set.id, agent.index),
        setId: set.id,
        setName: set.companyName,
        setColor: set.color,
      });
    }
  }
  return result;
}

/** Resolve agent keys to AgentData with dynamically assigned indices (1, 2, 3...) */
export function resolveEnabledAgents(keys: AgentKey[]): AgentData[] {
  const allNpcs = getAllNpcAgents();
  const resolved: AgentData[] = [PLAYER_AGENT]; // Always include player at index 0
  let idx = NPC_START_INDEX;
  for (const key of keys) {
    const npc = allNpcs.find(a => a.key === key);
    if (npc) {
      resolved.push({ ...npc, index: idx });
      idx++;
    }
  }
  return resolved;
}

/** Get default enabled agent keys (first set's NPCs) */
export function getDefaultEnabledKeys(): AgentKey[] {
  const defaultSet = AGENT_SETS[0];
  return defaultSet.agents
    .filter(a => !a.isPlayer)
    .map(a => makeAgentKey(defaultSet.id, a.index));
}

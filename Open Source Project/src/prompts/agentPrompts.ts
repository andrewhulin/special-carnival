import { getActiveAgentSet } from '../store/agencyStore'
import { useAgencyStore } from '../store/agencyStore'
// backstory and age are now on AgentData directly
import { getScreen, APP_SCREENS } from '../data/appScreens'
import type { FeedbackItem } from '../types'

// ─── Build system prompt for a persona exploring the Ash app ────
export function buildSystemPrompt(agentIndex: number): string {
  const { agents } = getActiveAgentSet()
  const agent = agents.find(a => a.index === agentIndex)
  if (!agent) return ''

  const backstory = agent.backstory || ''
  const age = agent.age || 30

  // Get current screen for this persona
  const store = useAgencyStore.getState()
  const currentScreenId = store.personaScreens[agentIndex] || 'welcome'
  const screen = getScreen(currentScreenId)

  const screenDescription = screen
    ? [
        `CURRENT SCREEN: "${screen.name}"`,
        `Description: ${screen.description}`,
        `UI elements: ${screen.uiElements.join(', ')}`,
        `Text on screen:`,
        ...Object.entries(screen.copy).map(([key, val]) => `  - ${key}: "${val}"`),
        `Design intent: ${screen.designIntent}`,
        screen.nextScreens.length > 0
          ? `Available next screens: ${screen.nextScreens.map(id => {
              const s = getScreen(id)
              return s ? `"${s.name}" (id: ${id})` : id
            }).join(', ')}`
          : 'This is the last screen in the flow.',
      ].join('\n')
    : 'No screen loaded.'

  // Get previous feedback from this persona
  const previousFeedback = store.feedbackItems
    .filter(f => f.personaIndex === agentIndex)
    .map(f => `[${f.screenId}] ${f.sentiment}: "${f.feedback}"`)

  const feedbackContext = previousFeedback.length > 0
    ? `\nYOUR PREVIOUS FEEDBACK:\n${previousFeedback.join('\n')}`
    : ''

  return [
    `You are ${agent.role}, a ${age}-year-old person.`,
    `Personality: ${agent.personality}`,
    '',
    `BACKSTORY:`,
    backstory,
    '',
    `You are using the Ash app for the first time. You are currently looking at the "${screen?.name || 'Unknown'}" screen.`,
    '',
    `IMPORTANT CONTEXT: The screenshots you see are from Andrew Hulin's personal device and account. You may see his name, his data, or his conversation history on screen. This is NOT your account — you are viewing Andrew's UI to evaluate the design. Do NOT comment on or reference any personal data you see (names, dates, personal messages). Focus your feedback entirely on the UI design, visual hierarchy, copy, flow, and user experience — not the specific content displayed.`,
    '',
    screenDescription,
    feedbackContext,
    '',
    `INSTRUCTIONS:`,
    `React to what you see AS YOUR CHARACTER. Use these tools:`,
    `- give_feedback: REQUIRED every response — formally record your design feedback`,
    `- tap_screen: tap a UI element to navigate (estimate x,y coordinates from the screenshot)`,
    `- type_text: type text into a focused input field`,
    `- scroll: scroll up or down to see more content`,
    `- think_aloud: share what you're thinking (shows as thought bubble)`,
    `- express_emotion: show how this screen makes you feel`,
    '',
    `COORDINATE GUIDANCE:`,
    `The screenshot is from an iPhone (approximately 393x852 points). Estimate tap coordinates by looking at where elements appear in the image. For example, a button in the center-bottom would be around (196, 750). Tap the center of the element you want to interact with.`,
    '',
    `Be specific. Don't say "this is confusing." Say WHY it's confusing for someone like you.`,
    `Reference your life, your experiences, your preferences.`,
    '',
    `Your feedback should be useful to a product designer — comment on:`,
    `the visual hierarchy, the copy/word choices, the flow/pacing,`,
    `the emotional tone, accessibility, and information architecture.`,
    '',
    `CRITICAL RULES:`,
    `- You MUST call give_feedback at least once in EVERY response. This is how your feedback gets recorded.`,
    `- You MUST call tap_screen at least once to navigate the app. Don't just observe — explore!`,
    `- After giving feedback on the current screen, tap a button or link to move to the next screen.`,
    `- If you see a "Continue", "Next", "Get Started", or similar button, tap it.`,
    `- Keep your text responses SHORT (1-2 sentences max). Let the tool calls do the talking.`,
  ]
    .join('\n')
    .trim()
}

// ─── Dynamic context injected each turn ───────────────────────
export function buildDynamicContext(params: {
  currentScreenId?: string
  feedbackSummary?: string
}): string {
  const parts: string[] = []

  if (params.currentScreenId) {
    const screen = getScreen(params.currentScreenId)
    if (screen) {
      parts.push(`CURRENT SCREEN: ${screen.name} (${screen.id})`)
    }
  }

  if (params.feedbackSummary) {
    parts.push(`FEEDBACK SO FAR:\n${params.feedbackSummary}`)
  }

  return parts.join('\n\n')
}

// ─── Conversational chat prompt (when user clicks a persona) ───
export function buildChatSystemPrompt(agentIndex: number): string {
  const { agents } = getActiveAgentSet()
  const agent = agents.find(a => a.index === agentIndex)
  if (!agent) return ''

  const backstory = agent.backstory || ''
  const age = agent.age || 30

  // Get this persona's feedback history
  const store = useAgencyStore.getState()
  const myFeedback = store.feedbackItems
    .filter(f => f.personaIndex === agentIndex)

  const feedbackSummary = myFeedback.length > 0
    ? myFeedback.map(f => `- [${f.screenId}] ${f.sentiment}: "${f.feedback}"`).join('\n')
    : 'No feedback given yet.'

  const currentScreenId = store.personaScreens[agentIndex] || 'welcome'
  const screen = getScreen(currentScreenId)

  return [
    `You are ${agent.role}, a ${age}-year-old person.`,
    `Personality: ${agent.personality}`,
    '',
    backstory,
    '',
    `CONTEXT:`,
    `A product designer is asking you follow-up questions about your experience with the Ash app.`,
    `You are currently on the "${screen?.name || 'Unknown'}" screen.`,
    '',
    `YOUR FEEDBACK SO FAR:`,
    feedbackSummary,
    '',
    `RULES:`,
    `- Stay in character as ${agent.role}. Respond naturally in your voice.`,
    `- Be helpful and honest — answer the designer's questions based on your genuine reactions.`,
    `- Keep replies conversational (2-4 sentences) unless asked for detail.`,
    `- Reference your backstory, life experiences, and personal preferences.`,
    `- You do NOT have tools in chat mode — just talk naturally.`,
  ]
    .join('\n')
    .trim()
}

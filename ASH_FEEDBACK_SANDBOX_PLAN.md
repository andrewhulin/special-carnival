# Ash Feedback Sandbox — Hackathon Build Plan

> **Goal**: A delightful vertical slice demo at 7pm tonight. AI persona characters explore the Ash app in a 3D sandbox and give realistic, character-driven design feedback.

> **Constraint**: Personal hackathon. Prioritize wow-factor and working end-to-end loop over feature completeness. Every decision below optimizes for demo impact.

---

## The Demo Moment

Picture this: you hit "Start Simulation." Three characters with distinct personalities — a skeptical veteran, a curious grandma, a college student — walk around a 3D space, sit down, and start "using" Ash. Thought bubbles appear: *"Why are there so many persona options? I just want to talk to someone."* The grandma character plays a confused animation. A feedback card appears in the sidebar. You click her and ask "What would make this easier for you?" and she responds in character. That's the demo.

---

## What We Ship Today

### The Core Loop (this is the whole demo)

```
3 hardcoded personas with rich backstories
         │
         ▼
Persona looks at a screen description
(static App Knowledge Base — no live simulator)
         │
         ▼
LLM generates: reaction + feedback + next action
(tool calls: give_feedback, express_emotion, navigate_to_screen)
         │
         ▼
3D character animates the reaction
(uses EXISTING animations: happy, sad, talk, sit, walk, look_around)
         │
         ▼
Feedback appears in the UI panel
         │
         ▼
Click character → chat with them in their persona voice
(EXISTING chat system, just new prompts)
```

### What We're NOT Building Today

- ❌ New 3D environment (keep the office — it works, it's charming)
- ❌ New character animations (existing happy/sad/talk/sit/look_around are enough)
- ❌ Simulator integration (no Flutter Inspector MCP, no iOS Simulator MCP today)
- ❌ Notion live API integration (pre-bake interview data into the code)
- ❌ Feedback Board component (repurpose the existing Kanban with light relabeling)
- ❌ Persona generation UI (hardcode 3 great personas + 1 speculative slot)
- ❌ Export, synthesis, multi-provider support
- ❌ New LLM provider (use Gemini if it's already working — swap to Claude later)

---

## Tool Recommendations (for today + future)

### For the Hackathon: Use What Already Works

**Keep Gemini API** — it's already wired up and functional. Swapping LLM providers is invisible to the demo audience and costs build time. The magic is in the prompts and personas, not the model brand.

**No simulator MCPs today** — integrating Flutter Inspector MCP or iOS Simulator MCP is a full workstream. Instead, describe 4-5 Ash screens as structured text in a static `appScreens.ts` file. The personas "see" the screen description and react to it. This is faster, more reliable, and still produces great feedback.

**Tools you already have that help today:**
- **Notion MCP** (already connected) — use it to quickly pull interview descriptions and themes into your persona definitions, then hardcode them. Don't build live Notion integration.
- **Figma MCP** (already connected) — if you have Ash screens in Figma, pull screenshots to show in the "App Screen Viewer" area of the demo. Even a static image of the screen next to the 3D view adds a lot of demo polish.

### Post-Hackathon Tool Roadmap

Once the demo is done and you want to make this real, here's the tool integration order:

| Priority | Tool | What It Unlocks |
|---|---|---|
| 1st | **Anthropic Claude Provider** | Better character voice, nuanced design feedback |
| 2nd | **[Flutter Inspector MCP](https://glama.ai/mcp/servers/@Arenukvern/mcp_flutter)** | Live widget tree + semantics from running Ash app. Personas can "see" actual UI structure, labels, layout. Connect to `flutter run` debug session. |
| 3rd | **[iOS Simulator MCP (IDB)](https://github.com/InditexTech/mcp-server-simulator-ios-idb)** | Physical interaction — tap, swipe, type on the simulator. Screenshots of actual rendered screens. |
| 4th | **Notion API** (live integration) | Pull interview data on-demand for persona generation |
| 5th | **[Dart MCP Server](https://github.com/dart-lang/ai/tree/main/pkgs/dart_mcp_server)** | Hot reload, test execution, error detection from within the sandbox |

The Flutter Inspector + iOS Simulator combo is the killer feature for v2: personas can look at the real screen via screenshot, read the real widget tree for accessibility feedback, and physically tap through flows. But it's a Phase 2 investment.

---

## Build Order (for Claude Code)

### Step 1: Personas (~45 min)
> Replace the agent team with 3 persona characters.

**Files to modify:**
- `src/data/agents.ts` → Replace agent sets with persona data
- `src/types.ts` → Add PersonaCharacter type

Create 3 personas pre-baked from the Notion interview data:

```typescript
// Persona 1: "Gloria" — The Cautious Grandma
// Derived from: interview themes around Warmth/gentleness, Pacing feedback
// Age 68, retired teacher, low tech comfort, high patience
// Found Ash through her daughter. Wants gentle companionship, not therapy.
// Voice: warm, uses full sentences, easily overwhelmed by too many choices.

// Persona 2: "Marcus" — The Skeptical Veteran
// Derived from: interview themes around AI skeptic converted, Crisis support
// Age 47, married father, medium tech comfort, low patience for "wellness BS"
// Tried therapy 3 times, it never stuck. Downloaded Ash at 2am during a rough night.
// Voice: blunt, no-nonsense, surprisingly emotional when trust is earned.

// Persona 3: "Priya" — The Speculative College Student
// NOT from interviews — this is the speculative persona for the demo
// Age 20, CS major, high tech comfort, very low patience
// Thinks AI wellness is "cringe" but her roommate convinced her to try it.
// Voice: casual, sarcastic, uses slang, but actually insightful under the snark.
```

Each persona maps to an existing NPC character index (1, 2, 3). Keep index 0 as the player (you).

### Step 2: App Knowledge Base (~30 min)
> Create a static description of 4-5 Ash screens that personas will "navigate."

**New file:** `src/data/appScreens.ts`

```typescript
interface AppScreen {
  id: string;
  name: string;
  description: string;        // What the screen looks like, what's on it
  uiElements: string[];       // Tappable/interactive elements
  copy: Record<string, string>; // Key text on the screen
  designIntent: string;       // What this screen is supposed to accomplish
  nextScreens: string[];      // Where you can go from here
}

// Describe 4-5 screens:
// 1. Welcome / First Open
// 2. Persona Picker (choose your AI companion style)
// 3. Topic Selector
// 4. First Chat Message
// 5. Home / Dashboard
```

You know your app best — fill these in with real copy and real UI descriptions. The richer the descriptions, the better the persona feedback will be.

### Step 3: Prompts (~45 min)
> Rewrite the prompt system so agents behave as persona characters exploring an app.

**File to modify:** `src/prompts/agentPrompts.ts`

The system prompt needs to:
1. Establish the persona's full identity (backstory, personality, attitudes)
2. Tell them they're exploring the Ash app for the first time
3. Tell them to react authentically — notice design choices, get confused, get delighted
4. Tell them to give feedback that would be useful to a UI/product designer
5. Give them the current screen description from the App Knowledge Base

```
You are {name}, a {age}-year-old {occupation} from {location}.

{backstory}

You are using the Ash app for the first time. You're currently looking at
the "{screenName}" screen. Here's what you see:

{screenDescription}

UI elements on this screen: {uiElements}
Text on the screen: {copy}

React to what you see AS YOUR CHARACTER. Use the tools to:
- express_emotion: show how this screen makes you feel
- give_feedback: share your honest opinion as {name}
- navigate_to_screen: move to the next screen when you're ready
- think_aloud: share what you're thinking (shows as thought bubble)

Be specific. Don't say "this is confusing." Say WHY it's confusing
for someone like you. Reference your life, your experiences, your preferences.

Your feedback should be useful to a product designer — comment on:
the visual hierarchy, the copy/word choices, the flow/pacing,
the emotional tone, accessibility, and information architecture.
```

### Step 4: Tools (~30 min)
> Replace the project-management tools with feedback tools.

**File to modify:** `src/services/llm/toolDefinitions.ts`

Slim it down to just 4 tools for the hackathon:

```typescript
const SANDBOX_TOOLS = [
  {
    name: "give_feedback",
    description: "Share your honest reaction to what you see on the current screen",
    parameters: {
      feedback: "string — your feedback in your own voice and words",
      sentiment: "positive | confused | frustrated | delighted | neutral",
      about: "string — what specifically you're reacting to"
    }
  },
  {
    name: "express_emotion",
    description: "Show how you're feeling right now",
    parameters: {
      emotion: "confused | delighted | frustrated | happy | skeptical",
      trigger: "string — what made you feel this way"
    }
  },
  {
    name: "think_aloud",
    description: "Share what you're thinking as a thought bubble",
    parameters: {
      thought: "string — your internal monologue"
    }
  },
  {
    name: "navigate_to_screen",
    description: "Move to the next screen in the app",
    parameters: {
      screen_id: "string — which screen to go to",
      reason: "string — why you're going there"
    }
  }
];
```

### Step 5: Tool Handlers + Simulation Loop (~1.5 hrs)
> Wire up the tools to the 3D world and state.

**Files to modify:**
- `src/services/toolHandlerService.ts` — New handlers for each tool
- `src/services/agencyService.ts` — New simulation orchestration loop
- `src/hooks/useAgencyOrchestrator.ts` — New dispatch logic

**Tool → 3D mapping (use existing animations!):**

| Tool Call | 3D Reaction | Existing Animation |
|---|---|---|
| `express_emotion(confused)` | Character plays look_around | `look_around` |
| `express_emotion(delighted)` | Character plays happy | `happy` |
| `express_emotion(frustrated)` | Character plays sad | `sad` |
| `give_feedback(...)` | Character plays talk, speech bubble appears | `talk` |
| `think_aloud(...)` | Character plays look_around, thought bubble appears | `look_around` |
| `navigate_to_screen(...)` | Character walks to a different POI | `walk` → `sit_idle` |

**Simulation loop** (replaces the project-brief orchestration):

```
1. User clicks persona → "Start Testing"
2. Persona is placed at screen 1 (Welcome)
3. Call LLM with persona prompt + screen description + tools
4. Process tool calls:
   - express_emotion → trigger animation + show emoji in overlay
   - think_aloud → show thought bubble on character
   - give_feedback → show speech bubble + add to feedback panel
   - navigate_to_screen → walk character to new POI, load next screen, loop back to step 3
5. After 4-5 screens, persona gives final impression
```

### Step 6: UI Relabeling (~30 min)
> Light touches to make it feel like a feedback sandbox, not a project office.

**Files to modify:**
- `src/components/Header.tsx` — Change title to "Ash Feedback Sandbox"
- `src/components/AgentView.tsx` — Show persona backstory + current screen instead of expertise/mission
- `src/components/InspectorPanel.tsx` — Rename tabs, show feedback history
- `src/components/KanbanPanel.tsx` — Relabel columns: instead of task status, use screen names. Each card = a piece of feedback with sentiment emoji.
- `src/components/UIOverlay.tsx` — Change bubble icons: show sentiment emojis instead of status sirens

**Don't rebuild these components.** Just change labels, colors, and what data they display.

### Step 7: Polish for Demo (~1 hr buffer)
> The stuff that makes the demo sparkle.

- [ ] Pre-generate 3 personas so they're ready to go at demo time (no loading wait)
- [ ] Make sure the first persona auto-starts on app load (no clicking through setup)
- [ ] Test the chat-with-persona flow — click Gloria, ask "what would help?" and get an in-character answer
- [ ] If time: add the speculative persona prompt — type "college student who thinks AI wellness is cringe" and a 4th character appears
- [ ] If time: show a Figma screenshot of the actual Ash screen in the Inspector panel while the persona reacts to it

---

## Demo Script (for 7pm)

1. **Open**: "What if your user research participants could come alive and use your app?"
2. **Show**: The 3D sandbox with 3 characters idle in the office space
3. **Start**: Hit start — Gloria (the grandma) walks to a desk, sits down, starts "using" Ash
4. **React**: She looks confused at the persona picker. Thought bubble: *"What are all these choices? I just want someone kind."*
5. **Feedback**: Speech bubble with design feedback. Card appears in the sidebar.
6. **Navigate**: She moves to the next screen. Different reaction.
7. **Contrast**: Start Marcus (the veteran). He reacts completely differently to the same screens. *"Just let me talk. I don't need to pick a personality."*
8. **Chat**: Click Gloria, ask her a follow-up question. She responds in character.
9. **Speculative** (if built): Type "college student" — Priya appears and gives a totally different perspective.
10. **Close**: "Every character is seeded from our real user interviews. And we can create speculative personas for users we haven't talked to yet."

---

## File Summary — What Gets Modified

| File | Change | Effort |
|---|---|---|
| `src/data/agents.ts` | Replace agent sets with persona characters | Medium |
| `src/types.ts` | Add PersonaCharacter, AppScreen, FeedbackItem types | Small |
| `src/data/appScreens.ts` | **NEW** — 4-5 Ash screen descriptions | Medium |
| `src/prompts/agentPrompts.ts` | Rewrite for persona simulation | Medium |
| `src/services/llm/toolDefinitions.ts` | Replace with 4 feedback tools | Small |
| `src/services/toolHandlerService.ts` | New handlers for feedback tools | Medium |
| `src/services/agencyService.ts` | New simulation loop | Large |
| `src/hooks/useAgencyOrchestrator.ts` | New dispatch logic | Large |
| `src/components/Header.tsx` | Rename | Tiny |
| `src/components/AgentView.tsx` | Show persona info | Small |
| `src/components/InspectorPanel.tsx` | Relabel, show feedback | Small |
| `src/components/KanbanPanel.tsx` | Relabel as feedback board | Small |
| `src/components/UIOverlay.tsx` | Sentiment emojis instead of status | Small |
| `src/store/agencyStore.ts` | Add feedback items array | Small |

**Total: ~14 files. ~6 hours of focused work. Leaves ~2 hours of buffer for debugging and polish.**

---

## Handing This to Claude Code

Copy-paste this into your first Claude Code session:

```
Read ./ASH_FEEDBACK_SANDBOX_PLAN.md — this is the full hackathon build plan.

This is a personal hackathon project. Demo is at 7pm today.
We're building a vertical slice, not a production app.

We're repurposing "The Delegation" (./Open Source Project/) into a
UX feedback sandbox where AI persona characters explore the Ash app
(a Flutter mental health/self-reflection app) and give design feedback.

START WITH STEP 1: Replace the agent definitions in src/data/agents.ts
with 3 persona characters. The persona data is already written in the
plan under "Step 1: Personas." Add the PersonaCharacter type to src/types.ts.

Keep everything else working — the 3D engine, the existing animations,
the Gemini provider. We're only changing the agent data, prompts, tools,
tool handlers, and orchestration loop. Light UI relabeling at the end.

Do NOT build new components, new 3D environments, or new LLM providers.
Use what exists and modify it.
```

---

## Post-Hackathon: What Becomes Real

After tonight, if this demo lands, here's the upgrade path:

1. **Swap to Claude API** — better character consistency and design feedback quality
2. **Flutter Inspector MCP** — personas see the real widget tree from `flutter run`
3. **iOS Simulator MCP** — personas physically tap through the real app
4. **Notion integration** — live persona generation from new interviews
5. **New 3D environment** — cozy testing lab instead of office
6. **Speculative persona builder** — natural language input for on-the-fly persona creation
7. **Cross-persona synthesis** — "3 of 5 personas were confused by the Topics screen"

But tonight? Three characters. Four screens. Real reactions. That's the demo.

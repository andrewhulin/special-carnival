# Ash Feedback Sandbox — Full Implementation Plan

> A playful, game-like environment where AI-generated user personas explore the Ash Flutter app in a 3D sandbox and deliver realistic, character-driven design feedback.

---

## 1. Project Overview

### What We're Building

A repurposed version of [The Delegation](https://github.com/arturitu/the-delegation) — an open-source Three.js + React project that orchestrates embodied AI agents in a 3D space — transformed into a **UX playtesting sandbox** for the Ash mobile app.

Instead of agents collaborating on a project brief, our agents are **simulated users** with distinct backstories, opinions, and behavioral patterns derived from real user interview data. They "use" the Ash app — a Flutter-based mental health and self-reflection app running in the iOS Simulator on macOS — and provide feedback from the perspective of their character, as if a grandma, a college student, or a therapy-skeptic veteran were navigating the app for the first time.

### Why This Matters

- **Real research, amplified**: Persona characters are seeded from actual user interview transcripts (Notion database with 10+ interviews, tagged themes, raw transcripts, and synthesized insights). They aren't generic — they carry the authentic language, frustrations, and desires of real users.
- **Speculative testing**: Create personas that don't exist in your current user base (college students, elderly users, international users) and stress-test the UI against them.
- **Designer-first feedback**: Feedback is tuned for product/UI designers — commenting on flows, copy, pacing, hierarchy, accessibility, and emotional tone rather than generic "I like it / I don't like it."
- **Delightful and legible**: The 3D sandbox makes the feedback process visible, watchable, and fun — you can see characters navigate, react, get confused, and express opinions in real time.
- **Live app integration**: Through Flutter Inspector MCP and iOS Simulator MCP, personas can eventually see and interact with the real running app — reading the actual widget tree, viewing real screenshots, and tapping through real flows.

---

## 2. Source Material Inventory

### 2A. The Delegation (Open Source Project)

**Location**: `./Open Source Project/`
**Tech stack**: Three.js WebGPU, React 19, Zustand, Vite, TypeScript, Tailwind CSS
**License**: MIT (code), CC BY-NC 4.0 (3D assets — personal/educational use OK)

#### Architecture We're Keeping

| Layer | What It Does | Modification Needed |
|---|---|---|
| `Engine.ts` / `SceneManager.ts` | Three.js WebGPU rendering, animation loop, camera | Minimal — retheme the environment |
| `CharacterStateMachine.ts` | Declarative animation states (idle, walk, talk, sit, react) | Add new states: confused, delighted, frustrated, scrolling |
| `NpcAgentDriver.ts` | Per-agent autonomous behavior loop | Major rework — drive behavior from app-usage simulation |
| `PoiManager.ts` | Named world locations agents navigate to | Remap POIs to represent app screens / UI zones |
| `NavMeshManager.ts` / `PathAgent.ts` | A* pathfinding on navmesh | Keep as-is |
| `agencyService.ts` | LLM orchestration — builds prompts, calls model, processes tool calls | Major rework — replace project-brief workflow with app-feedback workflow |
| `toolHandlerService.ts` | Processes LLM function calls into state changes | Replace tools entirely (see Section 5) |
| `toolDefinitions.ts` | JSON schema tool definitions for LLM | Replace with new tool set |
| `LLMFactory.ts` / `GeminiProvider.ts` | LLM provider abstraction | Add Anthropic Claude provider |
| `useStore.ts` / `agencyStore.ts` | Zustand state management | Extend with persona state, feedback log, app-screen state |
| `agents.ts` | Agent team definitions | Replace with persona character definitions |
| `agentPrompts.ts` | System prompt builder | Complete rewrite for persona-driven feedback |
| `UIOverlay.tsx` / `InspectorPanel.tsx` | React HUD and detail panels | Retheme for feedback sandbox UX |
| `KanbanPanel.tsx` | Task board | Replace with Feedback Board |
| `ChatPanel.tsx` | Chat with selected agent | Keep — becomes "talk to this persona" |

#### Architecture We're Replacing

- The "project brief → task proposal → approval → completion" workflow becomes a **"persona generation → app exploration → feedback generation → insight synthesis"** workflow
- The Kanban board becomes a **Feedback Board** organized by screen/flow rather than task status
- The agent "team sets" (Marketing Agency, Game Studio, etc.) become **persona sets** (Real Users, Speculative Users, Stress-Test Edge Cases)

#### Existing Architecture Deep Dive

**Orchestration flow** (`agencyService.ts`):
The agency service is the heart of agent orchestration. `callAgent()` validates the API key, retrieves the LLM provider, builds dynamic context including client brief and task state, applies phase-aware tool filtering, calls the LLM with tools, applies safety filters, updates conversation history, and triggers agent summary updates when conversations get long (>12 messages).

**Tool handler service** (`toolHandlerService.ts`):
Processes LLM-generated function calls and updates state. Currently handles: `propose_task`, `request_client_approval`, `receive_client_approval`, `complete_task`, `propose_subtask`, `notify_client_project_ready`, `update_client_brief`. Each handler transitions task/project state and triggers 3D character behaviors (walk to desk, return from boardroom, wander away, etc.)

**Character state machine** (`CharacterStateMachine.ts`):
Declarative animation management with a `STATE_MAP` defining every animation state with: animation name, expression, loop behavior, duration override, auto-transition target, and interruptibility. Key states include: idle, walk, talk, listen, sit_down (entry), sit_idle (loop), sit_work (loop), look_around, happy, sad, pick, wave.

**NPC Agent Driver** (`NpcAgentDriver.ts`):
Per-agent autonomous behavior controller. Update loop: if chatting → suspend behavior; if phase done → play happy_loop at spawn; if task in_progress → walk to nearest sit_work POI; if task on_hold → walk to spawn and wave; if idle → random actions (40% sit at idle POI, 70% wander to area, 10-20% play reaction animation). The Orchestrator (index 1) never sits, only paces.

**POI System** (`PoiManager.ts`):
Manages named world locations. POI definitions include id, position, quaternion, arrivalState, occupiedBy, and label. POIs are extracted from empty objects in the GLB scene file using naming convention: `poi-<state>-<id>`. Occupancy is managed (occupy/release) to prevent multiple agents at the same location.

**Zustand Stores**:
- `agencyStore.ts` (persisted): Project state (clientBrief, phase, finalOutput), tasks array, action/debug logs, per-agent conversation histories, per-task boardroom histories, UI state flags, selected agent set ID
- `useStore.ts` (local): Selection/hover state, chat state, NPC screen positions (3D→2D projection), LLM config (provider, apiKey, model from localStorage)

**Agency Orchestrator Hook** (`useAgencyOrchestrator.ts`):
React hook coordinating the workflow. Watches for tasks transitioning to 'scheduled', determines single-agent vs multi-agent (boardroom), guards against double-dispatch, manages round-robin boardroom sessions, handles approval flows, and routes player messages to appropriate handlers. When all tasks complete, orchestrator assembles final output.

**Data flow**: User interaction → InputManager/React Components → useStore (Zustand) → SceneManager + useAgencyOrchestrator → AgencyService → LLMFactory/Provider → LLM API → ToolHandlerService → agencyStore (Zustand) → UI Updates + 3D Updates (NpcAgentDriver, State Machine)

### 2B. User Interview Database (Notion)

**Database ID**: `0f3607b9-7286-448b-a037-9d4eb157f670`
**Data source**: `collection://a9cff9a5-99c1-43aa-94f0-fb06b1d80b16`

**Schema fields we'll use for persona generation:**

| Field | Type | Persona Use |
|---|---|---|
| `Name` | title | Real name → anonymized character seed |
| `User Description` | text | Demographics, life context, motivation — primary persona seed |
| `Raw Transcript` | text | Authentic language, opinions, frustrations — voice training |
| `Key Themes` | multi_select | Behavioral tags that shape character opinions |
| `Primary Persona` | select | Which Ash persona they prefer — informs character's relationship to the app |

**What we have**: ~10 interviews with rich descriptions like "47-year-old married father... after three failed therapy experiences" and tagged themes (Warmth/gentleness, Pacing feedback, AI skeptic converted, Crisis support, etc.). At least one full raw transcript with authentic conversational voice.

**Synthesis document**: "Claude's Thoughts on User Interviews" contains 13 high-signal insights already distilled from all interviews — this becomes the persona-generation knowledge base. Key themes include: safety as prerequisite, pacing sensitivity, the trust arc, AI-as-companion vs AI-as-therapist framing, crisis edge cases, and the "gentleness gap" in current mental health apps.

### 2C. Ash Development Environment

**What it is**: A Flutter-based mental health and self-reflection app. The development environment runs in Cursor, and the app is launched via `flutter run` in the terminal, which boots the iOS Simulator on macOS with a simulated iPhone running the app.

**Integration approaches (layered, from simple to advanced):**

1. **Static App Knowledge Base** (simplest): Manually describe screens, flows, UI elements, and copy as structured data. Personas navigate this conceptual representation. Fast to build, fully reliable.

2. **Flutter Inspector MCP** (medium complexity): Connect to the running Flutter debug session to read the live widget tree, semantics (accessibility) tree, render tree, and layout details. Personas "see" the actual UI structure. Also supports screenshot capture and hot reload.

3. **iOS Simulator MCP** (full integration): Physical interaction with the simulator — tap coordinates, swipe, type text, read the OS-level accessibility tree, capture screenshots of what the user actually sees. Combined with Flutter Inspector, this creates a complete loop: see the UI structure from inside + interact with it from outside.

---

## 3. Tool & MCP Recommendations

### Tier 1: Must-Have Tools

**[Flutter Inspector MCP (`mcp_flutter`)](https://glama.ai/mcp/servers/@Arenukvern/mcp_flutter)** — by Arenukvern
Connects to a running Flutter app's debug session. Exposes:
- Full widget tree inspection (layout, parent chains, children)
- Semantics tree (accessibility labels, roles, tappability)
- Render tree and layer tree dumps
- Screenshot capture
- Hot reload capability
- Performance monitoring (widget rebuilds, repaint tracking)
- Platform and brightness overrides for testing
- Time dilation for animation testing

This is the single most valuable tool for this project. The semantics tree means personas can evaluate accessibility. The widget tree means they can understand actual layout structure. Screenshots mean they can "see" what the user sees.

**[iOS Simulator MCP (IDB)](https://github.com/InditexTech/mcp-server-simulator-ios-idb)** — by InditexTech
Uses Facebook's iOS Development Bridge for physical simulator interaction:
- Tap at coordinates
- Swipe and scroll
- Type text
- Read the OS-level accessibility tree
- Capture screenshots
- UI hierarchy inspection

This is the "hands" that let personas physically interact with the app.

**[Dart & Flutter MCP Server](https://github.com/dart-lang/ai/tree/main/pkgs/dart_mcp_server)** — Official Dart team
Access to the running Dart/Flutter process:
- Widget tree inspection
- Error analysis
- Test execution
- Hot reload

### Tier 2: Supporting Tools (Already Connected)

**Figma MCP** — Pull actual Ash design specs and screenshots into the App Knowledge Base. Cross-reference persona feedback against design intent.

**Notion MCP** — Pull interview data for persona generation. Push synthesized feedback back as design research artifacts.

### Tier 3: Nice-to-Have

**[XcodeBuildMCP (Sentry)](https://github.com/getsentry/XcodeBuildMCP)** — Programmatically boot/kill simulators, manage device types (iPhone SE vs iPad for responsive testing), automate build cycles. 59 tools covering simulators, devices, LLDB debugging, and UI automation.

**Apple Native Xcode MCP** (`xcrun mcpbridge`, Xcode 26.3+) — 20 native tools bridging into Xcode's internals via XPC. Tightly integrated but requires latest Xcode.

### How Tools Integrate into the Simulation Loop

```
Persona decides to explore "Onboarding Screen"
       │
       ▼
┌─────────────────────────────────────┐
│  iOS Simulator MCP                   │
│  → Tap/swipe to navigate             │
│  → Capture screenshot of real screen │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  Flutter Inspector MCP               │
│  → Read widget tree (layout)         │
│  → Get semantics tree (a11y labels)  │
│  → Check for errors or rebuilds      │
│  → Detect layout overflow or issues  │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  Persona LLM (Claude/Gemini)         │
│  → Sees screenshot + widget tree     │
│  → Reads a11y labels + layout info   │
│  → Reacts as their character         │
│  → Calls give_feedback()             │
│  → Calls express_emotion()           │
│  → Calls navigate_to_screen()        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│  3D Sandbox (The Delegation engine)  │
│  → Character animates reaction       │
│  → Thought/speech bubble appears     │
│  → Feedback Board updates            │
│  → Persona walks to new POI          │
└─────────────────────────────────────┘
```

---

## 4. System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    NOTION DATABASE                        │
│  User Interviews → descriptions, transcripts, themes     │
└──────────────────────────┬──────────────────────────────┘
                           │ (live Notion API or pre-baked)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 PERSONA GENERATOR                        │
│                                                          │
│  1. Read all interview data from Notion API              │
│  2. Feed to LLM with persona-generation prompt           │
│  3. Output: structured PersonaCharacter objects           │
│     - name, age, backstory, personality traits            │
│     - relationship to therapy / mental health             │
│     - tech comfort level, communication style             │
│     - specific opinions seeded from real interviews       │
│     - "voice" calibrated from transcript language         │
│                                                          │
│  Also supports SPECULATIVE personas:                     │
│     "Create a college student who has never tried         │
│      therapy and is skeptical of AI wellness apps"        │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              APP SCREEN CONTEXT                          │
│  (layered — can use any combination)                     │
│                                                          │
│  Layer 1: Static Knowledge Base                          │
│  - Screen inventory, flow maps, UI copy, elements        │
│  - JSON screen graph that personas traverse              │
│  - Reliable fallback when simulator isn't running         │
│                                                          │
│  Layer 2: Flutter Inspector MCP (live)                   │
│  - Real widget tree from running app                     │
│  - Semantics/accessibility tree                          │
│  - Layout details, rebuild tracking                      │
│                                                          │
│  Layer 3: iOS Simulator MCP (live)                       │
│  - Screenshots of actual rendered screens                │
│  - Physical tap/swipe/type interactions                  │
│  - OS-level accessibility tree                           │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              SIMULATION ENGINE (modified Delegation)      │
│                                                          │
│  3D Space: Characters walk around, sit, emote, react     │
│  LLM Loop: Each persona gets a turn to:                  │
│    1. Look at current screen (via knowledge base + MCP)  │
│    2. Decide what to do (tap, scroll, read, skip)        │
│    3. React emotionally (confused, delighted, frustrated) │
│    4. Give feedback (as their character)                  │
│    5. Navigate to next screen                             │
│                                                          │
│  Tool calls drive state transitions:                      │
│    navigate_to_screen, give_feedback, express_emotion,    │
│    think_aloud, interact_with_element, abandon_flow,      │
│    compare_to_alternative, complete_session                │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              FEEDBACK DASHBOARD                           │
│                                                          │
│  Real-time feedback board (replaces Kanban):              │
│  - Organized by screen / flow                             │
│  - Each card = one piece of feedback from one persona     │
│  - Color-coded by sentiment (positive / neutral / issue)  │
│  - Filterable by persona, screen, theme, severity         │
│                                                          │
│  Inspector panel shows:                                   │
│  - Selected persona's full backstory                      │
│  - Their journey through the app so far                   │
│  - All feedback they've given                             │
│  - Their emotional state over time                        │
│                                                          │
│  Synthesis view:                                          │
│  - Cross-persona patterns ("3 of 5 personas were          │
│    confused by the Topics screen")                        │
│  - Actionable recommendations for the design team         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Persona System Design

### 5A. PersonaCharacter Data Model

```typescript
interface PersonaCharacter {
  // Identity
  id: string;
  name: string;                    // "Gloria", "Marcus", "Priya"
  age: number;
  occupation: string;
  location: string;

  // Visual (maps to 3D character)
  avatarIndex: number;             // Which character model to use
  color: string;                   // Hex color for UI identification

  // Backstory & Psychology
  backstory: string;               // 2-3 paragraph rich backstory
  personalityTraits: string[];     // ["cautious", "warm", "skeptical"]
  communicationStyle: string;      // "direct and no-nonsense" | "gentle, lots of qualifiers"
  emotionalBaseline: string;       // "anxious but hopeful" | "pragmatic and curious"

  // Relationship to Mental Health & Therapy
  therapyHistory: string;          // "tried twice, didn't stick" | "weekly for 3 years"
  mentalHealthAttitude: string;    // "open but private" | "skeptical of labels"
  aiAttitude: string;              // "cautiously optimistic" | "will it judge me?"

  // App Usage Context
  discoveryChannel: string;        // "friend recommendation" | "Facebook ad" | "NYT article"
  primaryNeed: string;             // "crisis support at 2am" | "career processing"
  techComfort: 1 | 2 | 3 | 4 | 5; // 1=struggles, 5=power user

  // Feedback Tendencies (calibrates how they give feedback)
  noticesDesign: boolean;          // Will they comment on visual hierarchy, spacing?
  noticesCopy: boolean;            // Will they react to word choices, tone?
  noticesPacing: boolean;          // Will they comment on conversation rhythm?
  patience: 1 | 2 | 3 | 4 | 5;   // How long before they get frustrated
  verbosity: 1 | 2 | 3 | 4 | 5;  // How much they say when giving feedback

  // Voice (seeded from real transcripts)
  sampleQuotes: string[];          // Calibration quotes in their voice
  vocabularyLevel: string;         // "casual, lots of slang" | "precise, clinical"

  // Source
  sourceType: 'research-based' | 'speculative';
  sourceInterviewIds?: string[];   // Notion page IDs this persona was derived from
}
```

### 5B. Persona Generation Prompt Strategy

**For research-based personas** (derived from real interviews):

```
You are creating a realistic user character for usability testing of Ash,
a mental health and self-reflection app built with Flutter.

This character should be based on the following real user interview data,
but fictionalized — new name, adjusted details, amplified personality traits
to make them a vivid, memorable character.

[inject: User Description, Key Themes, Raw Transcript excerpts,
 synthesis insights relevant to this user's archetype]

Create a character that:
- Feels like a real person, not a marketing persona
- Has specific opinions (not "she likes clean design" but
  "she finds the Topics screen patronizing because it reminds
  her of a dating app she hated")
- Would react differently from other characters in the set
- Carries the authentic voice and language patterns from the transcript
```

**For speculative personas** (imagined user types):

```
You are creating a speculative user character to stress-test Ash's UI
against a user type we haven't studied yet.

Target archetype: [user's input, e.g., "college student who's never
tried therapy and thinks AI wellness is cringe"]

Use these real user research insights as grounding context — the speculative
character should feel as real and specific as these research-derived ones:

[inject: synthesis document highlights, Key Themes list,
 example persona for calibration]

The character should have strong, specific opinions that would surface
design blind spots we haven't considered.
```

### 5C. Preset Persona Sets

| Set Name | Characters | Purpose |
|---|---|---|
| **The Research Five** | 5 characters derived from real interview archetypes: therapy veteran, AI skeptic, crisis user, career processor, therapist-who-recommends | Ground-truth usability feedback |
| **The Stress Test** | 5 speculative edge-case personas: elderly with low vision, non-English-primary speaker, teenager, clinical psychologist evaluating for patients, tech worker with AI fatigue | Accessibility and edge-case discovery |
| **Custom Set** | User-defined via natural language prompt | Answer specific design questions |

---

## 6. New Tool Definitions (replacing The Delegation's tools)

These are the LLM function-calling tools that personas use to "interact" with the app:

```typescript
const SANDBOX_TOOLS = [
  {
    name: "navigate_to_screen",
    description: "Move to a specific screen in the Ash app",
    parameters: {
      screen_id: "string — ID of the target screen",
      intent: "string — why the persona is navigating here"
    }
  },
  {
    name: "interact_with_element",
    description: "Tap, scroll, or interact with a UI element on the current screen",
    parameters: {
      element_id: "string — the UI element being interacted with",
      action: "tap | scroll | long_press | swipe | read | skip",
      thought: "string — the persona's internal monologue during this action"
    }
  },
  {
    name: "give_feedback",
    description: "Provide design feedback about the current screen or flow",
    parameters: {
      target: "string — what specifically the feedback is about (screen, element, flow, copy)",
      sentiment: "positive | neutral | confused | frustrated | delighted",
      feedback: "string — the feedback in the persona's voice",
      design_category: "visual_hierarchy | copy | flow | accessibility | pacing | emotional_tone | information_architecture",
      severity: "praise | suggestion | minor_issue | major_issue | blocker"
    }
  },
  {
    name: "express_emotion",
    description: "Show an emotional reaction that affects the 3D character's animation",
    parameters: {
      emotion: "confused | delighted | frustrated | bored | anxious | relieved | skeptical",
      trigger: "string — what caused this emotional reaction",
      intensity: "low | medium | high"
    }
  },
  {
    name: "think_aloud",
    description: "Share the persona's internal thought process (visible as thought bubble in 3D)",
    parameters: {
      thought: "string — what the persona is thinking right now"
    }
  },
  {
    name: "abandon_flow",
    description: "The persona decides to stop or leave a particular flow",
    parameters: {
      reason: "string — why they're abandoning",
      would_return: "boolean — would they come back to try again?"
    }
  },
  {
    name: "compare_to_alternative",
    description: "The persona compares Ash to another product or experience",
    parameters: {
      comparison: "string — what they're comparing to",
      verdict: "string — how Ash measures up in their view"
    }
  },
  {
    name: "complete_session",
    description: "The persona finishes their app exploration and gives a summary",
    parameters: {
      overall_impression: "string — summary in their voice",
      would_recommend: "boolean",
      top_praise: "string",
      top_complaint: "string",
      nps_score: "number 1-10"
    }
  }
];
```

---

## 7. 3D Environment Redesign

### Current: Office Space
The Delegation uses an office with desks, computers, and a boardroom. Characters walk to desks to "work" and to a boardroom for collaboration.

### New: Cozy Testing Lab / Living Room
Retheme the 3D space to feel like a relaxed user research lab — couch, coffee table, bean bags, a large screen showing the app. Characters wander around, sit on the couch to "use the app," walk to the screen to point things out, and gather to discuss.

**POI Remapping:**

| Old POI | New POI | Purpose |
|---|---|---|
| `sit_work-desk-*` | `sit_use-couch-*` | Persona is actively using the app |
| `sit_idle-chair-*` | `sit_wait-beanbag-*` | Persona is idle / waiting for turn |
| `area-boardroom` | `area-bigscreen` | Persona walks here to present feedback |
| `idle-spawn-*` | `idle-entrance-*` | Where personas appear when generated |
| `area-lounge` | `area-snacks` | Idle wandering destination |

**New Character States to Add:**

| State | Animation | Expression | Trigger |
|---|---|---|---|
| `scrolling` | Seated, thumb-scrolling gesture | neutral | Using the app |
| `confused` | Head tilt, hand on chin | puzzled | `express_emotion(confused)` |
| `delighted` | Excited bounce, smile | happy | `express_emotion(delighted)` |
| `frustrated` | Slump, sigh | sad | `express_emotion(frustrated)` |
| `presenting` | Standing, gesturing at screen | talk | `give_feedback` at big screen |
| `thinking` | Looking up, hand on chin | neutral | `think_aloud` |

**Existing animations that can be repurposed immediately:**
- `happy` → delighted reaction
- `sad` → frustrated reaction
- `look_around` → confused reaction / thinking
- `talk` → giving feedback / presenting
- `sit_idle` → waiting for turn
- `sit_work` → "using the app" (sitting and engaged)
- `walk` → navigating between screens
- `wave` → greeting / calling attention

---

## 8. UI Redesign

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Ash Feedback Sandbox                    [Personas ▼] ⚙️  │
├────────────┬───────────────────────┬─────────────────────┤
│            │                       │                     │
│  Feedback  │    3D Sandbox View    │  Persona Inspector  │
│  Board     │                       │                     │
│            │  ┌─────────────────┐  │  [Gloria, 68]       │
│  Onboarding│  │  Characters     │  │  "Retired teacher   │
│  ● 3 items │  │  walking around │  │   from Ohio..."     │
│            │  │  using app      │  │                     │
│  Chat Flow │  │                 │  │  Currently on:      │
│  ● 5 items │  │                 │  │  Persona Picker     │
│            │  └─────────────────┘  │                     │
│  Settings  │                       │  Mood: Confused 😕   │
│  ● 1 item  │  ┌─────────────────┐  │                     │
│            │  │ App Screen View │  │  ── Feedback ──     │
│            │  │ (screenshot or  │  │  "Why are there     │
│  ──────── │  │  description of │  │   so many options?  │
│  Synthesis │  │  current screen)│  │   I just want..."   │
│  View      │  └─────────────────┘  │                     │
│            │                       │  [💬 Chat with her]  │
└────────────┴───────────────────────┴─────────────────────┘
```

### Key UI Components

**Feedback Board** (left panel, replaces Kanban):
- Organized by app screen / flow section
- Each card shows: persona avatar, sentiment emoji, one-line feedback preview
- Click to expand full feedback with design category and severity
- Filter by: persona, sentiment, design category, severity
- "Synthesis" section at bottom rolls up cross-persona patterns

**3D Sandbox View** (center):
- The 3D environment with persona characters
- Floating thought bubbles and speech bubbles
- Emoji reactions floating up when emotions are expressed
- Click any character to select them in the Inspector

**App Screen Viewer** (bottom of center, collapsible):
- Shows which screen the selected persona is currently viewing
- When Flutter Inspector MCP is connected: live screenshot from simulator
- When not connected: static mockup or Figma screenshot
- Highlights which elements the persona is interacting with

**Persona Inspector** (right panel, replaces Agent Inspector):
- Full persona backstory, personality traits, attitudes
- Their journey through the app (breadcrumb of screens visited)
- All feedback they've given, chronologically
- Emotional state timeline
- "Chat with this persona" button — have a conversation to dig deeper

### Header Controls

- **Persona Set Picker**: Switch between "Research Five," "Stress Test," or "Custom"
- **Speed Control**: Run simulation faster or step-by-step
- **New Persona**: Generate a speculative persona via natural language prompt
- **Export**: Export all feedback as structured JSON, Markdown, or push to Notion
- **Simulator Status**: Indicator showing whether Flutter Inspector / iOS Simulator MCPs are connected

---

## 9. LLM Provider Changes

### Current: Gemini API (BYOK)
### Target: Multi-provider support with Claude as primary

**Changes to `LLMFactory.ts`:**
- Add `AnthropicProvider` implementing `LLMProvider` interface
- Claude's tool-use / function-calling maps cleanly to the existing abstraction
- Use `claude-sonnet-4-5-20250514` for persona simulation (good balance of quality + speed + cost)
- Use `claude-opus-4-5-20250414` for persona generation and synthesis (higher quality for one-time tasks)
- Keep `GeminiProvider` as secondary option

**New Provider File**: `src/services/llm/providers/AnthropicProvider.ts`

---

## 10. Implementation Phases

### Phase 1: Core Simulation Loop
> Get the core loop working: hardcoded personas "use" statically-described screens, feedback appears in the UI.

- [ ] **Replace agent data** — 3 hardcoded persona characters in `agents.ts` with rich backstories derived from interview data
- [ ] **Create PersonaCharacter type** in `types.ts`
- [ ] **Create App Knowledge Base** — `appScreens.ts` with 4-5 Ash screen descriptions (static, manually authored)
- [ ] **Rewrite prompts** — `agentPrompts.ts` for persona-driven feedback simulation
- [ ] **Replace tool definitions** — new sandbox tools (give_feedback, express_emotion, think_aloud, navigate_to_screen)
- [ ] **Rewrite tool handlers** — `toolHandlerService.ts` with new handlers mapping tools to 3D behaviors
- [ ] **Rewrite simulation service** — `agencyService.ts` with new orchestration loop (persona → screen → react → feedback → next screen)
- [ ] **Rewrite orchestrator hook** — `useAgencyOrchestrator.ts` with new dispatch logic
- [ ] **Map tools to existing animations** — happy for delighted, sad for frustrated, look_around for confused, talk for feedback, sit_work for app usage
- [ ] **Light UI relabeling** — Header, InspectorPanel, KanbanPanel, AgentView, UIOverlay
- [ ] **Test end-to-end**: One persona, 4 screens, feedback appearing in the repurposed Kanban

### Phase 2: UI & Feedback Dashboard
> Make it look and feel like a feedback sandbox with purpose-built components.

- [ ] **Build Feedback Board component** (replaces KanbanPanel) — organized by screen, filterable by persona/sentiment/category
- [ ] **Build Persona Inspector component** (replaces InspectorPanel + AgentView) — backstory, journey breadcrumbs, feedback history, emotional timeline
- [ ] **Build App Screen Viewer component** (new) — shows current screen being tested (static image or description)
- [ ] **Add floating reaction emojis** in 3D overlay when emotions are expressed
- [ ] **Update UIOverlay** for sentiment-based status bubbles and persona indicators
- [ ] **Build Persona Builder Modal** (replaces AgentSetPickerModal) — persona set picker + speculative persona input
- [ ] **Chat with persona** — click a character, ask follow-up questions, get in-character answers

### Phase 3: Multi-Persona Orchestration & Synthesis
> Run multiple personas simultaneously, synthesize collective feedback.

- [ ] **Multi-persona orchestration** — round-robin or parallel persona simulation across all characters in a set
- [ ] **Persona set management** — switch between Research Five / Stress Test / Custom sets
- [ ] **Cross-persona synthesis** — after all personas complete, LLM summarizes patterns and generates actionable recommendations
- [ ] **Feedback filtering and search** — filter by persona, screen, sentiment, design category, severity
- [ ] **Export functionality** — export feedback as JSON, Markdown, or push to Notion
- [ ] **Build Synthesis Panel component** (new) — cross-persona insights, pattern detection, recommendations

### Phase 4: Live Simulator Integration
> Bridge to the actual running Flutter app via MCPs.

- [ ] **Integrate Flutter Inspector MCP** — connect to `flutter run` debug session, read widget tree, semantics tree, capture screenshots
- [ ] **Integrate iOS Simulator MCP (IDB)** — physical tap/swipe/type on the simulator, screenshot capture
- [ ] **Hybrid screen context** — merge static knowledge base with live widget tree data to give personas the richest possible view
- [ ] **Accessibility-focused feedback** — personas with low-vision or screen-reader profiles evaluate the live semantics tree
- [ ] **Screenshot integration** — show live simulator screenshots in the App Screen Viewer component
- [ ] **Real interaction replay** — record persona's conceptual "taps" and replay them on the actual simulator

### Phase 5: Notion Integration & Persona Intelligence
> Connect to real data, make persona generation dynamic and smart.

- [ ] **Live Notion API integration** — pull interview data on-demand for persona generation
- [ ] **Speculative persona builder UI** — natural language input with preview ("Create a college student who...")
- [ ] **Persona memory** — personas remember previous sessions and can comment on design changes between versions
- [ ] **App Knowledge Base editor** — UI for updating the screen map when Ash's design changes
- [ ] **Comparison mode** — run the same personas against two versions of a screen to see preference shifts
- [ ] **Push feedback to Notion** — export synthesized insights as Notion pages linked to the research database

### Phase 6: 3D Environment & Polish
> Make the 3D space match the vision.

- [ ] **New 3D environment** — cozy testing lab / living room scene replacing the office
- [ ] **New character animations** — scrolling, confused, delighted, frustrated, presenting, thinking
- [ ] **Remap POIs** to new environment layout
- [ ] **Add Anthropic Claude provider** as primary LLM (better character voice)
- [ ] **Device size testing** — run personas on different simulated device sizes (iPhone SE, iPad) via XcodeBuildMCP
- [ ] **Multiplayer / sharing** — multiple designers watching the same simulation

---

## 11. File Structure (Target)

```
src/
├── services/
│   ├── personaService.ts          # NEW — persona generation from Notion data
│   ├── appKnowledgeBase.ts        # NEW — structured app screen/flow data + MCP bridge
│   ├── feedbackService.ts         # NEW — feedback collection and synthesis
│   ├── simulationService.ts       # REPLACES agencyService.ts — main simulation loop
│   ├── toolHandlerService.ts      # REWRITTEN — new tool handlers
│   ├── simulatorBridge.ts         # NEW — Flutter Inspector + iOS Simulator MCP integration
│   └── llm/
│       ├── providers/
│       │   ├── AnthropicProvider.ts   # NEW
│       │   └── GeminiProvider.ts      # KEEP (secondary)
│       ├── toolDefinitions.ts         # REWRITTEN — sandbox tools
│       ├── LLMFactory.ts              # EXTENDED
│       └── types.ts                   # EXTENDED
├── data/
│   ├── personas.ts                # REPLACES agents.ts
│   ├── appScreens.ts             # NEW — Ash screen definitions (static knowledge base)
│   └── presetPersonaSets.ts      # NEW — Research Five, Stress Test, etc.
├── prompts/
│   ├── personaGenerationPrompt.ts  # NEW
│   ├── simulationPrompt.ts         # REPLACES agentPrompts.ts
│   └── synthesisPrompt.ts          # NEW — cross-persona insight generation
├── store/
│   ├── useStore.ts                # EXTENDED — add persona + feedback state
│   ├── personaStore.ts            # NEW — persona state management
│   └── feedbackStore.ts           # REPLACES agencyStore.ts
├── components/
│   ├── FeedbackBoard.tsx          # REPLACES KanbanPanel.tsx
│   ├── PersonaInspector.tsx       # REPLACES InspectorPanel.tsx
│   ├── PersonaView.tsx            # REPLACES AgentView.tsx
│   ├── AppScreenViewer.tsx        # NEW — shows current screen (static or live screenshot)
│   ├── SynthesisPanel.tsx         # NEW — cross-persona insights
│   ├── PersonaBuilderModal.tsx    # REPLACES AgentSetPickerModal.tsx
│   ├── SimulatorStatus.tsx        # NEW — MCP connection indicator
│   ├── ChatPanel.tsx              # KEEP — conversation with persona
│   ├── UIOverlay.tsx              # MODIFIED — new bubble types
│   ├── SimulationView.tsx         # KEEP
│   ├── Header.tsx                 # MODIFIED
│   └── ExportModal.tsx            # REPLACES FinalOutputModal.tsx
├── hooks/
│   ├── useSimulationOrchestrator.ts  # REPLACES useAgencyOrchestrator.ts
│   ├── useSimulatorConnection.ts     # NEW — Flutter/iOS MCP connection management
│   └── useChatAvailability.ts        # KEEP
├── three/
│   ├── (all existing files kept, modifications noted in Section 7)
│   └── behavior/
│       └── CharacterStateMachine.ts  # EXTENDED with new states
└── types.ts                          # EXTENDED
```

---

## 12. Key Design Decisions & Open Questions

### Decisions Made

1. **Multi-layered app context** — static knowledge base as foundation, Flutter Inspector MCP for live widget data, iOS Simulator MCP for physical interaction. Each layer adds richness but the system works with any subset.
2. **Keep The Delegation's 3D engine** — the Three.js WebGPU rendering, character system, pathfinding, and state machine are high-quality and well-architected. Retheme rather than rebuild.
3. **Zustand stays** — the existing store architecture maps well to our needs, just needs new slices for personas and feedback.
4. **Persona generation is a first-class feature** — both research-based (from real interviews) and speculative (from natural language prompts). This is what makes the tool genuinely useful for design teams.
5. **Flutter-first integration** — since Ash is a Flutter app, the Flutter Inspector MCP's semantics tree is the highest-value integration point (more valuable than raw screenshots) because it gives personas access to accessibility information.

### Open Questions

1. **3D Assets**: The Delegation's office models are CC BY-NC 4.0 (non-commercial). Do we need new environment models, or is this an internal tool where the license is fine?
2. **App Screen Data**: How detailed should the initial static App Knowledge Base be? Just the onboarding flow, or map the whole app from day one?
3. **Feedback Granularity**: Should personas give feedback screen-by-screen (more structured) or as a continuous narrative stream (more natural)?
4. **Multiplayer / Sharing**: Should the sandbox support multiple designers watching the same simulation, or is this a single-user tool?
5. **Persona Persistence**: Should personas persist across sessions (remembering previous feedback) or start fresh each time?

---

## 13. Getting Started — First Claude Code Session

Copy-paste this into your first Claude Code session:

```
Read the full plan at ./ASH_FEEDBACK_SANDBOX_PLAN.md and read
./CLAUDE.md for project context.

We're building the Ash Feedback Sandbox — repurposing "The Delegation"
(./Open Source Project/) into a UX feedback sandbox where AI persona
characters explore the Ash Flutter app and give design feedback.

Start with Phase 1. Here's the build order:

1. Replace agent definitions in src/data/agents.ts with 3 persona
   characters. Add PersonaCharacter type to src/types.ts. Personas:
   - Gloria (68, retired teacher, low tech comfort, found Ash through daughter)
   - Marcus (47, veteran, therapy skeptic, downloaded Ash at 2am)
   - Priya (20, CS student, speculative persona, thinks AI wellness is cringe)

2. Create src/data/appScreens.ts — define 4-5 Ash screens as structured
   data with screen descriptions, UI elements, copy text, and navigation
   links. I'll fill in the real content after you create the schema.

3. Rewrite src/prompts/agentPrompts.ts for persona simulation. System
   prompt should establish persona identity, tell them they're exploring
   Ash for the first time, and instruct them to give designer-useful
   feedback using the tools.

4. Replace src/services/llm/toolDefinitions.ts with 4 feedback tools:
   give_feedback, express_emotion, think_aloud, navigate_to_screen.

5. Rewrite src/services/toolHandlerService.ts — new handlers that map
   tool calls to 3D character behaviors (happy animation for delighted,
   sad for frustrated, look_around for confused, talk for feedback).

6. Rewrite src/services/agencyService.ts — new simulation loop:
   persona views screen → LLM generates reaction → tool calls processed →
   character animates → feedback logged → navigate to next screen → repeat.

7. Rewrite src/hooks/useAgencyOrchestrator.ts — new dispatch logic for
   the simulation flow instead of project-brief workflow.

8. Light UI relabeling: Header title, InspectorPanel tabs, KanbanPanel
   columns (relabel as screen names), AgentView (show persona info),
   UIOverlay (sentiment emojis instead of status sirens).

Keep the 3D engine, existing animations, Gemini provider, and Zustand
architecture. We're modifying the orchestration layer and data, not
the rendering engine.
```

---

*This plan is designed to be handed directly to Claude Code as a project specification. It contains all architectural context, data models, tool recommendations, and implementation guidance needed to build the complete Ash Feedback Sandbox.*

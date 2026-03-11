# Ash Feedback Lab

A 3D sandbox where AI persona characters use your real app in the iOS Simulator and give character-driven design feedback. Personas appear as animated characters in a Three.js office environment, autonomously exploring your app while you watch and collect structured feedback.

## How It Works

```
┌─────────────────────────────┐
│   Web App (localhost:3000)  │
│                             │
│  Three.js 3D Office Scene   │  ← Animated persona characters
│  Kanban Feedback Board      │  ← Feedback organized by screen
│  Action Log + Inspector     │  ← Live exploration activity
│                             │
│  Claude API (BYOK)          │  ← Vision + tool use per persona
└──────────┬──────────────────┘
           │ HTTP
           ▼
┌─────────────────────────────┐
│  Bridge Server (:3001)      │  ← Express.js middleware
│  /screenshot, /tap, /type,  │
│  /swipe, /press, /status    │
└──────────┬──────────────────┘
           │ xcrun simctl / AXe CLI
           ▼
┌─────────────────────────────┐
│  iOS Simulator              │  ← Your real app running
│  (iPhone 16 Pro)            │
└─────────────────────────────┘
```

### The Exploration Loop

When you hit **Start**, each persona autonomously runs this loop (up to 12 steps):

1. **Screenshot** the current simulator screen via the bridge server
2. **Send** the screenshot + persona backstory + screen context to Claude (vision + tools)
3. **Claude responds** in character with tool calls:
   - `tap_screen` / `type_text` / `scroll` — interact with the app
   - `give_feedback` — record a feedback item (with sentiment and screen name)
   - `think_aloud` — internal monologue displayed as a thought bubble
   - `express_emotion` — trigger character animation (happy, sad, confused, etc.)
4. **Execute** tool calls: simulator actions go through the bridge, feedback goes to the Kanban board
5. **Wait** a few seconds, then repeat

Each persona explores independently and concurrently, giving feedback from their unique perspective.

### Persona System

Three curated persona sets, each with distinct characters:

| Set | Personas | Focus |
|-----|----------|-------|
| **Interview Insights** | Gloria (68, retired teacher), Marcus (47, warehouse manager), Priya (20, CS student) | Synthesized from real user interview archetypes |
| **Edge Cases** | Jordan (19, anxious student), Diana (34, overwhelmed parent), Ray (52, guarded divorcee) | Untapped demographics and stress-case scenarios |
| **Accessibility Focus** | Sam (28, blind QA engineer), Mika (23, ADHD designer), Elise (41, ESL nurse) | Inclusive design and accessibility testing |

Each persona has a rich backstory, personality traits, expertise areas, and a mission statement. Claude stays in character — feedback references their life experience, not generic design heuristics.

### Feedback Output

Feedback is collected on a **Kanban board** organized by app screen. Each card shows:
- Who said it (persona name + avatar color)
- What they reacted to (specific UI element or flow)
- Their sentiment (delighted, confused, frustrated, etc.)
- The full feedback in their voice

This makes it easy to spot patterns (e.g., "3 out of 3 personas were confused by the same button").

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, TypeScript, TailwindCSS |
| 3D Engine | Three.js with WebGPU renderer, GPU instancing, compute shaders |
| State | Zustand |
| LLM | Anthropic Claude API (vision + tool use), BYOK pattern |
| Bridge | Express.js REST server |
| Simulator | `xcrun simctl` with optional AXe CLI for enhanced control |

## Setup

### Prerequisites
- macOS with Xcode installed
- iOS Simulator booted with your app running
- Node.js 18+
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Install AXe CLI (one-time, optional but recommended)
```bash
brew install cameroncooke/axe/axe
```

### Install dependencies
```bash
cd "Open Source Project"
npm install
```

### Run

**Terminal 1** — Bridge server:
```bash
cd "Open Source Project"
npm run bridge
```

**Terminal 2** — Web app:
```bash
cd "Open Source Project"
npm run dev
```

Then open **http://localhost:3000**, enter your API key, pick a persona set, and hit Start.

## Project Structure

```
Open Source Project/
├── bridge/
│   ├── server.ts              # Express bridge server (port 3001)
│   └── simulator.ts           # iOS Simulator control layer
├── src/
│   ├── App.tsx                # Main layout & canvas mount
│   ├── components/            # React UI (Header, Kanban, Inspector, ActionLog)
│   ├── data/
│   │   ├── agents.ts          # Persona definitions (3 sets × 4 characters)
│   │   └── appScreens.ts     # App screen knowledge base for Claude context
│   ├── hooks/
│   │   └── useAgencyOrchestrator.ts  # Exploration loop orchestration
│   ├── prompts/
│   │   └── agentPrompts.ts    # System prompt construction per persona
│   ├── services/
│   │   ├── agencyService.ts   # Claude API integration (vision + tools)
│   │   ├── toolHandlerService.ts  # Tool execution dispatch
│   │   └── llm/               # Multi-provider LLM support
│   ├── store/
│   │   └── agencyStore.ts     # Zustand store (feedback, logs, phase)
│   └── three/                 # 3D engine (scene, characters, nav, input)
└── vite.config.ts             # Vite config with Anthropic API proxy
```

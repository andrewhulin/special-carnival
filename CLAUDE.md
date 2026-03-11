# Ash Feedback Lab

## Project Overview
**Ash Feedback Lab** — a playful 3D sandbox where AI persona characters use the real Ash app in the iOS Simulator and give character-driven design feedback. The web app (Three.js 3D office) serves as the observation/feedback dashboard.

## How to Run
```bash
cd "Open Source Project"
npm install
npm run dev
```

## Key File Locations
- **Persona Data:** `Open Source Project/src/data/agents.ts`
- **App Screens:** `Open Source Project/src/data/appScreens.ts`
- **Prompts:** `Open Source Project/src/prompts/agentPrompts.ts`
- **Tool Definitions:** `Open Source Project/src/services/llm/toolDefinitions.ts`
- **Tool Handlers:** `Open Source Project/src/services/toolHandlerService.ts`
- **Agency Service:** `Open Source Project/src/services/agencyService.ts`
- **Orchestrator Hook:** `Open Source Project/src/hooks/useAgencyOrchestrator.ts`
- **Store:** `Open Source Project/src/store/agencyStore.ts`
- **3D Engine:** `Open Source Project/src/three/`

## Architecture Notes
- 3 persona sets (Interview Insights, Edge Cases, Accessibility Focus) with picker at startup
- Personas interact with the real Ash app in iOS Simulator via bridge server (Express :3001)
- Claude Vision analyzes screenshots to decide what to tap/type/scroll
- 6 tools: give_feedback, express_emotion, think_aloud, tap_screen, type_text, scroll
- Feedback board (Kanban) organized by screen name
- Claude API via BYOK (Bring Your Own Key) with Vite proxy

## Error Log
<!-- Record every bug fix below with date, description, and resolution -->

| Date | Bug | Resolution |
|------|-----|------------|
| 2026-03-11 | Pre-existing `import.meta.env` TS errors in three/ engine files | Not our code. Vite handles these at build time. `npx tsc --noEmit` shows them but `vite build` succeeds. |

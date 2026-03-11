# Ash Feedback Sandbox

## Project Overview
Hackathon project transforming "The Delegation" (3D office simulation with LLM agents) into the **Ash Feedback Sandbox** — where AI persona characters explore the Ash Flutter mental health app in a 3D environment and give realistic, character-driven design feedback.

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
- 3 personas (Gloria, Marcus, Priya) mapped into `AgentData` interface for compatibility
- Personas explore 5 static Ash app screens via LLM tool calls
- 4 tools: give_feedback, express_emotion, think_aloud, navigate_to_screen
- Feedback board (repurposed Kanban) organized by screen name
- Gemini API via BYOK (Bring Your Own Key)

## Error Log
<!-- Record every bug fix below with date, description, and resolution -->

| Date | Bug | Resolution |
|------|-----|------------|
| 2026-03-11 | Pre-existing `import.meta.env` TS errors in three/ engine files | Not our code. Vite handles these at build time. `npx tsc --noEmit` shows them but `vite build` succeeds. |

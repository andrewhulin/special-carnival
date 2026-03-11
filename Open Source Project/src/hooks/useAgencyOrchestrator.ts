import { useEffect, useRef } from 'react'
import { useSceneManager } from '../three/SceneContext'
import { useAgencyStore } from '../store/agencyStore'
import { useStore } from '../store/useStore'
import {
  callAgent,
  type AgentFunctionCall,
} from '../services/agencyService'
import { ToolHandlerService } from '../services/toolHandlerService'
import { FIRST_SCREEN_ID } from '../data/appScreens'
import { getActiveAgentSet } from '../store/agencyStore'

// ── Constants ─────────────────────────────────────────────────
const MAX_EXPLORATION_STEPS = 8 // Max LLM calls per persona before stopping

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────────────────────
export function useAgencyOrchestrator() {
  const scene = useSceneManager()
  const sceneRef = useRef(scene)
  useEffect(() => { sceneRef.current = scene }, [scene])

  /** Personas currently being processed — prevents double-dispatch. */
  const runningAgents = useRef(new Set<number>())

  /**
   * Wrapper for tool handler to include local context.
   */
  const processFunctionCall = (fn: AgentFunctionCall, callerIndex: number): boolean => {
    return ToolHandlerService.process(fn, callerIndex, sceneRef.current)
  }

  // ── Single persona exploration loop ───────────────────────────
  const runPersonaExploration = async (agentIndex: number) => {
    if (runningAgents.current.has(agentIndex)) return
    runningAgents.current.add(agentIndex)

    const store = useAgencyStore.getState()

    // Set initial screen
    store.setPersonaScreen(agentIndex, FIRST_SCREEN_ID)

    store.addLogEntry({
      agentIndex,
      action: `starts exploring the Ash app`,
    })

    // Stagger persona starts for visual effect
    await sleep(randomBetween(1000, 3000))

    // Move persona to a work station
    sceneRef.current?.setNpcWorking(agentIndex, true)

    let steps = 0

    try {
      while (steps < MAX_EXPLORATION_STEPS) {
        // Check if simulation was reset
        const currentPhase = useAgencyStore.getState().phase
        if (currentPhase !== 'working') break

        const currentScreenId = useAgencyStore.getState().personaScreens[agentIndex] || FIRST_SCREEN_ID

        const response = await callAgent({
          agentIndex,
          userMessage: `You are now looking at the "${currentScreenId}" screen of the Ash app. React to what you see, give feedback, and navigate to the next screen when ready.`,
        })

        // Process all tool calls
        let navigated = false
        if (response.functionCalls) {
          for (const fn of response.functionCalls) {
            processFunctionCall(fn, agentIndex)
            if (fn.name === 'navigate_to_screen') {
              navigated = true
            }
          }
        }

        steps++

        // If persona navigated, add a delay for the walk animation then continue
        if (navigated) {
          await sleep(randomBetween(3000, 5000))
          // Re-seat the persona at a work desk for the next screen
          sceneRef.current?.setNpcWorking(agentIndex, true)
        } else {
          // Small delay between reactions on the same screen
          await sleep(randomBetween(2000, 4000))
        }

        // Check if we've reached the last screen (dashboard has no next screens)
        const latestScreenId = useAgencyStore.getState().personaScreens[agentIndex]
        if (latestScreenId === 'dashboard' && !navigated) {
          // Persona has finished exploring
          break
        }
      }

      // Final wrap-up
      const finalPhase = useAgencyStore.getState().phase
      if (finalPhase === 'working') {
        useAgencyStore.getState().addLogEntry({
          agentIndex,
          action: `finished exploring the Ash app`,
        })
        sceneRef.current?.setNpcWorking(agentIndex, false)
        sceneRef.current?.kickNpcDriver(agentIndex)
      }
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        console.error(`[Sandbox] Persona ${agentIndex} exploration error:`, err)
      }
    } finally {
      runningAgents.current.delete(agentIndex)

      // Check if all personas are done
      const allDone = ![1, 2, 3].some(i => runningAgents.current.has(i))
      if (allDone && useAgencyStore.getState().phase === 'working') {
        useAgencyStore.getState().setPhase('done')
        useAgencyStore.getState().addLogEntry({
          agentIndex: 0,
          action: `All personas have finished exploring. Review their feedback!`,
        })
      }
    }
  }

  // ── Start all personas ────────────────────────────────────────
  const startSimulation = () => {
    const agents = getActiveAgentSet().agents
    const npcAgents = agents.filter(a => !a.isPlayer)

    for (const agent of npcAgents) {
      runPersonaExploration(agent.index)
    }
  }

  // ── Chat handler (when user clicks a persona and sends a message) ──
  const handleAgencyMessage = async (
    npcIndex: number,
    text: string,
  ): Promise<string | null> => {
    const store = useAgencyStore.getState()

    // If simulation hasn't started yet, start it when user talks to any NPC
    if (store.phase === 'idle') {
      store.setPhase('working')
      startSimulation()
      return `Starting exploration! Watch the personas react to the Ash app.`
    }

    // Route through persona's LLM for a contextual, in-character response
    try {
      const response = await callAgent({
        agentIndex: npcIndex,
        userMessage: text,
        chatMode: true,
      })
      return response.text || null
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') {
        console.error('[Sandbox] Persona chat error:', err)
      }
      return null
    }
  }

  // ── Register handler + subscribe to phase changes ─────────────
  useEffect(() => {
    if (!scene) return

    scene.setAgencyHandler(handleAgencyMessage)

    // Watch for phase changes to start simulation
    const unsub = useAgencyStore.subscribe((s, prev) => {
      // When phase transitions to 'working', start persona exploration
      if (s.phase === 'working' && prev.phase === 'idle') {
        startSimulation()
      }
    })

    return () => {
      scene.setAgencyHandler(null)
      unsub()
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps
}

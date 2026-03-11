import { useEffect, useRef } from 'react'
import { useSceneManager } from '../three/SceneContext'
import { useAgencyStore } from '../store/agencyStore'
import { useStore } from '../store/useStore'
import {
  callAgent,
  type AgentFunctionCall,
} from '../services/agencyService'
import { ToolHandlerService } from '../services/toolHandlerService'
import { getActiveAgentSet } from '../store/agencyStore'
import { simulatorService } from '../services/simulatorService'

// ── Constants ─────────────────────────────────────────────────
const MAX_EXPLORATION_STEPS = 12 // Max LLM calls per persona before stopping
const INTERACTION_TOOLS = new Set(['tap_screen', 'type_text', 'scroll'])

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
   * Wrapper for tool handler — now async for simulator tools.
   */
  const processFunctionCall = async (fn: AgentFunctionCall, callerIndex: number): Promise<boolean> => {
    return ToolHandlerService.process(fn, callerIndex, sceneRef.current)
  }

  /**
   * Take a screenshot from the iOS Simulator and return it as a base64 string.
   * Returns null if the bridge is not available (falls back to text-only mode).
   */
  const captureScreenshot = async (): Promise<string | null> => {
    try {
      return await simulatorService.screenshot()
    } catch {
      return null
    }
  }

  // ── Single persona exploration loop ───────────────────────────
  const runPersonaExploration = async (agentIndex: number) => {
    if (runningAgents.current.has(agentIndex)) return
    runningAgents.current.add(agentIndex)

    const store = useAgencyStore.getState()

    store.setPersonaScreen(agentIndex, 'app')

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

        // Capture screenshot from the real app
        const screenshot = await captureScreenshot()

        // Build the user message — with or without screenshot
        let userMessage: string
        let imageData: string | undefined

        if (screenshot) {
          userMessage = `Here is a screenshot of the Ash app on an iPhone (393x852 points). You MUST: 1) Call give_feedback to record your reaction to this screen. 2) Call tap_screen with estimated x,y coordinates to tap a button and navigate forward. Look for buttons, links, or interactive elements and tap them to explore the app. Don't just observe — actively navigate!`
          imageData = screenshot
        } else {
          // Fallback: text-only mode when bridge is not running
          userMessage = `You are exploring the Ash app. The simulator bridge is not connected, so describe what you imagine seeing on a mental health app's onboarding flow. Give feedback based on your character's perspective.`
        }

        const response = await callAgent({
          agentIndex,
          userMessage,
          imageData,
        })

        // Process all tool calls — some are async (simulator interaction)
        let interacted = false
        if (response.functionCalls) {
          for (const fn of response.functionCalls) {
            await processFunctionCall(fn, agentIndex)
            if (INTERACTION_TOOLS.has(fn.name)) {
              interacted = true
            }
          }
        }

        steps++

        // After simulator interactions, wait for the UI to settle
        if (interacted) {
          await sleep(randomBetween(1500, 3000))
        } else {
          await sleep(randomBetween(2000, 4000))
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
        console.error(`[Lab] Persona ${agentIndex} exploration error:`, err)
      }
    } finally {
      runningAgents.current.delete(agentIndex)

      // Check if all personas are done
      const activeAgents = getActiveAgentSet().agents.filter(a => !a.isPlayer)
      const allDone = !activeAgents.some(a => runningAgents.current.has(a.index))
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
        console.error('[Lab] Persona chat error:', err)
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

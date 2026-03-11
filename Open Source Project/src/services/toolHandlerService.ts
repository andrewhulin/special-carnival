import { useAgencyStore } from '../store/agencyStore';
import { AgentFunctionCall } from './agencyService';
import { getActiveAgentSet } from '../store/agencyStore';

export class ToolHandlerService {
  /**
   * Process a function call returned by a persona and update the store.
   * @param fn The function call to process
   * @param callerIndex The index of the persona making the call
   * @param scene Object containing methods to interact with the 3D scene
   * @returns true if the call was handled
   */
  static process(
    fn: AgentFunctionCall,
    callerIndex: number,
    scene: { setNpcWorking: (index: number, working: boolean) => void } | null
  ): boolean {
    const store = useAgencyStore.getState();
    const persona = getActiveAgentSet().agents.find(a => a.index === callerIndex);
    const personaName = persona?.role || `Persona #${callerIndex}`;

    switch (fn.name) {
      case 'give_feedback': {
        const { feedback, sentiment, about } = fn.args as {
          feedback: string;
          sentiment: 'positive' | 'confused' | 'frustrated' | 'delighted' | 'neutral';
          about: string;
        };

        const currentScreen = store.personaScreens[callerIndex] || 'unknown';

        store.addFeedbackItem({
          personaIndex: callerIndex,
          screenId: currentScreen,
          feedback,
          sentiment,
          about,
        });

        store.addLogEntry({
          agentIndex: callerIndex,
          action: `gave ${sentiment} feedback about "${about}": "${feedback.slice(0, 80)}..."`,
        });

        // Trigger talk animation
        scene?.setNpcWorking(callerIndex, true);
        setTimeout(() => {
          scene?.setNpcWorking(callerIndex, false);
        }, 3000);

        return true;
      }

      case 'express_emotion': {
        const { emotion, trigger } = fn.args as {
          emotion: 'confused' | 'delighted' | 'frustrated' | 'happy' | 'skeptical';
          trigger: string;
        };

        store.addLogEntry({
          agentIndex: callerIndex,
          action: `feels ${emotion} — "${trigger}"`,
        });

        // Map emotions to 3D animations via kickNpcDriver
        // The NPC driver will handle animation state
        if (scene && 'kickNpcDriver' in scene) {
          (scene as any).kickNpcDriver(callerIndex);
        }

        return true;
      }

      case 'think_aloud': {
        const { thought } = fn.args as { thought: string };

        store.addLogEntry({
          agentIndex: callerIndex,
          action: `thinks: "${thought}"`,
        });

        return true;
      }

      case 'navigate_to_screen': {
        const { screen_id, reason } = fn.args as { screen_id: string; reason: string };

        store.setPersonaScreen(callerIndex, screen_id);
        store.addLogEntry({
          agentIndex: callerIndex,
          action: `navigates to "${screen_id}" — ${reason}`,
        });

        // Walk the character to a different position
        if (scene && 'moveNpcToSpawn' in scene) {
          (scene as any).moveNpcToSpawn(callerIndex);
        }

        return true;
      }

      default:
        console.warn(`[ToolHandler] Unknown function: ${fn.name}`);
        return false;
    }
  }
}

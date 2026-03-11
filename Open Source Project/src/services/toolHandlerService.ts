import { useAgencyStore } from '../store/agencyStore';
import { AgentFunctionCall } from './agencyService';
import { getActiveAgentSet } from '../store/agencyStore';
import { simulatorService } from './simulatorService';

export class ToolHandlerService {
  /**
   * Process a function call returned by a persona and update the store.
   * Returns true if the call was handled. Some tools (tap, type, scroll)
   * are async because they call the bridge server.
   */
  static async process(
    fn: AgentFunctionCall,
    callerIndex: number,
    scene: { setNpcWorking: (index: number, working: boolean) => void } | null
  ): Promise<boolean> {
    const store = useAgencyStore.getState();

    switch (fn.name) {
      case 'give_feedback': {
        const { feedback, sentiment, about, screen_name } = fn.args as {
          feedback: string;
          sentiment: 'positive' | 'confused' | 'frustrated' | 'delighted' | 'neutral';
          about: string;
          screen_name?: string;
        };

        // Use screen_name from LLM if provided, fall back to tracked screen
        const currentScreen = screen_name || store.personaScreens[callerIndex] || 'app';

        // Update the persona's current screen based on what the LLM identified
        if (screen_name) {
          store.setPersonaScreen(callerIndex, screen_name);
        }

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

        scene?.setNpcWorking(callerIndex, true);
        setTimeout(() => scene?.setNpcWorking(callerIndex, false), 3000);

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

      // ── Simulator interaction tools ─────────────────────────

      case 'tap_screen': {
        const { x, y, description } = fn.args as {
          x: number; y: number; description: string;
        };

        store.addLogEntry({
          agentIndex: callerIndex,
          action: `taps: "${description}" at (${x}, ${y})`,
        });

        scene?.setNpcWorking(callerIndex, true);
        try {
          await simulatorService.tap(x, y);
        } catch (err) {
          console.warn(`[ToolHandler] Tap failed:`, err);
        }
        setTimeout(() => scene?.setNpcWorking(callerIndex, false), 1000);

        return true;
      }

      case 'type_text': {
        const { text } = fn.args as { text: string };

        store.addLogEntry({
          agentIndex: callerIndex,
          action: `types: "${text.slice(0, 40)}${text.length > 40 ? '...' : ''}"`,
        });

        scene?.setNpcWorking(callerIndex, true);
        try {
          await simulatorService.type(text);
        } catch (err) {
          console.warn(`[ToolHandler] Type failed:`, err);
        }
        setTimeout(() => scene?.setNpcWorking(callerIndex, false), 1000);

        return true;
      }

      case 'scroll': {
        const { direction } = fn.args as { direction: 'up' | 'down' };

        store.addLogEntry({
          agentIndex: callerIndex,
          action: `scrolls ${direction}`,
        });

        try {
          await simulatorService.swipe(direction);
        } catch (err) {
          console.warn(`[ToolHandler] Scroll failed:`, err);
        }

        return true;
      }

      default:
        console.warn(`[ToolHandler] Unknown function: ${fn.name}`);
        return false;
    }
  }
}

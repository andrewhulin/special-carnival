import { useAgencyStore } from '../store/agencyStore'
import { useStore } from '../store/useStore'
import {
  buildSystemPrompt,
  buildChatSystemPrompt,
  buildDynamicContext,
} from '../prompts/agentPrompts'
import { LLMFactory } from './llm/LLMFactory'
import { LLMMessage, LLMContent } from './llm/types'
import { AGENCY_TOOLS } from './llm/toolDefinitions'
import { getActiveAgentSet } from '../store/agencyStore'

export interface AgentFunctionCall {
  name: string
  args: Record<string, unknown>
}

export interface AgentResponse {
  text: string
  functionCalls: AgentFunctionCall[]
}

// ── Reset abort controller ────────────────────────────────────
let _resetController = new AbortController();

/** Cancel every in-flight LLM call and arm a fresh signal for the next run. */
export function abortAllCalls(): void {
  _resetController.abort();
  _resetController = new AbortController();
}

/** Rejects if the current reset signal has been aborted. */
function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException('LLM call aborted by reset', 'AbortError');
}

/** Returns a promise that rejects as soon as the signal is aborted. */
function abortRace(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    if (signal.aborted) { reject(new DOMException('LLM call aborted by reset', 'AbortError')); return; }
    signal.addEventListener('abort', () => reject(new DOMException('LLM call aborted by reset', 'AbortError')), { once: true });
  });
}

const waitForResume = (signal: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      if (signal.aborted) { reject(new DOMException('LLM call aborted by reset', 'AbortError')); return; }
      const unsub = useAgencyStore.subscribe((state, prevState) => {
        if (prevState.isPaused && !state.isPaused) {
          unsub();
          if (signal.aborted) reject(new DOMException('LLM call aborted by reset', 'AbortError'));
          else resolve();
        }
      });
      signal.addEventListener('abort', () => { unsub(); reject(new DOMException('LLM call aborted by reset', 'AbortError')); }, { once: true });
    });
  };

export async function callAgent(params: {
  agentIndex: number;
  userMessage: string;
  chatMode?: boolean;
  imageData?: string;
}): Promise<AgentResponse> {
  const signal = _resetController.signal;
  throwIfAborted(signal);
  const { agentIndex, userMessage, chatMode = false, imageData } = params;
  const llmConfig = useStore.getState().llmConfig;

  let provider;
  try {
    provider = LLMFactory.getProvider(llmConfig);
  } catch (e) {
    if (e instanceof Error && e.message.includes('API key')) {
      useStore.getState().setBYOKOpen(true, e.message);
    }
    throw e;
  }

  const agentData = getActiveAgentSet().agents.find(a => a.index === agentIndex);

  // 1. Build context
  const systemInstruction = chatMode
    ? buildChatSystemPrompt(agentIndex)
    : buildSystemPrompt(agentIndex);

  const store = useAgencyStore.getState();
  const currentScreenId = store.personaScreens[agentIndex] || 'welcome';

  const feedbackSummary = store.feedbackItems
    .filter(f => f.personaIndex === agentIndex)
    .map(f => `[${f.screenId}] ${f.sentiment}: "${f.feedback}"`)
    .join('\n');

  const dynamicContext = buildDynamicContext({
    currentScreenId,
    feedbackSummary: feedbackSummary || undefined,
  });

  const fullUserMessage = chatMode
    ? `${dynamicContext}\n\n---\nDESIGNER QUESTION:\n${userMessage}`
    : `${dynamicContext}\n\n---\nINSTRUCTION:\n${userMessage}`;

  // 2. Get history from store
  let history = store.agentHistories[agentIndex] || [];

  const agentSummary = store.agentSummaries[agentIndex] || '';

  // Deduplicate if last entry is the same user message
  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  if (lastEntry?.role === 'user' && lastEntry.content === userMessage) {
    history = history.slice(0, -1);
  }

  // Keep history manageable
  const MAX_HISTORY = 10;
  if (history.length > MAX_HISTORY) {
    const recentHistory = history.slice(-MAX_HISTORY);
    const contextWithSummary = [
      {
        role: 'system' as const,
        content: `SUMMARY OF PREVIOUS EXPLORATION:\n${agentSummary}\n\n(The above is a summary of your previous exploration. Below are the most recent messages.)`
      },
      ...recentHistory
    ];
    history = contextWithSummary;
  }

  const userContent: LLMContent = imageData
    ? [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageData } },
        { type: 'text', text: fullUserMessage },
      ]
    : fullUserMessage;

  const messages: LLMMessage[] = [
    ...history,
    { role: 'user', content: userContent }
  ];

  // Always log the request
  useAgencyStore.getState().addDebugLogEntry({
      agentIndex,
      agentName: agentData?.role || 'Unknown',
      phase: 'request',
      systemPrompt: systemInstruction,
      dynamicContext,
      messages,
      rawContent: userMessage,
      status: 'pending',
  });

  // PAUSE BEFORE CALL (only when debug mode on)
  if (useAgencyStore.getState().pauseOnCall) {
    useAgencyStore.getState().setPaused(true);
    await waitForResume(signal);
  }
  throwIfAborted(signal);

  // 3. Call LLM — all sandbox tools in exploration mode, no tools in chat mode
  const tools = chatMode ? [] : AGENCY_TOOLS;

  let response;
  try {
    response = await Promise.race([
      provider.generateCompletion(messages, tools, systemInstruction, llmConfig.model, signal),
      abortRace(signal),
    ]);
  } catch (e) {
    if (e instanceof Error && (e.message.includes('API key') || e.message.includes('400') || e.message.includes('401'))) {
       useStore.getState().setBYOKOpen(true, 'API key not valid. Please check your key and try again.');
    }
    throw e;
  }

  const text = response.content || '';
  const toolCalls = response.tool_calls || [];

  const functionCalls = toolCalls.map(tc => ({
    name: tc.function.name,
    args: JSON.parse(tc.function.arguments)
  }));

  // Always log the response
  useAgencyStore.getState().addDebugLogEntry({
      agentIndex,
      agentName: agentData?.role || 'Unknown',
      phase: 'response',
      systemPrompt: systemInstruction,
      dynamicContext,
      messages,
      rawContent: JSON.stringify({ text, toolCalls }, null, 2),
      status: 'completed',
  });

  // PAUSE AFTER RESPONSE (only when debug mode on)
  if (useAgencyStore.getState().pauseOnCall) {
    useAgencyStore.getState().setPaused(true);
    await waitForResume(signal);
  }
  throwIfAborted(signal);

  // 4. Update history in store
  let assistantContent = response.content || '';

  const assistantMessage: LLMMessage | null = assistantContent.trim() || (response.tool_calls && response.tool_calls.length > 0)
    ? {
        role: 'assistant',
        content: assistantContent,
        tool_calls: response.tool_calls
      }
    : null;

  const shouldUpdateHistory = chatMode || (assistantContent.trim().length > 0);

  if (shouldUpdateHistory && assistantMessage) {
    useAgencyStore.setState((s) => ({
      agentHistories: {
        ...s.agentHistories,
        [agentIndex]: [...(s.agentHistories[agentIndex] || []), assistantMessage]
      }
    }));
  }

  return { text, functionCalls };
}

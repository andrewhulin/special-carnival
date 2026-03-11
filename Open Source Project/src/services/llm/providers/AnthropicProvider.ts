import { LLMProvider, LLMMessage, LLMToolDefinition, LLMResponse, LLMToolCall } from '../types';

/**
 * Anthropic Claude provider using the Messages API via fetch.
 * Calls go through the Vite dev proxy at /anthropic-api to avoid CORS issues.
 */
export class AnthropicProvider implements LLMProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCompletion(
    messages: LLMMessage[],
    tools?: LLMToolDefinition[],
    systemInstruction?: string,
    modelName: string = 'claude-sonnet-4-20250514',
    signal?: AbortSignal
  ): Promise<LLMResponse> {
    const anthropicMessages = this.mapMessages(messages);
    const anthropicTools = tools?.length ? this.mapTools(tools) : undefined;

    const body: Record<string, unknown> = {
      model: modelName,
      max_tokens: 4096,
      messages: anthropicMessages,
    };

    if (systemInstruction) {
      body.system = systemInstruction;
    }

    if (anthropicTools) {
      body.tools = anthropicTools;
    }

    const response = await fetch('/anthropic-api/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        throw new Error('API key not valid. Please check your Anthropic API key.');
      }
      throw new Error(`Anthropic API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return this.parseResponse(data);
  }

  private mapMessages(messages: LLMMessage[]): Array<Record<string, unknown>> {
    return messages
      .filter(m => m.role !== 'system')
      .map(m => {
        // Tool result messages → Anthropic tool_result content block
        if (m.role === 'tool' && m.name) {
          return {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: m.name,
                content: m.content,
              },
            ],
          };
        }

        // Assistant messages with tool_calls → Anthropic content blocks
        if (m.role === 'assistant' && m.tool_calls?.length) {
          const content: Array<Record<string, unknown>> = [];
          if (m.content) {
            content.push({ type: 'text', text: m.content });
          }
          for (const tc of m.tool_calls) {
            content.push({
              type: 'tool_use',
              id: tc.id,
              name: tc.function.name,
              input: JSON.parse(tc.function.arguments),
            });
          }
          return { role: 'assistant', content };
        }

        // Regular messages
        return {
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        };
      });
  }

  private mapTools(tools: LLMToolDefinition[]): Array<Record<string, unknown>> {
    return tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }

  private parseResponse(data: Record<string, unknown>): LLMResponse {
    const content = data.content as Array<Record<string, unknown>>;
    let textContent: string | null = null;
    const toolCalls: LLMToolCall[] = [];

    for (const block of content) {
      if (block.type === 'text') {
        textContent = (textContent || '') + (block.text as string);
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id as string,
          type: 'function',
          function: {
            name: block.name as string,
            arguments: JSON.stringify(block.input),
          },
        });
      }
    }

    return {
      content: textContent,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    };
  }
}

import { GeminiProvider } from './providers/GeminiProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { LLMProvider, LLMConfig } from './types';

export class LLMFactory {
  static getProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'anthropic':
        if (!config.apiKey) throw new Error('Anthropic API key is required');
        return new AnthropicProvider(config.apiKey);
      case 'gemini':
        if (!config.apiKey) throw new Error('Gemini API key is required');
        return new GeminiProvider(config.apiKey);
      case 'openai':
        throw new Error('OpenAI provider not yet implemented.');
      case 'local':
        throw new Error('Local provider not yet implemented.');
      default:
        throw new Error(`Provider ${config.provider} not supported`);
    }
  }
}

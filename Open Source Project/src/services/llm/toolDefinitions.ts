import { LLMToolDefinition } from './types';

export const AGENCY_TOOLS: LLMToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'give_feedback',
      description: 'Share your honest reaction to what you see on the current screen. Be specific and reference your personal experience.',
      parameters: {
        type: 'object',
        properties: {
          feedback: {
            type: 'string',
            description: 'Your feedback in your own voice and words. Be specific about what you see and how it makes you feel.',
          },
          sentiment: {
            type: 'string',
            enum: ['positive', 'confused', 'frustrated', 'delighted', 'neutral'],
            description: 'How this aspect of the screen makes you feel.',
          },
          about: {
            type: 'string',
            description: 'What specifically you are reacting to (e.g., "the persona picker cards", "the greeting text").',
          },
        },
        required: ['feedback', 'sentiment', 'about'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'express_emotion',
      description: 'Show how you are feeling right now about what you see.',
      parameters: {
        type: 'object',
        properties: {
          emotion: {
            type: 'string',
            enum: ['confused', 'delighted', 'frustrated', 'happy', 'skeptical'],
            description: 'The emotion you are feeling.',
          },
          trigger: {
            type: 'string',
            description: 'What made you feel this way.',
          },
        },
        required: ['emotion', 'trigger'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'think_aloud',
      description: 'Share what you are thinking as a thought bubble. This is your internal monologue — what goes through your head as you look at the screen.',
      parameters: {
        type: 'object',
        properties: {
          thought: {
            type: 'string',
            description: 'Your internal monologue — what you are thinking right now.',
          },
        },
        required: ['thought'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to_screen',
      description: 'Move to the next screen in the app. Call this when you are ready to continue exploring.',
      parameters: {
        type: 'object',
        properties: {
          screen_id: {
            type: 'string',
            description: 'The ID of the screen to navigate to.',
          },
          reason: {
            type: 'string',
            description: 'Why you are moving to this screen.',
          },
        },
        required: ['screen_id', 'reason'],
      },
    },
  },
];

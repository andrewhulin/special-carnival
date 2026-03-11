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
          screen_name: {
            type: 'string',
            description: 'A short name for the current screen you are looking at (e.g., "welcome", "persona-picker", "chat", "dashboard", "onboarding"). Use lowercase with hyphens.',
          },
        },
        required: ['feedback', 'sentiment', 'about', 'screen_name'],
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
      name: 'tap_screen',
      description: 'Tap on a specific element or location on the app screen. Use this to interact with buttons, links, cards, and other tappable elements. The screen is an iPhone (393x852 points). Estimate the x,y coordinates of the element center from the screenshot image. For example, a centered button near the bottom might be at (196, 750).',
      parameters: {
        type: 'object',
        properties: {
          x: {
            type: 'number',
            description: 'The x coordinate to tap (0-393, in iPhone screen points). Estimate from the screenshot.',
          },
          y: {
            type: 'number',
            description: 'The y coordinate to tap (0-852, in iPhone screen points). Estimate from the screenshot.',
          },
          description: {
            type: 'string',
            description: 'What you are tapping on and why (e.g., "the Get Started button to begin onboarding").',
          },
        },
        required: ['x', 'y', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'type_text',
      description: 'Type text into the currently focused text field.',
      parameters: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'The text to type.',
          },
        },
        required: ['text'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scroll',
      description: 'Scroll the current screen up or down to see more content.',
      parameters: {
        type: 'object',
        properties: {
          direction: {
            type: 'string',
            enum: ['up', 'down'],
            description: 'Which direction to scroll.',
          },
        },
        required: ['direction'],
      },
    },
  },
];

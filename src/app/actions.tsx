'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';

// Add Groq provider
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: groq('llama3-8b-8192'), // Use Groq model
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text, toolResults } = await generateText({
    model: groq('llama3-8b-8192'), // Use Groq model
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {
      // showWeather: {
      //   description: 'Show the weather for a given location.',
      //   parameters: z.object({
      //     city: z.string().describe('The city to show the weather for.'),
      //     unit: z
      //       .enum(['F'])
      //       .describe('The unit to display the temperature in'),
      //   }),
      //   execute: async ({ city, unit }) => {
      //     return `Here's the weather for ${city}!`; 
      //   },
      // },
    },
  });

  return {
    messages: [
      ...history,
      {
        role: 'assistant' as const,
        content: text || '',
        // Removed display: stream.value,
      },
    ],
  };
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.GROQ_API_KEY;
  return envVarExists;
}
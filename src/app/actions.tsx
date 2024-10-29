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

// Add OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Add Google Cloud AI provider
const googleCloudAI = createOpenAI({
  apiKey: process.env.GOOGLE_CLOUD_AI_API_KEY,
});

// Add Azure AI provider
const azureAI = createOpenAI({
  apiKey: process.env.AZURE_AI_API_KEY,
});

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  display?: ReactNode;
}

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[], provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' = 'groq') {
  const modelProvider = {
    groq,
    openai,
    googleCloudAI,
    azureAI,
  }[provider];

  const result = await streamText({
    model: modelProvider('llama3-8b-8192'), // Use selected model
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[], provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' = 'groq') {
  const stream = createStreamableUI();

  const modelProvider = {
    groq,
    openai,
    googleCloudAI,
    azureAI,
  }[provider];

  const { text, toolResults } = await generateText({
    model: modelProvider('llama3-8b-8192'), // Use selected model
    system: 'You are a friendly weather assistant!',
    messages: history,
    tools: {},
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

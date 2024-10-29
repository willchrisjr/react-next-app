'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
import { Configuration, OpenAIApi } from "openai"; // Import OpenAI API

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

// Function to get model provider
function getModelProvider(provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI') {
  const modelProviders = {
    groq,
    openai,
    googleCloudAI,
    azureAI,
  };
  return modelProviders[provider];
}

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[], provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' = 'groq', model: string = 'llama3-8b-8192') {
  const modelProvider = getModelProvider(provider);

  const result = await streamText({
    model: modelProvider(model), // Use selected model
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[], provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' = 'groq', model: string = 'llama3-8b-8192') {
  const stream = createStreamableUI();

  const modelProvider = getModelProvider(provider);

  const { text, toolResults } = await generateText({
    model: modelProvider(model), // Use selected model
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

// Function to get chat completion using OpenAI API
export async function getChatCompletion() {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Tell me a joke." },
      ],
    });

    console.log(response.data.choices[0].message?.content);
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(`Error: ${error.message}`);
    }
  }
}

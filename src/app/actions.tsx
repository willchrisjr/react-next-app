'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';
import { z } from 'zod';
import { Configuration, OpenAIApi } from "openai"; // Import OpenAI API
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Retrieve API key and endpoint from environment variables
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;

if (!apiKey || !endpoint) {
  throw new Error('API key or endpoint is not defined in the environment variables');
}

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
function getModelProvider(provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' | 'compare') {
  const modelProviders = {
    groq,
    openai,
    googleCloudAI,
    azureAI,
  };
  return modelProviders[provider];
}

// Function to compare responses from different AI models
export async function compareAIModels(messages: CoreMessage[], models: string[]) {
  const results = await Promise.all(models.map(async (model) => {
    const result = await streamText({
      model: openai(model), // Assuming openai for comparison, adjust as needed
      messages,
    });
    return {
      model,
      response: result.textStream,
    };
  }));

  return results;
}

// Streaming Chat 
export async function continueTextConversation(messages: CoreMessage[], provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' | 'compare' = 'groq', model: string = 'llama3-8b-8192') {
  if (provider === 'compare') {
    const models = ['llama3-8b-8192', 'gpt-3.5-turbo', 'palm-2', 'davinci']; // Example models to compare
    const results = await compareAIModels(messages, models);
    return results;
  }

  const modelProvider = getModelProvider(provider);

  const result = await streamText({
    model: modelProvider(model), // Use selected model
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

// Gen UIs 
export async function continueConversation(history: Message[], provider: 'groq' | 'openai' | 'googleCloudAI' | 'azureAI' | 'compare' = 'groq', model: string = 'llama3-8b-8192') {
  if (provider === 'compare') {
    const models = ['llama3-8b-8192', 'gpt-3.5-turbo', 'palm-2', 'davinci']; // Example models to compare
    const results = await compareAIModels(history, models);
    return {
      messages: [
        ...history,
        ...results.map(result => ({
          role: 'assistant' as const,
          content: result.response,
        })),
      ],
    };
  }

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
  const envVarExists = !!process.env.GROQ_API_KEY || !!process.env.OPENAI_API_KEY;
  return envVarExists;
}

// Function to get chat completion using OpenAI API
export async function getChatCompletion() {
  try {
    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Tell me a joke.' },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    console.log(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

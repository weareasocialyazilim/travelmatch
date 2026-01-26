/**
 * OpenAI Client Wrapper
 * Centralized OpenAI API integration for all ML services
 * Updated: 2026-01-26 - Updated to current model versions
 *
 * Model Versions:
 * - gpt-4o (2024) replaced gpt-4-turbo-preview
 * - gpt-4o-mini for cost-efficient vision tasks
 * - text-embedding-3-small replaced text-embedding-ada-002
 */

import OpenAI from 'openai';

// Environment compatibility: Support both Deno and Node.js
const getEnvVar = (key: string): string => {
  // Try Deno first
  if (
    typeof (
      globalThis as unknown as {
        Deno?: { env: { get: (k: string) => string | undefined } };
      }
    ).Deno !== 'undefined'
  ) {
    return (
      (
        globalThis as unknown as {
          Deno: { env: { get: (k: string) => string | undefined } };
        }
      ).Deno.env.get(key) ?? ''
    );
  }
  // Fallback to Node.js
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? '';
  }
  return '';
};

// AI startup check - disable gracefully if API key missing
const openaiApiKey = getEnvVar('OPENAI_API_KEY');
const isAiEnabled = openaiApiKey.length > 0;

const openai = isAiEnabled
  ? new OpenAI({
      apiKey: openaiApiKey,
    })
  : null;

/**
 * Configuration for AI models - single source of truth
 */
export const AI_MODELS = {
  vision: 'gpt-4o-mini', // Cost-efficient vision analysis
  chat: 'gpt-4o', // Latest GPT-4 for text generation
  embeddings: 'text-embedding-3-small', // Faster, smaller embeddings
  moderation: 'gpt-4o', // For content moderation fallback
} as const;

// Fallback handler when AI is disabled
function throwIfAiDisabled(): void {
  if (!isAiEnabled) {
    throw new Error('AI service is disabled (OPENAI_API_KEY not configured)');
  }
}

/**
 * Analyze image using GPT-4 Vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
): Promise<string> {
  throwIfAiDisabled();

  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const response = await openai.chat.completions.create({
    model: AI_MODELS.vision,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    max_tokens: 500,
  });

  return response.choices[0].message.content || '';
}

/**
 * Generate text using GPT-4
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  throwIfAiDisabled();

  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const messages: any[] = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await openai.chat.completions.create({
    model: AI_MODELS.chat,
    messages,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}

/**
 * Check content moderation (uses OpenAI Moderations API)
 */
export async function moderateContent(content: string): Promise<{
  flagged: boolean;
  categories: Record<string, boolean>;
}> {
  throwIfAiDisabled();

  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const response = await openai.moderations.create({
    input: content,
  });

  const result = response.results[0];

  return {
    flagged: result.flagged,
    categories: result.categories as Record<string, boolean>,
  };
}

/**
 * Generate embeddings for semantic search
 * Uses text-embedding-3-small (faster and cheaper than ada-002)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  throwIfAiDisabled();

  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const response = await openai.embeddings.create({
    model: AI_MODELS.embeddings,
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Batch generate embeddings
 */
export async function batchGenerateEmbeddings(
  texts: string[],
): Promise<number[][]> {
  throwIfAiDisabled();

  if (!openai) {
    throw new Error('OpenAI client not initialized');
  }

  const response = await openai.embeddings.create({
    model: AI_MODELS.embeddings,
    input: texts,
  });

  return response.data.map((d) => d.embedding);
}

/**
 * Calculate cosine similarity between embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Check if AI services are enabled
 */
export function isAiServiceEnabled(): boolean {
  return isAiEnabled;
}

/**
 * Get AI service status for diagnostics
 */
export function getAiServiceStatus(): {
  enabled: boolean;
  configuredModels: string[];
} {
  return {
    enabled: isAiEnabled,
    configuredModels: isAiEnabled ? Object.values(AI_MODELS) : [],
  };
}

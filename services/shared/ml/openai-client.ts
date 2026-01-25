/**
 * OpenAI Client Wrapper
 * Centralized OpenAI API integration for all ML services
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

const openai = new OpenAI({
  apiKey: getEnvVar('OPENAI_API_KEY'),
});

/**
 * Analyze image using GPT-4 Vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string,
): Promise<any> {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
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

  return response.choices[0].message.content;
}

/**
 * Generate text using GPT-4
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  const messages: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || '';
}

/**
 * Check content moderation
 */
export async function moderateContent(content: string): Promise<{
  flagged: boolean;
  categories: Record<string, boolean>;
}> {
  const response = await openai.moderations.create({
    input: content,
  });

  const result = response.results[0];

  return {
    flagged: result.flagged,
    categories: result.categories,
  };
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
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
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
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

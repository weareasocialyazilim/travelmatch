/**
 * OpenAI Client Wrapper
 * Centralized OpenAI API integration for all ML services
 *
 * Features:
 * - Rate limiting to prevent hitting OpenAI API limits
 * - Retry with exponential backoff
 * - Proper TypeScript types
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY') ?? '',
});

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitState {
  tokens: number;
  lastRefill: number;
}

/**
 * Token bucket rate limiter for OpenAI API calls
 * Default: 50 requests per minute (conservative limit)
 */
class OpenAIRateLimiter {
  private state: RateLimitState;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per millisecond

  constructor(requestsPerMinute: number = 50) {
    this.maxTokens = requestsPerMinute;
    this.refillRate = requestsPerMinute / 60000; // convert to per-ms
    this.state = {
      tokens: requestsPerMinute,
      lastRefill: Date.now(),
    };
  }

  /**
   * Wait for a token to become available, then consume it
   */
  async acquire(): Promise<void> {
    this.refill();

    if (this.state.tokens >= 1) {
      this.state.tokens -= 1;
      return;
    }

    // Calculate wait time until next token
    const tokensNeeded = 1 - this.state.tokens;
    const waitTime = Math.ceil(tokensNeeded / this.refillRate);

    console.warn(`[OpenAI] Rate limit reached, waiting ${waitTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));

    this.refill();
    this.state.tokens -= 1;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.state.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.state.tokens = Math.min(this.maxTokens, this.state.tokens + tokensToAdd);
    this.state.lastRefill = now;
  }
}

// Separate rate limiters for different API types
const chatRateLimiter = new OpenAIRateLimiter(50); // 50 chat requests/min
const embeddingRateLimiter = new OpenAIRateLimiter(100); // 100 embedding requests/min
const moderationRateLimiter = new OpenAIRateLimiter(100); // 100 moderation requests/min

// ============================================================================
// Retry Logic
// ============================================================================

/**
 * Retry a function with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on non-retryable errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 401 || error.status === 403) {
          throw error; // Auth errors - don't retry
        }
        if (error.status === 429) {
          // Rate limit - wait longer
          const delay = baseDelay * Math.pow(2, attempt) * 2;
          console.warn(`[OpenAI] Rate limited (429), waiting ${delay}ms before retry`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(`[OpenAI] Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Analyze image using GPT-4 Vision
 */
export async function analyzeImage(
  imageUrl: string,
  prompt: string
): Promise<string | null> {
  await chatRateLimiter.acquire();

  return withRetry(async () => {
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
  });
}

/**
 * Generate text using GPT-4
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  await chatRateLimiter.acquire();

  return withRetry(async () => {
    const messages: ChatCompletionMessageParam[] = [];

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
  });
}

/**
 * Check content moderation
 */
export async function moderateContent(
  content: string
): Promise<{
  flagged: boolean;
  categories: Record<string, boolean>;
}> {
  await moderationRateLimiter.acquire();

  return withRetry(async () => {
    const response = await openai.moderations.create({
      input: content,
    });

    const result = response.results[0];

    return {
      flagged: result.flagged,
      categories: result.categories as Record<string, boolean>,
    };
  });
}

/**
 * Generate embeddings for semantic search
 */
export async function generateEmbedding(
  text: string
): Promise<number[]> {
  await embeddingRateLimiter.acquire();

  return withRetry(async () => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  });
}

/**
 * Batch generate embeddings
 */
export async function batchGenerateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  await embeddingRateLimiter.acquire();

  return withRetry(async () => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: texts,
    });

    return response.data.map((d) => d.embedding);
  });
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

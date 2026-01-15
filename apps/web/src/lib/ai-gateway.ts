/**
 * Lovendo AI Gateway
 * Clean interface for ML service integration
 *
 * Connects web frontend to Supabase Edge Functions (ml-gateway)
 * for recommendation engine, price prediction, and proof verification
 */

type AIEndpoint =
  | 'recommendations'
  | 'price-prediction'
  | 'proof-verification'
  | 'moment-analysis';

interface AIRequestConfig {
  endpoint: AIEndpoint;
  payload: Record<string, unknown>;
  timeout?: number;
}

interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RecommendationResult {
  moments: Array<{
    id: string;
    title: string;
    score: number;
    reason: string;
  }>;
}

interface PricePredictionResult {
  suggestedPrice: number;
  confidence: number;
  factors: string[];
}

interface ProofVerificationResult {
  isValid: boolean;
  confidence: number;
  detectedLocation?: string;
}

// Base URL for ML Gateway (Supabase Edge Function)
const ML_GATEWAY_URL =
  process.env.NEXT_PUBLIC_ML_GATEWAY_URL ||
  'https://api.lovendo.xyz/functions/v1/ml-gateway';

/**
 * Make a request to the AI Gateway
 * Uses requestIdleCallback for non-blocking execution
 */
async function aiRequest<T>(config: AIRequestConfig): Promise<AIResponse<T>> {
  const { endpoint, payload, timeout = 10000 } = config;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${ML_GATEWAY_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data: data as T };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Get personalized moment recommendations
 * Uses ML recommendation engine based on user preferences
 */
export async function getRecommendations(
  userId: string,
  preferences?: {
    city?: string;
    priceRange?: [number, number];
    categories?: string[];
  },
): Promise<AIResponse<RecommendationResult>> {
  return aiRequest<RecommendationResult>({
    endpoint: 'recommendations',
    payload: { userId, preferences },
  });
}

/**
 * Get price prediction for a moment
 * Uses ML model trained on historical pricing data
 */
export async function getPricePrediction(
  momentId: string,
  date: Date,
): Promise<AIResponse<PricePredictionResult>> {
  return aiRequest<PricePredictionResult>({
    endpoint: 'price-prediction',
    payload: { momentId, date: date.toISOString() },
  });
}

/**
 * Verify proof of experience
 * Uses computer vision to validate location and authenticity
 */
export async function verifyProof(
  imageUrl: string,
  expectedLocation: string,
): Promise<AIResponse<ProofVerificationResult>> {
  return aiRequest<ProofVerificationResult>({
    endpoint: 'proof-verification',
    payload: { imageUrl, expectedLocation },
  });
}

/**
 * Schedule AI request during browser idle time
 * Prevents blocking main thread during initial page load
 */
export function scheduleAIRequest<T>(
  requestFn: () => Promise<AIResponse<T>>,
  callback: (result: AIResponse<T>) => void,
): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(async () => {
      const result = await requestFn();
      callback(result);
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(async () => {
      const result = await requestFn();
      callback(result);
    }, 1);
  }
}

/**
 * React hook helper for AI requests
 * Returns a function that can be called with useEffect
 */
export function createAIFetcher<T>(
  requestFn: () => Promise<AIResponse<T>>,
): () => Promise<AIResponse<T>> {
  return async () => {
    try {
      return await requestFn();
    } catch {
      return { success: false, error: 'Request failed' };
    }
  };
}

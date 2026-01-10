/**
 * AI Service
 *
 * Comprehensive AI/ML service for TravelMatch mobile app.
 * Integrates with ML service via Supabase Edge Functions.
 *
 * Features:
 * - Proof Verification (KYC & Experience)
 * - Price Prediction & Dynamic Pricing
 * - Turkish NLP (Sentiment, Moderation)
 * - Smart Recommendations
 * - AI Chatbot Assistant
 * - Demand Forecasting
 */

import { BaseService } from './BaseService';
import { supabase } from './supabase';

// =============================================================================
// Types
// =============================================================================

// Proof Verification
export interface ProofVerificationRequest {
  imageUrl: string;
  proofType: 'selfie_with_id' | 'experience_photo' | 'receipt' | 'location';
  momentId?: string;
  claimedLocation?: string;
  exifData?: {
    latitude?: number;
    longitude?: number;
    timestamp?: string;
  };
}

export interface ProofVerificationResult {
  overall: number;
  approved: boolean;
  status: 'verified' | 'rejected' | 'needs_review';
  breakdown: {
    faceQuality?: number;
    idQuality?: number;
    locationMatch?: number;
    imageAuthenticity?: number;
    landmarkMatch?: number;
  };
  issues: string[];
  suggestions: string[];
  detectedLandmarks?: string[];
}

// Price Prediction
export interface PricePredictionRequest {
  category: string;
  location: string;
  duration?: number;
  features?: string[];
  targetDate?: string;
}

export interface PricePredictionResult {
  predictedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  priceRange: {
    budget: number;
    standard: number;
    premium: number;
  };
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
}

export interface DynamicPriceRequest {
  basePrice: number;
  category: string;
  location: string;
  currentDemand?: number;
}

export interface DynamicPriceResult {
  finalPrice: number;
  adjustments: {
    type: string;
    multiplier: number;
    reason: string;
  }[];
  demandLevel: 'low' | 'normal' | 'high' | 'surge';
  validUntil: string;
}

// NLP
export interface NLPAnalysisRequest {
  text: string;
  analysisType?: 'full' | 'sentiment' | 'entities' | 'moderation';
}

export interface NLPAnalysisResult {
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  };
  entities: {
    text: string;
    type: 'location' | 'person' | 'date' | 'price' | 'category';
    confidence: number;
  }[];
  moderation: {
    approved: boolean;
    flags: string[];
    toxicityScore: number;
  };
  keywords: string[];
  language: string;
}

export interface TitleEnhanceResult {
  originalTitle: string;
  enhancedTitle: string;
  hashtags: string[];
  seoScore: number;
  suggestions: string[];
}

// Recommendations
export interface RecommendationRequest {
  context?: {
    occasion?: string;
    budget?: { min: number; max: number };
    location?: string;
    recipientAge?: number;
    recipientGender?: string;
  };
  limit?: number;
  excludeMomentIds?: string[];
}

export interface MomentRecommendation {
  momentId: string;
  score: number;
  reason: string;
  matchFactors: {
    factor: string;
    score: number;
  }[];
}

export interface RecipientRecommendation {
  userId: string;
  username: string;
  score: number;
  matchReason: string;
  commonInterests: string[];
}

// Chatbot
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    intent?: string;
    entities?: Record<string, string>;
    suggestions?: string[];
  };
}

export interface ChatResponse {
  message: string;
  intent: string;
  confidence: number;
  suggestions: string[];
  actions?: {
    type: 'navigate' | 'create_moment' | 'search' | 'support';
    data: Record<string, unknown>;
  }[];
  quickReplies?: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  priority: number;
}

// Forecasting
export interface ForecastRequest {
  category?: string;
  location?: string;
  horizon: number; // days
}

export interface ForecastResult {
  predictions: {
    date: string;
    predictedDemand: number;
    confidence: number;
    factors: string[];
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: {
    dayOfWeek: number[];
    monthOfYear: number[];
  };
  recommendations: string[];
}

// =============================================================================
// AI Service Implementation
// =============================================================================

class AIServiceImpl extends BaseService {
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    super({
      name: 'AIService',
      defaultRetries: 2,
      enableLogging: true,
      offlineQueueEnabled: false, // AI requires network
    });
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private async callML<T>(
    endpoint: string,
    body?: Record<string, unknown>,
    method: 'GET' | 'POST' = 'POST',
  ): Promise<T> {
    return this.withRetry(async () => {
      const { data, error } = await supabase.functions.invoke('ml-gateway', {
        body: {
          endpoint,
          method,
          body,
        },
      });

      if (error) {
        throw new Error(`ML service error: ${error.message}`);
      }

      return data as T;
    });
  }

  // ===========================================================================
  // Proof Verification
  // ===========================================================================

  /**
   * Verify a proof image (KYC or experience)
   */
  async verifyProof(
    request: ProofVerificationRequest,
  ): Promise<ProofVerificationResult> {
    this.log('Verifying proof', { type: request.proofType });

    const result = await this.callML<ProofVerificationResult>('proof/verify', {
      imageUrl: request.imageUrl,
      proofType: request.proofType,
      momentId: request.momentId,
      claimedLocation: request.claimedLocation,
      exifData: request.exifData,
    });

    this.log('Proof verification complete', {
      approved: result.approved,
      score: result.overall,
    });

    return result;
  }

  /**
   * Check if a proof image is a duplicate
   */
  async checkDuplicateProof(imageUrl: string): Promise<{
    isDuplicate: boolean;
    similarProofs?: { momentId: string; similarity: number }[];
  }> {
    return this.callML('proof/check-duplicate', { imageUrl });
  }

  // ===========================================================================
  // Price Prediction & Dynamic Pricing
  // ===========================================================================

  /**
   * Predict price for a moment
   */
  async predictPrice(
    request: PricePredictionRequest,
  ): Promise<PricePredictionResult> {
    this.log('Predicting price', { category: request.category });

    return this.callML<PricePredictionResult>('price/predict', {
      category: request.category,
      location: request.location,
      duration: request.duration,
      features: request.features,
      targetDate: request.targetDate,
    });
  }

  /**
   * Get dynamic price adjustment
   */
  async getDynamicPrice(
    request: DynamicPriceRequest,
  ): Promise<DynamicPriceResult> {
    return this.callML<DynamicPriceResult>('price/dynamic', {
      basePrice: request.basePrice,
      category: request.category,
      location: request.location,
      currentDemand: request.currentDemand,
    });
  }

  /**
   * Analyze price for a moment
   */
  async analyzePrice(
    price: number,
    category: string,
    location: string,
  ): Promise<{
    isCompetitive: boolean;
    percentile: number;
    suggestion: string;
    recommendedRange: { min: number; max: number };
  }> {
    return this.callML('price/analyze', { price, category, location });
  }

  /**
   * Get price history for category
   */
  async getPriceHistory(
    category: string,
    days: number = 30,
  ): Promise<{ date: string; avgPrice: number; volume: number }[]> {
    return this.callML(`price/history/${category}`, { days }, 'GET');
  }

  // ===========================================================================
  // Turkish NLP
  // ===========================================================================

  /**
   * Analyze text with NLP
   */
  async analyzeText(request: NLPAnalysisRequest): Promise<NLPAnalysisResult> {
    return this.callML<NLPAnalysisResult>('nlp/analyze', {
      text: request.text,
      analysisType: request.analysisType || 'full',
    });
  }

  /**
   * Get sentiment for text
   */
  async getSentiment(text: string): Promise<{
    score: number;
    label: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }> {
    return this.callML('nlp/sentiment', { text });
  }

  /**
   * Enhance moment title
   */
  async enhanceTitle(
    title: string,
    category?: string,
  ): Promise<TitleEnhanceResult> {
    return this.callML<TitleEnhanceResult>('nlp/enhance-title', {
      title,
      category,
    });
  }

  /**
   * Generate hashtags for moment
   */
  async generateHashtags(
    title: string,
    description?: string,
    category?: string,
  ): Promise<string[]> {
    const result = await this.callML<{ hashtags: string[] }>('nlp/hashtags', {
      title,
      description,
      category,
    });
    return result.hashtags;
  }

  /**
   * Moderate content
   */
  async moderateContent(text: string): Promise<{
    approved: boolean;
    flags: string[];
    toxicityScore: number;
    suggestedEdit?: string;
  }> {
    return this.callML('nlp/moderate', { text });
  }

  // ===========================================================================
  // Recommendations
  // ===========================================================================

  /**
   * Get personalized moment recommendations
   */
  async getRecommendations(
    request: RecommendationRequest = {},
  ): Promise<MomentRecommendation[]> {
    this.log('Getting recommendations', { context: request.context });

    return this.callML<MomentRecommendation[]>('recommendations', {
      context: request.context,
      limit: request.limit || 10,
      excludeMomentIds: request.excludeMomentIds,
    });
  }

  /**
   * Get similar moments
   */
  async getSimilarMoments(
    momentId: string,
    limit: number = 5,
  ): Promise<MomentRecommendation[]> {
    return this.callML<MomentRecommendation[]>('recommendations/similar', {
      momentId,
      limit,
    });
  }

  /**
   * Get trending moments
   */
  async getTrendingMoments(
    category?: string,
    location?: string,
  ): Promise<MomentRecommendation[]> {
    return this.callML<MomentRecommendation[]>(
      'recommendations/trending',
      { category, location },
      'GET',
    );
  }

  /**
   * Get recipient recommendations for a moment
   */
  async getRecipientRecommendations(
    momentId: string,
    limit: number = 5,
  ): Promise<RecipientRecommendation[]> {
    return this.callML<RecipientRecommendation[]>(
      'recommendations/recipients',
      {
        momentId,
        limit,
      },
    );
  }

  // ===========================================================================
  // Chatbot
  // ===========================================================================

  /**
   * Send message to AI chatbot
   */
  async chat(message: string): Promise<ChatResponse> {
    this.log('Chat message', { messageLength: message.length });

    // Add to history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    // Keep last 10 messages for context
    const recentHistory = this.conversationHistory.slice(-10);

    const response = await this.callML<ChatResponse>('chat', {
      message,
      conversationHistory: recentHistory,
    });

    // Add response to history
    this.conversationHistory.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: response.intent,
        suggestions: response.suggestions,
      },
    });

    return response;
  }

  /**
   * Get quick actions for user
   */
  async getQuickActions(): Promise<QuickAction[]> {
    return this.callML<QuickAction[]>('chat/quick-actions', {}, 'GET');
  }

  /**
   * Clear conversation history
   */
  clearConversation(): void {
    this.conversationHistory = [];
    this.log('Conversation cleared');
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // ===========================================================================
  // Forecasting
  // ===========================================================================

  /**
   * Get demand forecast
   */
  async getForecast(request: ForecastRequest): Promise<ForecastResult> {
    return this.callML<ForecastResult>('forecast', {
      category: request.category,
      location: request.location,
      horizon: request.horizon,
    });
  }

  /**
   * Get category trends
   */
  async getCategoryTrends(): Promise<
    {
      category: string;
      trend: 'rising' | 'falling' | 'stable';
      changePercent: number;
      topMoments: string[];
    }[]
  > {
    return this.callML('forecast/trends', {}, 'GET');
  }

  /**
   * Check capacity for an experience
   */
  async checkCapacity(
    category: string,
    location: string,
    date: string,
  ): Promise<{
    available: boolean;
    estimatedCapacity: number;
    recommendation: string;
    alternativeDates?: string[];
  }> {
    return this.callML('forecast/capacity', { category, location, date });
  }

  // ===========================================================================
  // Gift Advisor (Special Flow)
  // ===========================================================================

  /**
   * Get gift suggestions based on recipient
   */
  async getGiftSuggestions(recipientInfo: {
    age?: number;
    gender?: string;
    interests?: string[];
    relationship?: string;
    budget?: { min: number; max: number };
    occasion?: string;
  }): Promise<{
    suggestions: MomentRecommendation[];
    reasoning: string;
    alternatives: string[];
  }> {
    return this.callML('chat/gift-advisor', {
      action: 'suggest',
      recipientInfo,
    });
  }

  /**
   * Analyze a gift choice
   */
  async analyzeGiftChoice(
    momentId: string,
    recipientInfo: {
      age?: number;
      gender?: string;
      interests?: string[];
    },
  ): Promise<{
    matchScore: number;
    pros: string[];
    cons: string[];
    alternatives: MomentRecommendation[];
  }> {
    return this.callML('chat/gift-advisor', {
      action: 'analyze',
      momentId,
      recipientInfo,
    });
  }
}

// Export singleton instance
export const AIService = new AIServiceImpl();
export default AIService;

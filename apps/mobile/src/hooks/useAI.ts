/**
 * AI Hooks
 *
 * React hooks for AI/ML features in TravelMatch mobile app.
 * Provides easy-to-use hooks for all AI capabilities.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIService } from '../services/aiService';
import type {
  ProofVerificationRequest,
  ProofVerificationResult,
  PricePredictionRequest,
  PricePredictionResult,
  DynamicPriceRequest,
  DynamicPriceResult,
  NLPAnalysisRequest,
  NLPAnalysisResult,
  TitleEnhanceResult,
  RecommendationRequest,
  MomentRecommendation,
  RecipientRecommendation,
  ChatMessage,
  ChatResponse,
  QuickAction,
  ForecastRequest,
  ForecastResult,
} from '../services/aiService';

// =============================================================================
// Query Keys
// =============================================================================

export const aiQueryKeys = {
  recommendations: (params?: RecommendationRequest) =>
    ['ai', 'recommendations', params] as const,
  similarMoments: (momentId: string) =>
    ['ai', 'similar-moments', momentId] as const,
  trending: (category?: string, location?: string) =>
    ['ai', 'trending', category, location] as const,
  recipientRecommendations: (momentId: string) =>
    ['ai', 'recipient-recommendations', momentId] as const,
  quickActions: () => ['ai', 'quick-actions'] as const,
  categoryTrends: () => ['ai', 'category-trends'] as const,
  priceHistory: (category: string, days?: number) =>
    ['ai', 'price-history', category, days] as const,
  forecast: (params: ForecastRequest) => ['ai', 'forecast', params] as const,
};

// =============================================================================
// Proof Verification Hook
// =============================================================================

export function useProofVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<ProofVerificationResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const verify = useCallback(async (request: ProofVerificationRequest) => {
    setIsVerifying(true);
    setError(null);

    try {
      const verificationResult = await AIService.verifyProof(request);
      setResult(verificationResult);
      return verificationResult;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Verification failed');
      setError(error);
      throw error;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const checkDuplicate = useCallback(async (imageUrl: string) => {
    return AIService.checkDuplicateProof(imageUrl);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    verify,
    checkDuplicate,
    isVerifying,
    result,
    error,
    reset,
  };
}

// =============================================================================
// Price Prediction Hook
// =============================================================================

export function usePricePrediction() {
  const mutation = useMutation({
    mutationFn: (request: PricePredictionRequest) =>
      AIService.predictPrice(request),
  });

  const dynamicPriceMutation = useMutation({
    mutationFn: (request: DynamicPriceRequest) =>
      AIService.getDynamicPrice(request),
  });

  const analyzeMutation = useMutation({
    mutationFn: ({
      price,
      category,
      location,
    }: {
      price: number;
      category: string;
      location: string;
    }) => AIService.analyzePrice(price, category, location),
  });

  return {
    // Predict
    predict: mutation.mutateAsync,
    prediction: mutation.data,
    isPredicting: mutation.isPending,
    predictionError: mutation.error,

    // Dynamic pricing
    getDynamicPrice: dynamicPriceMutation.mutateAsync,
    dynamicPrice: dynamicPriceMutation.data,
    isGettingDynamicPrice: dynamicPriceMutation.isPending,

    // Analyze
    analyze: analyzeMutation.mutateAsync,
    analysis: analyzeMutation.data,
    isAnalyzing: analyzeMutation.isPending,
  };
}

export function usePriceHistory(category: string, days: number = 30) {
  return useQuery({
    queryKey: aiQueryKeys.priceHistory(category, days),
    queryFn: () => AIService.getPriceHistory(category, days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!category,
  });
}

// =============================================================================
// NLP Hook
// =============================================================================

export function useNLP() {
  const analyzeMutation = useMutation({
    mutationFn: (request: NLPAnalysisRequest) => AIService.analyzeText(request),
  });

  const sentimentMutation = useMutation({
    mutationFn: (text: string) => AIService.getSentiment(text),
  });

  const enhanceTitleMutation = useMutation({
    mutationFn: ({ title, category }: { title: string; category?: string }) =>
      AIService.enhanceTitle(title, category),
  });

  const hashtagsMutation = useMutation({
    mutationFn: ({
      title,
      description,
      category,
    }: {
      title: string;
      description?: string;
      category?: string;
    }) => AIService.generateHashtags(title, description, category),
  });

  const moderateMutation = useMutation({
    mutationFn: (text: string) => AIService.moderateContent(text),
  });

  return {
    // Full analysis
    analyze: analyzeMutation.mutateAsync,
    analysis: analyzeMutation.data,
    isAnalyzing: analyzeMutation.isPending,

    // Sentiment
    getSentiment: sentimentMutation.mutateAsync,
    sentiment: sentimentMutation.data,
    isGettingSentiment: sentimentMutation.isPending,

    // Title enhancement
    enhanceTitle: enhanceTitleMutation.mutateAsync,
    enhancedTitle: enhanceTitleMutation.data,
    isEnhancing: enhanceTitleMutation.isPending,

    // Hashtags
    generateHashtags: hashtagsMutation.mutateAsync,
    hashtags: hashtagsMutation.data,
    isGeneratingHashtags: hashtagsMutation.isPending,

    // Moderation
    moderate: moderateMutation.mutateAsync,
    moderation: moderateMutation.data,
    isModerating: moderateMutation.isPending,
  };
}

// =============================================================================
// Recommendations Hook
// =============================================================================

export function useRecommendations(params?: RecommendationRequest) {
  return useQuery({
    queryKey: aiQueryKeys.recommendations(params),
    queryFn: () => AIService.getRecommendations(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSimilarMoments(momentId: string | undefined) {
  return useQuery({
    queryKey: aiQueryKeys.similarMoments(momentId!),
    queryFn: () => AIService.getSimilarMoments(momentId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!momentId,
  });
}

export function useTrendingMoments(category?: string, location?: string) {
  return useQuery({
    queryKey: aiQueryKeys.trending(category, location),
    queryFn: () => AIService.getTrendingMoments(category, location),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecipientRecommendations(momentId: string | undefined) {
  return useQuery({
    queryKey: aiQueryKeys.recipientRecommendations(momentId!),
    queryFn: () => AIService.getRecipientRecommendations(momentId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!momentId,
  });
}

// =============================================================================
// Chatbot Hook
// =============================================================================

export function useAIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();

  // Quick actions
  const quickActionsQuery = useQuery({
    queryKey: aiQueryKeys.quickActions(),
    queryFn: () => AIService.getQuickActions(),
    staleTime: 10 * 60 * 1000,
  });

  // Send message
  const sendMessage = useCallback(
    async (message: string): Promise<ChatResponse> => {
      // Add user message optimistically
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await AIService.chat(message);

        // Add assistant response
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          metadata: {
            intent: response.intent,
            suggestions: response.suggestions,
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);

        return response;
      } catch {
        // Remove failed user message
        setMessages((prev) => prev.slice(0, -1));
        throw new Error('Failed to send message');
      } finally {
        setIsTyping(false);
      }
    },
    [],
  );

  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    AIService.clearConversation();
  }, []);

  // Load history from service
  useEffect(() => {
    const history = AIService.getConversationHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat,
    quickActions: quickActionsQuery.data || [],
    isLoadingQuickActions: quickActionsQuery.isLoading,
  };
}

// =============================================================================
// Forecasting Hook
// =============================================================================

export function useForecast(params: ForecastRequest) {
  return useQuery({
    queryKey: aiQueryKeys.forecast(params),
    queryFn: () => AIService.getForecast(params),
    staleTime: 5 * 60 * 1000,
    enabled: params.horizon > 0,
  });
}

export function useCategoryTrends() {
  return useQuery({
    queryKey: aiQueryKeys.categoryTrends(),
    queryFn: () => AIService.getCategoryTrends(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCapacityCheck() {
  const mutation = useMutation({
    mutationFn: ({
      category,
      location,
      date,
    }: {
      category: string;
      location: string;
      date: string;
    }) => AIService.checkCapacity(category, location, date),
  });

  return {
    checkCapacity: mutation.mutateAsync,
    capacity: mutation.data,
    isChecking: mutation.isPending,
    error: mutation.error,
  };
}

// =============================================================================
// Gift Advisor Hook
// =============================================================================

export function useGiftAdvisor() {
  const suggestionsMutation = useMutation({
    mutationFn: (recipientInfo: {
      age?: number;
      gender?: string;
      interests?: string[];
      relationship?: string;
      budget?: { min: number; max: number };
      occasion?: string;
    }) => AIService.getGiftSuggestions(recipientInfo),
  });

  const analyzeMutation = useMutation({
    mutationFn: ({
      momentId,
      recipientInfo,
    }: {
      momentId: string;
      recipientInfo: {
        age?: number;
        gender?: string;
        interests?: string[];
      };
    }) => AIService.analyzeGiftChoice(momentId, recipientInfo),
  });

  return {
    // Get suggestions
    getSuggestions: suggestionsMutation.mutateAsync,
    suggestions: suggestionsMutation.data,
    isGettingSuggestions: suggestionsMutation.isPending,

    // Analyze choice
    analyzeChoice: analyzeMutation.mutateAsync,
    analysis: analyzeMutation.data,
    isAnalyzing: analyzeMutation.isPending,
  };
}

// =============================================================================
// Smart Title Input Hook (for CreateMoment)
// =============================================================================

export function useSmartTitleInput(initialTitle: string = '') {
  const [title, setTitle] = useState(initialTitle);
  const [debouncedTitle, setDebouncedTitle] = useState(initialTitle);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce title changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setDebouncedTitle(title);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [title]);

  // Auto-enhance query
  const enhanceQuery = useQuery({
    queryKey: ['ai', 'smart-title', debouncedTitle],
    queryFn: () => AIService.enhanceTitle(debouncedTitle),
    enabled: debouncedTitle.length >= 5,
    staleTime: 60 * 1000,
  });

  // Moderation check
  const moderationQuery = useQuery({
    queryKey: ['ai', 'moderation', debouncedTitle],
    queryFn: () => AIService.moderateContent(debouncedTitle),
    enabled: debouncedTitle.length >= 3,
    staleTime: 60 * 1000,
  });

  const applyEnhancement = useCallback(() => {
    if (enhanceQuery.data?.enhancedTitle) {
      setTitle(enhanceQuery.data.enhancedTitle);
    }
  }, [enhanceQuery.data?.enhancedTitle]);

  return {
    title,
    setTitle,
    enhancedTitle: enhanceQuery.data?.enhancedTitle,
    hashtags: enhanceQuery.data?.hashtags || [],
    suggestions: enhanceQuery.data?.suggestions || [],
    isEnhancing: enhanceQuery.isLoading,
    moderation: moderationQuery.data,
    isApproved: moderationQuery.data?.approved ?? true,
    applyEnhancement,
  };
}

// =============================================================================
// Export All
// =============================================================================

export {
  type ProofVerificationRequest,
  type ProofVerificationResult,
  type PricePredictionRequest,
  type PricePredictionResult,
  type DynamicPriceRequest,
  type DynamicPriceResult,
  type NLPAnalysisRequest,
  type NLPAnalysisResult,
  type TitleEnhanceResult,
  type RecommendationRequest,
  type MomentRecommendation,
  type RecipientRecommendation,
  type ChatMessage,
  type ChatResponse,
  type QuickAction,
  type ForecastRequest,
  type ForecastResult,
};

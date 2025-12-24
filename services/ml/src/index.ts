/**
 * @travelmatch/ml-services
 *
 * Machine Learning services for TravelMatch platform
 *
 * This package contains ML-related utilities and services.
 * Edge Functions (smart-notifications, etc.) are deployed separately via Supabase.
 */

// ML services will be implemented here
// For now, export placeholder types

export interface MLConfig {
  enabled: boolean;
  modelVersion: string;
}

export interface NotificationPrediction {
  userId: string;
  type: string;
  probability: number;
  recommendedTime: Date;
}

export interface PersonalizationResult {
  userId: string;
  preferences: Record<string, unknown>;
  recommendations: string[];
}

/**
 * Personalization Engine
 * ML-driven recommendation system with user profiling
 */

import { logger } from '../utils/logger';
// import { analytics } from './analytics'; // Removed as analytics service was deleted
import type { Moment } from '../types';

/**
 * User Profile Interface
 */
export interface UserProfile {
  userId: string;
  favoriteActivities: string[];
  priceRange: { min: number; max: number };
  preferredDates: 'weekdays' | 'weekends' | 'flexible';
  favoriteLocations: string[];
  travelStyle: 'budget' | 'comfort' | 'luxury';
  lastUpdated: number;
}

/**
 * User Behavior Tracking
 */
interface UserInteraction {
  type: 'view' | 'like' | 'book' | 'search' | 'skip';
  momentId?: string;
  query?: string;
  filters?: string; // JSON string of filters
  timestamp: number;
}

/**
 * Activity Pattern
 */
interface ActivityPattern {
  mostActiveHour: number; // 0-23
  mostActiveDays: number[]; // 0-6 (Sunday-Saturday)
  avgSessionDuration: number; // minutes
  preferredNotificationTime: number; // hour
}

/**
 * Personalization Engine Class
 */
class PersonalizationService {
  private interactions: UserInteraction[] = [];
  private readonly MAX_HISTORY = 100;

  /**
   * Add user interaction
   */
  private addInteraction(interaction: UserInteraction): void {
    this.interactions.unshift(interaction);
    if (this.interactions.length > this.MAX_HISTORY) {
      this.interactions.pop();
    }
  }

  /**
   * Track moment view
   */
  trackView(momentId: string): void {
    this.addInteraction({
      type: 'view',
      momentId,
      timestamp: Date.now(),
    });
    
    // Analytics removed
    logger.debug('Tracked view:', momentId);
  }

  /**
   * Track moment like
   */
  trackLike(momentId: string): void {
    this.addInteraction({
      type: 'like',
      momentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track booking
   */
  trackBooking(momentId: string, price: number): void {
    this.addInteraction({
      type: 'book',
      momentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track search query
   */
  trackSearch(query: string, filters: Record<string, unknown>): void {
    this.addInteraction({
      type: 'search',
      query,
      filters: JSON.stringify(filters),
      timestamp: Date.now(),
    });
  }

  /**
   * Track moment skip
   */
  trackSkip(momentId: string): void {
    this.addInteraction({
      type: 'skip',
      momentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Get personalized moment recommendations
   */
  getRecommendations(moments: Moment[], limit = 20): Moment[] {
    try {
      // For now, just return the moments as-is
      // ML-based personalization will be implemented in future updates
      return moments.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get personalized recommendations:', error);
      // Fallback to returning all moments
      return moments.slice(0, limit);
    }
  }
  
  /**
   * Update user profile based on booking
   */
  private updateProfileFromBooking(momentId: string, price: number) {
      // Placeholder for profile update logic
  }
}

export const personalization = new PersonalizationService();
export default personalization;

/**
 * Personalization Engine
 * ML-driven recommendation system with user profiling
 */

import { analytics } from './analytics';
import type { Moment, User } from '../types';

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
   * Track user viewing a moment
   */
  trackView(momentId: string): void {
    this.addInteraction({
      type: 'view',
      momentId,
      timestamp: Date.now(),
    });

    analytics.trackEvent('moment_viewed', {
      momentId,
      timestamp: Date.now(),
      source: 'personalization',
    });
  }

  /**
   * Track user liking a moment
   */
  trackLike(momentId: string): void {
    this.addInteraction({
      type: 'like',
      momentId,
      timestamp: Date.now(),
    });

    analytics.trackEvent('moment_liked', {
      momentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track user booking a trip
   */
  trackBooking(momentId: string, price: number): void {
    this.addInteraction({
      type: 'book',
      momentId,
      timestamp: Date.now(),
    });

    analytics.trackEvent('trip_booked', {
      momentId,
      price,
      timestamp: Date.now(),
    });

    // High-value action - update user profile
    this.updateProfileFromBooking(momentId, price);
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

    analytics.trackEvent('search_performed', {
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

    analytics.trackEvent('moment_skipped', {
      momentId,
      timestamp: Date.now(),
    });
  }

  /**
   * Get personalized moment recommendations
   */
  async getRecommendations(moments: Moment[], limit = 20): Promise<Moment[]> {
    try {
      // For now, just return the moments as-is
      // TODO: Implement actual ML-based personalization
      return moments.slice(0, limit);
    } catch (error) {
      console.error('Failed to get personalized recommendations:', error);
      // Fallback to returning all moments
      return moments.slice(0, limit);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile> {
    // Return default profile
    // TODO: Implement actual user profile fetching
    return {
      userId: 'default-user',
      favoriteActivities: [],
      priceRange: { min: 0, max: 1000 },
      preferredDates: 'flexible',
      favoriteLocations: [],
      travelStyle: 'comfort',
      lastUpdated: Date.now(),
    };
  }

  /**
   * Update user profile from booking
   */
  private async updateProfileFromBooking(
    momentId: string,
    price: number,
  ): Promise<void> {
    // TODO: Implement API call to update profile
    console.log('Profile would be updated from booking:', { momentId, price });
  }

  /**
   * Get user activity pattern
   */
  async getActivityPattern(): Promise<ActivityPattern> {
    // Return default pattern
    // TODO: Implement actual activity pattern analysis
    return {
      mostActiveHour: 19, // 7 PM
      mostActiveDays: [0, 6], // Weekends
      avgSessionDuration: 15,
      preferredNotificationTime: 19,
    };
  }

  /**
   * Get optimal notification time for user
   */
  async getOptimalNotificationTime(): Promise<number> {
    const pattern = await this.getActivityPattern();
    return pattern.preferredNotificationTime;
  }

  /**
   * Calculate similarity score between user and moment
   */
  calculateSimilarityScore(userProfile: UserProfile, moment: Moment): number {
    let score = 0;

    // Activity match (40% weight)
    const categoryId = moment.category?.id;
    const activityMatch = categoryId && userProfile.favoriteActivities.includes(categoryId);
    if (activityMatch) score += 0.4;

    // Price range match (30% weight)
    const priceInRange =
      moment.price >= userProfile.priceRange.min &&
      moment.price <= userProfile.priceRange.max;
    if (priceInRange) score += 0.3;

    // Location match (20% weight)
    const locationMatch = userProfile.favoriteLocations.some(
      (loc) => moment.location.city === loc,
    );
    if (locationMatch) score += 0.2;

    // Travel style match (10% weight)
    const styleMatch = this.matchesTravelStyle(moment, userProfile.travelStyle);
    if (styleMatch) score += 0.1;

    return score;
  }

  /**
   * Check if moment matches travel style
   */
  private matchesTravelStyle(
    moment: Moment,
    style: UserProfile['travelStyle'],
  ): boolean {
    switch (style) {
      case 'budget':
        return moment.price < 50;
      case 'comfort':
        return moment.price >= 50 && moment.price <= 200;
      case 'luxury':
        return moment.price > 200;
      default:
        return true;
    }
  }

  /**
   * Add interaction to history
   */
  private addInteraction(interaction: UserInteraction): void {
    this.interactions.push(interaction);

    // Keep only recent interactions
    if (this.interactions.length > this.MAX_HISTORY) {
      this.interactions = this.interactions.slice(-this.MAX_HISTORY);
    }
  }

  /**
   * Get recent interaction history
   */
  private getRecentHistory(limit: number): UserInteraction[] {
    return this.interactions.slice(-limit);
  }

  /**
   * Clear interaction history
   */
  clearHistory(): void {
    this.interactions = [];
  }
}

// Export singleton instance
export const personalizationEngine = new PersonalizationService();

/**
 * React Hook for personalization
 */
export const usePersonalization = () => {
  return {
    trackView: personalizationEngine.trackView.bind(personalizationEngine),
    trackLike: personalizationEngine.trackLike.bind(personalizationEngine),
    trackBooking: personalizationEngine.trackBooking.bind(
      personalizationEngine,
    ),
    trackSearch: personalizationEngine.trackSearch.bind(personalizationEngine),
    trackSkip: personalizationEngine.trackSkip.bind(personalizationEngine),
    getRecommendations: personalizationEngine.getRecommendations.bind(
      personalizationEngine,
    ),
    getUserProfile: personalizationEngine.getUserProfile.bind(
      personalizationEngine,
    ),
    getOptimalNotificationTime:
      personalizationEngine.getOptimalNotificationTime.bind(
        personalizationEngine,
      ),
  };
};

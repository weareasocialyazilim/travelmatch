/**
 * Deep Link Event Tracking Service
 *
 * Tracks user journey from deep links through the app:
 * - Attribution (which campaign/source brought user)
 * - Conversion tracking (did user complete intended action)
 * - Drop-off analysis (where users abandoned flow)
 * - A/B testing (different deep link strategies)
 */

import React from 'react';
import { Linking } from 'react-native';
import analytics from '@react-native-firebase/analytics';
import { supabase } from './supabase';
import { logger } from '../utils/logger';
import type { Database } from '../types/database.types';

// Deep link types
export enum DeepLinkType {
  PROFILE = 'profile',
  MOMENT = 'moment',
  MATCH = 'match',
  MESSAGE = 'message',
  INVITE = 'invite',
  REFERRAL = 'referral',
  NOTIFICATION = 'notification',
  CAMPAIGN = 'campaign',
  SHARE = 'share',
}

// Attribution sources
export enum AttributionSource {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  SMS = 'sms',
  QR_CODE = 'qr_code',
  PUSH_NOTIFICATION = 'push',
  IN_APP = 'in_app',
  ORGANIC = 'organic',
  UNKNOWN = 'unknown',
}

// Deep link event
interface DeepLinkEvent {
  id: string;
  type: DeepLinkType;
  source: AttributionSource;
  url: string;
  params: Record<string, any>;
  userId?: string;
  sessionId: string;
  timestamp: Date;

  // Tracking metadata
  campaign?: string;
  medium?: string;
  term?: string;
  content?: string;

  // User journey
  landingScreen?: string;
  targetScreen?: string;
  completed: boolean;
  completedAt?: Date;
  dropOffScreen?: string;

  // Performance
  timeToLand: number; // Time from link click to app open
  timeToComplete?: number; // Time from open to conversion
}

// Conversion goals
export enum ConversionGoal {
  VIEW_PROFILE = 'view_profile',
  FOLLOW_USER = 'follow_user',
  SEND_MESSAGE = 'send_message',
  LIKE_MOMENT = 'like_moment',
  CREATE_MATCH = 'create_match',
  COMPLETE_PROFILE = 'complete_profile',
  UPLOAD_MOMENT = 'upload_moment',
  INVITE_FRIEND = 'invite_friend',
  PURCHASE = 'purchase',
}

class DeepLinkTracker {
  private currentEvent: DeepLinkEvent | null = null;
  private sessionId: string = this.generateSessionId();
  private listeners: ((event: DeepLinkEvent) => void)[] = [];

  /**
   * Initialize deep link tracking
   */
  async initialize() {
    // Listen to initial URL (app was closed)
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      this.handleDeepLink(initialUrl, true);
    }

    // Listen to URL changes (app was in background)
    Linking.addEventListener('url', (event) => {
      this.handleDeepLink(event.url, false);
    });

    logger.info('[DeepLink] Tracker initialized');
  }

  /**
   * Handle deep link
   */
  private async handleDeepLink(url: string, isInitial: boolean) {
    try {
      const parsed = this.parseDeepLink(url);

      const event: DeepLinkEvent = {
        id: this.generateEventId(),
        type: parsed.type,
        source: parsed.source,
        url,
        params: parsed.params,
        sessionId: this.sessionId,
        timestamp: new Date(),
        campaign: parsed.params.utm_campaign,
        medium: parsed.params.utm_medium,
        term: parsed.params.utm_term,
        content: parsed.params.utm_content,
        completed: false,
        timeToLand: isInitial
          ? 0
          : Date.now() - this.getClickTimestamp(parsed.params),
      };

      this.currentEvent = event;

      // Log to analytics
      await this.logToAnalytics(event);

      // Save to database
      await this.saveToDatabase(event);

      // Notify listeners
      this.notifyListeners(event);

      logger.info('[DeepLink] Tracked', {
        type: event.type,
        source: event.source,
      });
    } catch (error) {
      logger.error('[DeepLink] Error handling deep link', error);
    }
  }

  /**
   * Parse deep link URL
   */
  private parseDeepLink(url: string): {
    type: DeepLinkType;
    source: AttributionSource;
    params: Record<string, any>;
  } {
    // Parse URL
    // Format: travelmatch://profile/123?utm_source=instagram&utm_campaign=summer
    // Or: https://travelmatch.app/p/123?utm_source=instagram

    const urlObj = new URL(
      url.replace('travelmatch://', 'https://travelmatch.app/'),
    );
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    const params = Object.fromEntries(urlObj.searchParams.entries());

    // Determine type from path
    let type: DeepLinkType = DeepLinkType.PROFILE;
    if (pathParts[0] === 'profile' || pathParts[0] === 'p') {
      type = DeepLinkType.PROFILE;
    } else if (pathParts[0] === 'moment' || pathParts[0] === 'm') {
      type = DeepLinkType.MOMENT;
    } else if (pathParts[0] === 'match') {
      type = DeepLinkType.MATCH;
    } else if (pathParts[0] === 'message' || pathParts[0] === 'chat') {
      type = DeepLinkType.MESSAGE;
    } else if (pathParts[0] === 'invite' || pathParts[0] === 'i') {
      type = DeepLinkType.INVITE;
    } else if (pathParts[0] === 'referral' || pathParts[0] === 'r') {
      type = DeepLinkType.REFERRAL;
    } else if (pathParts[0] === 'campaign' || pathParts[0] === 'c') {
      type = DeepLinkType.CAMPAIGN;
    }

    // Determine source from utm_source or referer
    let source: AttributionSource = AttributionSource.UNKNOWN;
    const utmSource = params.utm_source?.toLowerCase();

    if (utmSource === 'instagram' || utmSource === 'ig') {
      source = AttributionSource.INSTAGRAM;
    } else if (utmSource === 'facebook' || utmSource === 'fb') {
      source = AttributionSource.FACEBOOK;
    } else if (utmSource === 'twitter' || utmSource === 'tw') {
      source = AttributionSource.TWITTER;
    } else if (utmSource === 'whatsapp' || utmSource === 'wa') {
      source = AttributionSource.WHATSAPP;
    } else if (utmSource === 'email') {
      source = AttributionSource.EMAIL;
    } else if (utmSource === 'sms') {
      source = AttributionSource.SMS;
    } else if (utmSource === 'qr') {
      source = AttributionSource.QR_CODE;
    } else if (utmSource === 'push') {
      source = AttributionSource.PUSH_NOTIFICATION;
    } else if (params.ref === 'in_app') {
      source = AttributionSource.IN_APP;
    } else if (!utmSource) {
      source = AttributionSource.ORGANIC;
    }

    return { type, source, params };
  }

  /**
   * Mark screen navigation
   */
  trackNavigation(screenName: string) {
    if (!this.currentEvent) return;

    if (!this.currentEvent.landingScreen) {
      this.currentEvent.landingScreen = screenName;
    }

    this.currentEvent.targetScreen = screenName;

    // Update in database
    this.updateEventInDatabase(this.currentEvent);
  }

  /**
   * Mark conversion complete
   */
  async trackConversion(goal: ConversionGoal, metadata?: Record<string, any>) {
    if (!this.currentEvent) return;

    this.currentEvent.completed = true;
    this.currentEvent.completedAt = new Date();
    this.currentEvent.timeToComplete =
      Date.now() - this.currentEvent.timestamp.getTime();

    // Log conversion to analytics
    await analytics().logEvent('deep_link_conversion', {
      event_id: this.currentEvent.id,
      type: this.currentEvent.type,
      source: this.currentEvent.source,
      goal,
      campaign: this.currentEvent.campaign,
      time_to_convert: this.currentEvent.timeToComplete,
      ...metadata,
    });

    // Update database
    await this.updateEventInDatabase(this.currentEvent);

    logger.info('[DeepLink] Conversion', {
      goal,
      timeToComplete: this.currentEvent.timeToComplete,
    });
  }

  /**
   * Mark drop-off (user abandoned flow)
   */
  async trackDropOff(screenName: string, reason?: string) {
    if (!this.currentEvent || this.currentEvent.completed) return;

    this.currentEvent.dropOffScreen = screenName;

    // Log drop-off to analytics
    await analytics().logEvent('deep_link_drop_off', {
      event_id: this.currentEvent.id,
      type: this.currentEvent.type,
      source: this.currentEvent.source,
      drop_off_screen: screenName,
      reason,
      campaign: this.currentEvent.campaign,
    });

    // Update database
    await this.updateEventInDatabase(this.currentEvent);

    logger.warn('[DeepLink] Drop-off', { screenName, reason });
  }

  /**
   * Get current deep link event
   */
  getCurrentEvent(): DeepLinkEvent | null {
    return this.currentEvent;
  }

  /**
   * Clear current event (after conversion or drop-off)
   */
  clearCurrentEvent() {
    this.currentEvent = null;
  }

  /**
   * Subscribe to deep link events
   */
  subscribe(listener: (event: DeepLinkEvent) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Log to Firebase Analytics
   */
  private async logToAnalytics(event: DeepLinkEvent) {
    await analytics().logEvent('deep_link_open', {
      event_id: event.id,
      type: event.type,
      source: event.source,
      campaign: event.campaign,
      medium: event.medium,
      term: event.term,
      content: event.content,
      time_to_land: event.timeToLand,
      session_id: event.sessionId,
    });
  }

  /**
   * Save to Supabase database
   */
  private async saveToDatabase(event: DeepLinkEvent) {
    try {
      const { data: user } = await supabase.auth.getUser();

      const insertPayload: Database['public']['Tables']['deep_link_events']['Insert'] =
        {
          id: event.id,
          user_id: user?.user?.id ?? undefined,
          type: event.type,
          source: event.source,
          url: event.url,
          params:
            event.params as unknown as Database['public']['Tables']['deep_link_events']['Row']['params'],
          session_id: event.sessionId,
          campaign: event.campaign,
          medium: event.medium,
          term: event.term,
          content: event.content,
          landing_screen: event.landingScreen ?? undefined,
          target_screen: event.targetScreen ?? undefined,
          completed: event.completed,
          completed_at: event.completedAt
            ? event.completedAt.toISOString()
            : undefined,
          drop_off_screen: event.dropOffScreen ?? undefined,
          time_to_land: event.timeToLand,
          time_to_complete: event.timeToComplete ?? undefined,
          created_at: event.timestamp.toISOString(),
        };

      await supabase.from('deep_link_events').insert(insertPayload);
    } catch (error) {
      logger.error('[DeepLink] Failed to save to database', error);
    }
  }

  /**
   * Update event in database
   */
  private async updateEventInDatabase(event: DeepLinkEvent) {
    try {
      const updatePayload: Database['public']['Tables']['deep_link_events']['Update'] =
        {
          landing_screen: event.landingScreen ?? undefined,
          target_screen: event.targetScreen ?? undefined,
          completed: event.completed,
          completed_at: event.completedAt
            ? event.completedAt.toISOString()
            : undefined,
          drop_off_screen: event.dropOffScreen ?? undefined,
          time_to_complete: event.timeToComplete ?? undefined,
        };

      await supabase
        .from('deep_link_events')
        .update(updatePayload)
        .eq('id', event.id);
    } catch (error) {
      logger.error('[DeepLink] Failed to update event', error);
    }
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: DeepLinkEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get click timestamp from params
   */
  private getClickTimestamp(params: Record<string, any>): number {
    // If link includes click timestamp, use it
    if (params.ts) {
      return parseInt(params.ts, 10);
    }
    // Otherwise assume immediate
    return Date.now();
  }

  /**
   * Generate shareable deep link
   */
  static generateDeepLink(
    type: DeepLinkType,
    id: string,
    options?: {
      source?: AttributionSource;
      campaign?: string;
      medium?: string;
      term?: string;
      content?: string;
    },
  ): string {
    const baseUrl = 'https://travelmatch.app';
    const params = new URLSearchParams();

    if (options?.source) params.set('utm_source', options.source);
    if (options?.campaign) params.set('utm_campaign', options.campaign);
    if (options?.medium) params.set('utm_medium', options.medium);
    if (options?.term) params.set('utm_term', options.term);
    if (options?.content) params.set('utm_content', options.content);

    // Add click timestamp
    params.set('ts', Date.now().toString());

    const typePrefix = this.getTypePrefix(type);
    const queryString = params.toString();

    return `${baseUrl}/${typePrefix}/${id}${
      queryString ? '?' + queryString : ''
    }`;
  }

  /**
   * Get type prefix for URL
   */
  private static getTypePrefix(type: DeepLinkType): string {
    const prefixes: Record<DeepLinkType, string> = {
      [DeepLinkType.PROFILE]: 'p',
      [DeepLinkType.MOMENT]: 'm',
      [DeepLinkType.MATCH]: 'match',
      [DeepLinkType.MESSAGE]: 'chat',
      [DeepLinkType.INVITE]: 'i',
      [DeepLinkType.REFERRAL]: 'r',
      [DeepLinkType.CAMPAIGN]: 'c',
      [DeepLinkType.NOTIFICATION]: 'n',
      [DeepLinkType.SHARE]: 's',
    };
    return prefixes[type] || type;
  }
}

// Export singleton instance
export const deepLinkTracker = new DeepLinkTracker();

// Export hook for React components
export function useDeepLinkTracking() {
  const [currentEvent, setCurrentEvent] = React.useState<DeepLinkEvent | null>(
    deepLinkTracker.getCurrentEvent(),
  );

  React.useEffect(() => {
    return deepLinkTracker.subscribe(setCurrentEvent);
  }, []);

  return {
    currentEvent,
    trackNavigation: deepLinkTracker.trackNavigation.bind(deepLinkTracker),
    trackConversion: deepLinkTracker.trackConversion.bind(deepLinkTracker),
    trackDropOff: deepLinkTracker.trackDropOff.bind(deepLinkTracker),
  };
}

/**
 * HapticManager - Centralized Haptic Feedback System
 *
 * Master-level haptic feedback management for TravelMatch.
 * Provides semantic haptic patterns for all user interactions.
 *
 * Features:
 * - Semantic haptic patterns for TravelMatch actions
 * - User preference integration
 * - Analytics tracking
 * - Debouncing for rapid interactions
 * - Pattern composition for complex feedback
 *
 * @example
 * ```tsx
 * import { HapticManager } from '@/services/HapticManager';
 *
 * // Simple usage
 * HapticManager.buttonPress();
 * HapticManager.success();
 *
 * // TravelMatch-specific patterns
 * HapticManager.momentCreated();
 * HapticManager.paymentComplete();
 * HapticManager.matchFound();
 * ```
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

// =============================================================================
// TYPES
// =============================================================================

export type HapticIntensity = 'light' | 'medium' | 'heavy';
export type HapticNotification = 'success' | 'warning' | 'error';
export type HapticPattern =
  | 'impact'
  | 'notification'
  | 'selection'
  | 'sequence';

interface HapticConfig {
  enabled: boolean;
  intensity: 'normal' | 'reduced' | 'off';
  soundEnabled: boolean;
}

interface _HapticEvent {
  type: string;
  timestamp: number;
  intensity?: HapticIntensity;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = '@travelmatch/haptic_preferences';
const DEBOUNCE_MS = 50; // Minimum time between haptics
const MAX_EVENTS_PER_SECOND = 10; // Rate limiting

// =============================================================================
// HAPTIC MANAGER CLASS
// =============================================================================

class HapticManagerClass {
  private config: HapticConfig = {
    enabled: true,
    intensity: 'normal',
    soundEnabled: true,
  };

  private lastHapticTime = 0;
  private eventCount = 0;
  private eventResetTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadPreferences();
  }

  // ===========================================================================
  // CONFIGURATION
  // ===========================================================================

  /**
   * Load user preferences from storage
   */
  private async loadPreferences(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.warn('Failed to load haptic preferences', { error });
    }
  }

  /**
   * Save preferences to storage
   */
  private async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      logger.warn('Failed to save haptic preferences', { error });
    }
  }

  /**
   * Set haptic enabled state
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.savePreferences();
  }

  /**
   * Set haptic intensity
   */
  setIntensity(intensity: 'normal' | 'reduced' | 'off'): void {
    this.config.intensity = intensity;
    this.savePreferences();
  }

  /**
   * Get current configuration
   */
  getConfig(): HapticConfig {
    return { ...this.config };
  }

  /**
   * Check if haptics are available
   */
  isAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  // ===========================================================================
  // CORE HAPTIC METHODS
  // ===========================================================================

  /**
   * Check if haptic should fire (debouncing + rate limiting)
   */
  private shouldFire(): boolean {
    if (!this.config.enabled || this.config.intensity === 'off') {
      return false;
    }

    if (!this.isAvailable()) {
      return false;
    }

    const now = Date.now();

    // Debounce check
    if (now - this.lastHapticTime < DEBOUNCE_MS) {
      return false;
    }

    // Rate limiting
    if (this.eventCount >= MAX_EVENTS_PER_SECOND) {
      return false;
    }

    // Update state
    this.lastHapticTime = now;
    this.eventCount++;

    // Reset event count after 1 second
    if (!this.eventResetTimeout) {
      this.eventResetTimeout = setTimeout(() => {
        this.eventCount = 0;
        this.eventResetTimeout = null;
      }, 1000);
    }

    return true;
  }

  /**
   * Map intensity based on user preference
   */
  private mapIntensity(intensity: HapticIntensity): HapticIntensity {
    if (this.config.intensity === 'reduced') {
      // Reduce all intensities by one level
      switch (intensity) {
        case 'heavy':
          return 'medium';
        case 'medium':
          return 'light';
        default:
          return 'light';
      }
    }
    return intensity;
  }

  /**
   * Fire impact haptic
   */
  private async impact(intensity: HapticIntensity): Promise<void> {
    if (!this.shouldFire()) return;

    const mappedIntensity = this.mapIntensity(intensity);

    try {
      switch (mappedIntensity) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    } catch (error) {
      logger.debug('Haptic impact failed', { error });
    }
  }

  /**
   * Fire notification haptic
   */
  private async notification(type: HapticNotification): Promise<void> {
    if (!this.shouldFire()) return;

    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          break;
        case 'warning':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          break;
        case 'error':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          break;
      }
    } catch (error) {
      logger.debug('Haptic notification failed', { error });
    }
  }

  /**
   * Fire selection haptic
   */
  private async selection(): Promise<void> {
    if (!this.shouldFire()) return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      logger.debug('Haptic selection failed', { error });
    }
  }

  // ===========================================================================
  // BASIC PATTERNS
  // ===========================================================================

  /**
   * Light button press
   */
  buttonPress = (): Promise<void> => this.impact('light');

  /**
   * Primary action (submit, confirm)
   */
  primaryAction = (): Promise<void> => this.impact('medium');

  /**
   * Destructive action (delete, cancel)
   */
  destructiveAction = (): Promise<void> => this.impact('heavy');

  /**
   * Success feedback
   */
  success = (): Promise<void> => this.notification('success');

  /**
   * Error feedback
   */
  error = (): Promise<void> => this.notification('error');

  /**
   * Warning feedback
   */
  warning = (): Promise<void> => this.notification('warning');

  /**
   * Selection change (tabs, pickers)
   */
  selectionChange = (): Promise<void> => this.selection();

  /**
   * Toggle switch
   */
  toggle = (): Promise<void> => this.selection();

  /**
   * Long press feedback
   */
  longPress = (): Promise<void> => this.impact('medium');

  /**
   * Pull to refresh trigger
   */
  pullToRefresh = (): Promise<void> => this.impact('medium');

  /**
   * Swipe action
   */
  swipe = (): Promise<void> => this.impact('light');

  // ===========================================================================
  // TRAVELMATCH-SPECIFIC PATTERNS
  // ===========================================================================

  /**
   * Moment created successfully
   */
  momentCreated = async (): Promise<void> => {
    await this.notification('success');
  };

  /**
   * Request sent
   */
  requestSent = async (): Promise<void> => {
    await this.impact('medium');
  };

  /**
   * Request accepted - celebration pattern
   */
  requestAccepted = async (): Promise<void> => {
    await this.notification('success');
    // Double tap for celebration
    setTimeout(() => this.impact('light'), 100);
  };

  /**
   * Request rejected
   */
  requestRejected = async (): Promise<void> => {
    await this.notification('warning');
  };

  /**
   * Match found - excitement pattern
   */
  matchFound = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('medium'), 150);
    setTimeout(() => this.impact('light'), 300);
  };

  /**
   * New message received
   */
  messageReceived = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Message sent
   */
  messageSent = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Payment initiated
   */
  paymentInitiated = async (): Promise<void> => {
    await this.impact('medium');
  };

  /**
   * Payment complete - celebration pattern
   */
  paymentComplete = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('medium'), 100);
  };

  /**
   * Payment failed
   */
  paymentFailed = async (): Promise<void> => {
    await this.notification('error');
  };

  /**
   * Gift sent - special celebration
   */
  giftSent = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('light'), 100);
    setTimeout(() => this.impact('light'), 200);
  };

  /**
   * Gift received
   */
  giftReceived = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('medium'), 150);
  };

  /**
   * Proof verification started
   */
  proofStarted = async (): Promise<void> => {
    await this.impact('medium');
  };

  /**
   * Proof verified successfully
   */
  proofVerified = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('medium'), 100);
  };

  /**
   * KYC step completed
   */
  kycStepCompleted = async (): Promise<void> => {
    await this.notification('success');
  };

  /**
   * KYC fully verified
   */
  kycVerified = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('heavy'), 100);
    setTimeout(() => this.impact('medium'), 200);
  };

  /**
   * Review submitted
   */
  reviewSubmitted = async (): Promise<void> => {
    await this.notification('success');
  };

  /**
   * Star rating changed
   */
  starRatingChanged = async (): Promise<void> => {
    await this.selection();
  };

  /**
   * Favorite toggled
   */
  favoriteToggled = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Category selected
   */
  categorySelected = async (): Promise<void> => {
    await this.selection();
  };

  /**
   * Filter applied
   */
  filterApplied = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Map interaction
   */
  mapInteraction = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Photo captured
   */
  photoCaptured = async (): Promise<void> => {
    await this.impact('medium');
  };

  /**
   * Profile updated
   */
  profileUpdated = async (): Promise<void> => {
    await this.notification('success');
  };

  /**
   * Notification received
   */
  notificationReceived = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Tab changed
   */
  tabChanged = async (): Promise<void> => {
    await this.selection();
  };

  /**
   * Modal opened
   */
  modalOpened = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Modal closed
   */
  modalClosed = async (): Promise<void> => {
    await this.impact('light');
  };

  /**
   * Refresh triggered
   */
  refreshTriggered = async (): Promise<void> => {
    await this.impact('medium');
  };

  /**
   * Countdown tick (for ceremonies)
   */
  countdownTick = async (): Promise<void> => {
    await this.selection();
  };

  /**
   * Ceremony complete
   */
  ceremonyComplete = async (): Promise<void> => {
    await this.notification('success');
    setTimeout(() => this.impact('heavy'), 100);
    setTimeout(() => this.impact('medium'), 200);
    setTimeout(() => this.impact('light'), 300);
  };
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const HapticManager = new HapticManagerClass();

// Default export for convenience
export default HapticManager;

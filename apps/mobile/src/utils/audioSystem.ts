/**
 * Audio System - Premium Liquid Glass Sounds
 *
 * Audio-haptic synchronized feedback system.
 * High-frequency, silky water droplet sounds.
 *
 * Features:
 * - Success ceremony sounds
 * - Message send feedback
 * - Button interaction sounds
 * - Haptic-audio synchronization
 *
 * Sound Design Philosophy:
 * - High frequency (clean, premium)
 * - Short duration (non-intrusive)
 * - Water/glass theme (liquid glass)
 * - Subtle volume (elegant)
 *
 * NOTE: expo-av is required for audio features. Install with:
 *   npx expo install expo-av
 */

import { logger } from '@/utils/logger';

let Audio: any = null;

// Try to load expo-av dynamically - graceful degradation if not available
try {
  // Dynamic require to avoid TypeScript compile errors when expo-av is not installed

  Audio = require('expo-av').Audio;
} catch {
  logger.warn(
    '[AudioSystem] expo-av not installed. Audio features disabled. Install with: npx expo install expo-av',
  );
}

import { HapticManager } from '@/services/HapticManager';

class AudioSystem {
  private sounds: Map<string, any> = new Map();
  private enabled: boolean = true;

  async initialize() {
    if (!Audio) return;
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      logger.warn('Audio initialization failed', error as Error);
    }
  }

  async loadSound(key: string, source: unknown) {
    if (!Audio) return;
    try {
      const { sound } = await Audio.Sound.createAsync(source);
      this.sounds.set(key, sound);
    } catch (error) {
      logger.warn(`Failed to load sound: ${key}`, error as Error);
    }
  }

  async playSound(key: string) {
    if (!this.enabled) return;

    try {
      const sound = this.sounds.get(key);
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      logger.warn(`Failed to play sound: ${key}`, error as Error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async cleanup() {
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

// Singleton instance
const audioSystem = new AudioSystem();

/**
 * Premium Audio-Haptic Feedback
 */
export const AUDIO_HAPTIC = {
  /**
   * Success ceremony - liquid splash
   */
  success: async () => {
    await HapticManager.success();
    // Note: Add actual sound file here
    // await audioSystem.playSound('success');
  },

  /**
   * Message sent - water droplet
   */
  messageSent: async () => {
    await HapticManager.messageSent();
    // Note: Add actual sound file here
    // await audioSystem.playSound('droplet');
  },

  /**
   * Button press - subtle click
   */
  buttonPress: async () => {
    await HapticManager.buttonPress();
    // Note: Add actual sound file here
    // await audioSystem.playSound('click');
  },

  /**
   * Card swipe - glass slide
   */
  cardSwipe: async () => {
    await HapticManager.swipe();
    // Note: Add actual sound file here
    // await audioSystem.playSound('swipe');
  },

  /**
   * Error - warning tone
   */
  error: async () => {
    await HapticManager.error();
    // Note: Add actual sound file here
    // await audioSystem.playSound('error');
  },
};

/**
 * Initialize audio system
 */
export const initializeAudio = async () => {
  await audioSystem.initialize();

  // Load sound files here when available
  // await audioSystem.loadSound('success', require('@/assets/sounds/success.mp3'));
  // await audioSystem.loadSound('droplet', require('@/assets/sounds/droplet.mp3'));
  // await audioSystem.loadSound('click', require('@/assets/sounds/click.mp3'));
};

/**
 * Cleanup audio system
 */
export const cleanupAudio = async () => {
  await audioSystem.cleanup();
};

export default audioSystem;

import { SHADOWS } from './shadows';

export const VALUES = {
  // App deep link scheme
  APP_SCHEME: 'lovendo',
  DEEP_LINKS: {
    AUTH_CALLBACK: 'lovendo://auth/callback',
    RESET_PASSWORD: 'lovendo://auth/reset-password',
  },

  // Default images - undefined triggers component's built-in fallback UI
  // (initials for avatars, placeholder icon for moments)
  IMAGES: {
    DEFAULT_AVATAR: undefined as string | undefined,
    DEFAULT_MOMENT: undefined as string | undefined,
  },

  // Escrow thresholds - Titan Protocol
  // 0-30 LVND: Direct payment (no escrow)
  // 30-100 LVND: Optional escrow (user chooses)
  // 100+ LVND: Mandatory escrow (forced protection)
  ESCROW_THRESHOLDS: {
    /** Max amount for direct payment without escrow */
    DIRECT_MAX: 30, // 30 LVND
    /** Max amount for optional escrow (above this is mandatory) */
    OPTIONAL_MAX: 100, // 100 LVND
    /** Currency for threshold values */
    CURRENCY: 'LVND',
  } as const,

  // Xcode 26 App Store Connect IAP Product IDs
  IAP_PRODUCTS: {
    LVND_50: 'xyz.lovendo.lvnd50',
    LVND_250: 'xyz.lovendo.lvnd250',
    LVND_1000: 'xyz.lovendo.lvnd1000',
  },

  // Legacy aliases for backward compatibility
  /** @deprecated Use ESCROW_THRESHOLDS.DIRECT_MAX */
  ESCROW_DIRECT_MAX: 30,
  /** @deprecated Use ESCROW_THRESHOLDS.OPTIONAL_MAX */
  ESCROW_OPTIONAL_MAX: 100,

  // Input limits
  TITLE_MAX_LENGTH: 60,
  STORY_MAX_LENGTH: 200,
  AMOUNT_MIN: 1,
  AMOUNT_MAX: 500,

  // UI values
  ANIMATION_DURATION: 300,
  // Common UI tokens (legacy compatibility)
  borderRadius: 12,
  shadow: SHADOWS.md,

  // Trust score
  MIN_TRUST_SCORE: 0,
  MAX_TRUST_SCORE: 100,
  TRUST_SCORE_THRESHOLD: 85,

  // Map coordinates (sample locations)
  MAP_COORDINATES: {
    PARIS: { latitude: 48.8566, longitude: 2.3522 },
    TOKYO: { latitude: 35.6762, longitude: 139.6503 },
    BARCELONA: { latitude: 41.3851, longitude: 2.1734 },
    ISTANBUL: { latitude: 41.0082, longitude: 28.9784 },
  },

  // Map region deltas
  MAP_DELTA: {
    latitude: 0.0922,
    longitude: 0.0421,
  },
} as const;
// Export ESCROW_THRESHOLDS for direct import
export const ESCROW_THRESHOLDS = VALUES.ESCROW_THRESHOLDS;

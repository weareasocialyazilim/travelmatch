/**
 * Default Values Constants
 *
 * Centralized default values used across the app.
 * Extracted from magic numbers for better maintainability.
 */

/**
 * Profile defaults
 */
export const PROFILE_DEFAULTS = {
  /** Default response rate for new users (100%) */
  RESPONSE_RATE: 100,

  /** Default wallet balance */
  WALLET_BALANCE: 0,

  /** Default saved items count */
  SAVED_COUNT: 0,

  /** Default trust score for new users */
  TRUST_SCORE: 0,

  /** Default moments count */
  MOMENTS_COUNT: 0,

  /** Default exchanges count */
  EXCHANGES_COUNT: 0,
} as const;

/**
 * Trust Garden defaults
 */
export const TRUST_GARDEN_DEFAULTS = {
  /** Default response rate percentage shown in trust metrics */
  RESPONSE_RATE_PERCENTAGE: 95,

  /** Minimum trust score */
  MIN_SCORE: 0,

  /** Maximum trust score */
  MAX_SCORE: 100,

  /** Trust levels */
  LEVELS: {
    SPROUT: 0, // 0-24
    GROWING: 25, // 25-49
    BLOOMING: 50, // 50-74
    FLOURISHING: 75, // 75-100
  },
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  /** Default page size for lists */
  PAGE_SIZE: 20,

  /** Default starting page */
  INITIAL_PAGE: 1,
} as const;

/**
 * Upload defaults
 */
export const UPLOAD_DEFAULTS = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10485760,

  /** Maximum number of files in dispute evidence */
  MAX_DISPUTE_FILES: 3,

  /** Maximum number of photos in moment */
  MAX_MOMENT_PHOTOS: 10,
} as const;

/**
 * Timeout defaults (in milliseconds)
 */
export const TIMEOUT_DEFAULTS = {
  /** API request timeout */
  API_REQUEST: 30000,

  /** Retry delay */
  RETRY_DELAY: 1000,

  /** Retry attempts */
  RETRY_ATTEMPTS: 3,

  /** Toast duration */
  TOAST_DURATION: 3000,
} as const;

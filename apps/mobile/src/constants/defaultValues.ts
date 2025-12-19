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
    SPROUT: 0,      // 0-24
    GROWING: 25,    // 25-49
    BLOOMING: 50,   // 50-74
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

/**
 * Default images and avatars
 * Uses data URIs to avoid external dependencies and network requests
 */
export const DEFAULT_IMAGES = {
  /** Default avatar - simple user icon SVG as data URI */
  AVATAR_SMALL: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0U1RTdFQiIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjciIGZpbGw9IiM5Q0EzQUYiLz48cGF0aCBkPSJNOCAzNWMwLTguMjg0IDUuMzczLTE1IDEyLTE1czEyIDYuNzE2IDEyIDE1IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+',

  /** Default avatar - medium size */
  AVATAR_MEDIUM: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjM4IiByPSIxOCIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0xNSA4OGMwLTIwLjcxIDEzLjQzLTM3LjUgMzUtMzcuNXMzNSAxNi43OSAzNSAzNy41IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+',

  /** Default avatar - large size */
  AVATAR_LARGE: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiB2aWV3Qm94PSIwIDAgMTUwIDE1MCI+PGNpcmNsZSBjeD0iNzUiIGN5PSI3NSIgcj0iNzUiIGZpbGw9IiNFNUU3RUIiLz48Y2lyY2xlIGN4PSI3NSIgY3k9IjU1IiByPSIyNSIgZmlsbD0iIzlDQTNBRiIvPjxwYXRoIGQ9Ik0yMCAxMzJjMC0zMC4zNyAyNC42Mi01NSA1NS01NXM1NSAyNC42MyA1NSA1NSIgZmlsbD0iIzlDQTNBRiIvPjwvc3ZnPg==',

  /** Default moment/image placeholder - simple image icon */
  MOMENT_PLACEHOLDER: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiB2aWV3Qm94PSIwIDAgNDAwIDQwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNMTUwIDI0MGw1MC03MCA1MCA3MCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTgwIDI0MGw0MC01MCA0MCA1MCIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz48Y2lyY2xlIGN4PSIyNjAiIGN5PSIxNDAiIHI9IjI1IiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+',
} as const;

/**
 * Lovendo Image Dimensions - 2026 Standards
 * Based on 2025/2026 social media best practices
 *
 * Key ratios:
 * - 4:5 (portrait) - Moment cards, feed posts
 * - 1:1 (square) - Avatars, thumbnails
 * - 9:16 (vertical) - Stories, fullscreen
 * - 16:9 (landscape) - Banners, video thumbnails
 * - 3:1 (wide) - Profile covers
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// ASPECT RATIOS
// ============================================
export const ASPECT_RATIOS = {
  square: 1, // 1:1
  portrait: 4 / 5, // 4:5 (0.8)
  vertical: 9 / 16, // 9:16 (0.5625)
  landscape: 16 / 9, // 16:9 (1.777)
  wide: 1.91, // Facebook/Twitter link preview
  cover: 3, // 3:1
  proof: 4 / 3, // 4:3 (1.333)
} as const;

// ============================================
// AVATAR DIMENSIONS
// ============================================
export const AVATAR = {
  // Upload to storage
  upload: {
    width: 500,
    height: 500,
  },

  // Display sizes
  sizes: {
    xl: 120, // Profile page header
    lg: 80, // Profile card
    md: 60, // Chat header, list items
    sm: 40, // Small cards, mentions
    xs: 32, // Notifications, compact
    xxs: 24, // Inline mentions
  },

  // Quality
  quality: 0.9,
  maxFileSizeMB: 5,
} as const;

// ============================================
// MOMENT CARD DIMENSIONS
// ============================================
export const MOMENT_CARD = {
  // Upload dimensions (4:5 portrait - 2025/2026 standard)
  upload: {
    width: 1080,
    height: 1350,
  },

  // Alternative upload formats
  uploadVariants: {
    square: { width: 1080, height: 1080 },
    portrait: { width: 1080, height: 1350 },
    landscape: { width: 1080, height: 566 },
  },

  // Aspect ratio
  aspectRatio: ASPECT_RATIOS.portrait,

  // Feed display (full width card)
  feed: {
    width: SCREEN_WIDTH - 32, // 16px padding each side
    get height(): number {
      return Math.round(this.width * (5 / 4));
    },
  },

  // Grid display (2 columns)
  grid: {
    width: Math.floor((SCREEN_WIDTH - 48) / 2), // 16px edges + 16px gap
    get height(): number {
      return Math.round(this.width * (5 / 4));
    },
  },

  // Compact card (horizontal scroll)
  compact: {
    width: 140,
    height: 175,
  },

  // Thumbnail
  thumbnail: {
    width: 100,
    height: 125,
  },

  // Quality
  quality: 0.85,
  maxFileSizeMB: 15,
  maxImages: 10,
} as const;

// ============================================
// PROOF IMAGE DIMENSIONS
// ============================================
export const PROOF = {
  // Upload (high quality for verification)
  upload: {
    width: 1920,
    height: 1440,
    minWidth: 800,
    minHeight: 600,
  },

  aspectRatio: ASPECT_RATIOS.proof,

  // Review display
  review: {
    width: SCREEN_WIDTH - 64,
    get height(): number {
      return Math.round(this.width * 0.75);
    },
  },

  // Thumbnail
  thumbnail: {
    width: 100,
    height: 75,
  },

  // Gallery view (scrollable)
  gallery: {
    width: SCREEN_WIDTH - 32,
    get height(): number {
      return Math.round(this.width * 0.75);
    },
  },

  // Quality (high for verification)
  quality: 0.95,
  maxFileSizeMB: 20,
  preserveExif: true,
} as const;

// ============================================
// CHAT IMAGE DIMENSIONS
// ============================================
export const CHAT_IMAGE = {
  // Max upload
  upload: {
    maxWidth: 1200,
    maxHeight: 1200,
  },

  // Display in bubble
  display: {
    maxWidth: 280,
    maxHeight: 350,
  },

  quality: 0.8,
  maxFileSizeMB: 10,
} as const;

// ============================================
// PROFILE COVER DIMENSIONS
// ============================================
export const PROFILE_COVER = {
  upload: {
    width: 1500,
    height: 500,
  },

  aspectRatio: ASPECT_RATIOS.cover,

  display: {
    width: SCREEN_WIDTH,
    get height(): number {
      return Math.round(this.width / 3);
    },
  },

  quality: 0.85,
  maxFileSizeMB: 10,
} as const;

// ============================================
// STORY / FULLSCREEN DIMENSIONS
// ============================================
export const STORY = {
  upload: {
    width: 1080,
    height: 1920,
  },

  aspectRatio: ASPECT_RATIOS.vertical,

  display: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  quality: 0.85,
  maxFileSizeMB: 15,
} as const;

// ============================================
// VIDEO DIMENSIONS
// ============================================
export const VIDEO = {
  // Vertical (Story/Reels format)
  vertical: {
    width: 1080,
    height: 1920,
    aspectRatio: ASPECT_RATIOS.vertical,
  },

  // Square
  square: {
    width: 1080,
    height: 1080,
    aspectRatio: ASPECT_RATIOS.square,
  },

  // Landscape
  landscape: {
    width: 1920,
    height: 1080,
    aspectRatio: ASPECT_RATIOS.landscape,
  },

  // Limits
  maxDuration: 60, // seconds
  fps: 30,
  maxBitrate: '8Mbps',
  maxFileSizeMB: 100,

  // Thumbnail
  thumbnail: {
    width: 1080,
    height: 1920,
    captureAt: 0.5, // Middle of video
  },
} as const;

// ============================================
// THUMBNAIL SIZES
// ============================================
export const THUMBNAIL = {
  xl: { width: 300, height: 300 },
  lg: { width: 200, height: 200 },
  md: { width: 100, height: 100 },
  sm: { width: 50, height: 50 },
} as const;

// ============================================
// QUALITY SETTINGS
// ============================================
export const IMAGE_QUALITY = {
  high: 0.95,
  medium: 0.85,
  low: 0.7,
  thumbnail: 0.6,
} as const;

// ============================================
// MAX FILE SIZES (MB)
// ============================================
export const MAX_FILE_SIZES = {
  avatar: 5,
  moment: 15,
  proof: 20,
  chat: 10,
  video: 100,
  cover: 10,
  story: 15,
} as const;

// ============================================
// COMBINED EXPORT
// ============================================
export const IMAGE_DIMENSIONS = {
  avatar: AVATAR,
  momentCard: MOMENT_CARD,
  proof: PROOF,
  chatImage: CHAT_IMAGE,
  profileCover: PROFILE_COVER,
  story: STORY,
  video: VIDEO,
  thumbnail: THUMBNAIL,
  quality: IMAGE_QUALITY,
  maxFileSizes: MAX_FILE_SIZES,
  aspectRatios: ASPECT_RATIOS,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get dimensions for aspect ratio
 */
export const getDimensionsForRatio = (
  width: number,
  ratio: number,
): { width: number; height: number } => ({
  width,
  height: Math.round(width / ratio),
});

/**
 * Calculate height from width and aspect ratio
 */
export const calculateHeight = (width: number, aspectRatio: number): number =>
  Math.round(width / aspectRatio);

/**
 * Calculate width from height and aspect ratio
 */
export const calculateWidth = (height: number, aspectRatio: number): number =>
  Math.round(height * aspectRatio);

/**
 * Check if image meets minimum requirements
 */
export const meetsMinimumSize = (
  width: number,
  height: number,
  type: 'avatar' | 'moment' | 'proof',
): boolean => {
  switch (type) {
    case 'avatar':
      return width >= 200 && height >= 200;
    case 'moment':
      return width >= 600 && height >= 600;
    case 'proof':
      return width >= PROOF.upload.minWidth && height >= PROOF.upload.minHeight;
    default:
      return width >= 100 && height >= 100;
  }
};

/**
 * Get optimal dimensions for upload
 */
export const getOptimalUploadDimensions = (
  type: 'avatar' | 'moment' | 'proof' | 'chat' | 'cover' | 'story',
): { width: number; height: number } => {
  switch (type) {
    case 'avatar':
      return AVATAR.upload;
    case 'moment':
      return MOMENT_CARD.upload;
    case 'proof':
      return PROOF.upload;
    case 'chat':
      return {
        width: CHAT_IMAGE.upload.maxWidth,
        height: CHAT_IMAGE.upload.maxHeight,
      };
    case 'cover':
      return PROFILE_COVER.upload;
    case 'story':
      return STORY.upload;
    default:
      return { width: 1080, height: 1080 };
  }
};

export default IMAGE_DIMENSIONS;

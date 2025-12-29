/**
 * Cloudflare + BlurHash Image Helpers
 *
 * Simplifies image URL generation with BlurHash placeholders
 * for components using Cloudflare Images CDN.
 *
 * Usage:
 * ```tsx
 * import { getMomentImageProps } from '@/utils/cloudflareImageHelpers';
 *
 * <OptimizedImage
 *   {...getMomentImageProps(moment, 'medium')}
 *   style={{ width: 300, height: 400 }}
 * />
 * ```
 */

import { getImageUrl, ImageVariant } from '../services/cloudflareImages';

/**
 * Moment with optional Cloudflare/BlurHash fields
 * Use this until API types are updated
 */
export interface CloudflareImage {
  imageUrl?: string;
  imageCloudflareId?: string;
  imageBlurHash?: string;
  image?: string; // Legacy field
}

/**
 * User avatar with optional Cloudflare/BlurHash fields
 */
export interface CloudflareAvatar {
  avatar?: string | null;
  avatarCloudflareId?: string;
  avatarBlurHash?: string;
}

/**
 * Uploaded image with Cloudflare/BlurHash fields
 */
export interface CloudflareUploadedImage {
  id?: string;
  url?: string;
  cloudflareId?: string;
  blurHash?: string;
}

/**
 * Get optimized image URL from Cloudflare or fallback to legacy URL
 *
 * @param item - Object with imageUrl and optional imageCloudflareId
 * @param variant - Cloudflare image variant (thumbnail, small, medium, large)
 * @param fallbackUrl - Default URL if neither Cloudflare nor imageUrl exist
 * @returns Optimized image URL
 *
 * @example
 * const url = getOptimizedImageUrl(moment, 'medium');
 * // Returns: https://imagedelivery.net/.../moment-id/medium
 * // Or falls back to: moment.imageUrl or moment.image
 */
export function getOptimizedImageUrl(
  item: CloudflareImage,
  variant: ImageVariant = 'medium',
  fallbackUrl?: string,
): string {
  // Priority 1: Cloudflare CDN (WebP/AVIF optimized)
  if (item.imageCloudflareId) {
    const cloudflareUrl = getImageUrl(item.imageCloudflareId, variant);
    // Only use Cloudflare URL if it's valid (account hash is configured)
    if (cloudflareUrl) {
      return cloudflareUrl;
    }
  }

  // Priority 2: Legacy URL (direct URL)
  if (item.imageUrl) {
    return item.imageUrl;
  }

  // Priority 3: Legacy 'image' field (for backwards compatibility)
  if (item.image) {
    return item.image;
  }

  // Priority 4: Fallback URL (placeholder)
  return fallbackUrl || '';
}

/**
 * Get optimized avatar URL from Cloudflare or fallback
 *
 * @param user - User object with avatar and optional avatarCloudflareId
 * @param variant - Cloudflare image variant (typically 'thumbnail' or 'small')
 * @param fallbackUrl - Default avatar URL
 * @returns Optimized avatar URL
 *
 * @example
 * const avatarUrl = getOptimizedAvatarUrl(user, 'thumbnail', DEFAULT_AVATAR);
 */
export function getOptimizedAvatarUrl(
  user: CloudflareAvatar,
  variant: ImageVariant = 'thumbnail',
  fallbackUrl?: string,
): string {
  if (user.avatarCloudflareId) {
    const cloudflareUrl = getImageUrl(user.avatarCloudflareId, variant);
    // Only use Cloudflare URL if it's valid (account hash is configured)
    if (cloudflareUrl) {
      return cloudflareUrl;
    }
  }

  return user.avatar || fallbackUrl || '';
}

/**
 * Get image props for OptimizedImage component
 * Returns source URL and optional BlurHash placeholder
 *
 * @param item - Object with image data
 * @param variant - Cloudflare image variant
 * @param fallbackUrl - Default URL
 * @returns Props object for OptimizedImage component
 *
 * @example
 * <OptimizedImage
 *   {...getMomentImageProps(moment, 'medium')}
 *   contentFit="cover"
 * />
 */
export function getMomentImageProps(
  item: CloudflareImage,
  variant: ImageVariant = 'medium',
  fallbackUrl?: string,
) {
  return {
    source: getOptimizedImageUrl(item, variant, fallbackUrl),
    placeholder: item.imageBlurHash,
  };
}

/**
 * Get avatar props for OptimizedImage component
 *
 * @example
 * <OptimizedImage
 *   {...getAvatarImageProps(user, 'thumbnail', DEFAULT_AVATAR)}
 *   contentFit="cover"
 *   style={styles.avatar}
 * />
 */
export function getAvatarImageProps(
  user: CloudflareAvatar,
  variant: ImageVariant = 'thumbnail',
  fallbackUrl?: string,
) {
  return {
    source: getOptimizedAvatarUrl(user, variant, fallbackUrl),
    placeholder: user.avatarBlurHash,
  };
}

/**
 * Get uploaded image props
 * For images from the upload-image Edge Function
 *
 * @example
 * const uploadedImage = await uploadImage(file);
 * <OptimizedImage
 *   {...getUploadedImageProps(uploadedImage, 'medium')}
 * />
 */
export function getUploadedImageProps(
  image: CloudflareUploadedImage,
  variant: ImageVariant = 'medium',
  fallbackUrl?: string,
) {
  return {
    source: image.cloudflareId
      ? getImageUrl(image.cloudflareId, variant)
      : image.url || fallbackUrl || '',
    placeholder: image.blurHash,
  };
}

/**
 * Variant selection guide for different UI contexts
 * Use these constants to ensure consistent sizing across the app
 */
export const IMAGE_VARIANTS_BY_CONTEXT = {
  // Avatars
  AVATAR_SMALL: 'thumbnail' as ImageVariant, // 150x150 - Story avatars, small icons
  AVATAR_LARGE: 'small' as ImageVariant, // 320x320 - Profile page, large avatars

  // Cards
  CARD_GRID: 'small' as ImageVariant, // 320x320 - Grid view cards
  CARD_SINGLE: 'medium' as ImageVariant, // 640x640 - Single card view
  CARD_DETAIL: 'medium' as ImageVariant, // 640x640 - Detail view

  // Full screen
  FULLSCREEN: 'large' as ImageVariant, // 1280x1280 - Full screen view
  ZOOM: 'original' as ImageVariant, // 2560x2560 - Zoomed/pinch-to-zoom

  // Stories
  STORY_AVATAR: 'thumbnail' as ImageVariant, // 150x150 - Story ring avatars
  STORY_CONTENT: 'large' as ImageVariant, // 1280x1280 - Story full-screen content
} as const;

/**
 * Check if an item has Cloudflare optimization enabled
 * Useful for feature flags or gradual rollout
 *
 * @example
 * if (hasCloudflareOptimization(moment)) {
 *   // Use optimized path
 * } else {
 *   // Use legacy path
 * }
 */
export function hasCloudflareOptimization(item: CloudflareImage): boolean {
  return !!(item.imageCloudflareId && item.imageBlurHash);
}

/**
 * Check if an avatar has Cloudflare optimization
 */
export function hasCloudflareAvatar(user: CloudflareAvatar): boolean {
  return !!(user.avatarCloudflareId && user.avatarBlurHash);
}

/**
 * Migration helper: Convert legacy image URL to Cloudflare format
 * Returns the data structure expected by components after migration
 *
 * @example
 * // After uploading to Cloudflare via Edge Function:
 * const uploaded = await fetch('/upload-image', { method: 'POST', body: formData });
 * const cloudflareImage = migrateToCloudflare(uploaded.id, uploaded.blurHash);
 *
 * // Update database:
 * await supabase
 *   .from('moments')
 *   .update(cloudflareImage)
 *   .eq('id', momentId);
 */
export function migrateToCloudflare(
  cloudflareId: string,
  blurHash: string,
  legacyUrl?: string,
): CloudflareImage {
  return {
    imageCloudflareId: cloudflareId,
    imageBlurHash: blurHash,
    imageUrl: legacyUrl, // Keep for backwards compatibility
  };
}

/**
 * Batch helper: Get all variant URLs for a Cloudflare image
 * Useful for preloading or prefetching multiple sizes
 *
 * @example
 * const variants = getAllVariantUrls('cloudflare-image-id');
 * // Preload all sizes
 * variants.forEach(url => Image.prefetch(url));
 */
export function getAllVariantUrls(
  cloudflareId: string,
): Record<ImageVariant, string> {
  return {
    thumbnail: getImageUrl(cloudflareId, 'thumbnail'),
    small: getImageUrl(cloudflareId, 'small'),
    medium: getImageUrl(cloudflareId, 'medium'),
    large: getImageUrl(cloudflareId, 'large'),
    original: getImageUrl(cloudflareId, 'original'),
  };
}

/**
 * Type guard: Check if object has BlurHash
 */
export function hasBlurHash(item: unknown): item is { imageBlurHash: string } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'imageBlurHash' in item &&
    typeof (item as { imageBlurHash?: unknown }).imageBlurHash === 'string'
  );
}

/**
 * Performance helper: Should we use BlurHash?
 * Returns false if BlurHash is invalid or too short
 */
export function shouldUseBlurHash(blurHash?: string): boolean {
  if (!blurHash) return false;

  // BlurHash should be at least 6 characters
  // Typical BlurHash is 20-30 characters
  return blurHash.length >= 6 && blurHash.length <= 90;
}

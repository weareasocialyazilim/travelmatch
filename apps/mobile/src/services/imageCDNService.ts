/**
 * Image CDN Service
 * Cloudflare Images integration for optimized image delivery
 *
 * 🔒 SECURITY WARNING:
 * CLOUDFLARE_IMAGES_TOKEN should NOT be in EXPO_PUBLIC_* variables!
 * This service should ONLY handle image delivery (reading), not uploads.
 * Image uploads must be done via Supabase Edge Functions (server-side).
 *
 * Features:
 * - Automatic WebP/AVIF conversion
 * - On-the-fly resizing and optimization
 * - Global CDN delivery
 * - 60-80% faster image loads
 *
 * Usage:
 * 1. Upload images via server-side API
 * 2. Get optimized delivery URLs
 * 3. Use responsive srcsets for multi-resolution
 */

import { logger } from '../utils/logger';

// Cloudflare Images Configuration (READ-ONLY)
const CLOUDFLARE_ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
// 🔒 REMOVED: CLOUDFLARE_IMAGES_TOKEN - must be server-side only
const CLOUDFLARE_DELIVERY_URL = `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_ID}`;

// Image Variants (predefined sizes)
export const ImageSizes = {
  avatar: { width: 200, height: 200 },
  thumbnail: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 },
  full: { width: 2000, height: 2000 },
} as const;

export type ImageSize = keyof typeof ImageSizes;

export interface CloudflareUploadResult {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

export interface ImageUploadOptions {
  requireSignedURLs?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Check if Cloudflare Images is configured for delivery
 */
export function isCloudflareImagesEnabled(): boolean {
  return Boolean(CLOUDFLARE_ACCOUNT_ID);
}

/**
 * 🔒 DEPRECATED: Upload image to Cloudflare Images CDN
 *
 * @deprecated This function exposes sensitive tokens in client code.
 * Use the server-side upload endpoint instead:
 *
 * ```typescript
 * // ✅ SECURE: Upload via Supabase Edge Function
 * const response = await fetch(
 *   `${SUPABASE_URL}/functions/v1/upload-image`,
 *   {
 *     method: 'POST',
 *     headers: {
 *       'apikey': SUPABASE_ANON_KEY,
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify({ imageUri, options }),
 *   }
 * );
 * ```
 */
export async function uploadToCloudflare(
  _imageUri: string,
  _options: ImageUploadOptions = {},
): Promise<CloudflareUploadResult> {
  throw new Error(
    '🔒 SECURITY: Image uploads must be done server-side. ' +
      'Use Supabase Edge Function: /functions/v1/upload-image',
  );
}

/**
 * Get optimized image URL from Cloudflare
 */
export function getCloudflareImageURL(
  imageId: string,
  size: ImageSize = 'medium',
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png',
): string {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    logger.warn('Cloudflare Images not configured, cannot generate URL');
    return '';
  }

  const variant = `${size}`;

  // Build URL with transformations
  let url = `${CLOUDFLARE_DELIVERY_URL}/${imageId}/${variant}`;

  // Add format if specified
  if (format) {
    url += `?format=${format}`;
  }

  return url;
}

/**
 * Get responsive srcset for image
 */
export function getResponsiveSrcSet(
  imageId: string,
  sizes: ImageSize[] = ['thumbnail', 'medium', 'large'],
): string {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    return '';
  }

  return sizes
    .map((size) => {
      const url = getCloudflareImageURL(imageId, size);
      const width = ImageSizes[size].width;
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * 🔒 DEPRECATED: Delete image from Cloudflare Images CDN
 *
 * @deprecated This function requires sensitive tokens that must be server-side only.
 * Use the server-side delete endpoint instead via Supabase Edge Function.
 */
export async function deleteFromCloudflare(_imageId: string): Promise<void> {
  throw new Error(
    '🔒 SECURITY: Image deletion must be done server-side. ' +
      'Use Supabase Edge Function: /functions/v1/delete-image',
  );
}

/**
 * Upload image with fallback to Supabase Storage
 * If Cloudflare is not configured, uses Supabase Storage
 */
export async function uploadImageWithCDN(
  imageUri: string,
  bucket: string,
  options: ImageUploadOptions = {},
): Promise<{ url: string; id: string; provider: 'cloudflare' | 'supabase' }> {
  // Try Cloudflare first if configured
  if (isCloudflareImagesEnabled()) {
    try {
      const result = await uploadToCloudflare(imageUri, options);
      const url = getCloudflareImageURL(result.id, 'medium');

      return {
        url,
        id: result.id,
        provider: 'cloudflare',
      };
    } catch (error) {
      logger.warn('Cloudflare upload failed, falling back to Supabase', {
        error,
      });
    }
  }

  // Fallback to Supabase Storage
  const { uploadFile } = await import('./supabaseStorageService');
  const { url, error } = await uploadFile(
    bucket as 'avatars' | 'moments' | 'proofs' | 'messages',
    imageUri,
    'image',
  );

  if (error) {
    throw error;
  }

  return {
    url: url!,
    id: url!,
    provider: 'supabase',
  };
}

/**
 * Get image URL with automatic provider detection
 */
export function getOptimizedImageURL(
  imageId: string,
  size: ImageSize = 'medium',
): string {
  // If imageId looks like a Cloudflare ID (no slashes), use Cloudflare
  if (!imageId.includes('/') && isCloudflareImagesEnabled()) {
    return getCloudflareImageURL(imageId, size);
  }

  // Otherwise, return as-is (Supabase URL)
  return imageId;
}

export const imageCDNService = {
  isEnabled: isCloudflareImagesEnabled,
  upload: uploadToCloudflare,
  getURL: getCloudflareImageURL,
  getResponsiveSrcSet,
  delete: deleteFromCloudflare,
  uploadWithFallback: uploadImageWithCDN,
  getOptimized: getOptimizedImageURL,
};

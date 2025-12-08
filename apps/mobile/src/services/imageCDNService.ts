/**
 * Image CDN Service
 * Cloudflare Images integration for optimized image delivery
 * 
 * Features:
 * - Automatic WebP/AVIF conversion
 * - On-the-fly resizing and optimization
 * - Global CDN delivery
 * - 60-80% faster image loads
 * 
 * Usage:
 * 1. Upload images to Cloudflare CDN
 * 2. Get optimized URLs with ImageVariants
 * 3. Use responsive srcsets for multi-resolution
 */

import { logger } from '../utils/logger';

// Cloudflare Images Configuration
const CLOUDFLARE_ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_IMAGES_TOKEN = process.env.EXPO_PUBLIC_CLOUDFLARE_IMAGES_TOKEN;
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
 * Check if Cloudflare Images is configured
 */
export function isCloudflareImagesEnabled(): boolean {
  return Boolean(CLOUDFLARE_ACCOUNT_ID && CLOUDFLARE_IMAGES_TOKEN);
}

/**
 * Upload image to Cloudflare Images CDN
 */
export async function uploadToCloudflare(
  imageUri: string,
  options: ImageUploadOptions = {}
): Promise<CloudflareUploadResult> {
  if (!isCloudflareImagesEnabled()) {
    throw new Error('Cloudflare Images not configured. Set EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID and EXPO_PUBLIC_CLOUDFLARE_IMAGES_TOKEN');
  }

  try {
    // Convert URI to Blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create FormData
    const formData = new FormData();
    formData.append('file', blob);

    if (options.requireSignedURLs) {
      formData.append('requireSignedURLs', 'true');
    }

    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    // Upload to Cloudflare
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(`Cloudflare upload failed: ${error.errors?.[0]?.message || 'Unknown error'}`);
    }

    const result = await uploadResponse.json();
    logger.info('Cloudflare image uploaded', { id: result.result.id });

    return result.result;
  } catch (error) {
    logger.error('Cloudflare upload error', { error });
    throw error;
  }
}

/**
 * Get optimized image URL from Cloudflare
 */
export function getCloudflareImageURL(
  imageId: string,
  size: ImageSize = 'medium',
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png'
): string {
  if (!CLOUDFLARE_ACCOUNT_ID) {
    logger.warn('Cloudflare Images not configured, cannot generate URL');
    return '';
  }

  const dimensions = ImageSizes[size];
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
  sizes: ImageSize[] = ['thumbnail', 'medium', 'large']
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
 * Delete image from Cloudflare
 */
export async function deleteFromCloudflare(imageId: string): Promise<void> {
  if (!isCloudflareImagesEnabled()) {
    throw new Error('Cloudflare Images not configured');
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cloudflare delete failed: ${error.errors?.[0]?.message || 'Unknown error'}`);
    }

    logger.info('Cloudflare image deleted', { id: imageId });
  } catch (error) {
    logger.error('Cloudflare delete error', { error });
    throw error;
  }
}

/**
 * Upload image with fallback to Supabase Storage
 * If Cloudflare is not configured, uses Supabase Storage
 */
export async function uploadImageWithCDN(
  imageUri: string,
  bucket: string,
  options: ImageUploadOptions = {}
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
      logger.warn('Cloudflare upload failed, falling back to Supabase', { error });
    }
  }

  // Fallback to Supabase Storage
  const { uploadFile } = await import('./supabaseStorageService');
  const { url, error } = await uploadFile(bucket as any, imageUri);

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
  size: ImageSize = 'medium'
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

/**
 * Cloudflare Images Service
 *
 * Automatic WebP pipeline for image optimization
 *
 * Features:
 * - Automatic format conversion (JPEG/PNG → WebP)
 * - Responsive image variants (thumbnail, small, medium, large)
 * - CDN delivery via Cloudflare
 * - Lazy loading support
 * - Performance monitoring
 *
 * Setup:
 * 1. Create Cloudflare Images account
 * 2. Get API token and account ID
 * 3. Set environment variables:
 *    - CLOUDFLARE_ACCOUNT_ID
 *    - CLOUDFLARE_IMAGES_TOKEN
 *
 * @see https://developers.cloudflare.com/images/
 */

import React from 'react';
import { logger } from '../utils/logger';

// Environment variables
const CLOUDFLARE_ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_IMAGES_TOKEN = process.env.CLOUDFLARE_IMAGES_TOKEN || '';
const CLOUDFLARE_IMAGES_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

/**
 * Image variant configurations
 * Cloudflare will automatically generate these variants
 */
export const IMAGE_VARIANTS = {
  thumbnail: { width: 150, height: 150, fit: 'cover' as const },
  small: { width: 320, height: 320, fit: 'scale-down' as const },
  medium: { width: 640, height: 640, fit: 'scale-down' as const },
  large: { width: 1280, height: 1280, fit: 'scale-down' as const },
  original: { width: 2560, height: 2560, fit: 'scale-down' as const },
} as const;

export type ImageVariant = keyof typeof IMAGE_VARIANTS;

/**
 * Image upload options
 */
interface UploadOptions {
  requireSignedURLs?: boolean;
  metadata?: Record<string, string>;
  customId?: string;
}

/**
 * Image response from Cloudflare
 */
interface CloudflareImageResponse {
  id: string;
  filename: string;
  uploaded: string;
  requireSignedURLs: boolean;
  variants: string[];
}

/**
 * Upload image to Cloudflare Images
 * Automatically generates WebP variants
 */
export async function uploadToCloudflare(
  imageData: Blob | File,
  options: UploadOptions = {},
): Promise<CloudflareImageResponse> {
  const startTime = Date.now();

  try {
    logger.info('[Cloudflare] Uploading image...', {
      size: imageData.size,
      type: imageData.type,
    });

    const formData = new FormData();
    formData.append('file', imageData);

    if (options.requireSignedURLs) {
      formData.append('requireSignedURLs', 'true');
    }

    if (options.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    if (options.customId) {
      formData.append('id', options.customId);
    }

    const response = await fetch(CLOUDFLARE_IMAGES_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare upload failed: ${error}`);
    }

    const result = await response.json();

    logger.info('[Cloudflare] Upload successful', {
      id: result.result.id,
      duration: Date.now() - startTime,
    });

    return result.result;
  } catch (error) {
    logger.error('[Cloudflare] Upload failed:', error);
    throw error;
  }
}

/**
 * Get optimized image URL for specific variant
 * Automatically serves WebP format when supported by browser
 * 
 * @example
 * const url = getImageUrl(imageId, 'medium');
 * // Returns: https://imagedelivery.net/{account_hash}/{image_id}/medium
 */
export function getImageUrl(
  imageId: string,
  variant: ImageVariant = 'medium',
): string {
  const accountHash = CLOUDFLARE_ACCOUNT_ID;
  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

/**
 * Get responsive image URLs for all variants
 * Use for srcset in <img> tags
 * 
 * @example
 * const urls = getResponsiveUrls(imageId);
 * <img 
 *   src={urls.medium}
 *   srcset={`${urls.small} 320w, ${urls.medium} 640w, ${urls.large} 1280w`}
 * />
 */
export function getResponsiveUrls(imageId: string) {
  return {
    thumbnail: getImageUrl(imageId, 'thumbnail'),
    small: getImageUrl(imageId, 'small'),
    medium: getImageUrl(imageId, 'medium'),
    large: getImageUrl(imageId, 'large'),
    original: getImageUrl(imageId, 'original'),
  };
}

/**
 * Delete image from Cloudflare
 */
export async function deleteFromCloudflare(imageId: string): Promise<void> {
  try {
    const response = await fetch(`${CLOUDFLARE_IMAGES_URL}/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete image: ${imageId}`);
    }

    logger.info('[Cloudflare] Image deleted:', imageId);
  } catch (error) {
    logger.error('[Cloudflare] Delete failed:', error);
    throw error;
  }
}

/**
 * Get image details and variants
 */
export async function getImageDetails(
  imageId: string,
): Promise<CloudflareImageResponse> {
  try {
    const response = await fetch(`${CLOUDFLARE_IMAGES_URL}/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_IMAGES_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get image details: ${imageId}`);
    }

    const result = await response.json();
    return result.result;
  } catch (error) {
    logger.error('[Cloudflare] Get details failed:', error);
    throw error;
  }
}

/**
 * Batch upload images
 */
export async function batchUpload(
  images: Array<{ data: Blob | File; metadata?: Record<string, string> }>,
): Promise<CloudflareImageResponse[]> {
  const results = await Promise.allSettled(
    images.map((img) =>
      uploadToCloudflare(img.data, { metadata: img.metadata }),
    ),
  );

  const successful = results
    .filter((r): r is PromiseFulfilledResult<CloudflareImageResponse> => r.status === 'fulfilled')
    .map((r) => r.value);

  const failed = results.filter((r) => r.status === 'rejected');

  if (failed.length > 0) {
    logger.warn('[Cloudflare] Some uploads failed:', {
      successful: successful.length,
      failed: failed.length,
    });
  }

  return successful;
}

/**
 * React Native hook for image upload with progress
 */
export function useCloudflareUpload() {
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<Error | null>(null);

  const upload = async (imageData: Blob | File, options?: UploadOptions) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress (Cloudflare doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadToCloudflare(imageData, options);

      clearInterval(progressInterval);
      setProgress(100);
      setUploading(false);

      return result;
    } catch (err) {
      setError(err as Error);
      setUploading(false);
      throw err;
    }
  };

  return { upload, uploading, progress, error };
}

/**
 * Image optimization helper
 * Compresses image before uploading to Cloudflare
 */
export async function optimizeBeforeUpload(
  imageUri: string,
  maxWidth = 2560,
  quality = 0.8,
): Promise<Blob> {
  // For React Native with expo-image-manipulator
  const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');

  const manipulated = await manipulateAsync(
    imageUri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: SaveFormat.JPEG },
  );

  const response = await fetch(manipulated.uri);
  return await response.blob();
}

/**
 * Migration helper: Convert Supabase Storage URL to Cloudflare
 */
export async function migrateFromSupabase(
  supabaseUrl: string,
  metadata?: Record<string, string>,
): Promise<CloudflareImageResponse> {
  try {
    // Download from Supabase
    const response = await fetch(supabaseUrl);
    const blob = await response.blob();

    // Upload to Cloudflare
    return await uploadToCloudflare(blob, { metadata });
  } catch (error) {
    logger.error('[Cloudflare] Migration failed:', error);
    throw error;
  }
}

/**
 * Cloudflare Images configuration for Supabase Edge Functions
 */
export const cloudflareConfig = {
  accountId: CLOUDFLARE_ACCOUNT_ID,
  apiToken: CLOUDFLARE_IMAGES_TOKEN,
  variants: IMAGE_VARIANTS,
  
  // Automatic WebP conversion
  formats: ['webp', 'avif', 'jpeg', 'png'] as const,
  
  // Cache control
  cacheControl: {
    browserTTL: 31536000, // 1 year
    edgeTTL: 2592000, // 30 days
  },
  
  // Security
  requireSignedURLs: false, // Set to true for private images
  
  // Performance
  lazyLoading: true,
  preload: ['thumbnail', 'small'] as ImageVariant[],
};

export default {
  uploadToCloudflare,
  getImageUrl,
  getResponsiveUrls,
  deleteFromCloudflare,
  getImageDetails,
  batchUpload,
  optimizeBeforeUpload,
  migrateFromSupabase,
  config: cloudflareConfig,
};

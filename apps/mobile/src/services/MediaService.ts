/**
 * MediaService - Lovendo Unified Media Service
 *
 * Consolidates all media-related services into a single entry point:
 * - Image CDN delivery (Cloudflare Images)
 * - Secure image uploads (via Edge Functions or Supabase Storage)
 * - Multi-tier caching (Memory → Disk → CDN)
 * - Image preloading and prefetching
 *
 * PATCH-003: Merged uploadService.ts into this file
 * - Added secure upload namespace with security validation
 * - Added storage monitoring and crash recovery
 * - Added rate limiting support
 *
 * @example
 * ```tsx
 * import { MediaService } from '@/services/MediaService';
 *
 * // Upload an image (Cloudflare via Edge Function)
 * const result = await MediaService.upload.image(imageUri, { type: 'avatar' });
 *
 * // Secure upload with validation (Supabase Storage)
 * const secureResult = await MediaService.upload.secure(imageUri, { folder: 'moments' });
 *
 * // Get optimized URL
 * const url = MediaService.cdn.getUrl(imageId, 'medium');
 *
 * // Get cached image
 * const cachedUri = await MediaService.cache.getImage(url);
 *
 * // Preload images
 * MediaService.preload.images(uris, 'high');
 * ```
 */

import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase, SUPABASE_EDGE_URL } from '../config/supabase';
import { logger } from '../utils/logger';
import { uploadFile as supabaseUploadFile } from './supabaseStorageService';
import type { StorageBucket } from './supabaseStorageService';
import {
  pendingTransactionsService,
  TransactionStatus,
} from './pendingTransactionsService';
import { storageMonitor, StorageLevel } from './storageMonitor';

// Re-export from individual services
import {
  ImageSizes,
  isCloudflareImagesEnabled,
  getCloudflareImageURL,
  getResponsiveSrcSet,
  uploadImageWithCDN,
  getOptimizedImageURL,
  type ImageSize,
  type CloudflareUploadResult,
  type ImageUploadOptions as CDNUploadOptions,
} from './imageCDNService';

import {
  uploadImage,
  uploadImages,
  deleteImage,
  type ImageUploadOptions,
  type ImageUploadResult,
  type BatchUploadResult,
} from './imageUploadService';

import {
  uploadToCloudflare,
  getImageUrl,
  getResponsiveUrls,
  deleteFromCloudflare,
  getImageDetails,
  batchUpload,
  optimizeBeforeUpload,
  migrateFromSupabase,
  useCloudflareUpload,
  cloudflareConfig,
  IMAGE_VARIANTS,
  type ImageVariant,
} from './cloudflareImages';

import {
  imageCacheManager,
  useImageCache,
  type CacheConfig,
  type CacheEntry,
  type CacheStats,
} from './imageCacheManager';

import {
  imagePreloader,
  viewportObserver,
  useImagePreload,
  useViewportTracking,
} from './imagePreloader';

// ═══════════════════════════════════════════════════════════════════
// Unified Media Service Namespace
// ═══════════════════════════════════════════════════════════════════

export const MediaService = {
  // ─────────────────────────────────────────────────────────────────
  // CDN Operations (Cloudflare Images)
  // ─────────────────────────────────────────────────────────────────
  cdn: {
    /** Check if Cloudflare Images is configured */
    isEnabled: isCloudflareImagesEnabled,

    /** Get optimized image URL for a variant */
    getUrl: getCloudflareImageURL,

    /** Alternative URL getter from cloudflareImages */
    getImageUrl,

    /** Get responsive srcset for multiple sizes */
    getSrcSet: getResponsiveSrcSet,

    /** Get all responsive variant URLs */
    getResponsiveUrls,

    /** Get optimized URL with automatic provider detection */
    getOptimized: getOptimizedImageURL,

    /** Get image details from Cloudflare */
    getDetails: getImageDetails,

    /** Image size presets */
    sizes: ImageSizes,

    /** Image variant configurations */
    variants: IMAGE_VARIANTS,

    /** Cloudflare configuration (public) */
    config: cloudflareConfig,
  },

  // ─────────────────────────────────────────────────────────────────
  // Upload Operations (Secure via Edge Functions)
  // ─────────────────────────────────────────────────────────────────
  upload: {
    /** Upload single image (authenticated via Edge Function) */
    image: uploadImage,

    /** Upload multiple images with resilient error handling */
    batch: uploadImages,

    /** Upload directly to Cloudflare via Edge Function */
    toCloudflare: uploadToCloudflare,

    /** Upload with CDN fallback to Supabase */
    withFallback: uploadImageWithCDN,

    /** Batch upload to Cloudflare */
    batchToCloudflare: batchUpload,

    /** Optimize image before upload */
    optimize: optimizeBeforeUpload,

    /** Migrate from Supabase Storage to Cloudflare */
    migrate: migrateFromSupabase,

    /** React hook for upload with progress */
    useUpload: useCloudflareUpload,

    // ───────────────────────────────────────────────────────────────
    // Secure Upload (with security validation, merged from uploadService)
    // ───────────────────────────────────────────────────────────────
    secure: {
      /** Upload with full security validation */
      image: uploadSecureImage,

      /** Upload multiple images with security validation */
      batch: uploadSecureImages,

      /** Validate file before upload */
      validate: validateFile,
    },
  },

  // ─────────────────────────────────────────────────────────────────
  // Delete Operations
  // ─────────────────────────────────────────────────────────────────
  delete: {
    /** Delete image from CDN (authenticated) */
    image: deleteImage,

    /** Delete from Cloudflare via Edge Function */
    fromCloudflare: deleteFromCloudflare,
  },

  // ─────────────────────────────────────────────────────────────────
  // Cache Operations (Multi-tier: Memory → Disk → CDN)
  // ─────────────────────────────────────────────────────────────────
  cache: {
    /** Get image with multi-tier caching */
    getImage: imageCacheManager.getImage.bind(imageCacheManager),

    /** Prefetch image and variants */
    prefetch: imageCacheManager.prefetch.bind(imageCacheManager),

    /** Upload and cache locally */
    uploadAndCache: imageCacheManager.uploadAndCache.bind(imageCacheManager),

    /** Clear cache (memory and/or disk) */
    clear: imageCacheManager.clearCache.bind(imageCacheManager),

    /** Get cache statistics */
    getStats: imageCacheManager.getStats.bind(imageCacheManager),

    /** Evict least recently used entries */
    evictLRU: imageCacheManager.evictLRU.bind(imageCacheManager),

    /** Initialize cache manager */
    initialize: imageCacheManager.initialize.bind(imageCacheManager),

    /** Cache manager instance */
    manager: imageCacheManager,

    /** React hook for cache operations */
    useCache: useImageCache,
  },

  // ─────────────────────────────────────────────────────────────────
  // Preload Operations (Background loading)
  // ─────────────────────────────────────────────────────────────────
  preload: {
    /** Add images to preload queue */
    images: imagePreloader.preload.bind(imagePreloader),

    /** Prefetch moments feed images */
    momentsImages: imagePreloader.prefetchMomentsImages.bind(imagePreloader),

    /** Prefetch next page of content */
    nextPage: imagePreloader.prefetchNextPage.bind(imagePreloader),

    /** Clear preload queue */
    clear: imagePreloader.clear.bind(imagePreloader),

    /** Clear all cached preloaded images */
    clearCache: imagePreloader.clearCache.bind(imagePreloader),

    /** Get preload statistics */
    getStats: imagePreloader.getStats.bind(imagePreloader),

    /** Preloader instance */
    preloader: imagePreloader,

    /** React hook for preloading */
    usePreload: useImagePreload,
  },

  // ─────────────────────────────────────────────────────────────────
  // Viewport Tracking (Lazy loading support)
  // ─────────────────────────────────────────────────────────────────
  viewport: {
    /** Register item for viewport tracking */
    track: viewportObserver.track.bind(viewportObserver),

    /** Unregister item */
    untrack: viewportObserver.untrack.bind(viewportObserver),

    /** Mark item as visible */
    markVisible: viewportObserver.markVisible.bind(viewportObserver),

    /** Mark item as hidden */
    markHidden: viewportObserver.markHidden.bind(viewportObserver),

    /** Get currently visible items */
    getVisible: viewportObserver.getVisibleItems.bind(viewportObserver),

    /** Observer instance */
    observer: viewportObserver,

    /** React hook for viewport tracking */
    useTracking: useViewportTracking,
  },
};

// ═══════════════════════════════════════════════════════════════════
// PATCH-003: Secure Upload Implementation (merged from uploadService)
// ═══════════════════════════════════════════════════════════════════

// Security constants
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];
const MAX_FILE_SIZES = {
  avatars: 2 * 1024 * 1024, // 2MB
  moments: 10 * 1024 * 1024, // 10MB
  proofs: 5 * 1024 * 1024, // 5MB
  messages: 10 * 1024 * 1024, // 10MB
} as const;
const BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.dll',
  '.so',
  '.dylib',
  '.app',
  '.deb',
  '.rpm',
  '.apk',
  '.ipa',
  '.msi',
  '.dmg',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.rb',
  '.php',
  '.asp',
  '.html',
  '.htm',
  '.svg',
  '.xml',
] as const;

export interface SecureUploadOptions {
  folder?: 'avatars' | 'moments' | 'proofs' | 'messages';
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: {
    loaded: number;
    total: number;
    percentage: number;
  }) => void;
}

export interface SecureUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface FileValidationResult {
  valid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

/**
 * Validate file for upload
 */
export function validateFile(
  uri: string,
  folder: 'avatars' | 'moments' | 'proofs' | 'messages' = 'moments',
): Promise<FileValidationResult> {
  return (async () => {
    try {
      const filename = uri.split('/').pop() || 'upload.jpg';
      const extension = filename
        .toLowerCase()
        .substring(filename.lastIndexOf('.'));

      // Check blocked extensions
      if (BLOCKED_EXTENSIONS.some((e) => e === extension)) {
        return {
          valid: false,
          error: `Security: File type ${extension} is not allowed`,
        };
      }

      // Get file size
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileSize = blob.size;
      const mimeType = blob.type || 'image/jpeg';

      // Check file size
      const maxSize = MAX_FILE_SIZES[folder];
      if (fileSize > maxSize) {
        const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
        const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
        return {
          valid: false,
          error: `File size (${fileSizeMB}MB) exceeds maximum (${maxSizeMB}MB)`,
        };
      }

      // Check minimum size
      if (fileSize < 100) {
        return { valid: false, error: 'File is too small or corrupted' };
      }

      return {
        valid: true,
        fileInfo: { name: filename, size: fileSize, type: mimeType, extension },
      };
    } catch (error) {
      return { valid: false, error: 'Failed to validate file' };
    }
  })();
}

/**
 * Optimize image before upload
 */
async function optimizeImage(uri: string, quality = 0.8): Promise<string> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  } catch (error) {
    logger.warn('Image optimization failed, using original:', error);
    return uri;
  }
}

/**
 * Upload image with full security validation
 */
export async function uploadSecureImage(
  uri: string,
  options: SecureUploadOptions = {},
): Promise<SecureUploadResult> {
  let uploadId: string | undefined;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const folder = options.folder || 'moments';
    const bucket: StorageBucket = folder as StorageBucket;

    // Optimize image
    const optimizedUri = await optimizeImage(uri, options.quality);

    // Get file info
    const response = await fetch(optimizedUri);
    const blob = await response.blob();
    const fileInfo = {
      name: uri.split('/').pop() || 'upload.jpg',
      size: blob.size,
      type: blob.type || 'image/jpeg',
    };

    // Check storage
    const storageInfo = await storageMonitor.getStorageInfo();
    if (storageInfo?.level === StorageLevel.CRITICAL) {
      throw new Error('Not enough storage space for upload');
    }

    // Validate file
    const validation = await validateFile(optimizedUri, folder);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create pending transaction for crash recovery
    uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await pendingTransactionsService.addPendingUpload({
      id: uploadId,
      type: folder as 'proof' | 'moment' | 'avatar' | 'message',
      localUri: optimizedUri,
      bucket,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      mimeType: fileInfo.type,
      status: TransactionStatus.INITIATED,
      progress: 0,
    });

    // Upload to Supabase Storage
    const { url, path, error } = await supabaseUploadFile(
      bucket,
      optimizedUri,
      user.id,
    );

    if (error || !url || !path) {
      await pendingTransactionsService.updateUploadProgress(
        uploadId,
        0,
        TransactionStatus.FAILED,
      );
      throw error || new Error('Upload failed');
    }

    // Mark complete
    await pendingTransactionsService.updateUploadProgress(
      uploadId,
      100,
      TransactionStatus.COMPLETED,
    );

    logger.info('Secure upload completed:', { bucket, size: fileInfo.size });

    return {
      url,
      publicId: path,
      width: 0,
      height: 0,
      format: fileInfo.type.split('/')[1] || 'jpg',
      size: fileInfo.size,
    };
  } catch (error) {
    logger.error('Secure upload error:', error);
    if (uploadId) {
      await pendingTransactionsService.incrementUploadRetry(uploadId);
    }
    throw error;
  }
}

/**
 * Upload multiple images with security validation
 */
export async function uploadSecureImages(
  uris: string[],
  options: SecureUploadOptions = {},
): Promise<SecureUploadResult[]> {
  const results = await Promise.allSettled(
    uris.map((uri) => uploadSecureImage(uri, options)),
  );

  const successful: SecureUploadResult[] = [];
  const failed: Array<{ uri: string; error: Error }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      failed.push({
        uri: uris[index],
        error:
          result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason)),
      });
    }
  });

  logger.info(
    `Secure batch upload: ${successful.length}/${uris.length} successful`,
  );
  return successful;
}

// ═══════════════════════════════════════════════════════════════════
// Type Exports
// ═══════════════════════════════════════════════════════════════════

export type {
  // CDN types
  ImageSize,
  ImageVariant,
  CloudflareUploadResult,
  CDNUploadOptions,

  // Upload types
  ImageUploadOptions,
  ImageUploadResult,
  BatchUploadResult,

  // Cache types
  CacheConfig,
  CacheEntry,
  CacheStats,
};

// ═══════════════════════════════════════════════════════════════════
// Legacy Exports (Backward Compatibility)
// ═══════════════════════════════════════════════════════════════════

/** @deprecated Use MediaService.cdn.* */
export { imageCDNService } from './imageCDNService';

/** @deprecated Use MediaService.cache.* */
export { imageCacheManager } from './imageCacheManager';

/** @deprecated Use MediaService.preload.* */
export { imagePreloader } from './imagePreloader';

/** @deprecated Use MediaService.viewport.* */
export { viewportObserver, ViewportObserver } from './imagePreloader';

// Re-export all hooks for convenience
export {
  useCloudflareUpload,
  useImageCache,
  useImagePreload,
  useViewportTracking,
};

export default MediaService;

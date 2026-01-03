/**
 * MediaService - TravelMatch Unified Media Service
 *
 * Consolidates all media-related services into a single entry point:
 * - Image CDN delivery (Cloudflare Images)
 * - Secure image uploads (via Edge Functions)
 * - Multi-tier caching (Memory → Disk → CDN)
 * - Image preloading and prefetching
 *
 * @example
 * ```tsx
 * import { MediaService } from '@/services/MediaService';
 *
 * // Upload an image
 * const result = await MediaService.upload.image(imageUri, { type: 'avatar' });
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
  ViewportObserver,
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
    /** Upload single image (authenticated) */
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

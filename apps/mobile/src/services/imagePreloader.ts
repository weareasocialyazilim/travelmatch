/**
 * Image Preload Pipeline for Moments Feed
 *
 * Optimizations:
 * - Prefetch next page of moments before user scrolls
 * - Preload images in background
 * - Prioritize visible/near-visible images
 * - Cache preloaded images
 * - Use native fast image for caching
 */

import React from 'react';
import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';
import { queryClient } from '../services/offlineCache';
import { logger } from '../utils/logger';

// Preload queue
interface PreloadItem {
  uri: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

class ImagePreloader {
  private queue: PreloadItem[] = [];
  private preloading = new Set<string>();
  private preloaded = new Set<string>();
  private maxConcurrent = 3;
  private isProcessing = false;

  /**
   * Add images to preload queue
   */
  preload(uris: string[], priority: 'high' | 'normal' | 'low' = 'normal') {
    const newItems = uris
      .filter((uri) => !this.preloaded.has(uri) && !this.preloading.has(uri))
      .map((uri) => ({
        uri,
        priority,
        timestamp: Date.now(),
      }));

    this.queue.push(...newItems);
    this.sortQueue();
    this.processQueue();
  }

  /**
   * Prefetch moments images
   */
  async prefetchMomentsImages(
    moments: Array<{ id: string; imageUrl: string }>,
  ) {
    const uris = moments.map((m) => m.imageUrl).filter(Boolean);

    // Use FastImage preload for better performance
    await FastImage.preload(
      uris.map((uri) => ({
        uri,
        priority: FastImage.priority.normal,
      })),
    );

    logger.info('[Preload] Prefetched moment images', { count: uris.length });
  }

  /**
   * Prefetch next page of moments
   */
  async prefetchNextPage(
    currentPage: number,
    fetchPage: (page: number) => Promise<any>,
  ) {
    const nextPage = currentPage + 1;
    const queryKey = ['moments', 'feed', 'page', nextPage];

    // Check if already cached
    if (queryClient.getQueryData(queryKey)) {
      logger.debug('[Preload] Page already cached', { page: nextPage });
      return;
    }

    try {
      // Prefetch next page data
      await queryClient.prefetchQuery({
        queryKey,
        queryFn: () => fetchPage(nextPage),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });

      // Get moments from cache
      const data = queryClient.getQueryData<any>(queryKey);

      if (data?.moments) {
        // Preload images from next page
        await this.prefetchMomentsImages(data.moments);
      }

      logger.info('[Preload] Prefetched page', { page: nextPage });
    } catch (error) {
      logger.error('[Preload] Failed to prefetch page', {
        page: nextPage,
        error,
      });
    }
  }

  /**
   * Sort queue by priority
   */
  private sortQueue() {
    const priorityOrder = { high: 0, normal: 1, low: 2 };

    this.queue.sort((a, b) => {
      // Sort by priority first
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // Then by timestamp (older first)
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Process preload queue
   */
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.preloading.size < this.maxConcurrent) {
      const item = this.queue.shift();
      if (!item) break;

      this.preloading.add(item.uri);

      // Preload image
      this.preloadImage(item.uri)
        .then(() => {
          this.preloaded.add(item.uri);
          this.preloading.delete(item.uri);
          this.processQueue(); // Process next item
        })
        .catch((error) => {
          logger.error('[Preload] Failed to preload image', {
            uri: item.uri,
            error,
          });
          this.preloading.delete(item.uri);
          this.processQueue(); // Process next item
        });
    }

    this.isProcessing = false;
  }

  /**
   * Preload single image
   */
  private async preloadImage(uri: string): Promise<void> {
    return new Promise((resolve, reject) => {
      Image.prefetch(uri)
        .then(() => {
          logger.debug('[Preload] Image loaded', { uri });
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Clear preload queue
   */
  clear() {
    this.queue = [];
    this.preloading.clear();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.preloaded.clear();
    FastImage.clearMemoryCache();
    FastImage.clearDiskCache();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      queued: this.queue.length,
      preloading: this.preloading.size,
      preloaded: this.preloaded.size,
    };
  }
}

// Export singleton
export const imagePreloader = new ImagePreloader();

// Hook for preloading in components
export function useImagePreload() {
  return {
    preload: imagePreloader.preload.bind(imagePreloader),
    prefetchMomentsImages:
      imagePreloader.prefetchMomentsImages.bind(imagePreloader),
    prefetchNextPage: imagePreloader.prefetchNextPage.bind(imagePreloader),
    clear: imagePreloader.clear.bind(imagePreloader),
    stats: imagePreloader.getStats(),
  };
}

// Intersection observer for lazy loading (using viewport tracking)
interface ViewportTracker {
  itemId: string;
  onVisible: () => void;
  onHidden: () => void;
}

export class ViewportObserver {
  private trackers = new Map<string, ViewportTracker>();
  private visibleItems = new Set<string>();

  /**
   * Register item for viewport tracking
   */
  track(itemId: string, onVisible: () => void, onHidden: () => void) {
    this.trackers.set(itemId, { itemId, onVisible, onHidden });
  }

  /**
   * Unregister item
   */
  untrack(itemId: string) {
    this.trackers.delete(itemId);
    this.visibleItems.delete(itemId);
  }

  /**
   * Mark item as visible
   */
  markVisible(itemId: string) {
    if (this.visibleItems.has(itemId)) return;

    this.visibleItems.add(itemId);
    const tracker = this.trackers.get(itemId);
    tracker?.onVisible();
  }

  /**
   * Mark item as hidden
   */
  markHidden(itemId: string) {
    if (!this.visibleItems.has(itemId)) return;

    this.visibleItems.delete(itemId);
    const tracker = this.trackers.get(itemId);
    tracker?.onHidden();
  }

  /**
   * Get visible items
   */
  getVisibleItems(): string[] {
    return Array.from(this.visibleItems);
  }
}

// Export singleton
export const viewportObserver = new ViewportObserver();

// Hook for viewport tracking
export function useViewportTracking(
  itemId: string,
  onVisible: () => void,
  onHidden: () => void,
) {
  React.useEffect(() => {
    viewportObserver.track(itemId, onVisible, onHidden);
    return () => viewportObserver.untrack(itemId);
  }, [itemId, onVisible, onHidden]);
}

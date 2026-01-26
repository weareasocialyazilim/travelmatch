/**
 * Image Upload Pipeline with Auto-Resize Fallback
 *
 * AI-Aware Upload Pipeline:
 * - Optimizes images for AWS Rekognition (5MB limit)
 * - Provides graceful fallback for large files
 * - Shows AI review status to users before upload
 *
 * Usage:
 *   const result = await prepareImageForUpload(uri);
 *   if (result.needsReview) {
 *     // File was too large, will require manual moderation
 *   }
 *
 * UI Integration:
 *   - Show "İçerik inceleme altında" before upload completes
 *   - Never show "Yayınlandı" until moderation passes
 *   - Show pending state for 5MB+ files
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface UploadImageResult {
  uri: string;
  size: number;
  width: number;
  height: number;
  needsReview: boolean; // true if file > 5MB even after compression
  quality: number;
  wasResized: boolean;
  originalSize?: number;
}

// AWS Rekognition byte limit
const REKOGNITION_MAX_BYTES = 5 * 1024 * 1024; // 5MB

// Target sizes for different use cases
const TARGET_SIZES = {
  moment: {
    maxWidth: 1920,
    maxHeight: 1920,
    initialQuality: 0.85,
    fallbackQuality: 0.6,
  },
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    initialQuality: 0.9,
    fallbackQuality: 0.7,
  },
  proof: {
    maxWidth: 2048,
    maxHeight: 2048,
    initialQuality: 0.8,
    fallbackQuality: 0.6,
  },
} as const;

type ImageType = keyof typeof TARGET_SIZES;

/**
 * Prepare image for upload with automatic compression
 * Returns metadata about the processed image
 */
export async function prepareImageForUpload(
  uri: string,
  type: ImageType = 'moment',
): Promise<UploadImageResult> {
  const targetConfig = TARGET_SIZES[type];

  try {
    // Get original file info
    const originalInfo = await FileSystem.getInfoAsync(uri);
    const originalSize =
      (originalInfo as FileSystem.FileInfo & { size?: number }).size || 0;

    // If already under limit, just return
    if (originalSize <= REKOGNITION_MAX_BYTES) {
      const dimensions = await getImageDimensions(uri);
      return {
        uri,
        size: originalSize,
        width: dimensions.width,
        height: dimensions.height,
        needsReview: false,
        quality: targetConfig.initialQuality,
        wasResized: false,
      };
    }

    // Resize image to max dimensions
    const resizedResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: targetConfig.maxWidth,
            height: targetConfig.maxHeight,
          },
        },
      ],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: targetConfig.initialQuality,
      },
    );

    // Check size after resize
    const resizedInfo = await FileSystem.getInfoAsync(resizedResult.uri);
    const resizedSize =
      (resizedInfo as FileSystem.FileInfo & { size?: number }).size || 0;

    if (resizedSize <= REKOGNITION_MAX_BYTES) {
      const dimensions = await getImageDimensions(resizedResult.uri);
      return {
        uri: resizedResult.uri,
        size: resizedSize,
        width: dimensions.width,
        height: dimensions.height,
        needsReview: false,
        quality: targetConfig.initialQuality,
        wasResized: true,
        originalSize,
      };
    }

    // Try with lower quality
    const lowQualityResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: targetConfig.maxWidth,
            height: targetConfig.maxHeight,
          },
        },
      ],
      {
        format: ImageManipulator.SaveFormat.JPEG,
        compress: targetConfig.fallbackQuality,
      },
    );

    const lowQualityInfo = await FileSystem.getInfoAsync(lowQualityResult.uri);
    const lowQualitySize =
      (lowQualityInfo as FileSystem.FileInfo & { size?: number }).size || 0;

    if (lowQualitySize <= REKOGNITION_MAX_BYTES) {
      const dimensions = await getImageDimensions(lowQualityResult.uri);
      return {
        uri: lowQualityResult.uri,
        size: lowQualitySize,
        width: dimensions.width,
        height: dimensions.height,
        needsReview: false,
        quality: targetConfig.fallbackQuality,
        wasResized: true,
        originalSize,
      };
    }

    // Still too large - will require manual moderation
    const dimensions = await getImageDimensions(lowQualityResult.uri);
    return {
      uri: lowQualityResult.uri,
      size: lowQualitySize,
      width: dimensions.width,
      height: dimensions.height,
      needsReview: true, // Flag for pending_review
      quality: targetConfig.fallbackQuality,
      wasResized: true,
      originalSize,
    };
  } catch (error) {
    console.error('[ImageCompression] Failed to process image:', error);
    // Return original if processing fails - edge function will handle
    const dimensions = await getImageDimensions(uri);
    const info = await FileSystem.getInfoAsync(uri);
    const infoWithSize = info as FileSystem.FileInfo & { size?: number };
    return {
      uri,
      size: infoWithSize.size || 0,
      width: dimensions.width,
      height: dimensions.height,
      needsReview: (info.size || 0) > REKOGNITION_MAX_BYTES,
      quality: targetConfig.initialQuality,
      wasResized: false,
      originalSize: infoWithSize.size,
    };
  }
}

/**
 * Check if image needs moderation review
 * Useful for showing UI hints before upload
 */
export async function checkImageRequiresReview(
  uri: string,
): Promise<{ requiresReview: boolean; size: number; maxSize: number }> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    const infoWithSize = info as FileSystem.FileInfo & { size?: number };
    const size = infoWithSize.size || 0;
    return {
      requiresReview: size > REKOGNITION_MAX_BYTES,
      size,
      maxSize: REKOGNITION_MAX_BYTES,
    };
  } catch {
    return {
      requiresReview: false,
      size: 0,
      maxSize: REKOGNITION_MAX_BYTES,
    };
  }
}

/**
 * Get image dimensions
 */
async function getImageDimensions(
  uri: string,
): Promise<{ width: number; height: number }> {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return { width: result.width, height: result.height };
  } catch {
    return { width: 0, height: 0 };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get upload warning message based on image status
 */
export function getUploadWarningMessage(size: number): string | null {
  if (size > REKOGNITION_MAX_BYTES) {
    return `Bu dosya (${formatFileSize(size)}) otomatik inceleme için çok büyük. Manuel onay gerekebilir.`;
  }
  return null;
}

/**
 * AI Review Status Messages for UI
 * These messages set correct user expectations before upload completes
 */
export const AI_REVIEW_MESSAGES = {
  uploading: 'İçerik güvenlik incelemesine gönderiliyor...',
  processing: 'İçerik inceleniyor',
  pending: 'İçerik inceleme altında - Yayınlanması için onay bekleniyor',
  approved: 'İçerik onaylandı',
  rejected: 'İçerik uygunsuz bulundu',
  error: 'İnceleme sırasında bir sorun oluştu',
} as const;

/**
 * Get user-facing message for moderation status
 */
export function getModerationStatusMessage(status: string): string {
  const statusMap: Record<string, keyof typeof AI_REVIEW_MESSAGES> = {
    pending: 'pending',
    pending_review: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    error: 'error',
  };
  return AI_REVIEW_MESSAGES[statusMap[status] || 'processing'];
}

/**
 * Check if upload should show pending UI
 * Returns true if content won't be immediately visible
 */
export function isPendingUpload(moderationStatus: string | null): boolean {
  return moderationStatus === null || moderationStatus === 'pending_review';
}

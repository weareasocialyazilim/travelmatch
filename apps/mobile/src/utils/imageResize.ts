/**
 * Image Resize Utility
 * Handles image resizing and optimization for TravelMatch
 *
 * Uses expo-image-manipulator for processing
 */

import * as ImageManipulator from 'expo-image-manipulator';
import {
  IMAGE_QUALITY,
  AVATAR,
  MOMENT_CARD,
  PROOF,
  CHAT_IMAGE,
  PROFILE_COVER,
  STORY,
  MAX_FILE_SIZES,
  THUMBNAIL,
} from '@/constants/imageDimensions';
import { logger } from '@/utils/logger';

export type ImageType =
  | 'avatar'
  | 'moment'
  | 'proof'
  | 'chat'
  | 'cover'
  | 'story'
  | 'thumbnail';

interface ResizeResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

interface ResizeOptions {
  type: ImageType;
  uri: string;
  includeBase64?: boolean;
}

/**
 * Resize image based on type
 */
export const resizeImage = async ({
  type,
  uri,
  includeBase64 = false,
}: ResizeOptions): Promise<ResizeResult> => {
  let dimensions: { width: number; height?: number };
  let quality: number;

  switch (type) {
    case 'avatar':
      dimensions = AVATAR.upload;
      quality = AVATAR.quality;
      break;

    case 'moment':
      dimensions = MOMENT_CARD.upload;
      quality = MOMENT_CARD.quality;
      break;

    case 'proof':
      dimensions = PROOF.upload;
      quality = PROOF.quality;
      break;

    case 'chat':
      dimensions = { width: CHAT_IMAGE.upload.maxWidth };
      quality = CHAT_IMAGE.quality;
      break;

    case 'cover':
      dimensions = PROFILE_COVER.upload;
      quality = PROFILE_COVER.quality;
      break;

    case 'story':
      dimensions = STORY.upload;
      quality = STORY.quality;
      break;

    case 'thumbnail':
      dimensions = { width: 200, height: 200 };
      quality = IMAGE_QUALITY.thumbnail;
      break;

    default:
      dimensions = { width: 1080, height: 1080 };
      quality = IMAGE_QUALITY.medium;
  }

  try {
    const actions: ImageManipulator.Action[] = [{ resize: dimensions }];

    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: includeBase64,
    });

    logger.info('[ImageResize] Resized image', {
      type,
      originalUri: uri.substring(0, 50),
      newWidth: result.width,
      newHeight: result.height,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
    };
  } catch (error) {
    logger.error('[ImageResize] Failed to resize', error as Error);
    throw error;
  }
};

/**
 * Generate thumbnail from image
 */
export const generateThumbnail = async (
  uri: string,
  size: 'xl' | 'lg' | 'md' | 'sm' = 'md',
): Promise<ResizeResult> => {
  const dimensions = THUMBNAIL[size];

  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: dimensions }],
      {
        compress: IMAGE_QUALITY.thumbnail,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('[ImageResize] Failed to generate thumbnail', error as Error);
    throw error;
  }
};

/**
 * Resize image to specific dimensions
 */
export const resizeToCustomDimensions = async (
  uri: string,
  width: number,
  height?: number,
  quality: number = IMAGE_QUALITY.medium,
): Promise<ResizeResult> => {
  try {
    const resize: { width: number; height?: number } = { width };
    if (height) resize.height = height;

    const result = await ImageManipulator.manipulateAsync(uri, [{ resize }], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('[ImageResize] Custom resize failed', error as Error);
    throw error;
  }
};

/**
 * Crop and resize image
 */
export const cropAndResize = async (
  uri: string,
  cropRegion: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  },
  targetSize: { width: number; height?: number },
  quality: number = IMAGE_QUALITY.medium,
): Promise<ResizeResult> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: cropRegion }, { resize: targetSize }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('[ImageResize] Crop and resize failed', error as Error);
    throw error;
  }
};

/**
 * Rotate image
 */
export const rotateImage = async (
  uri: string,
  degrees: number,
): Promise<ResizeResult> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ rotate: degrees }],
      { format: ImageManipulator.SaveFormat.JPEG },
    );

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('[ImageResize] Rotation failed', error as Error);
    throw error;
  }
};

/**
 * Flip image
 */
export const flipImage = async (
  uri: string,
  direction: 'horizontal' | 'vertical',
): Promise<ResizeResult> => {
  try {
    const flip: 'horizontal' | 'vertical' =
      direction === 'horizontal' ? 'horizontal' : 'vertical';

    const result = await ImageManipulator.manipulateAsync(uri, [{ flip }], {
      format: ImageManipulator.SaveFormat.JPEG,
    });

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    logger.error('[ImageResize] Flip failed', error as Error);
    throw error;
  }
};

/**
 * Process multiple images for upload
 */
export const processImagesForUpload = async (
  uris: string[],
  type: ImageType,
): Promise<ResizeResult[]> => {
  const results = await Promise.all(
    uris.map((uri) => resizeImage({ type, uri })),
  );
  return results;
};

/**
 * Check if file size is within limits
 */
export const checkFileSize = async (
  uri: string,
  type: ImageType,
): Promise<{ valid: boolean; sizeMB: number; maxMB: number }> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const sizeMB = blob.size / (1024 * 1024);

    const maxMB = MAX_FILE_SIZES[type as keyof typeof MAX_FILE_SIZES] || 10;

    return {
      valid: sizeMB <= maxMB,
      sizeMB: Math.round(sizeMB * 100) / 100,
      maxMB,
    };
  } catch (error) {
    logger.error('[ImageResize] File size check failed', error as Error);
    return { valid: true, sizeMB: 0, maxMB: 10 };
  }
};

/**
 * Compress image until it meets size requirements
 */
export const compressToSize = async (
  uri: string,
  maxSizeMB: number,
  initialQuality: number = 0.9,
): Promise<ResizeResult> => {
  let quality = initialQuality;
  let result: ImageManipulator.ImageResult;
  let attempts = 0;
  const maxAttempts = 5;

  do {
    result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: quality,
      format: ImageManipulator.SaveFormat.JPEG,
    });

    const response = await fetch(result.uri);
    const blob = await response.blob();
    const sizeMB = blob.size / (1024 * 1024);

    if (sizeMB <= maxSizeMB) {
      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    }

    quality -= 0.1;
    attempts++;
  } while (quality > 0.3 && attempts < maxAttempts);

  // If still too large, resize
  const scaleFactor = 0.7;
  result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: Math.round(result.width * scaleFactor) } }],
    {
      compress: 0.7,
      format: ImageManipulator.SaveFormat.JPEG,
    },
  );

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
  };
};

/**
 * Prepare image for proof upload (preserves quality)
 */
export const prepareProofImage = async (uri: string): Promise<ResizeResult> => {
  // Check current size first
  const sizeCheck = await checkFileSize(uri, 'proof');

  if (sizeCheck.valid) {
    // If within limits, just ensure dimensions are correct
    return resizeImage({ type: 'proof', uri });
  }

  // If too large, compress to max size
  return compressToSize(uri, PROOF.maxFileSizeMB, PROOF.quality);
};

/**
 * Prepare avatar for upload
 */
export const prepareAvatar = async (uri: string): Promise<ResizeResult> => {
  return resizeImage({ type: 'avatar', uri });
};

/**
 * Prepare moment image for upload
 */
export const prepareMomentImage = async (
  uri: string,
): Promise<ResizeResult> => {
  return resizeImage({ type: 'moment', uri });
};

/**
 * Prepare chat image for upload
 */
export const prepareChatImage = async (uri: string): Promise<ResizeResult> => {
  return resizeImage({ type: 'chat', uri });
};

export default {
  resizeImage,
  generateThumbnail,
  resizeToCustomDimensions,
  cropAndResize,
  rotateImage,
  flipImage,
  processImagesForUpload,
  checkFileSize,
  compressToSize,
  prepareProofImage,
  prepareAvatar,
  prepareMomentImage,
  prepareChatImage,
};

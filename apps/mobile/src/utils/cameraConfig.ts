/**
 * Camera Configuration Utility
 * Centralized high-quality camera settings for consistent image/video capture
 * across the application.
 */

import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { logger } from './logger';

/**
 * Camera quality presets for different use cases
 */
export const CAMERA_QUALITY = {
  /** Maximum quality - for KYC documents, ID verification */
  MAXIMUM: 1.0,
  /** High quality - for profile photos, moments */
  HIGH: 0.92,
  /** Standard quality - for general photos */
  STANDARD: 0.85,
  /** Compressed - for thumbnails, quick shares */
  COMPRESSED: 0.7,
} as const;

/**
 * Aspect ratio presets
 */
export const ASPECT_RATIOS = {
  /** Standard photo ratio */
  PHOTO_4_3: [4, 3] as [number, number],
  /** Wide/cinematic ratio */
  WIDE_16_9: [16, 9] as [number, number],
  /** Square for profile photos */
  SQUARE_1_1: [1, 1] as [number, number],
  /** Portrait for stories */
  PORTRAIT_9_16: [9, 16] as [number, number],
  /** Document ratio */
  DOCUMENT_3_2: [3, 2] as [number, number],
  /** Portrait 4:5 - 2025/2026 standard for feed posts (Instagram-like) */
  PORTRAIT_4_5: [4, 5] as [number, number],
  /** Cover ratio 3:1 */
  COVER_3_1: [3, 1] as [number, number],
} as const;

/**
 * Camera configuration for different use cases
 */
export interface CameraConfig {
  quality: number;
  aspect?: [number, number];
  allowsEditing: boolean;
  /** Base64 export - use sparingly due to memory */
  base64?: boolean;
  /** EXIF data for location/timestamp */
  exif?: boolean;
  /** Video options */
  videoMaxDuration?: number;
  videoQuality?: 'high' | 'medium' | 'low';
}

/**
 * Pre-configured camera settings for common use cases
 */
export const CAMERA_CONFIGS: Record<string, CameraConfig> = {
  /** Profile photo - high quality, square crop */
  PROFILE_PHOTO: {
    quality: CAMERA_QUALITY.HIGH,
    aspect: ASPECT_RATIOS.SQUARE_1_1,
    allowsEditing: true,
    exif: false,
  },

  /** Moment photo - high quality, 4:5 portrait (2025/2026 standard) */
  MOMENT_PHOTO: {
    quality: CAMERA_QUALITY.HIGH,
    aspect: ASPECT_RATIOS.PORTRAIT_4_5,
    allowsEditing: true,
    exif: true,
  },

  /** Moment photo free aspect - for carousel/multiple selection */
  MOMENT_PHOTO_FREE: {
    quality: CAMERA_QUALITY.HIGH,
    aspect: undefined,
    allowsEditing: false,
    exif: true,
  },

  /** Proof photo - maximum quality for verification */
  PROOF_PHOTO: {
    quality: CAMERA_QUALITY.MAXIMUM,
    aspect: ASPECT_RATIOS.PHOTO_4_3,
    allowsEditing: false, // Preserve original for verification
    exif: true,
  },

  /** Cover photo - 3:1 wide ratio for profile cover */
  COVER_PHOTO: {
    quality: CAMERA_QUALITY.HIGH,
    aspect: ASPECT_RATIOS.COVER_3_1,
    allowsEditing: true,
    exif: false,
  },

  /** KYC Document - maximum quality, document ratio */
  KYC_DOCUMENT: {
    quality: CAMERA_QUALITY.MAXIMUM,
    aspect: ASPECT_RATIOS.DOCUMENT_3_2,
    allowsEditing: false, // No editing for documents
    exif: true,
  },

  /** KYC Selfie - maximum quality, square */
  KYC_SELFIE: {
    quality: CAMERA_QUALITY.MAXIMUM,
    aspect: ASPECT_RATIOS.SQUARE_1_1,
    allowsEditing: false,
    exif: true,
  },

  /** Chat attachment - standard quality */
  CHAT_ATTACHMENT: {
    quality: CAMERA_QUALITY.STANDARD,
    aspect: undefined, // Free aspect
    allowsEditing: true,
    exif: false,
  },

  /** Quick share - compressed for speed */
  QUICK_SHARE: {
    quality: CAMERA_QUALITY.COMPRESSED,
    allowsEditing: true,
    exif: false,
  },
};

/**
 * Request camera permissions
 * @returns true if permission granted
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    const granted = status === 'granted';

    if (!granted) {
      logger.warn('Camera permission denied');
    }

    return granted;
  } catch (error) {
    logger.error('Camera permission request failed', error);
    return false;
  }
}

/**
 * Request media library permissions
 * @returns true if permission granted
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted = status === 'granted';

    if (!granted) {
      logger.warn('Media library permission denied');
    }

    return granted;
  } catch (error) {
    logger.error('Media library permission request failed', error);
    return false;
  }
}

/**
 * Launch camera with specified configuration
 * @param config Camera configuration preset or custom config
 * @returns Image result or null if cancelled
 */
export async function launchCamera(
  config: CameraConfig | keyof typeof CAMERA_CONFIGS = 'MOMENT_PHOTO',
): Promise<ImagePicker.ImagePickerAsset | null> {
  const cameraConfig =
    typeof config === 'string' ? CAMERA_CONFIGS[config] : config;

  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Camera permission not granted');
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: cameraConfig.quality,
      aspect: cameraConfig.aspect,
      allowsEditing: cameraConfig.allowsEditing,
      base64: cameraConfig.base64,
      exif: cameraConfig.exif,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];

    logger.debug('Camera capture successful', {
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
    });

    return asset;
  } catch (error) {
    logger.error('Camera launch failed', error);
    throw error;
  }
}

/**
 * Launch image picker from gallery
 * @param config Camera configuration preset or custom config
 * @param allowMultiple Allow selecting multiple images
 * @param selectionLimit Maximum number of images (if multiple)
 * @returns Array of selected images
 */
export async function launchGallery(
  config: CameraConfig | keyof typeof CAMERA_CONFIGS = 'MOMENT_PHOTO',
  allowMultiple = false,
  selectionLimit = 10,
): Promise<ImagePicker.ImagePickerAsset[]> {
  const pickerConfig =
    typeof config === 'string' ? CAMERA_CONFIGS[config] : config;

  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: pickerConfig.quality,
      aspect: pickerConfig.aspect,
      allowsEditing: !allowMultiple && pickerConfig.allowsEditing,
      allowsMultipleSelection: allowMultiple,
      selectionLimit: allowMultiple ? selectionLimit : 1,
      base64: pickerConfig.base64,
      exif: pickerConfig.exif,
    });

    if (result.canceled) {
      return [];
    }

    logger.debug('Gallery selection successful', {
      count: result.assets.length,
    });

    return result.assets;
  } catch (error) {
    logger.error('Gallery launch failed', error);
    throw error;
  }
}

/**
 * Launch camera for video capture
 * @param maxDuration Maximum video duration in seconds
 * @param quality Video quality preset
 * @returns Video result or null if cancelled
 */
export async function launchVideoCamera(
  maxDuration = 60,
  quality: 'high' | 'medium' | 'low' = 'high',
): Promise<ImagePicker.ImagePickerAsset | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Camera permission not granted');
  }

  // Map quality to expo-image-picker format
  const videoQuality =
    quality === 'high'
      ? ImagePicker.UIImagePickerControllerQualityType.High
      : quality === 'medium'
        ? ImagePicker.UIImagePickerControllerQualityType.Medium
        : ImagePicker.UIImagePickerControllerQualityType.Low;

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: Platform.OS === 'ios', // iOS supports video editing
      videoMaxDuration: maxDuration,
      videoQuality: Platform.OS === 'ios' ? videoQuality : undefined,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];

    logger.debug('Video capture successful', {
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      fileSize: asset.fileSize,
    });

    return asset;
  } catch (error) {
    logger.error('Video capture failed', error);
    throw error;
  }
}

/**
 * Get camera facing preference
 * Note: expo-image-picker doesn't directly support camera facing,
 * but this can be used for UI hints
 */
export type CameraFacing = 'front' | 'back';

export const DEFAULT_CAMERA_FACING: Record<string, CameraFacing> = {
  PROFILE_PHOTO: 'front',
  KYC_SELFIE: 'front',
  MOMENT_PHOTO: 'back',
  MOMENT_PHOTO_FREE: 'back',
  PROOF_PHOTO: 'back',
  COVER_PHOTO: 'back',
  KYC_DOCUMENT: 'back',
  CHAT_ATTACHMENT: 'back',
};

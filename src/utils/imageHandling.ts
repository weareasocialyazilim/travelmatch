/**
 * Image Handling Utilities
 * Image picker, compression, upload ve caching
 */

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import ExpoFileSystem from 'expo-file-system/build/ExpoFileSystem';
import { Platform as _Platform } from 'react-native';

// Image Types
export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  fileName?: string;
  mimeType?: string;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  allowsMultipleSelection?: boolean;
  selectionLimit?: number;
}

export interface CompressionOptions {
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png';
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Request camera permissions
 */
export async function requestCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return status === 'granted';
}

/**
 * Request media library permissions
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
}

/**
 * Pick image from camera
 */
export async function pickImageFromCamera(
  options: ImagePickerOptions = {},
): Promise<ImageAsset | null> {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Camera permission not granted');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect,
    quality: options.quality ?? 0.8,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  };
}

/**
 * Pick image(s) from gallery
 */
export async function pickImageFromGallery(
  options: ImagePickerOptions = {},
): Promise<ImageAsset[]> {
  const hasPermission = await requestMediaLibraryPermission();
  if (!hasPermission) {
    throw new Error('Media library permission not granted');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: options.allowsEditing ?? true,
    aspect: options.aspect,
    quality: options.quality ?? 0.8,
    allowsMultipleSelection: options.allowsMultipleSelection ?? false,
    selectionLimit: options.selectionLimit ?? 1,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.map((asset) => ({
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    fileSize: asset.fileSize,
    fileName: asset.fileName ?? undefined,
    mimeType: asset.mimeType ?? undefined,
  }));
}

/**
 * Compress image
 * Reduces file size while maintaining quality
 */
export async function compressImage(
  uri: string,
  options: CompressionOptions = {},
): Promise<string> {
  const {
    quality: _quality = 0.7,
    maxWidth: _maxWidth,
    maxHeight: _maxHeight,
    format: _format = 'jpeg',
  } = options;

  // Get image info
  const imageInfo = await FileSystem.getInfoAsync(uri);
  if (!imageInfo.exists) {
    throw new Error('Image file not found');
  }

  // Manipulate image (requires expo-image-manipulator)
  // For now, we'll use the URI as-is
  // TODO: Add expo-image-manipulator for actual compression
  return uri;
}

/**
 * Get image file size
 */
export async function getImageSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists || !('size' in info)) {
    return 0;
  }
  return info.size;
}

/**
 * Calculate resize dimensions maintaining aspect ratio
 */
export function calculateResizeDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Cache directory for images
 */
const getImageCacheDir = () => {
  const cacheDir = ExpoFileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('Cache directory not available');
  }
  return `${cacheDir}images/`;
};

/**
 * Initialize image cache directory
 */
async function initImageCacheDir() {
  const IMAGE_CACHE_DIR = getImageCacheDir();
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(IMAGE_CACHE_DIR, {
      intermediates: true,
    });
  }
}

/**
 * Cache image locally
 */
export async function cacheImage(
  uri: string,
  filename?: string,
): Promise<string> {
  await initImageCacheDir();
  const IMAGE_CACHE_DIR = getImageCacheDir();

  const name = filename || `cached_${Date.now()}.jpg`;
  const cachedPath = `${IMAGE_CACHE_DIR}${name}`;

  // Download to cache
  const { uri: localUri } = await FileSystem.downloadAsync(uri, cachedPath);
  return localUri;
}

/**
 * Get cached image
 */
export async function getCachedImage(filename: string): Promise<string | null> {
  const IMAGE_CACHE_DIR = getImageCacheDir();
  const cachedPath = `${IMAGE_CACHE_DIR}${filename}`;
  const info = await FileSystem.getInfoAsync(cachedPath);

  if (info.exists) {
    return cachedPath;
  }

  return null;
}

/**
 * Clear image cache
 */
export async function clearImageCache(): Promise<void> {
  const IMAGE_CACHE_DIR = getImageCacheDir();
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(IMAGE_CACHE_DIR, { idempotent: true });
  }
}

/**
 * Get cache size
 */
export async function getImageCacheSize(): Promise<number> {
  const IMAGE_CACHE_DIR = getImageCacheDir();
  const dirInfo = await FileSystem.getInfoAsync(IMAGE_CACHE_DIR);
  if (!dirInfo.exists) {
    return 0;
  }

  const files = await FileSystem.readDirectoryAsync(IMAGE_CACHE_DIR);
  let totalSize = 0;

  for (const file of files) {
    const fileInfo = await FileSystem.getInfoAsync(`${IMAGE_CACHE_DIR}${file}`);
    if ('size' in fileInfo) {
      totalSize += fileInfo.size;
    }
  }

  return totalSize;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Generate thumbnail from image
 */
export function getThumbnailUri(uri: string, size = 200): string {
  // If using CDN, append resize params
  // Example: Cloudinary, imgix
  if (uri.includes('cloudinary.com')) {
    return uri.replace('/upload/', `/upload/w_${size},h_${size},c_fill/`);
  }

  if (uri.includes('imgix.net')) {
    return `${uri}?w=${size}&h=${size}&fit=crop`;
  }

  // Default: return original
  return uri;
}

/**
 * Get optimized image URL for CDN
 */
export function getOptimizedImageUrl(
  uri: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpeg' | 'png';
  } = {},
): string {
  const { width, height, quality = 80, format = 'auto' } = options;

  // Cloudinary
  if (uri.includes('cloudinary.com')) {
    const transforms = [];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    if (format !== 'auto') transforms.push(`f_${format}`);

    return uri.replace('/upload/', `/upload/${transforms.join(',')}/`);
  }

  // imgix
  if (uri.includes('imgix.net')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    if (format !== 'auto') params.append('fm', format);
    params.append('auto', 'format,compress');

    return `${uri}?${params.toString()}`;
  }

  return uri;
}

/**
 * Validate image file
 */
export function validateImageFile(
  asset: ImageAsset,
  options: {
    maxSizeMB?: number;
    allowedFormats?: string[];
    maxWidth?: number;
    maxHeight?: number;
  } = {},
): { valid: boolean; error?: string } {
  const {
    maxSizeMB = 10,
    allowedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    maxWidth = 4096,
    maxHeight = 4096,
  } = options;

  // Check file size
  if (asset.fileSize) {
    const sizeMB = asset.fileSize / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `Image size (${sizeMB.toFixed(
          1,
        )}MB) exceeds maximum of ${maxSizeMB}MB`,
      };
    }
  }

  // Check format
  if (asset.mimeType && !allowedFormats.includes(asset.mimeType)) {
    return {
      valid: false,
      error: `Image format not allowed. Allowed: ${allowedFormats.join(', ')}`,
    };
  }

  // Check dimensions
  if (asset.width > maxWidth || asset.height > maxHeight) {
    return {
      valid: false,
      error: `Image dimensions (${asset.width}x${asset.height}) exceed maximum (${maxWidth}x${maxHeight})`,
    };
  }

  return { valid: true };
}

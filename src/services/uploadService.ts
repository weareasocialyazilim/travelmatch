/**
 * Upload Service
 * Image and file upload operations with progress tracking
 */
import * as FileSystem from 'expo-file-system';
import { logger } from '../utils/logger';

// Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface UploadOptions {
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploadConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  folder: string;
}

// Config - Replace with your actual upload endpoint
const UPLOAD_URL = __DEV__
  ? 'http://localhost:3000/api/upload'
  : 'https://api.travelmatch.com/api/upload';

// TODO: Enable when Cloudinary integration is needed
// Cloudinary config (alternative)
// const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
// const CLOUDINARY_UPLOAD_PRESET = 'travelmatch';

/**
 * Compress and resize image before upload
 * Note: Requires expo-image-manipulator to be installed for compression
 * If not installed, returns the original image
 */
export const compressImage = (
  uri: string,
  _options: { maxWidth?: number; maxHeight?: number; quality?: number } = {},
): string => {
  // For now, return original - install expo-image-manipulator for compression
  // npm install expo-image-manipulator
  logger.debug(
    'Image compression skipped - install expo-image-manipulator for this feature',
  );
  return uri;
};

/**
 * Get file info
 */
export const getFileInfo = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return info;
  } catch (error) {
    logger.error('Failed to get file info:', error);
    return null;
  }
};

/**
 * Upload Service
 */
export const uploadService = {
  /**
   * Upload single image
   */
  uploadImage: async (
    uri: string,
    options: UploadOptions = {},
  ): Promise<UploadResult> => {
    const {
      folder = 'general',
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      onProgress,
    } = options;

    try {
      // Compress image first (sync for now, will be async when expo-image-manipulator is added)
      const compressedUri = compressImage(uri, {
        maxWidth,
        maxHeight,
        quality,
      });

      // Get file info
      const fileInfo = await getFileInfo(compressedUri);
      if (!fileInfo?.exists) {
        throw new Error('File not found');
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('file', {
        uri: compressedUri,
        type: 'image/jpeg',
        name: `upload_${Date.now()}.jpg`,
      } as unknown as Blob);
      formData.append('folder', folder);

      // Upload with XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progress handler
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
            });
          }
        });

        // Complete handler
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText) as UploadResult;
              resolve(response);
            } catch {
              reject(new Error('Invalid response'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        // Error handler
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        // Abort handler
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Send request
        xhr.open('POST', UPLOAD_URL);
        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
        // TODO: Add auth token
        // xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
    } catch (error) {
      logger.error('Upload failed:', error);
      throw error;
    }
  },

  /**
   * Upload multiple images
   */
  uploadMultipleImages: async (
    uris: string[],
    options: UploadOptions = {},
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    const totalImages = uris.length;
    let completedImages = 0;

    for (const uri of uris) {
      const result = await uploadService.uploadImage(uri, {
        ...options,
        onProgress: (progress) => {
          // Calculate overall progress
          const overallProgress = {
            loaded: completedImages + progress.percentage / 100,
            total: totalImages,
            percentage: Math.round(
              ((completedImages + progress.percentage / 100) / totalImages) *
                100,
            ),
          };
          options.onProgress?.(overallProgress);
        },
      });
      results.push(result);
      completedImages++;
    }

    return results;
  },

  /**
   * Upload profile photo
   */
  uploadProfilePhoto: async (
    uri: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<UploadResult> => {
    return uploadService.uploadImage(uri, {
      folder: 'profiles',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.9,
      onProgress,
    });
  },

  /**
   * Upload moment photos
   */
  uploadMomentPhotos: async (
    uris: string[],
    momentId: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<UploadResult[]> => {
    return uploadService.uploadMultipleImages(uris, {
      folder: `moments/${momentId}`,
      maxWidth: 1500,
      maxHeight: 1500,
      quality: 0.85,
      onProgress,
    });
  },

  /**
   * Upload KYC document
   */
  uploadKYCDocument: async (
    uri: string,
    _documentType: 'id_front' | 'id_back' | 'selfie',
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<UploadResult> => {
    return uploadService.uploadImage(uri, {
      folder: 'kyc',
      maxWidth: 2000,
      maxHeight: 2000,
      quality: 0.95, // Higher quality for documents
      onProgress,
    });
  },

  /**
   * Upload chat image
   */
  uploadChatImage: async (
    uri: string,
    conversationId: string,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<UploadResult> => {
    return uploadService.uploadImage(uri, {
      folder: `chats/${conversationId}`,
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      onProgress,
    });
  },

  /**
   * Delete uploaded image
   */
  deleteImage: async (publicId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${UPLOAD_URL}/${publicId}`, {
        method: 'DELETE',
        // TODO: Add auth headers
      });
      return response.ok;
    } catch (error) {
      logger.error('Failed to delete image:', error);
      return false;
    }
  },
};

export default uploadService;

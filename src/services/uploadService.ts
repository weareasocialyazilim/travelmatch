/**
 * Upload Service
 * Image and file upload operations using Supabase Storage
 */
import { logger } from '../utils/logger';
import { uploadFile as supabaseUploadFile, StorageBucket } from './supabaseStorageService';
import { supabase } from '../config/supabase';

// Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  publicId: string; // path in supabase
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface UploadOptions {
  folder?: string; // Maps to bucket or path prefix
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

/**
 * Upload an image
 */
export const uploadImage = async (
  uri: string,
  options: UploadOptions = {},
): Promise<UploadResult> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    // Map "folder" to bucket if possible, or default to 'moments'
    // Valid buckets: 'avatars' | 'moments' | 'proofs' | 'messages'
    let bucket: StorageBucket = 'moments';
    if (options.folder === 'avatars') bucket = 'avatars';
    if (options.folder === 'proofs') bucket = 'proofs';
    if (options.folder === 'messages') bucket = 'messages';

    // TODO: Implement client-side compression if needed before upload
    // For now, we upload directly

    const { url, path, error } = await supabaseUploadFile(bucket, uri, user.id);

    if (error) throw error;
    if (!url || !path) throw new Error('Upload failed');

    return {
      url,
      publicId: path,
      width: 0, // Metadata not returned by Supabase upload
      height: 0,
      format: 'jpg', // Default assumption
      size: 0,
    };
  } catch (error) {
    logger.error('Upload image error:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 */
export const uploadImages = async (
  uris: string[],
  options: UploadOptions = {},
): Promise<UploadResult[]> => {
  try {
    const promises = uris.map((uri) => uploadImage(uri, options));
    return await Promise.all(promises);
  } catch (error) {
    logger.error('Upload images error:', error);
    throw error;
  }
};

export const uploadService = {
  uploadImage,
  uploadImages,
};

export default uploadService;

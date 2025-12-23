/**
 * Secure Image Upload Service
 * 
 * Handles image uploads via Supabase Edge Functions (server-side)
 * All uploads are authenticated and rate-limited
 * 
 * 🔒 SECURITY:
 * - Never exposes Cloudflare API tokens in client
 * - All uploads authenticated via Supabase auth
 * - Rate limited to prevent abuse
 * - File validation on server-side
 */

import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface ImageUploadOptions {
  type?: 'avatar' | 'moment' | 'gift' | 'proof';
  metadata?: Record<string, string>;
}

export interface ImageUploadResult {
  id: string;
  filename: string;
  url: string;
  variants: string[];
  uploaded: string;
}

/**
 * Upload image to Cloudflare via Supabase Edge Function
 * 
 * @param imageUri - Local file URI or Blob
 * @param options - Upload options (type, metadata)
 * @returns Upload result with CDN URLs
 */
export async function uploadImage(
  imageUri: string,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  try {
    // 1. Get auth session
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      throw new Error('Authentication required to upload images');
    }

    // 2. Prepare form data
    const formData = new FormData();
    
    // Convert URI to Blob/File
    let file: Blob;
    if (imageUri.startsWith('http')) {
      // Remote URL
      const response = await fetch(imageUri);
      file = await response.blob();
    } else if (imageUri.startsWith('data:')) {
      // Data URL
      const response = await fetch(imageUri);
      file = await response.blob();
    } else {
      // Local file URI
      const response = await fetch(imageUri);
      file = await response.blob();
    }

    // FormData.append accepts Blob in browsers but React Native uses a different FormData implementation
     
    formData.append('file', file as Blob);
    
    // Add metadata
    if (options.type || options.metadata) {
      formData.append('metadata', JSON.stringify({
        type: options.type || 'general',
        ...options.metadata,
      }));
    }

    // 3. Upload via Edge Function
    logger.info('Uploading image via Edge Function...');
    
    const uploadResponse = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/upload-image`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      
      // Handle specific error cases
      if (uploadResponse.status === 429) {
        throw new Error('Upload rate limit exceeded. Please try again later.');
      }
      
      throw new Error(error.error?.message || 'Image upload failed');
    }

    const result = await uploadResponse.json();
    
    logger.info('Image uploaded successfully:', result.data.id);
    
    return result.data as ImageUploadResult;
  } catch (error) {
    logger.error('Image upload failed:', error);
    throw error;
  }
}

/**
 * Upload multiple images concurrently
 */
export async function uploadImages(
  imageUris: string[],
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult[]> {
  try {
    const uploads = imageUris.map(uri => uploadImage(uri, options));
    return await Promise.all(uploads);
  } catch (error) {
    logger.error('Batch image upload failed:', error);
    throw error;
  }
}

/**
 * Delete image from CDN
 */
export async function deleteImage(imageId: string): Promise<void> {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      throw new Error('Authentication required to delete images');
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/delete-image`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Image deletion failed');
    }

    logger.info('Image deleted successfully:', imageId);
  } catch (error) {
    logger.error('Image deletion failed:', error);
    throw error;
  }
}

export default {
  uploadImage,
  uploadImages,
  deleteImage,
};

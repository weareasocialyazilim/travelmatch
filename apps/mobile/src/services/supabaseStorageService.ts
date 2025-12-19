/**
 * Supabase Storage Service
 * File upload/download operations for TravelMatch
 */

import * as FileSystem from 'expo-file-system';
import { cacheDirectory, EncodingType } from 'expo-file-system/legacy';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { logger } from '../utils/logger';

// Type assertion for File and Paths from expo-file-system SDK 54
// These are new APIs that may not be in the type definitions yet
interface ExpoFileSystemExtended {
  File: new (path: string) => {
    readAsStringAsync: () => Promise<string>;
    downloadFromUrlAsync: (url: string) => Promise<void>;
  };
  Paths: {
    cache: string;
    document: string;
  };
}

const FileSystemExtended = FileSystem as typeof FileSystem &
  ExpoFileSystemExtended;
const File = FileSystemExtended.File;
const Paths = FileSystemExtended.Paths;

// ArrayBuffer to Base64 conversion
const encode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
};

export type StorageBucket = 'avatars' | 'moments' | 'proofs' | 'messages';

interface UploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

interface DownloadResult {
  localUri: string | null;
  error: Error | null;
}

/**
 * Generate a unique file name
 */
const generateFileName = (originalName: string, userId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${userId}/${timestamp}-${random}.${extension}`;
};

/**
 * Upload a file from URI
 */
export const uploadFile = async (
  bucket: StorageBucket,
  fileUri: string,
  userId: string,
  options?: {
    fileName?: string;
    contentType?: string;
  },
): Promise<UploadResult> => {
  if (!isSupabaseConfigured()) {
    return {
      url: null,
      path: null,
      error: new Error('Supabase not configured'),
    };
  }

  try {
    // Read file via fetch and get ArrayBuffer (works across RN runtimes)
    const response = await fetch(fileUri);
    const arrayBuffer = await response.arrayBuffer();

    const fileName = options?.fileName || generateFileName(fileUri, userId);
    const contentType = options?.contentType || getMimeType(fileUri);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    logger.info('[Storage] File uploaded:', { bucket, path: data.path });

    return {
      url: urlData.publicUrl,
      path: data.path,
      error: null,
    };
  } catch (error) {
    logger.error('[Storage] Upload error:', error);
    return { url: null, path: null, error: error as Error };
  }
};

/**
 * Upload multiple files
 */
export const uploadFiles = async (
  bucket: StorageBucket,
  fileUris: string[],
  userId: string,
): Promise<UploadResult[]> => {
  const results = await Promise.all(
    fileUris.map((uri) => uploadFile(bucket, uri, userId)),
  );
  return results;
};

/**
 * Download a file to local storage
 */
export const downloadFile = async (
  bucket: StorageBucket,
  path: string,
): Promise<DownloadResult> => {
  if (!isSupabaseConfigured()) {
    return { localUri: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error) throw error;

    // Save to local cache using expo-file-system
    const fileName = path.split('/').pop() || 'download';
    const localPath = `${cacheDirectory}${fileName}`;

    const arrayBuffer = await data.arrayBuffer();
    const base64 = encode(arrayBuffer);

    await FileSystem.writeAsStringAsync(localPath, base64, {
      encoding: EncodingType.Base64,
    });

    return { localUri: localPath, error: null };
  } catch (error) {
    logger.error('[Storage] Download error:', error);
    return { localUri: null, error: error as Error };
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (
  bucket: StorageBucket,
  path: string,
): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) throw error;

    logger.info('[Storage] File deleted:', { bucket, path });
    return { error: null };
  } catch (error) {
    logger.error('[Storage] Delete error:', error);
    return { error: error as Error };
  }
};

/**
 * Delete multiple files
 */
export const deleteFiles = async (
  bucket: StorageBucket,
  paths: string[],
): Promise<{ error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove(paths);

    if (error) throw error;

    logger.info('[Storage] Files deleted:', { bucket, count: paths.length });
    return { error: null };
  } catch (error) {
    logger.error('[Storage] Delete files error:', error);
    return { error: error as Error };
  }
};

/**
 * Get signed URL for private file
 */
export const getSignedUrl = async (
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600, // 1 hour default
): Promise<{ url: string | null; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { url: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) throw error;

    return { url: data.signedUrl, error: null };
  } catch (error) {
    logger.error('[Storage] Get signed URL error:', error);
    return { url: null, error: error as Error };
  }
};

/**
 * Get public URL (for public buckets)
 */
export const getPublicUrl = (bucket: StorageBucket, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * List files in a folder
 */
export const listFiles = async (
  bucket: StorageBucket,
  folder: string,
): Promise<{ files: string[]; error: Error | null }> => {
  if (!isSupabaseConfigured()) {
    return { files: [], error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder);

    if (error) throw error;

    const files = data?.map((file) => `${folder}/${file.name}`) || [];
    return { files, error: null };
  } catch (error) {
    logger.error('[Storage] List files error:', error);
    return { files: [], error: error as Error };
  }
};

/**
 * Helper to get MIME type from file URI
 */
const getMimeType = (uri: string): string => {
  const extension = uri.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    pdf: 'application/pdf',
  };
  return mimeTypes[extension || ''] || 'application/octet-stream';
};

/**
 * Upload avatar specifically
 */
export const uploadAvatar = async (
  fileUri: string,
  userId: string,
): Promise<UploadResult> => {
  // Delete old avatar first
  await deleteFiles('avatars', [`${userId}/`]);

  return uploadFile('avatars', fileUri, userId, {
    fileName: `${userId}/avatar.${fileUri.split('.').pop() || 'jpg'}`,
  });
};

/**
 * Upload moment images
 */
export const uploadMomentImages = async (
  fileUris: string[],
  userId: string,
  momentId: string,
): Promise<UploadResult[]> => {
  const results = await Promise.all(
    fileUris.map((uri, index) =>
      uploadFile('moments', uri, userId, {
        fileName: `${userId}/${momentId}/${index}.${
          uri.split('.').pop() || 'jpg'
        }`,
      }),
    ),
  );
  return results;
};

/**
 * Upload proof image
 */
export const uploadProofImage = async (
  fileUri: string,
  userId: string,
  momentId: string,
): Promise<UploadResult> => {
  return uploadFile('proofs', fileUri, userId, {
    fileName: `${userId}/${momentId}/proof.${
      fileUri.split('.').pop() || 'jpg'
    }`,
  });
};

export default {
  uploadFile,
  uploadFiles,
  downloadFile,
  deleteFile,
  deleteFiles,
  getSignedUrl,
  getPublicUrl,
  listFiles,
  uploadAvatar,
  uploadMomentImages,
  uploadProofImage,
};

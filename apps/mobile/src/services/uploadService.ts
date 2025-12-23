/**
 * Upload Service
 * Image and file upload operations using Supabase Storage
 *
 * Security Features:
 * - File type validation (whitelist)
 * - File size limits
 * - Malicious filename detection
 * - MIME type verification
 * - Rate limiting preparation
 * - Crash recovery with pending transactions
 * - Low storage detection and warnings
 */
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';
import { uploadFile as supabaseUploadFile } from './supabaseStorageService';
import type { StorageBucket } from './supabaseStorageService';
import {
  pendingTransactionsService,
  TransactionStatus,
} from './pendingTransactionsService';
import { storageMonitor, StorageLevel } from './storageMonitor';

// Security Constants
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];
const ALLOWED_DOCUMENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

const MAX_FILE_SIZES = {
  avatars: 2 * 1024 * 1024, // 2MB
  moments: 10 * 1024 * 1024, // 10MB
  proofs: 5 * 1024 * 1024, // 5MB
  messages: 10 * 1024 * 1024, // 10MB
} as const;

const ALLOWED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  documents: ['.jpg', '.jpeg', '.png', '.pdf'],
} as const;

// Blocked extensions (security)
const BLOCKED_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.ps1',
  '.dll',
  '.so',
  '.dylib',
  '.app',
  '.deb',
  '.rpm',
  '.apk',
  '.ipa',
  '.msi',
  '.dmg',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.py',
  '.rb',
  '.php',
  '.asp',
  '.html',
  '.htm',
  '.svg',
  '.xml',
] as const;

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

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
    extension: string;
  };
}

/**
 * Validate file type based on bucket
 */
const validateFileType = (
  bucket: StorageBucket,
  mimeType: string,
  filename: string,
): ValidationResult => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  // Check for blocked extensions (security)
  if (BLOCKED_EXTENSIONS.some((e) => e === extension)) {
    return {
      valid: false,
      error: `Security: File type ${extension} is not allowed`,
    };
  }

  // Check for path traversal attempts
  if (
    filename.includes('..') ||
    filename.includes('/') ||
    filename.includes('\\')
  ) {
    return {
      valid: false,
      error: 'Security: Invalid filename - path traversal detected',
    };
  }

  // Validate based on bucket type
  if (bucket === 'avatars' || bucket === 'moments' || bucket === 'messages') {
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(
          ', ',
        )}`,
      };
    }

    if (!ALLOWED_EXTENSIONS.images.some((e) => e === extension)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.images.join(
          ', ',
        )}`,
      };
    }
  } else if (bucket === 'proofs') {
    if (!ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${ALLOWED_DOCUMENT_TYPES.join(
          ', ',
        )}`,
      };
    }

    if (!ALLOWED_EXTENSIONS.documents.some((e) => e === extension)) {
      return {
        valid: false,
        error: `Invalid file extension. Allowed: ${ALLOWED_EXTENSIONS.documents.join(
          ', ',
        )}`,
      };
    }
  }

  return { valid: true };
};

/**
 * Validate file size based on bucket
 */
const validateFileSize = (
  bucket: StorageBucket,
  fileSize: number,
): ValidationResult => {
  const maxSize = MAX_FILE_SIZES[bucket];

  if (fileSize > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  // Minimum file size check (prevent empty files)
  if (fileSize < 100) {
    return {
      valid: false,
      error: 'File is too small or corrupted',
    };
  }

  return { valid: true };
};

/**
 * Sanitize filename for safe storage
 */
const sanitizeFilename = (filename: string): string => {
  // Remove path components
  const baseName = filename.split('/').pop() || filename;

  // Remove dangerous characters, keep only alphanumeric, dash, underscore, dot
  const sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit filename length
  const maxLength = 100;
  if (sanitized.length > maxLength) {
    const extension = sanitized.substring(sanitized.lastIndexOf('.'));
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
    return (
      nameWithoutExt.substring(0, maxLength - extension.length) + extension
    );
  }

  return sanitized;
};

/**
 * Get file info from URI (React Native)
 */
const getFileInfo = async (
  uri: string,
): Promise<{ name: string; size: number; type: string }> => {
  try {
    // For React Native, we can extract info from URI
    const filename = uri.split('/').pop() || 'upload.jpg';

    // For file size and type, we'd typically use expo-file-system or similar
    // For now, we'll use fetch to get basic info
    const response = await fetch(uri);
    const blob = await response.blob();

    return {
      name: filename,
      size: blob.size,
      type: blob.type || 'image/jpeg',
    };
  } catch (error) {
    logger.error('Failed to get file info:', error);
    throw new Error('Failed to read file information');
  }
};

/**
 * Track upload attempt to database (for rate limiting and monitoring)
 */
const trackUploadAttempt = async (
  userId: string,
  bucket: StorageBucket,
  fileInfo: { name: string; size: number; type: string },
  status: 'pending' | 'completed' | 'failed',
): Promise<void> => {
  try {
    // Insert to file_uploads table (created in migration)
    await supabase.from('file_uploads').insert({
      user_id: userId,
      bucket_id: bucket,
      file_name: fileInfo.name,
      file_size: fileInfo.size,
      mime_type: fileInfo.type,
      upload_status: status,
      metadata: {
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Don't fail upload if tracking fails
    logger.warn('Failed to track upload attempt:', error);
  }
};

/**
 * Check upload rate limit (client-side pre-check)
 * Server-side validation happens in database triggers
 */
const checkRateLimit = async (userId: string): Promise<boolean> => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from('file_uploads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('uploaded_at', oneHourAgo);

    if (error) {
      logger.warn('Rate limit check failed, allowing upload:', error);
      return true; // Allow upload if check fails
    }

    const uploadCount = count || 0;
    const isAllowed = uploadCount < 10; // 10 uploads per hour

    if (!isAllowed) {
      logger.warn('Upload rate limit exceeded:', {
        userId: userId.substring(0, 8),
        count: uploadCount,
      });
    }

    return isAllowed;
  } catch (error) {
    logger.warn('Rate limit check error, allowing upload:', error);
    return true; // Allow upload if check fails
  }
};

/**
 * Upload an image with security validation
 */
export const uploadImage = async (
  uri: string,
  options: UploadOptions = {},
): Promise<UploadResult> => {
  let uploadId: string | undefined;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    // Check rate limit
    const rateLimitOk = await checkRateLimit(user.id);
    if (!rateLimitOk) {
      throw new Error('Upload rate limit exceeded. Please try again later.');
    }

    // Map "folder" to bucket if possible, or default to 'moments'
    // Valid buckets: 'avatars' | 'moments' | 'proofs' | 'messages'
    let bucket: StorageBucket = 'moments';
    if (options.folder === 'avatars') bucket = 'avatars';
    if (options.folder === 'proofs') bucket = 'proofs';
    if (options.folder === 'messages') bucket = 'messages';

    // Get file information
    const fileInfo = await getFileInfo(uri);
    logger.debug('Upload file info:', {
      name: fileInfo.name,
      size: fileInfo.size,
      type: fileInfo.type,
      bucket,
    });

    // === EDGE CASE 1: Check storage availability ===
    const storageInfo = await storageMonitor.getStorageInfo();

    if (!storageInfo) {
      logger.warn('Could not get storage info, proceeding with upload');
    } else if (storageInfo.level === StorageLevel.CRITICAL) {
      logger.error('Upload blocked: Critical storage level', {
        freeSpace: storageMonitor.formatBytes(storageInfo.freeSpace),
        fileSize: storageMonitor.formatBytes(fileInfo.size),
      });
      throw new Error(
        `Not enough storage space. Free: ${storageMonitor.formatBytes(
          storageInfo.freeSpace,
        )}, ` + `Need: ${storageMonitor.formatBytes(fileInfo.size * 1.5)}`,
      );
    }

    const canUpload = await storageMonitor.canUpload(fileInfo.size);
    if (!canUpload) {
      logger.warn('Upload blocked: Insufficient storage for processing', {
        freeSpace: storageMonitor.formatBytes(storageInfo?.freeSpace ?? 0),
        fileSize: storageMonitor.formatBytes(fileInfo.size),
        required: storageMonitor.formatBytes(fileInfo.size * 1.5),
      });
      throw new Error(
        `Insufficient storage. Free up at least ${storageMonitor.formatBytes(
          fileInfo.size * 1.5,
        )}`,
      );
    }

    if (storageInfo?.level === StorageLevel.LOW) {
      logger.warn('Upload proceeding with low storage warning', {
        freeSpace: storageMonitor.formatBytes(storageInfo.freeSpace),
        level: storageInfo.level,
      });
    }

    // === EDGE CASE 2: Add to pending transactions (crash recovery) ===
    uploadId = `upload_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await pendingTransactionsService.addPendingUpload({
      id: uploadId,
      type: bucket as 'proof' | 'moment' | 'avatar' | 'message',
      localUri: uri,
      bucket,
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      mimeType: fileInfo.type,
      status: TransactionStatus.INITIATED,
      progress: 0,
    });

    logger.info('Upload tracked in pending transactions', { uploadId, bucket });

    // Track upload attempt (pending)
    await trackUploadAttempt(user.id, bucket, fileInfo, 'pending');

    // Validate file type
    const typeValidation = validateFileType(
      bucket,
      fileInfo.type,
      fileInfo.name,
    );
    if (!typeValidation.valid) {
      logger.warn('File type validation failed:', typeValidation.error);
      await trackUploadAttempt(user.id, bucket, fileInfo, 'failed');
      await pendingTransactionsService.updateUploadProgress(
        uploadId,
        0,
        TransactionStatus.FAILED,
      );
      throw new Error(typeValidation.error);
    }

    // Validate file size
    const sizeValidation = validateFileSize(bucket, fileInfo.size);
    if (!sizeValidation.valid) {
      logger.warn('File size validation failed:', sizeValidation.error);
      await trackUploadAttempt(user.id, bucket, fileInfo, 'failed');
      await pendingTransactionsService.updateUploadProgress(
        uploadId,
        0,
        TransactionStatus.FAILED,
      );
      throw new Error(sizeValidation.error);
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(fileInfo.name);
    logger.debug('Sanitized filename:', {
      original: fileInfo.name,
      sanitized: sanitizedFilename,
    });

    // Security check passed - proceed with upload
    logger.info('Security validation passed, uploading file', {
      bucket,
      size: fileInfo.size,
      type: fileInfo.type,
    });

    // Update status: uploading
    await pendingTransactionsService.updateUploadProgress(
      uploadId,
      10,
      TransactionStatus.UPLOADING,
    );

    // TODO: Implement client-side compression if needed before upload
    // For now, we upload directly

    const { url, path, error } = await supabaseUploadFile(bucket, uri, user.id);

    if (error) {
      await trackUploadAttempt(user.id, bucket, fileInfo, 'failed');
      await pendingTransactionsService.updateUploadProgress(
        uploadId,
        0,
        TransactionStatus.FAILED,
      );
      throw error;
    }
    if (!url || !path) {
      await trackUploadAttempt(user.id, bucket, fileInfo, 'failed');
      await pendingTransactionsService.updateUploadProgress(
        uploadId,
        0,
        TransactionStatus.FAILED,
      );
      throw new Error('Upload failed');
    }

    // Track successful upload
    await trackUploadAttempt(user.id, bucket, fileInfo, 'completed');

    // === EDGE CASE 3: Mark upload as completed (auto-cleanup) ===
    await pendingTransactionsService.updateUploadProgress(
      uploadId,
      100,
      TransactionStatus.COMPLETED,
    );

    // Log successful upload (without sensitive data)
    logger.info('File uploaded successfully', {
      uploadId,
      bucket,
      size: fileInfo.size,
      path: path.substring(0, 50), // Truncate path for security
    });

    return {
      url,
      publicId: path,
      width: 0, // Metadata not returned by Supabase upload
      height: 0,
      format: fileInfo.type.split('/')[1] || 'jpg',
      size: fileInfo.size,
    };
  } catch (error) {
    logger.error('Upload image error:', error);

    // Mark as failed and increment retry count
    if (uploadId) {
      await pendingTransactionsService.incrementUploadRetry(uploadId);
      logger.info('Upload retry count incremented', { uploadId });
    }

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

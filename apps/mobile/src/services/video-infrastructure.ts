/**
 * Video Infrastructure Configuration
 * Handles video upload, transcoding, streaming, and CDN delivery
 * 
 * Features:
 * - Multi-resolution transcoding (360p, 720p, 1080p)
 * - HLS/DASH adaptive streaming
 * - Thumbnail generation
 * - CDN delivery with edge caching
 * - Automatic compression and optimization
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Video processing configuration
export const VIDEO_CONFIG = {
  // Upload limits
  maxFileSize: 500 * 1024 * 1024, // 500MB
  maxDuration: 300, // 5 minutes
  allowedFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv'],
  
  // Transcoding profiles
  profiles: {
    '360p': {
      width: 640,
      height: 360,
      bitrate: '800k',
      audioBitrate: '96k',
    },
    '720p': {
      width: 1280,
      height: 720,
      bitrate: '2500k',
      audioBitrate: '128k',
    },
    '1080p': {
      width: 1920,
      height: 1080,
      bitrate: '5000k',
      audioBitrate: '192k',
    },
  },
  
  // Thumbnail settings
  thumbnail: {
    width: 640,
    height: 360,
    count: 3, // Generate 3 thumbnails at different timestamps
    format: 'jpg',
    quality: 85,
  },
  
  // Streaming settings
  streaming: {
    protocol: 'hls', // HLS for broad compatibility
    segmentDuration: 6, // 6-second segments
    enableDash: true, // Also generate DASH for modern browsers
  },
  
  // CDN settings
  cdn: {
    provider: 'cloudflare-stream', // or 'mux', 'cloudinary'
    domain: 'https://stream.travelmatch.app',
    cacheControl: 'public, max-age=31536000, immutable',
  },
} as const;

// Mux.com configuration (professional video infrastructure)
export const MUX_CONFIG = {
  tokenId: process.env.MUX_TOKEN_ID || '',
  tokenSecret: process.env.MUX_TOKEN_SECRET || '',
  webhookSecret: process.env.MUX_WEBHOOK_SECRET || '',
  baseUrl: 'https://api.mux.com',
};

interface VideoUploadOptions {
  file: File;
  userId: string;
  momentId: string;
  onProgress?: (progress: number) => void;
}

export interface VideoMetadata {
  id: string;
  playbackId: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  duration: number;
  width: number;
  height: number;
  size: number;
  thumbnails: string[];
  streamingUrls: {
    hls: string;
    dash?: string;
  };
  createdAt: string;
}

/**
 * Upload video to Mux for processing
 */
export async function uploadVideo({
  file,
  userId,
  momentId,
  onProgress,
}: VideoUploadOptions): Promise<VideoMetadata> {
  // Validate file
  const validation = validateVideoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Create direct upload URL from Mux
  const uploadUrl = await createMuxUpload(userId, momentId);

  // Upload file with progress tracking
  const uploadResult = await uploadToMux(file, uploadUrl, onProgress);

  // Save metadata to database
  const metadata = await saveVideoMetadata({
    id: uploadResult.assetId,
    playbackId: uploadResult.playbackId,
    userId,
    momentId,
    status: 'processing',
  });

  return metadata;
}

/**
 * Validate video file before upload
 */
function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > VIDEO_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum (${VIDEO_CONFIG.maxFileSize / 1024 / 1024}MB)`,
    };
  }

  // Check file format
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedFormat = extension as typeof VIDEO_CONFIG.allowedFormats[number] | undefined;
  if (!extension || !VIDEO_CONFIG.allowedFormats.includes(allowedFormat!)) {
    return {
      valid: false,
      error: `Invalid format. Allowed: ${VIDEO_CONFIG.allowedFormats.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Create Mux direct upload URL
 */
async function createMuxUpload(userId: string, momentId: string): Promise<string> {
  const response = await fetch(`${MUX_CONFIG.baseUrl}/video/v1/uploads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa(`${MUX_CONFIG.tokenId}:${MUX_CONFIG.tokenSecret}`)}`,
    },
    body: JSON.stringify({
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
        master_access: 'temporary',
        passthrough: JSON.stringify({ userId, momentId }),
      },
      cors_origin: '*',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create upload URL');
  }

  const data = await response.json();
  return data.data.url;
}

/**
 * Upload file to Mux with progress tracking
 */
async function uploadToMux(
  file: File,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<{ assetId: string; playbackId: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    // Handle completion
    xhr.addEventListener('load', async () => {
      if (xhr.status === 200 || xhr.status === 201) {
        // Poll for asset creation
        const uploadId = uploadUrl.split('/').pop();
        const asset = await pollForAsset(uploadId!);
        resolve(asset);
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    // Send file
    xhr.open('PUT', uploadUrl);
    xhr.send(file);
  });
}

/**
 * Poll Mux API until asset is ready
 */
async function pollForAsset(
  uploadId: string,
  maxAttempts = 60,
  interval = 2000
): Promise<{ assetId: string; playbackId: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${MUX_CONFIG.baseUrl}/video/v1/uploads/${uploadId}`, {
      headers: {
        Authorization: `Basic ${btoa(`${MUX_CONFIG.tokenId}:${MUX_CONFIG.tokenSecret}`)}`,
      },
    });

    const data = await response.json();
    const upload = data.data;

    if (upload.asset_id) {
      // Get asset details
      const assetResponse = await fetch(
        `${MUX_CONFIG.baseUrl}/video/v1/assets/${upload.asset_id}`,
        {
          headers: {
            Authorization: `Basic ${btoa(`${MUX_CONFIG.tokenId}:${MUX_CONFIG.tokenSecret}`)}`,
          },
        }
      );

      const assetData = await assetResponse.json();
      const asset = assetData.data;

      if (asset.playback_ids && asset.playback_ids.length > 0) {
        return {
          assetId: asset.id,
          playbackId: asset.playback_ids[0].id,
        };
      }
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error('Timeout waiting for asset creation');
}

/**
 * Save video metadata to database
 */
async function saveVideoMetadata(data: {
  id: string;
  playbackId: string;
  userId: string;
  momentId: string;
  status: string;
}): Promise<VideoMetadata> {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const { data: video, error } = await supabase
    .from('videos')
    .insert({
      id: data.id,
      playback_id: data.playbackId,
      user_id: data.userId,
      moment_id: data.momentId,
      status: data.status,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  if (!video) throw new Error('Failed to save video metadata');

  return {
    id: video.id as string,
    playbackId: video.playback_id as string as string,
    status: video.status as VideoMetadata['status'],
    duration: (video.duration as number) || 0,
    width: (video.width as number) || 0,
    height: (video.height as number) || 0,
    size: (video.size as number) || 0,
    thumbnails: (video.thumbnails as string[]) || [],
    streamingUrls: {
      hls: `https://stream.mux.com/${video.playback_id}.m3u8`,
      dash: `https://stream.mux.com/${video.playback_id}.mpd`,
    },
    createdAt: video.created_at as string,
  };
}

/**
 * Get video streaming URLs
 */
export function getStreamingUrls(playbackId: string) {
  return {
    hls: `https://stream.mux.com/${playbackId}.m3u8`,
    dash: `https://stream.mux.com/${playbackId}.mpd`,
    thumbnail: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
    gif: `https://image.mux.com/${playbackId}/animated.gif`,
  };
}

/**
 * Generate thumbnail URL with options
 */
export function getThumbnailUrl(
  playbackId: string,
  options: {
    time?: number; // Timestamp in seconds
    width?: number;
    height?: number;
    fitMode?: 'preserve' | 'crop' | 'smartcrop';
  } = {}
): string {
  const params = new URLSearchParams();
  
  if (options.time) params.set('time', options.time.toString());
  if (options.width) params.set('width', options.width.toString());
  if (options.height) params.set('height', options.height.toString());
  if (options.fitMode) params.set('fit_mode', options.fitMode);

  return `https://image.mux.com/${playbackId}/thumbnail.jpg?${params.toString()}`;
}

/**
 * Delete video and all associated files
 */
export async function deleteVideo(assetId: string): Promise<void> {
  // Delete from Mux
  await fetch(`${MUX_CONFIG.baseUrl}/video/v1/assets/${assetId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Basic ${btoa(`${MUX_CONFIG.tokenId}:${MUX_CONFIG.tokenSecret}`)}`,
    },
  });

  // Delete from database
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  await supabase.from('videos').delete().eq('id', assetId);
}

/**
 * Get video analytics
 */
export async function getVideoAnalytics(assetId: string) {
  const response = await fetch(
    `${MUX_CONFIG.baseUrl}/data/v1/metrics/video_views?filter[asset_id]=${assetId}`,
    {
      headers: {
        Authorization: `Basic ${btoa(`${MUX_CONFIG.tokenId}:${MUX_CONFIG.tokenSecret}`)}`,
      },
    }
  );

  const data = await response.json();
  
  return {
    views: data.data.total_views || 0,
    uniqueViewers: data.data.unique_viewers || 0,
    playbackTime: data.data.total_playing_time || 0,
    avgViewDuration: data.data.average_view_duration || 0,
  };
}

/**
 * Webhook handler for Mux events
 */
export async function handleMuxWebhook(
  payload: { type: string; data: Record<string, unknown> },
  signature: string
): Promise<void> {
  // Verify webhook signature
  const isValid = verifyMuxSignature(payload, signature);
  if (!isValid) {
    throw new Error('Invalid webhook signature');
  }

  const { type, data } = payload;

  switch (type) {
    case 'video.asset.ready':
      await handleAssetReady(data as Parameters<typeof handleAssetReady>[0]);
      break;
    case 'video.asset.errored':
      await handleAssetError(data as Parameters<typeof handleAssetError>[0]);
      break;
    case 'video.upload.asset_created':
      await handleUploadComplete(data as { id: string });
      break;
    default:
      logger.debug(`Unhandled webhook type: ${type}`);
  }
}

function verifyMuxSignature(
  payload: { type: string; data: Record<string, unknown> },
  signature: string
): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', MUX_CONFIG.webhookSecret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  return signature === expectedSignature;
}

async function handleAssetReady(data: {
  id: string;
  duration: number;
  tracks: Array<{ max_width?: number; max_height?: number }>;
  playback_ids: Array<{ id: string }>;
}): Promise<void> {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  await supabase
    .from('videos')
    .update({
      status: 'ready',
      duration: data.duration,
      width: data.tracks[0]?.max_width,
      height: data.tracks[0]?.max_height,
      thumbnails: [getThumbnailUrl(data.playback_ids[0].id)],
    })
    .eq('id', data.id);
}

async function handleAssetError(data: {
  id: string;
  errors?: Array<{ messages?: string[] }>;
}): Promise<void> {
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  await supabase
    .from('videos')
    .update({
      status: 'error',
      error_message: data.errors?.[0]?.messages?.[0],
    })
    .eq('id', data.id);
}

async function handleUploadComplete(data: { id: string }): Promise<void> {
  logger.debug('Upload complete for asset:', data.id);
}

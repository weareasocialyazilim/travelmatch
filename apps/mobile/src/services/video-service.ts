/**
 * Video Content Infrastructure
 * Optimized video delivery with accessibility features
 * 
 * Features:
 * - Adaptive bitrate streaming (HLS/DASH)
 * - Captions and subtitles
 * - Audio descriptions
 * - Transcript generation
 * - Thumbnail generation
 * - Video optimization
 * - CDN delivery
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Video configuration
export const VIDEO_CONFIG = {
  // Supported formats
  formats: {
    input: ['mp4', 'mov', 'avi', 'webm'],
    output: ['mp4', 'webm', 'hls', 'dash'],
  },

  // Quality presets
  qualities: {
    low: {
      width: 640,
      height: 360,
      bitrate: '500k',
      label: '360p',
    },
    medium: {
      width: 1280,
      height: 720,
      bitrate: '2500k',
      label: '720p',
    },
    high: {
      width: 1920,
      height: 1080,
      bitrate: '5000k',
      label: '1080p',
    },
  },

  // Accessibility requirements
  accessibility: {
    captionsRequired: true,
    transcriptRequired: true,
    audioDescriptionRequired: false, // Optional but recommended
    signLanguageRequired: false, // Optional
  },

  // Storage limits
  limits: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    maxDuration: 300, // 5 minutes
    minDuration: 3, // 3 seconds
  },
} as const;

// Video processing service (using Cloudflare Stream via Edge Functions)
// SECURITY: All sensitive operations are handled server-side via Edge Functions
// The client NEVER has access to service_role key or Cloudflare API keys

// Import supabase type from config
import type { supabase as SupabaseInstance } from '../config/supabase';

export class VideoService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private streamAccountId: string;
  private supabaseClient: typeof SupabaseInstance | null = null;

  constructor() {
    // SECURITY FIX: Only use ANON key on client - service operations go through Edge Functions
    this.supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
    this.supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
    this.streamAccountId = process.env.EXPO_PUBLIC_CLOUDFLARE_STREAM_ACCOUNT_ID ?? '';
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      // Use logger instead of console for production safety
      logger.warn('[VideoService] Missing Supabase configuration');
    }
  }

  /**
   * Get authenticated Supabase client for user operations
   */
  private async getAuthenticatedClient(): Promise<NonNullable<typeof SupabaseInstance>> {
    if (!this.supabaseClient) {
      const { supabase } = await import('../config/supabase');
      this.supabaseClient = supabase;
    }
    return this.supabaseClient!;
  }

  /**
   * Upload and process video
   * SECURITY: Upload is handled via Edge Function - no direct Cloudflare API access from client
   */
  async uploadVideo(
    file: File,
    metadata: {
      momentId: string;
      userId: string;
      title: string;
      description?: string;
    }
  ): Promise<{
    videoId: string;
    playbackUrl: string;
    thumbnailUrl: string;
    status: string;
  }> {
    // Validate file client-side first
    this.validateVideo(file);

    // Get user session for authenticated request
    const supabase = await this.getAuthenticatedClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required for video upload');
    }

    // Step 1: Request upload URL from Edge Function
    const uploadUrlResponse = await fetch(
      `${this.supabaseUrl}/functions/v1/video-processing/upload`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': this.supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          momentId: metadata.momentId,
          title: metadata.title,
          description: metadata.description,
          uploadUrl: 'request', // Indicates we need an upload URL
        }),
      }
    );

    if (!uploadUrlResponse.ok) {
      const error = await uploadUrlResponse.json();
      throw new Error(error.error || 'Failed to get upload URL');
    }

    const { data: uploadData } = await uploadUrlResponse.json();

    // Step 2: Upload file directly to Cloudflare using the signed URL
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await fetch(uploadData.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Video upload failed');
    }

    return {
      videoId: uploadData.videoId,
      playbackUrl: '', // Will be available after processing
      thumbnailUrl: '', // Will be available after processing
      status: 'processing',
    };
  }

  /**
   * Add captions/subtitles to video
   * Note: Caption upload is handled via transcribe-video Edge Function
   */
  async addCaptions(
    videoId: string,
    language: string,
    captionsFile: File
  ): Promise<void> {
    const supabase = await this.getAuthenticatedClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }

    // Convert file to base64 for API transmission
    const reader = new FileReader();
    const captionsContent = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(captionsFile);
    });

    // Upload captions via Edge Function
    const response = await fetch(
      `${this.supabaseUrl}/functions/v1/transcribe-video`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': this.supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          language,
          captionsContent,
          action: 'add-captions',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add captions');
    }
  }

  /**
   * Generate captions automatically using AI
   */
  async generateCaptions(videoId: string, language = 'en'): Promise<string> {
    const supabase = await this.getAuthenticatedClient();
    
    // Get video URL
    // SECURITY: Explicit column selection - never use select('*')
    const { data: video } = await supabase
      .from('videos')
      .select(`
        id,
        user_id,
        stream_uid,
        status,
        duration,
        thumbnail_url,
        playback_url,
        created_at
      `)
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new Error('Video not found');
    }

    // 🔒 SECURITY: Transcription must be done server-side
    // OpenAI API keys should NEVER be exposed in client code
    // Call Supabase Edge Function instead
    const audioUrl = `https://customer-${this.streamAccountId}.cloudflarestream.com/${videoId}/downloads/default.mp4`;

    // Get auth token from SecureStore for authenticated request
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for transcription');
    }

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/transcribe-video`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          audioUrl,
          language,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Transcription failed');
    }

    const result = await response.json();
    const vttContent = result.data.text;

    // Save captions
    const captionsFile = new File([vttContent], `${videoId}-${language}.vtt`, {
      type: 'text/vtt',
    });

    await this.addCaptions(videoId, language, captionsFile);

    return vttContent;
  }

  /**
   * Generate transcript (plain text)
   */
  async generateTranscript(videoId: string, language = 'en'): Promise<string> {
    const vttContent = await this.generateCaptions(videoId, language);

    // Convert VTT to plain text
    const transcript = vttContent
      .split('\n')
      .filter(line => !line.includes('-->') && !line.match(/^\d+$/))
      .filter(line => line.trim().length > 0)
      .join(' ');

    // Save transcript via authenticated client
    const supabase = await this.getAuthenticatedClient();
    await supabase
      .from('video_transcripts')
      .insert({
        video_id: videoId,
        language,
        content: transcript,
        created_at: new Date().toISOString(),
      });

    return transcript;
  }

  /**
   * Get video analytics
   * SECURITY: Analytics are fetched via Edge Function - no direct Cloudflare API access
   */
  async getAnalytics(videoId: string): Promise<{
    views: number;
    watchTime: number;
    avgWatchTime: number;
    completionRate: number;
  }> {
    const supabase = await this.getAuthenticatedClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.supabaseUrl}/functions/v1/video-processing/analytics?videoId=${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': this.supabaseAnonKey,
        },
      }
    );

    if (!response.ok) {
      return { views: 0, watchTime: 0, avgWatchTime: 0, completionRate: 0 };
    }

    const result = await response.json();
    
    return {
      views: result.data?.views || 0,
      watchTime: result.data?.watchTime || 0,
      avgWatchTime: result.data?.avgWatchTime || 0,
      completionRate: result.data?.completionRate || 0,
    };
  }

  /**
   * Delete video
   * SECURITY: Deletion is handled via Edge Function with proper authorization
   */
  async deleteVideo(videoId: string): Promise<void> {
    const supabase = await this.getAuthenticatedClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.supabaseUrl}/functions/v1/video-processing/delete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': this.supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete video');
    }
  }

  /**
   * Validate video file
   */
  private validateVideo(file: File): void {
    // Check file size
    if (file.size > VIDEO_CONFIG.limits.maxFileSize) {
      throw new Error(`File size exceeds ${VIDEO_CONFIG.limits.maxFileSize / 1024 / 1024}MB limit`);
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !(VIDEO_CONFIG.formats.input as readonly string[]).includes(extension)) {
      throw new Error(`Unsupported format. Supported: ${VIDEO_CONFIG.formats.input.join(', ')}`);
    }
  }
}

/**
 * React Native Video Player Component with Accessibility
 */
export const AccessibleVideoPlayer = {
  // Video player props with accessibility features
  getVideoPlayerProps: (videoUrl: string, options?: {
    captions?: { url: string; language: string; label: string }[];
    transcript?: string;
    poster?: string;
    autoplay?: boolean;
  }) => ({
    source: { uri: videoUrl },
    poster: options?.poster,
    textTracks: options?.captions?.map(caption => ({
      title: caption.label,
      language: caption.language,
      type: 'text/vtt',
      uri: caption.url,
    })),
    selectedTextTrack: {
      type: 'language',
      value: 'en',
    },
    paused: !options?.autoplay,
    controls: true,
    resizeMode: 'contain',
    
    // Accessibility
    accessible: true,
    accessibilityLabel: 'Video player',
    accessibilityHint: 'Double tap to play or pause',
    accessibilityRole: 'video',
  }),

  // Transcript panel
  TranscriptPanel: (transcript: string) => ({
    accessible: true,
    accessibilityLabel: 'Video transcript',
    accessibilityRole: 'text',
    content: transcript,
  }),
};

// Export video service instance
export const videoService = new VideoService();

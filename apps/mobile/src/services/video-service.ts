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

// Video processing service (using Cloudflare Stream or similar)
export class VideoService {
  private supabase: ReturnType<typeof createClient>;
  private streamApiKey: string;
  private streamAccountId: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    this.streamApiKey = process.env.CLOUDFLARE_STREAM_API_KEY!;
    this.streamAccountId = process.env.CLOUDFLARE_STREAM_ACCOUNT_ID!;
  }

  /**
   * Upload and process video
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
    // Validate file
    this.validateVideo(file);

    // Upload to Cloudflare Stream
    const formData = new FormData();
    formData.append('file', file);
    formData.append('meta', JSON.stringify({
      name: metadata.title,
      requireSignedURLs: false,
      allowedOrigins: ['travelmatch.app'],
    }));

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.streamAccountId}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.streamApiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    const videoId = result.result.uid;

    // Save to database
    await this.supabase.from('videos').insert({
      id: videoId,
      moment_id: metadata.momentId,
      user_id: metadata.userId,
      title: metadata.title,
      description: metadata.description,
      status: 'processing',
      created_at: new Date().toISOString(),
    });

    return {
      videoId,
      playbackUrl: `https://customer-${this.streamAccountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
      thumbnailUrl: `https://customer-${this.streamAccountId}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`,
      status: 'processing',
    };
  }

  /**
   * Add captions/subtitles to video
   */
  async addCaptions(
    videoId: string,
    language: string,
    captionsFile: File
  ): Promise<void> {
    // Upload captions (WebVTT format)
    const formData = new FormData();
    formData.append('file', captionsFile);

    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.streamAccountId}/stream/${videoId}/captions/${language}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.streamApiKey}`,
        },
        body: formData,
      }
    );

    // Update database
    await this.supabase
      .from('video_captions')
      .insert({
        video_id: videoId,
        language,
        created_at: new Date().toISOString(),
      });
  }

  /**
   * Generate captions automatically using AI
   */
  async generateCaptions(videoId: string, language: string = 'en'): Promise<string> {
    // Get video URL
    const { data: video } = await this.supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (!video) {
      throw new Error('Video not found');
    }

    // Use OpenAI Whisper for transcription
    const audioUrl = `https://customer-${this.streamAccountId}.cloudflarestream.com/${videoId}/downloads/default.mp4`;

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: audioUrl,
        model: 'whisper-1',
        response_format: 'vtt', // WebVTT format
        language,
      }),
    });

    const vttContent = await response.text();

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
  async generateTranscript(videoId: string, language: string = 'en'): Promise<string> {
    const vttContent = await this.generateCaptions(videoId, language);

    // Convert VTT to plain text
    const transcript = vttContent
      .split('\n')
      .filter(line => !line.includes('-->') && !line.match(/^\d+$/))
      .filter(line => line.trim().length > 0)
      .join(' ');

    // Save transcript
    await this.supabase
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
   */
  async getAnalytics(videoId: string): Promise<{
    views: number;
    watchTime: number;
    avgWatchTime: number;
    completionRate: number;
  }> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.streamAccountId}/stream/analytics/views?videoUID=${videoId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.streamApiKey}`,
        },
      }
    );

    const result = await response.json();
    
    return {
      views: result.result.totalViews || 0,
      watchTime: result.result.totalTimeViewedMinutes || 0,
      avgWatchTime: result.result.avgTimeViewedMinutes || 0,
      completionRate: result.result.completionRate || 0,
    };
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    // Delete from Cloudflare Stream
    await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.streamAccountId}/stream/${videoId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.streamApiKey}`,
        },
      }
    );

    // Delete from database
    await this.supabase.from('videos').delete().eq('id', videoId);
    await this.supabase.from('video_captions').delete().eq('video_id', videoId);
    await this.supabase.from('video_transcripts').delete().eq('video_id', videoId);
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
    if (!extension || !VIDEO_CONFIG.formats.input.includes(extension)) {
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

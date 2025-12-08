import React, { useState, useRef } from 'react';
import { uploadVideo, getStreamingUrls, type VideoMetadata } from '@/services/video-infrastructure';
import { logAuditEvent } from '@/config/soc2-compliance';

interface VideoUploaderProps {
  momentId: string;
  userId: string;
  onUploadComplete?: (video: VideoMetadata) => void;
  onUploadError?: (error: Error) => void;
}

export function VideoUploader({
  momentId,
  userId,
  onUploadComplete,
  onUploadError,
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Log upload start
      await logAuditEvent({
        userId,
        userEmail: '', // Get from user context
        event: 'video_upload_started',
        category: 'dataAccess',
        resource: 'video',
        action: 'create',
        result: 'success',
        ipAddress: '', // Get from request
        userAgent: navigator.userAgent,
        metadata: {
          momentId,
          fileName: file.name,
          fileSize: file.size,
        },
      });

      // Upload video
      const video = await uploadVideo({
        file,
        userId,
        momentId,
        onProgress: (p) => setProgress(p),
      });

      // Log upload completion
      await logAuditEvent({
        userId,
        userEmail: '',
        event: 'video_upload_completed',
        category: 'dataAccess',
        resource: 'video',
        action: 'create',
        result: 'success',
        ipAddress: '',
        userAgent: navigator.userAgent,
        metadata: {
          videoId: video.id,
          playbackId: video.playbackId,
        },
      });

      setUploading(false);
      onUploadComplete?.(video);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setUploading(false);

      // Log upload error
      await logAuditEvent({
        userId,
        userEmail: '',
        event: 'video_upload_failed',
        category: 'dataAccess',
        resource: 'video',
        action: 'create',
        result: 'failure',
        ipAddress: '',
        userAgent: navigator.userAgent,
        metadata: {
          error: error.message,
          fileName: file.name,
        },
      });

      onUploadError?.(error);
    }
  };

  return (
    <div className="video-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        aria-label="Upload video proof"
      >
        {uploading ? `Uploading... ${Math.round(progress)}%` : 'Upload Video Proof'}
      </button>

      {uploading && (
        <div className="progress-bar" role="progressbar" aria-valuenow={progress}>
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

interface VideoPlayerProps {
  playbackId: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export function VideoPlayer({
  playbackId,
  autoPlay = false,
  muted = false,
  controls = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const urls = getStreamingUrls(playbackId);

  const handlePlay = () => {
    setPlaying(true);
    
    // Track video view
    // (Would integrate with analytics service)
  };

  const handlePause = () => {
    setPlaying(false);
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        poster={urls.thumbnail}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        onPlay={handlePlay}
        onPause={handlePause}
        aria-label="Video moment"
      >
        <source src={urls.hls} type="application/x-mpegURL" />
        <source src={urls.dash} type="application/dash+xml" />
        <track kind="captions" />
      </video>

      {!controls && (
        <button
          onClick={() => {
            if (playing) {
              videoRef.current?.pause();
            } else {
              videoRef.current?.play();
            }
          }}
          aria-label={playing ? 'Pause video' : 'Play video'}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      )}
    </div>
  );
}

/**
 * Accessible Video Player Component
 * WCAG 2.1 AA compliant video player with full accessibility features
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { useAccessibility } from '@/hooks/useAccessibility';
import { colors, spacing, typography } from '@travelmatch/design-system/tokens';
import { logger } from '@/utils/logger';

interface Caption {
  url: string;
  language: string;
  label: string;
}

interface AccessibleVideoPlayerProps {
  videoUrl: string;
  captions?: Caption[];
  transcript?: string;
  poster?: string;
  title: string;
  description?: string;
  onProgress?: (progress: { currentTime: number; duration: number }) => void;
  onEnd?: () => void;
}

export function AccessibleVideoPlayer({
  videoUrl,
  captions = [],
  transcript,
  poster,
  title,
  description,
  onProgress,
  onEnd,
}: AccessibleVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const { announce } = useAccessibility();
  
  const [paused, setPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedCaptions, setSelectedCaptions] = useState<string | null>(
    captions.length > 0 ? captions[0].language : null
  );
  const [showTranscript, setShowTranscript] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);

  // Announce video state changes to screen readers
  useEffect(() => {
    if (!paused) {
      announce(`${title} playing`, 'polite');
    } else if (currentTime > 0) {
      announce(`${title} paused`, 'polite');
    }
  }, [paused, title, announce]);

  const handlePlayPause = () => {
    setPaused(!paused);
    announce(paused ? 'Playing' : 'Paused', 'assertive');
  };

  const handleProgress = (data: { currentTime: number; playableDuration: number }) => {
    setCurrentTime(data.currentTime);
    onProgress?.({ currentTime: data.currentTime, duration });
  };

  const handleLoad = (data: { duration: number }) => {
    setDuration(data.duration);
    setIsLoading(false);
    announce(`Video loaded. Duration: ${formatTime(data.duration)}`, 'polite');
  };

  const handleEnd = () => {
    setPaused(true);
    announce('Video ended', 'polite');
    onEnd?.();
  };

  const toggleCaptions = () => {
    if (!selectedCaptions && captions.length > 0) {
      setSelectedCaptions(captions[0].language);
      announce('Captions enabled', 'assertive');
    } else {
      setSelectedCaptions(null);
      announce('Captions disabled', 'assertive');
    }
  };

  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
    announce(showTranscript ? 'Transcript hidden' : 'Transcript shown', 'assertive');
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    announce(`Playback speed: ${nextSpeed}x`, 'assertive');
  };

  const seekTo = (seconds: number) => {
    videoRef.current?.seek(currentTime + seconds);
    announce(`Skipped ${seconds > 0 ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds`, 'assertive');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Video Title */}
      <View style={styles.header}>
        <Text
          style={styles.title}
          accessibilityRole="header"
          accessibilityLevel={2}
        >
          {title}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUrl }}
          poster={poster}
          paused={paused}
          rate={playbackSpeed}
          resizeMode="contain"
          onProgress={handleProgress}
          onLoad={handleLoad}
          onEnd={handleEnd}
          onError={(error) => {
            logger.error('Video error:', error);
            announce('Video failed to load', 'assertive');
          }}
          textTracks={captions.map(caption => ({
            title: caption.label,
            language: caption.language,
            type: 'text/vtt',
            uri: caption.url,
          }))}
          selectedTextTrack={
            selectedCaptions
              ? { type: 'language', value: selectedCaptions }
              : { type: 'disabled' }
          }
          style={styles.video}
          accessible={true}
          accessibilityLabel={`Video player: ${title}`}
          accessibilityHint="Double tap to play or pause"
          accessibilityRole="video"
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary[500]} />
            <Text style={styles.loadingText} accessibilityLiveRegion="polite">
              Loading video...
            </Text>
          </View>
        )}

        {/* Play/Pause overlay button */}
        <TouchableOpacity
          style={styles.playPauseOverlay}
          onPress={handlePlayPause}
          accessible={true}
          accessibilityLabel={paused ? 'Play video' : 'Pause video'}
          accessibilityRole="button"
        >
          <Text style={styles.playPauseIcon}>
            {paused ? '▶' : '⏸'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { width: `${(currentTime / duration) * 100}%` }]}
            accessible={false}
          />
          <Text
            style={styles.timeText}
            accessibilityLabel={`${formatTime(currentTime)} of ${formatTime(duration)}`}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>

        {/* Control buttons */}
        <View style={styles.controlButtons}>
          {/* Rewind 10s */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekTo(-10)}
            accessible={true}
            accessibilityLabel="Rewind 10 seconds"
            accessibilityRole="button"
          >
            <Text style={styles.controlButtonText}>⏪ 10s</Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={[styles.controlButton, styles.primaryButton]}
            onPress={handlePlayPause}
            accessible={true}
            accessibilityLabel={paused ? 'Play' : 'Pause'}
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>
              {paused ? '▶ Play' : '⏸ Pause'}
            </Text>
          </TouchableOpacity>

          {/* Forward 10s */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekTo(10)}
            accessible={true}
            accessibilityLabel="Forward 10 seconds"
            accessibilityRole="button"
          >
            <Text style={styles.controlButtonText}>10s ⏩</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary controls */}
        <View style={styles.secondaryControls}>
          {/* Captions toggle */}
          {captions.length > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={toggleCaptions}
              accessible={true}
              accessibilityLabel={selectedCaptions ? 'Disable captions' : 'Enable captions'}
              accessibilityRole="button"
              accessibilityState={{ selected: !!selectedCaptions }}
            >
              <Text style={styles.secondaryButtonText}>
                CC {selectedCaptions ? 'On' : 'Off'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Playback speed */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={changePlaybackSpeed}
            accessible={true}
            accessibilityLabel={`Playback speed: ${playbackSpeed}x`}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          {/* Transcript toggle */}
          {transcript && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={toggleTranscript}
              accessible={true}
              accessibilityLabel={showTranscript ? 'Hide transcript' : 'Show transcript'}
              accessibilityRole="button"
              accessibilityState={{ selected: showTranscript }}
            >
              <Text style={styles.secondaryButtonText}>
                📄 Transcript
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Transcript panel */}
      {showTranscript && transcript && (
        <View
          style={styles.transcriptPanel}
          accessible={true}
          accessibilityLabel="Video transcript"
          accessibilityRole="text"
        >
          <Text style={styles.transcriptTitle}>Transcript</Text>
          <Text style={styles.transcriptText}>{transcript}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    padding: spacing.md,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.styles.body2,
    color: colors.text.secondary,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.neutral[900],
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: colors.neutral[0],
    marginTop: spacing.md,
    ...typography.styles.body1,
  },
  playPauseOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 24,
    color: colors.neutral[0],
  },
  controls: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
  },
  progressContainer: {
    position: 'relative',
    height: 4,
    backgroundColor: colors.neutral[300],
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  timeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  controlButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.neutral[200],
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.lg,
  },
  controlButtonText: {
    ...typography.styles.button,
    color: colors.text.primary,
  },
  primaryButtonText: {
    ...typography.styles.button,
    color: colors.neutral[0],
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  secondaryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.neutral[100],
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  transcriptPanel: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  transcriptTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  transcriptText: {
    ...typography.styles.body2,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
});

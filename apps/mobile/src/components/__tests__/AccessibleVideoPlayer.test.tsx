import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock react-native-video with manual mock
jest.mock(
  'react-native-video',
  () => {
    const mockVideo = (props: any, ref: any) => {
      const React = require('react');
      const { View } = require('react-native');
      return React.createElement(View, {
        ...props,
        ref,
        testID: 'video-component',
      });
    };
    return mockVideo;
  },
  { virtual: true },
);

// Mock design system tokens
jest.mock('@travelmatch/design-system/tokens', () => ({
  colors: {
    primary: { 500: '#007AFF', main: '#007AFF' },
    neutral: {
      0: '#FFFFFF',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      900: '#171717',
    },
    text: { primary: '#000000', secondary: '#666666' },
    background: { secondary: '#F5F5F5', primary: '#FFFFFF' },
    border: { light: '#E5E5E5', primary: '#E5E5E5' },
    status: { error: '#EF4444' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    styles: {
      h1: {
        fontSize: 48,
        fontWeight: '700',
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: 36,
        fontWeight: '700',
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h3: {
        fontSize: 30,
        fontWeight: '600',
        lineHeight: 1.3,
        letterSpacing: 0,
      },
      h4: {
        fontSize: 24,
        fontWeight: '600',
        lineHeight: 1.4,
        letterSpacing: 0,
      },
      h5: {
        fontSize: 20,
        fontWeight: '600',
        lineHeight: 1.4,
        letterSpacing: 0,
      },
      h6: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      body1: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      body2: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      button: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 1.5,
        letterSpacing: 0.5,
      },
      caption: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 1.5,
        letterSpacing: 0.5,
      },
    },
    fontSize: { base: 16, sm: 14, lg: 18 },
    lineHeight: { relaxed: 1.6, normal: 1.5 },
    fontWeight: { regular: '400', semibold: '600', bold: '700' },
  },
}));

import { AccessibleVideoPlayer } from '../AccessibleVideoPlayer';

// Mock dependencies
const mockAnnounce = jest.fn();
jest.mock('@/hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announce: mockAnnounce,
  }),
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('AccessibleVideoPlayer', () => {
  const mockCaptions = [
    { url: 'https://example.com/en.vtt', language: 'en', label: 'English' },
    { url: 'https://example.com/es.vtt', language: 'es', label: 'Spanish' },
  ];

  const defaultProps = {
    videoUrl: 'https://example.com/video.mp4',
    title: 'Sample Video',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders video player with title', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      expect(getByText('Sample Video')).toBeTruthy();
    });

    it('renders video component', () => {
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(getByTestId('video-component')).toBeTruthy();
    });

    it('renders description when provided', () => {
      const { getByText } = render(
        <AccessibleVideoPlayer
          {...defaultProps}
          description="Test description"
        />,
      );

      expect(getByText('Test description')).toBeTruthy();
    });

    it('renders loading indicator initially', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      expect(getByText('Loading video...')).toBeTruthy();
    });

    it('renders play/pause overlay button', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(getByLabelText('Play video')).toBeTruthy();
    });

    it('renders progress bar and time display', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      expect(getByText(/0:00 \/ 0:00/)).toBeTruthy();
    });

    it('renders control buttons', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(getByLabelText('Rewind 10 seconds')).toBeTruthy();
      expect(getByLabelText('Play')).toBeTruthy();
      expect(getByLabelText('Forward 10 seconds')).toBeTruthy();
    });

    it('does not render caption button when no captions provided', () => {
      const { queryByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(queryByText(/CC/)).toBeNull();
    });

    it('renders caption button when captions provided', () => {
      const { getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      expect(getByText('CC Off')).toBeTruthy();
    });

    it('does not render transcript button when no transcript provided', () => {
      const { queryByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(queryByText(/Transcript/)).toBeNull();
    });

    it('renders transcript button when transcript provided', () => {
      const { getByText } = render(
        <AccessibleVideoPlayer
          {...defaultProps}
          transcript="Test transcript"
        />,
      );

      expect(getByText('📄 Transcript')).toBeTruthy();
    });

    it('renders playback speed button', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      expect(getByText('1x')).toBeTruthy();
    });
  });

  describe('Play/Pause Functionality', () => {
    it('starts paused', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(getByLabelText('Play video')).toBeTruthy();
    });

    it('toggles play/pause when overlay button pressed', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const overlayButton = getByLabelText('Play video');
      fireEvent.press(overlayButton);

      expect(getByLabelText('Pause video')).toBeTruthy();
    });

    it('toggles play/pause when control button pressed', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const controlButton = getByLabelText('Play');
      fireEvent.press(controlButton);

      expect(getByLabelText('Pause')).toBeTruthy();
    });

    it('announces play state change', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      fireEvent.press(getByLabelText('Play'));

      expect(mockAnnounce).toHaveBeenCalledWith('Playing', 'assertive');
    });

    it('announces pause state change', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const playButton = getByLabelText('Play');
      fireEvent.press(playButton);
      mockAnnounce.mockClear();

      fireEvent.press(getByLabelText('Pause'));

      expect(mockAnnounce).toHaveBeenCalledWith('Paused', 'assertive');
    });
  });

  describe('Caption Functionality', () => {
    it('starts with captions off', () => {
      const { getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      expect(getByText('CC Off')).toBeTruthy();
    });

    it('toggles captions on', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      fireEvent.press(getByLabelText('Enable captions'));

      expect(getByText('CC On')).toBeTruthy();
    });

    it('toggles captions off', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      fireEvent.press(getByLabelText('Enable captions'));
      fireEvent.press(getByLabelText('Disable captions'));

      expect(getByText('CC Off')).toBeTruthy();
    });

    it('announces caption state changes', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      fireEvent.press(getByLabelText('Enable captions'));

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Captions enabled',
        'assertive',
      );
    });

    it('selects first caption by default when enabling', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      fireEvent.press(getByLabelText('Enable captions'));

      // Caption should be enabled (first one selected)
      expect(getByLabelText('Disable captions')).toBeTruthy();
    });
  });

  describe('Playback Speed', () => {
    it('starts at 1x speed', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      expect(getByText('1x')).toBeTruthy();
    });

    it('cycles through speed options', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const speedButton = getByLabelText('Playback speed: 1x');

      fireEvent.press(speedButton);
      expect(getByText('1.25x')).toBeTruthy();

      fireEvent.press(getByLabelText('Playback speed: 1.25x'));
      expect(getByText('1.5x')).toBeTruthy();

      fireEvent.press(getByLabelText('Playback speed: 1.5x'));
      expect(getByText('2x')).toBeTruthy();

      fireEvent.press(getByLabelText('Playback speed: 2x'));
      expect(getByText('0.5x')).toBeTruthy();
    });

    it('announces speed changes', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      fireEvent.press(getByLabelText('Playback speed: 1x'));

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Playback speed: 1.25x',
        'assertive',
      );
    });
  });

  describe('Transcript Functionality', () => {
    it('transcript is hidden by default', () => {
      const { queryByText } = render(
        <AccessibleVideoPlayer
          {...defaultProps}
          transcript="Test transcript content"
        />,
      );

      expect(queryByText('Test transcript content')).toBeNull();
    });

    it('shows transcript when toggle pressed', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer
          {...defaultProps}
          transcript="Test transcript content"
        />,
      );

      fireEvent.press(getByLabelText('Show transcript'));

      expect(getByText('Test transcript content')).toBeTruthy();
    });

    it('hides transcript when toggle pressed again', () => {
      const { getByLabelText, queryByText } = render(
        <AccessibleVideoPlayer
          {...defaultProps}
          transcript="Test transcript content"
        />,
      );

      fireEvent.press(getByLabelText('Show transcript'));
      fireEvent.press(getByLabelText('Hide transcript'));

      expect(queryByText('Test transcript content')).toBeNull();
    });

    it('announces transcript visibility changes', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer
          {...defaultProps}
          transcript="Test transcript"
        />,
      );

      fireEvent.press(getByLabelText('Show transcript'));

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Transcript shown',
        'assertive',
      );
    });

    it('renders transcript title when shown', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} transcript="Test content" />,
      );

      fireEvent.press(getByLabelText('Show transcript'));

      expect(getByText('Transcript')).toBeTruthy();
    });
  });

  describe('Seek Controls', () => {
    it('renders rewind button', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(getByLabelText('Rewind 10 seconds')).toBeTruthy();
    });

    it('renders forward button', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      expect(getByLabelText('Forward 10 seconds')).toBeTruthy();
    });

    it('announces rewind action', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      fireEvent.press(getByLabelText('Rewind 10 seconds'));

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Skipped backward 10 seconds',
        'assertive',
      );
    });

    it('announces forward action', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      fireEvent.press(getByLabelText('Forward 10 seconds'));

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Skipped forward 10 seconds',
        'assertive',
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper role for video element', () => {
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');
      expect(video.props.accessibilityRole).toBe('video');
    });

    it('has proper label for video element', () => {
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');
      expect(video.props.accessibilityLabel).toBe('Video player: Sample Video');
    });

    it('has proper hint for video element', () => {
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');
      expect(video.props.accessibilityHint).toBe('Double tap to play or pause');
    });

    it('has proper role for title', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      const title = getByText('Sample Video');
      expect(title.props.accessibilityRole).toBe('header');
    });

    it('caption button has proper selected state', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={mockCaptions} />,
      );

      const button = getByLabelText('Enable captions');
      expect(button.props.accessibilityState).toMatchObject({
        selected: false,
      });

      fireEvent.press(button);

      const enabledButton = getByLabelText('Disable captions');
      expect(enabledButton.props.accessibilityState).toMatchObject({
        selected: true,
      });
    });

    it('transcript button has proper selected state', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} transcript="Test" />,
      );

      const button = getByLabelText('Show transcript');
      expect(button.props.accessibilityState).toMatchObject({
        selected: false,
      });

      fireEvent.press(button);

      const shownButton = getByLabelText('Hide transcript');
      expect(shownButton.props.accessibilityState).toMatchObject({
        selected: true,
      });
    });
  });

  describe('Callbacks', () => {
    it('calls onProgress callback', async () => {
      const mockOnProgress = jest.fn();
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} onProgress={mockOnProgress} />,
      );

      const video = getByTestId('video-component');

      // Simulate video load first
      fireEvent(video, 'load', { duration: 120 });

      // Simulate progress
      fireEvent(video, 'progress', { currentTime: 30, playableDuration: 60 });

      await waitFor(() => {
        expect(mockOnProgress).toHaveBeenCalledWith({
          currentTime: 30,
          duration: 120,
        });
      });
    });

    it('calls onEnd callback', () => {
      const mockOnEnd = jest.fn();
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} onEnd={mockOnEnd} />,
      );

      const video = getByTestId('video-component');
      fireEvent(video, 'end');

      expect(mockOnEnd).toHaveBeenCalled();
    });

    it('pauses video when onEnd is called', () => {
      const { getByTestId, getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      // Start playing
      fireEvent.press(getByLabelText('Play'));

      // End video
      const video = getByTestId('video-component');
      fireEvent(video, 'end');

      // Should be paused
      expect(getByLabelText('Play video')).toBeTruthy();
    });
  });

  describe('Video Loading', () => {
    it('shows loading indicator initially', () => {
      const { getByText } = render(<AccessibleVideoPlayer {...defaultProps} />);

      expect(getByText('Loading video...')).toBeTruthy();
    });

    it('hides loading indicator when video loads', async () => {
      const { getByTestId, queryByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');
      fireEvent(video, 'load', { duration: 120 });

      await waitFor(() => {
        expect(queryByText('Loading video...')).toBeNull();
      });
    });

    it('announces video duration when loaded', () => {
      const { getByTestId } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');
      fireEvent(video, 'load', { duration: 125 });

      expect(mockAnnounce).toHaveBeenCalledWith(
        'Video loaded. Duration: 2:05',
        'polite',
      );
    });
  });

  describe('Time Formatting', () => {
    it('formats time correctly', async () => {
      const { getByTestId, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');

      // Load video with duration
      fireEvent(video, 'load', { duration: 185 });

      await waitFor(() => {
        expect(getByText(/0:00 \/ 3:05/)).toBeTruthy();
      });
    });

    it('updates time display on progress', async () => {
      const { getByTestId, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      const video = getByTestId('video-component');

      fireEvent(video, 'load', { duration: 120 });
      fireEvent(video, 'progress', { currentTime: 65, playableDuration: 90 });

      await waitFor(() => {
        expect(getByText(/1:05 \/ 2:00/)).toBeTruthy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles missing title gracefully', () => {
      const { getByTestId } = render(
        <AccessibleVideoPlayer
          videoUrl="https://example.com/video.mp4"
          title=""
        />,
      );

      expect(getByTestId('video-component')).toBeTruthy();
    });

    it('handles empty captions array', () => {
      const { queryByText } = render(
        <AccessibleVideoPlayer {...defaultProps} captions={[]} />,
      );

      expect(queryByText(/CC/)).toBeNull();
    });

    it('handles empty transcript', () => {
      const { queryByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} transcript="" />,
      );

      // Empty transcript should not show transcript button
      expect(queryByLabelText('Show transcript')).toBeNull();
    });

    it('handles very long title', () => {
      const longTitle = 'A'.repeat(200);
      const { getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} title={longTitle} />,
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('handles very long transcript', () => {
      const longTranscript = 'Lorem ipsum dolor sit amet. '.repeat(100);
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} transcript={longTranscript} />,
      );

      fireEvent.press(getByLabelText('Show transcript'));

      expect(getByText(longTranscript)).toBeTruthy();
    });

    it('handles rapid play/pause toggles', () => {
      const { getByLabelText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      fireEvent.press(getByLabelText('Play'));
      fireEvent.press(getByLabelText('Pause'));
      fireEvent.press(getByLabelText('Play'));
      fireEvent.press(getByLabelText('Pause'));

      expect(getByLabelText('Play video')).toBeTruthy();
    });

    it('handles rapid speed changes', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      fireEvent.press(getByLabelText('Playback speed: 1x'));
      fireEvent.press(getByLabelText('Playback speed: 1.25x'));
      fireEvent.press(getByLabelText('Playback speed: 1.5x'));

      expect(getByText('2x')).toBeTruthy();
    });

    it('cycles speed back to start after maximum', () => {
      const { getByLabelText, getByText } = render(
        <AccessibleVideoPlayer {...defaultProps} />,
      );

      // Cycle through all speeds (1x → 1.25x → 1.5x → 2x → 0.5x → 0.75x → 1x)
      fireEvent.press(getByLabelText('Playback speed: 1x'));
      fireEvent.press(getByLabelText('Playback speed: 1.25x'));
      fireEvent.press(getByLabelText('Playback speed: 1.5x'));
      fireEvent.press(getByLabelText('Playback speed: 2x'));

      // Should cycle back to 0.5x
      expect(getByText('0.5x')).toBeTruthy();
    });
  });
});

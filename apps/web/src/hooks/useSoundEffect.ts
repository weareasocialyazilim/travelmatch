'use client';

import { useCallback, useRef } from 'react';

/**
 * useSoundEffect - Audio interaction hook
 *
 * Features:
 * - Plays subtle UI sounds on interactions
 * - Volume control
 * - Graceful error handling (no crash if audio blocked)
 * - Pooled audio instances for performance
 */

interface SoundOptions {
  volume?: number;
  playbackRate?: number;
}

// Sound file paths
const SOUNDS = {
  click: '/sounds/soft-click.mp3',
  pulse: '/sounds/pulse-low.mp3',
  success: '/sounds/success.mp3',
  hover: '/sounds/hover.mp3',
} as const;

type SoundType = keyof typeof SOUNDS;

export function useSoundEffect() {
  const audioPoolRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  const getAudio = useCallback((sound: SoundType): HTMLAudioElement | null => {
    if (typeof window === 'undefined') return null;

    const cached = audioPoolRef.current.get(sound);
    if (cached) {
      cached.currentTime = 0;
      return cached;
    }

    try {
      const audio = new Audio(SOUNDS[sound]);
      audioPoolRef.current.set(sound, audio);
      return audio;
    } catch {
      return null;
    }
  }, []);

  const play = useCallback(
    (sound: SoundType, options: SoundOptions = {}) => {
      const audio = getAudio(sound);
      if (!audio) return;

      audio.volume = options.volume ?? 0.15;
      audio.playbackRate = options.playbackRate ?? 1;

      audio.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    },
    [getAudio]
  );

  const playClick = useCallback(() => {
    play('click', { volume: 0.12 });
  }, [play]);

  const playPulse = useCallback(() => {
    play('pulse', { volume: 0.08 });
  }, [play]);

  const playSuccess = useCallback(() => {
    play('success', { volume: 0.15 });
  }, [play]);

  const playHover = useCallback(() => {
    play('hover', { volume: 0.05 });
  }, [play]);

  return {
    play,
    playClick,
    playPulse,
    playSuccess,
    playHover,
  };
}

export default useSoundEffect;

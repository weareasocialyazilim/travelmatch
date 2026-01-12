'use client';

export function useHapticInteraction() {
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 30,
        heavy: 60,
      };
      navigator.vibrate(patterns[intensity]);
    }
  };

  return { triggerHaptic };
}

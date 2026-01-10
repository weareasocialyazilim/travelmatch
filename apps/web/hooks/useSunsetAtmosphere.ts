'use client';

import { useEffect, useState, useCallback } from 'react';

// Time-based atmosphere phases
export type AtmospherePhase =
  | 'dawn' // 5-7 AM - Awakening
  | 'morning' // 7-12 PM - Energy
  | 'afternoon' // 12-16 PM - Peak
  | 'golden' // 16-18 PM - Golden Hour (Magic Time)
  | 'sunset' // 18-20 PM - Sacred Transition
  | 'dusk' // 20-22 PM - Calm
  | 'night'; // 22-5 AM - Sacred Moments Mode

interface AtmosphereColors {
  bg: string;
  bgSecondary: string;
  acid: string;
  neonPink: string;
  electricBlue: string;
  text: string;
  glow: string;
  glassOpacity: number;
}

interface AtmosphereConfig {
  phase: AtmospherePhase;
  colors: AtmosphereColors;
  particleSpeed: number;
  glowIntensity: number;
  isSacredMode: boolean;
}

// Color palettes for each phase
const ATMOSPHERE_PALETTES: Record<AtmospherePhase, AtmosphereColors> = {
  dawn: {
    bg: '#0a0a1a',
    bgSecondary: '#1a0a2a',
    acid: '#FFB800',
    neonPink: '#FF6B9D',
    electricBlue: '#6BB8FF',
    text: '#ffffff',
    glow: 'rgba(255, 184, 0, 0.3)',
    glassOpacity: 0.15,
  },
  morning: {
    bg: '#050505',
    bgSecondary: '#111111',
    acid: '#CCFF00',
    neonPink: '#FF0099',
    electricBlue: '#00F0FF',
    text: '#ffffff',
    glow: 'rgba(204, 255, 0, 0.25)',
    glassOpacity: 0.1,
  },
  afternoon: {
    bg: '#ffffff',
    bgSecondary: '#f5f5f5',
    acid: '#CCFF00',
    neonPink: '#FF0099',
    electricBlue: '#00B8FF',
    text: '#000000',
    glow: 'rgba(204, 255, 0, 0.4)',
    glassOpacity: 0.08,
  },
  golden: {
    bg: '#1a0f00',
    bgSecondary: '#2a1500',
    acid: '#FFB800',
    neonPink: '#FF6B4A',
    electricBlue: '#FFD700',
    text: '#ffffff',
    glow: 'rgba(255, 184, 0, 0.5)',
    glassOpacity: 0.2,
  },
  sunset: {
    bg: '#140008',
    bgSecondary: '#200010',
    acid: '#FF6B4A',
    neonPink: '#FF0066',
    electricBlue: '#FF9500',
    text: '#ffffff',
    glow: 'rgba(255, 0, 102, 0.4)',
    glassOpacity: 0.25,
  },
  dusk: {
    bg: '#0a0015',
    bgSecondary: '#150025',
    acid: '#9B6BFF',
    neonPink: '#FF0099',
    electricBlue: '#6B9BFF',
    text: '#ffffff',
    glow: 'rgba(155, 107, 255, 0.35)',
    glassOpacity: 0.2,
  },
  night: {
    bg: '#020202',
    bgSecondary: '#080808',
    acid: '#FF0099', // Neon Pink takes over at night
    neonPink: '#FF00FF',
    electricBlue: '#00F0FF',
    text: '#ffffff',
    glow: 'rgba(255, 0, 153, 0.4)',
    glassOpacity: 0.1,
  },
};

const getPhaseFromHour = (hour: number): AtmospherePhase => {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 16) return 'afternoon';
  if (hour >= 16 && hour < 18) return 'golden';
  if (hour >= 18 && hour < 20) return 'sunset';
  if (hour >= 20 && hour < 22) return 'dusk';
  return 'night';
};

export const useSunsetAtmosphere = (
  forcePhase?: AtmospherePhase,
): AtmosphereConfig => {
  const [config, setConfig] = useState<AtmosphereConfig>(() => {
    const initialPhase = forcePhase || 'morning';
    return {
      phase: initialPhase,
      colors: ATMOSPHERE_PALETTES[initialPhase],
      particleSpeed: 1,
      glowIntensity: 1,
      isSacredMode: false,
    };
  });

  const updateTheme = useCallback(() => {
    if (typeof window === 'undefined') return;

    const hour = new Date().getHours();
    const phase = forcePhase || getPhaseFromHour(hour);
    const colors = ATMOSPHERE_PALETTES[phase];
    const isSacredMode =
      phase === 'night' || phase === 'dusk' || phase === 'sunset';

    // Calculate dynamic values based on phase
    const particleSpeed =
      phase === 'golden' || phase === 'sunset'
        ? 0.7
        : phase === 'night'
          ? 0.4
          : phase === 'morning'
            ? 1.2
            : 1;

    const glowIntensity =
      phase === 'golden'
        ? 1.5
        : phase === 'sunset'
          ? 1.3
          : phase === 'night'
            ? 1.8
            : 1;

    // Apply CSS variables to document root
    const root = document.documentElement;
    root.style.setProperty('--bg', colors.bg);
    root.style.setProperty('--bg-secondary', colors.bgSecondary);
    root.style.setProperty('--acid', colors.acid);
    root.style.setProperty('--neon-pink', colors.neonPink);
    root.style.setProperty('--electric-blue', colors.electricBlue);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--glow', colors.glow);
    root.style.setProperty('--glass-opacity', colors.glassOpacity.toString());
    root.style.setProperty('--particle-speed', particleSpeed.toString());
    root.style.setProperty('--glow-intensity', glowIntensity.toString());

    // Add body class for phase-specific styles
    document.body.classList.remove(
      'phase-dawn',
      'phase-morning',
      'phase-afternoon',
      'phase-golden',
      'phase-sunset',
      'phase-dusk',
      'phase-night',
    );
    document.body.classList.add(`phase-${phase}`);

    if (isSacredMode) {
      document.body.classList.add('sacred-mode');
    } else {
      document.body.classList.remove('sacred-mode');
    }

    setConfig({
      phase,
      colors,
      particleSpeed,
      glowIntensity,
      isSacredMode,
    });
  }, [forcePhase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update every minute to catch phase changes
    const interval = setInterval(updateTheme, 60000);

    // Also update on visibility change (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateTheme();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [updateTheme]);

  return config;
};

// Hook for getting current atmosphere without applying it
export const useAtmosphereInfo = () => {
  const [info, setInfo] = useState<{ phase: AtmospherePhase; hour: number }>({
    phase: 'morning',
    hour: 12,
  });

  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      setInfo({
        phase: getPhaseFromHour(hour),
        hour,
      });
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return info;
};

// CSS-in-JS styles generator for atmosphere
export const getAtmosphereStyles = (phase: AtmospherePhase) => {
  const colors = ATMOSPHERE_PALETTES[phase];

  return {
    container: {
      backgroundColor: colors.bg,
      color: colors.text,
      transition: 'background-color 2s ease, color 2s ease',
    },
    glowEffect: {
      boxShadow: `0 0 60px ${colors.glow}`,
    },
    acidButton: {
      backgroundColor: colors.acid,
      color: phase === 'afternoon' ? '#000' : '#000',
    },
    glassPanel: {
      backgroundColor: `rgba(255, 255, 255, ${colors.glassOpacity})`,
      backdropFilter: 'blur(20px)',
    },
  };
};

export default useSunsetAtmosphere;

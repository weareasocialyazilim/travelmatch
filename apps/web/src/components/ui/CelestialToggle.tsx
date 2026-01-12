'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

/**
 * CelestialToggle - Theme Switcher (Dark/Light Mode)
 *
 * Smooth magnetic interaction with icon rotation animation.
 * Respects system theme preference on first load.
 * Stores preference in localStorage.
 */
export function CelestialToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const { playClick } = useSoundEffect();

  useEffect(() => {
    setMounted(true);
    // Check localStorage or system preference
    const savedTheme =
      (localStorage.getItem('theme') as 'dark' | 'light') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark');
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    playClick?.();
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) {
    return (
      <div className="w-12 h-12 rounded-full bg-glass border border-glass-border" />
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="group relative w-12 h-12 flex items-center justify-center rounded-full bg-glass border border-glass-border interactive overflow-hidden transition-all duration-300"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.4 }}
          >
            <Moon className="w-5 h-5 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.4 }}
          >
            <Sun className="w-5 h-5 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background glow effect on hover */}
      <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.button>
  );
}

export default CelestialToggle;

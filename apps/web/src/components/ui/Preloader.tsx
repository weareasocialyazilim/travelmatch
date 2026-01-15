'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Preloader - Protocol Initialization Screen
 *
 * Features:
 * - Terminal-style loading messages
 * - Nvidia system boot aesthetic
 * - Progress bar with glow
 * - Smooth exit animation
 */

const LOADING_STEPS = [
  'INITIALIZING LOVENDO PROTOCOL...',
  'SYNCING NEURAL NEXUS...',
  'ESTABLISHING ESCROW SHIELD...',
  'LOADING SACRED MOMENTS...',
  'CALIBRATING IDENTITY PULSE...',
  'SYSTEM READY.',
];

interface PreloaderProps {
  onComplete: () => void;
  minDuration?: number;
}

export function Preloader({ onComplete, minDuration = 3000 }: PreloaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const stepDuration = minDuration / LOADING_STEPS.length;

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    // Progress bar (smoother)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const elapsed = Date.now() - startTime;
        const target = Math.min((elapsed / minDuration) * 100, 100);

        if (target >= 100) {
          clearInterval(progressInterval);
          setIsExiting(true);
          setTimeout(onComplete, 800);
          return 100;
        }

        // Smooth lerp towards target
        return prev + (target - prev) * 0.1;
      });
    }, 16);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete, minDuration]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center p-6"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <span className="font-clash text-2xl font-bold text-primary uppercase italic tracking-tight">
              Lovendo
            </span>
          </motion.div>

          <div className="w-full max-w-md">
            {/* Terminal Text */}
            <div className="mb-8 h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-primary font-mono text-sm">{'>'}</span>
                  <span className="font-mono text-[11px] text-primary/80 tracking-[0.15em] uppercase">
                    {LOADING_STEPS[currentStep]}
                  </span>
                  {currentStep < LOADING_STEPS.length - 1 && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-primary font-mono"
                    >
                      _
                    </motion.span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Bar - Nvidia Style */}
            <div className="relative w-full h-[2px] bg-border overflow-hidden rounded-full">
              <motion.div
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Glow effect */}
              <motion.div
                className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"
                style={{ left: `${progress - 4}%` }}
              />
            </div>

            {/* Progress Info */}
            <div className="mt-4 flex justify-between items-center font-mono text-[9px] text-muted tracking-widest uppercase">
              <span>Protocol v0.1.0-alpha</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-8 text-[8px] font-mono text-muted/50 uppercase tracking-wider"
          >
            Establishing secure connection...
          </motion.div>

          {/* Corner Decorations */}
          <div className="absolute top-8 left-8 w-12 h-12 border-l border-t border-border/30" />
          <div className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-border/30" />

          {/* Noise Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Preloader;

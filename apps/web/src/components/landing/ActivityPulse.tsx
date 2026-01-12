'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const MOCK_ACTIVITIES = [
  'New Ritual started in Bali',
  'Identity Pulse verified for @genz_nomad',
  'Sacred Gift unlocked: $250',
  'Match established in Tokyo',
  'Moment exchange initiated',
  'Real humans connecting...',
];

/**
 * ActivityPulse - Live Social Feed Simulation
 *
 * Shows mock activity stream like Nvidia system logs but with GenZ warmth.
 * Cycles through activities with smooth fade + slide animations.
 * Desktop-only (lg breakpoint) to maintain mobile performance.
 */
export function ActivityPulse() {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % MOCK_ACTIVITIES.length),
      4000,
    );
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-32 right-10 z-[40] hidden lg:block pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-xl border border-white/5 px-4 py-2 rounded-full"
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none whitespace-nowrap">
            {MOCK_ACTIVITIES[index]}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ActivityPulse;

'use client';

/**
 * VelvetExperience - Content Wrapper with Elegant Skew
 *
 * Simple scroll-based skew effect for premium feel.
 * No duplicate 3D effects - Scene3D handles the background.
 */

import { ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface VelvetExperienceProps {
  children: ReactNode;
}

export function VelvetExperience({ children }: VelvetExperienceProps) {
  const { scrollYProgress } = useScroll();

  // Subtle skew effect on scroll (-1.5 degrees max - elegant, not distracting)
  const contentSkew = useTransform(scrollYProgress, [0, 0.2], [0, -1.5]);

  return (
    <motion.div
      style={{ skewY: contentSkew }}
      className="relative will-change-transform"
    >
      {children}
    </motion.div>
  );
}

// Additional exports for backwards compatibility
export const LiquidSection = ({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) => (
  <section id={id} className={`relative ${className}`}>{children}</section>
);

export const GravityContent = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`relative ${className}`}>{children}</div>
);

export const LiquidTransitionDivider = () => (
  <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
);

export default VelvetExperience;

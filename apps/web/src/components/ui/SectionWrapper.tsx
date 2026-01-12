'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * SectionWrapper - Editorial Scrollytelling Component
 *
 * Creates silky transitions between sections as if turning magazine pages.
 * Blur + opacity + scale animation with cubic-bezier easing for premium feel.
 */
export function SectionWrapper({
  children,
  className = '',
}: SectionWrapperProps) {
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className={`relative min-h-screen w-full flex items-center justify-center overflow-hidden py-20 ${className}`}
    >
      {children}
    </motion.section>
  );
}

export default SectionWrapper;

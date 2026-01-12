'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import React from 'react';

/**
 * LiquidCard - Mouse-tracking glow effect card
 *
 * Features:
 * - Radial gradient follows mouse position
 * - Subtle 3D tilt effect
 * - Premium glassmorphism
 * - Animated underline on hover
 */

interface LiquidCardProps {
  title: string;
  category: string;
  image?: string;
  className?: string;
  index?: number;
}

export function LiquidCard({
  title,
  category,
  image,
  className = '',
  index = 0,
}: LiquidCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
      className={`group relative overflow-hidden rounded-3xl border border-border
                  bg-card backdrop-blur-xl transition-all duration-500
                  hover:border-border-hover ${className}`}
    >
      {/* Liquid Glow Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              500px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 255, 136, 0.12),
              transparent 60%
            )
          `,
        }}
      />

      {/* Secondary glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              300px circle at ${mouseX}px ${mouseY}px,
              rgba(139, 92, 246, 0.08),
              transparent 50%
            )
          `,
        }}
      />

      {/* Background Image (if provided) */}
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 transition-opacity duration-500 group-hover:opacity-30"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}

      {/* Content */}
      <div className="relative h-full w-full p-8 flex flex-col justify-end min-h-[280px]">
        {/* Category Badge */}
        <span
          className="mb-3 w-fit px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5
                     text-[10px] font-bold uppercase tracking-[0.15em] text-primary
                     transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/30"
        >
          {category}
        </span>

        {/* Title - Clash Display Style */}
        <h3
          className="font-clash text-2xl md:text-3xl font-bold text-foreground uppercase italic
                     leading-tight tracking-tight transition-transform duration-500
                     group-hover:translate-x-2"
        >
          {title}
        </h3>

        {/* Animated Underline */}
        <div
          className="mt-5 h-px w-0 bg-gradient-to-r from-primary via-secondary to-transparent
                     transition-all duration-700 group-hover:w-full"
        />

        {/* Arrow Icon */}
        <div
          className="absolute top-6 right-6 w-10 h-10 rounded-full border border-border
                     flex items-center justify-center opacity-0 translate-x-4
                     transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0"
        >
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      </div>

      {/* Corner Decoration - Tesla/Nvidia Minimalism */}
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
        <div className="w-20 h-20 border-t border-r border-foreground rounded-tr-2xl" />
      </div>
    </motion.div>
  );
}

export default LiquidCard;

/**
 * TrustBadgeDisplay Component
 *
 * Web component for displaying trust badges on landing page.
 * Shows trust level with visual indicators.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';

type TrustLevel = 'platinum' | 'gold' | 'silver' | 'bronze';

interface TrustBadgeDisplayProps {
  level: TrustLevel;
  score: number;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

const levelConfig = {
  platinum: {
    gradient: 'from-gray-200 via-gray-100 to-gray-300',
    glow: 'shadow-gray-300/50',
    icon: '👑',
    label: 'Trusted Traveler',
    minScore: 90,
  },
  gold: {
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    glow: 'shadow-amber-400/50',
    icon: '⭐',
    label: 'Reliable',
    minScore: 70,
  },
  silver: {
    gradient: 'from-slate-300 via-slate-200 to-slate-400',
    glow: 'shadow-slate-400/50',
    icon: '🛡️',
    label: 'Building Trust',
    minScore: 50,
  },
  bronze: {
    gradient: 'from-orange-400 via-orange-300 to-orange-500',
    glow: 'shadow-orange-400/50',
    icon: '🌱',
    label: 'New Member',
    minScore: 0,
  },
};

const sizeConfig = {
  sm: {
    container: 'w-16 h-16',
    icon: 'text-xl',
    score: 'text-xs',
    label: 'text-xs',
  },
  md: {
    container: 'w-24 h-24',
    icon: 'text-2xl',
    score: 'text-sm',
    label: 'text-sm',
  },
  lg: {
    container: 'w-32 h-32',
    icon: 'text-4xl',
    score: 'text-lg',
    label: 'text-base',
  },
};

export function TrustBadgeDisplay({
  level,
  score,
  userName,
  size = 'md',
  showLabel = true,
  animated = true,
}: TrustBadgeDisplayProps) {
  const config = levelConfig[level];
  const sizes = sizeConfig[size];

  const BadgeContent = (
    <>
      {/* Glow effect */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} blur-xl opacity-50`}
      />

      {/* Badge circle */}
      <div
        className={`relative ${sizes.container} rounded-full bg-gradient-to-br ${config.gradient} shadow-lg ${config.glow} flex items-center justify-center`}
      >
        {/* Inner circle */}
        <div className="absolute inset-2 rounded-full bg-white/90 flex flex-col items-center justify-center">
          <span className={sizes.icon}>{config.icon}</span>
          <span className={`font-bold text-gray-800 ${sizes.score}`}>
            {score}
          </span>
        </div>

        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/30"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-white"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: score / 100 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              strokeDasharray: '1',
              strokeDashoffset: '0',
            }}
          />
        </svg>
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center">
      {/* Badge */}
      {animated ? (
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
        >
          {BadgeContent}
        </motion.div>
      ) : (
        <div className="relative">{BadgeContent}</div>
      )}

      {/* Label */}
      {showLabel && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-center"
        >
          {userName && (
            <p className="font-semibold text-gray-900">{userName}</p>
          )}
          <p className={`text-gray-600 ${sizes.label}`}>{config.label}</p>
        </motion.div>
      )}
    </div>
  );
}

/**
 * TrustBadgeRow Component
 *
 * Shows multiple trust badges in a row (for marketing/showcase).
 */

interface TrustBadgeRowProps {
  badges: Array<{
    level: TrustLevel;
    score: number;
    userName: string;
  }>;
}

export function TrustBadgeRow({ badges }: TrustBadgeRowProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <TrustBadgeDisplay
            level={badge.level}
            score={badge.score}
            userName={badge.userName}
            size="md"
          />
        </motion.div>
      ))}
    </div>
  );
}

export default TrustBadgeDisplay;

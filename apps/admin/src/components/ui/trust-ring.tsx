'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const sizeMap = {
  sm: { container: 44, avatar: 36, stroke: 3, fontSize: 'text-xs' },
  md: { container: 64, avatar: 52, stroke: 4, fontSize: 'text-sm' },
  lg: { container: 88, avatar: 72, stroke: 5, fontSize: 'text-base' },
  xl: { container: 120, avatar: 100, stroke: 6, fontSize: 'text-lg' },
} as const;

type TrustLevel = 'platinum' | 'gold' | 'silver' | 'bronze';

interface TrustLevelConfig {
  label: string;
  minScore: number;
  gradientStart: string;
  gradientEnd: string;
}

const trustLevels: Record<TrustLevel, TrustLevelConfig> = {
  platinum: {
    label: 'Platinum',
    minScore: 90,
    gradientStart: '#D6D3D1',
    gradientEnd: '#A8A29E',
  },
  gold: {
    label: 'Gold',
    minScore: 70,
    gradientStart: '#FBBF24',
    gradientEnd: '#F59E0B',
  },
  silver: {
    label: 'Silver',
    minScore: 50,
    gradientStart: '#A8A29E',
    gradientEnd: '#78716C',
  },
  bronze: {
    label: 'Bronze',
    minScore: 0,
    gradientStart: '#D97706',
    gradientEnd: '#B45309',
  },
};

const getTrustLevel = (score: number): TrustLevelConfig => {
  if (score >= 90) return trustLevels.platinum;
  if (score >= 70) return trustLevels.gold;
  if (score >= 50) return trustLevels.silver;
  return trustLevels.bronze;
};

export interface TrustRingProps {
  score: number;
  size?: keyof typeof sizeMap;
  showScore?: boolean;
  showLabel?: boolean;
  avatarUrl?: string;
  avatarFallback?: string;
  animated?: boolean;
  className?: string;
}

const TrustRing = React.forwardRef<HTMLDivElement, TrustRingProps>(
  (
    {
      score,
      size = 'md',
      showScore = false,
      showLabel = false,
      avatarUrl,
      avatarFallback = '?',
      animated = true,
      className,
    },
    ref,
  ) => {
    const { container, avatar, stroke, fontSize } = sizeMap[size];
    const trustLevel = getTrustLevel(score);
    const radius = (container - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (Math.min(score, 100) / 100) * circumference;
    const gradientId = React.useId();

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex flex-col items-center justify-center',
          className,
        )}
      >
        {/* Ring Container */}
        <div
          className="relative inline-flex items-center justify-center"
          style={{ width: container, height: container }}
        >
          {/* SVG Ring */}
          <svg
            className="absolute inset-0 -rotate-90"
            width={container}
            height={container}
          >
            {/* Background circle */}
            <circle
              cx={container / 2}
              cy={container / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={stroke}
              className="text-stone-200 dark:text-stone-700"
            />
            {/* Progress circle */}
            <circle
              cx={container / 2}
              cy={container / 2}
              r={radius}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className={cn(
                animated && 'transition-all duration-1000 ease-out',
              )}
            />
            <defs>
              <linearGradient
                id={gradientId}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User avatar"
              className="rounded-full object-cover"
              style={{ width: avatar, height: avatar }}
            />
          ) : (
            <div
              className="rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center font-semibold text-stone-500"
              style={{ width: avatar, height: avatar }}
            >
              <span className={fontSize}>{avatarFallback}</span>
            </div>
          )}

          {/* Score badge */}
          {showScore && (
            <div
              className={cn(
                'absolute -bottom-1 -right-1 bg-trust text-white font-bold rounded-full min-w-[28px] text-center flex items-center justify-center',
                size === 'sm' && 'px-1.5 py-0.5 text-[10px] min-w-[22px]',
                size === 'md' && 'px-2 py-0.5 text-xs',
                size === 'lg' && 'px-2.5 py-1 text-sm',
                size === 'xl' && 'px-3 py-1 text-base',
              )}
            >
              {score}
            </div>
          )}
        </div>

        {/* Trust Level Label */}
        {showLabel && (
          <span
            className={cn(
              'mt-2 font-medium',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              size === 'lg' && 'text-base',
              size === 'xl' && 'text-lg',
            )}
            style={{
              background: `linear-gradient(to right, ${trustLevel.gradientStart}, ${trustLevel.gradientEnd})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {trustLevel.label}
          </span>
        )}
      </div>
    );
  },
);
TrustRing.displayName = 'TrustRing';

export { TrustRing, getTrustLevel, trustLevels };

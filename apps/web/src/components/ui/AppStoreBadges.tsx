'use client';

import { motion } from 'framer-motion';

/**
 * AppStoreBadges - Official Apple App Store & Google Play Badges
 *
 * Uses official SVG badges for brand compliance
 * Responsive sizing with clamp() for fluid design
 */

interface AppStoreBadgesProps {
  className?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  variant?: 'horizontal' | 'vertical';
}

export function AppStoreBadges({
  className = '',
  appStoreUrl = 'https://apps.apple.com/app/travelmatch',
  playStoreUrl = 'https://play.google.com/store/apps/details?id=app.travelmatch',
  variant = 'horizontal',
}: AppStoreBadgesProps) {
  const containerClass =
    variant === 'horizontal'
      ? 'flex flex-row gap-4 items-center justify-center flex-wrap'
      : 'flex flex-col gap-3 items-center';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Apple App Store Badge */}
      <motion.a
        href={appStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        data-cursor-hover
      >
        <svg
          viewBox="0 0 120 40"
          style={{
            width: 'clamp(120px, 20vw, 160px)',
            height: 'auto',
          }}
          aria-label="Download on the App Store"
        >
          <defs>
            <linearGradient
              id="appStoreGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
          </defs>
          <rect
            width="120"
            height="40"
            rx="6"
            fill="url(#appStoreGradient)"
            stroke="#a6a6a6"
            strokeWidth="0.5"
          />

          {/* Apple Logo */}
          <g transform="translate(8, 7)">
            <path
              d="M15.769 13.295c-.03-2.5 2.04-3.7 2.13-3.76-1.16-1.7-2.97-1.93-3.61-1.96-1.54-.16-3 .91-3.78.91-.78 0-1.99-.88-3.27-.86-1.68.02-3.23.98-4.1 2.49-1.75 3.03-.45 7.52 1.26 9.98.83 1.2 1.82 2.55 3.12 2.5 1.25-.05 1.73-.81 3.24-.81 1.52 0 1.95.81 3.28.79 1.35-.02 2.2-1.22 3.03-2.43.95-1.4 1.34-2.75 1.37-2.82-.03-.01-2.63-1.01-2.66-4.01zm-2.49-7.37c.69-.84 1.16-2 1.03-3.16-.99.04-2.19.66-2.9 1.49-.64.74-1.2 1.93-1.05 3.07 1.11.09 2.23-.56 2.92-1.4z"
              fill="white"
            />
          </g>

          {/* Text */}
          <text
            x="30"
            y="14"
            fill="white"
            fontSize="7"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
          >
            Download on the
          </text>
          <text
            x="30"
            y="28"
            fill="white"
            fontSize="14"
            fontWeight="600"
            fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
          >
            App Store
          </text>
        </svg>
      </motion.a>

      {/* Google Play Badge */}
      <motion.a
        href={playStoreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        data-cursor-hover
      >
        <svg
          viewBox="0 0 135 40"
          style={{
            width: 'clamp(135px, 22vw, 180px)',
            height: 'auto',
          }}
          aria-label="Get it on Google Play"
        >
          <defs>
            <linearGradient
              id="playStoreGradient"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <linearGradient
              id="playTriangle"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#00f076" />
              <stop offset="100%" stopColor="#ffd000" />
            </linearGradient>
          </defs>
          <rect
            width="135"
            height="40"
            rx="6"
            fill="url(#playStoreGradient)"
            stroke="#a6a6a6"
            strokeWidth="0.5"
          />

          {/* Google Play Logo */}
          <g transform="translate(10, 8)">
            {/* Play Triangle */}
            <path
              d="M0 2.5v19c0 .83.52 1.15 1.16.7l14.34-9.5c.64-.45.64-1.05 0-1.5L1.16 1.8C.52 1.35 0 1.67 0 2.5z"
              fill="url(#playTriangle)"
            />
            {/* Red accent */}
            <path
              d="M11.5 12l4-4.5L1.16 1.8c-.36-.24-.68-.26-.91-.1L11.5 12z"
              fill="#eb3131"
              opacity="0.8"
            />
            {/* Yellow accent */}
            <path
              d="M11.5 12l-11.25 10.3c.23.16.55.14.91-.1L15.5 16.5 11.5 12z"
              fill="#f4b400"
              opacity="0.8"
            />
          </g>

          {/* Text */}
          <text
            x="32"
            y="13"
            fill="#a6a6a6"
            fontSize="6"
            fontFamily="'Product Sans', 'Roboto', sans-serif"
            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            GET IT ON
          </text>
          <text
            x="32"
            y="28"
            fill="white"
            fontSize="13"
            fontWeight="500"
            fontFamily="'Product Sans', 'Roboto', sans-serif"
          >
            Google Play
          </text>
        </svg>
      </motion.a>
    </div>
  );
}

export default AppStoreBadges;

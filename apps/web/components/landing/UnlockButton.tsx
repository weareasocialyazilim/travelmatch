'use client';

/**
 * UnlockButton Component - Deep Link CTA Button
 *
 * The primary conversion button that:
 * 1. Copies moment code to clipboard
 * 2. Opens app store or app via deep link
 * 3. Tracks conversion events
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Unlock, Apple, Smartphone, Sparkles, Check } from 'lucide-react';

interface UnlockButtonProps {
  deepLink: string;
  text: string;
  city: string;
  intent: string;
  size?: 'default' | 'large';
}

// Detect device type
function getDeviceType(): 'ios' | 'android' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';

  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

// Store URLs
const STORE_URLS = {
  ios: 'https://apps.apple.com/app/travelmatch/id123456789',
  android: 'https://play.google.com/store/apps/details?id=com.travelmatch.app',
  desktop: 'https://travelmatch.app/download',
};

export function UnlockButton({
  deepLink,
  text,
  city,
  intent,
  size = 'default',
}: UnlockButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(async () => {
    const deviceType = getDeviceType();

    // Generate a unique moment code for attribution
    const momentCode = `TM-${city.toUpperCase().slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

    // Copy moment code to clipboard for app to read
    try {
      await navigator.clipboard.writeText(momentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access denied, continue anyway
    }

    // Track conversion event (would integrate with PostHog/Analytics)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as unknown as { gtag: (type: string, event: string, data: Record<string, unknown>) => void }).gtag('event', 'unlock_click', {
        city,
        intent,
        device: deviceType,
        moment_code: momentCode,
      });
    }

    // Try deep link first, then fallback to store
    if (deviceType !== 'desktop') {
      // Mobile: Try deep link, fallback to store after timeout
      const storeUrl = STORE_URLS[deviceType];
      const deepLinkUrl = `${deepLink}&code=${momentCode}`;

      // Create hidden iframe for deep link attempt
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = deepLinkUrl;
      document.body.appendChild(iframe);

      // Fallback to store after 1.5 seconds
      setTimeout(() => {
        document.body.removeChild(iframe);
        window.location.href = storeUrl;
      }, 1500);
    } else {
      // Desktop: Go to download page
      window.location.href = STORE_URLS.desktop;
    }
  }, [city, intent, deepLink]);

  const sizeClasses = size === 'large'
    ? 'px-12 py-5 text-lg gap-3'
    : 'px-8 py-4 text-base gap-2';

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600
        bg-[length:200%_100%]
        text-white font-black uppercase tracking-wider
        rounded-full
        shadow-2xl shadow-purple-500/30
        flex items-center justify-center
        ${sizeClasses}
        transition-all duration-300
        hover:shadow-purple-500/50
      `}
      style={{
        backgroundPosition: isHovered ? '100% 0' : '0% 0',
      }}
    >
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />

      {/* Icon */}
      {copied ? (
        <Check className="w-5 h-5" />
      ) : (
        <Unlock className="w-5 h-5" />
      )}

      {/* Text */}
      <span>{copied ? 'Kod Kopyalandı!' : text}</span>

      {/* Sparkle */}
      <Sparkles className="w-4 h-4 opacity-70" />
    </motion.button>
  );
}

// Store Badge Buttons (for download page)
export function StoreBadges() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <a
        href={STORE_URLS.ios}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
      >
        <Apple className="w-6 h-6" />
        <div className="text-left">
          <div className="text-[10px] opacity-70">Download on the</div>
          <div className="text-sm font-bold">App Store</div>
        </div>
      </a>

      <a
        href={STORE_URLS.android}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
      >
        <Smartphone className="w-6 h-6" />
        <div className="text-left">
          <div className="text-[10px] opacity-70">Get it on</div>
          <div className="text-sm font-bold">Google Play</div>
        </div>
      </a>
    </div>
  );
}

export default UnlockButton;

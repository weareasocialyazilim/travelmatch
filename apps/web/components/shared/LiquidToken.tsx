'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { Apple, Play, Sparkles, ArrowRight, Download } from 'lucide-react';

interface LiquidTokenProps {
  onInteract?: () => void;
  deepLink?: string;
  lang?: 'en' | 'tr';
}

const CONTENT = {
  en: {
    install: 'INSTALL',
    tryNow: 'TRY NOW',
    comingSoon: 'COMING SOON',
    appStore: 'App Store',
    playStore: 'Play Store',
    stash: 'THE STASH',
  },
  tr: {
    install: 'YUKLE',
    tryNow: 'DENE',
    comingSoon: 'YAKINDA',
    appStore: 'App Store',
    playStore: 'Play Store',
    stash: 'ZULA',
  },
};

export const LiquidToken = ({
  onInteract,
  deepLink = 'travelmatch://stash',
  lang = 'en',
}: LiquidTokenProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tokenRef = useRef<HTMLDivElement>(null);
  const content = CONTENT[lang];

  const { scrollYProgress } = useScroll();

  // Smooth spring animations
  const scale = useSpring(
    useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [1, 1.2, 1.1, 0.9]),
    { stiffness: 100, damping: 30 },
  );

  const rotate = useSpring(useTransform(scrollYProgress, [0, 1], [0, 360]), {
    stiffness: 50,
    damping: 30,
  });

  // Opacity transform for scroll fade effect
  useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 1, 1, 0.5]);

  // Haptic feedback for mobile browsers
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([10, 30, 10]);
    }
  }, []);

  const handleClick = useCallback(() => {
    triggerHaptic();
    setIsExpanded(!isExpanded);
    onInteract?.();
  }, [isExpanded, triggerHaptic, onInteract]);

  const handleStoreClick = useCallback(
    (store: 'apple' | 'google') => {
      triggerHaptic();

      // Deep linking attempt
      if (typeof window !== 'undefined') {
        // Try deep link first
        const timeout = setTimeout(() => {
          // Fallback to store
          window.location.href =
            store === 'apple'
              ? 'mailto:beta@travelmatch.app?subject=iOS Beta Request'
              : 'mailto:beta@travelmatch.app?subject=Android Beta Request';
        }, 500);

        window.location.href = deepLink;

        // Clear timeout if deep link works
        window.addEventListener('blur', () => clearTimeout(timeout), {
          once: true,
        });
      }
    },
    [deepLink, triggerHaptic],
  );

  // Floating animation based on scroll
  const [floatY, setFloatY] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.02;
      setFloatY(Math.sin(time) * 8);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <motion.div
      ref={tokenRef}
      className="fixed bottom-8 right-8 z-50 cursor-pointer"
      style={{
        scale,
        y: floatY,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, var(--acid) 0%, transparent 70%)',
          opacity: isHovered ? 0.8 : 0.4,
        }}
        animate={{
          scale: isHovered ? 1.5 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Ping animation */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-[var(--acid)]"
        animate={{
          scale: [1, 1.5],
          opacity: [0.5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />

      {/* Main token */}
      <motion.div
        className="relative w-20 h-20 bg-[var(--acid)] rounded-full flex items-center justify-center shadow-[0_0_40px_var(--glow)] border-4 border-black overflow-hidden"
        whileHover={{ scale: 1.15, rotate: 15 }}
        whileTap={{ scale: 0.95, rotate: -5 }}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ rotate }}
      >
        {/* Liquid animation inside */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, var(--neon-pink) 0%, transparent 50%)
            `,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Icon */}
        <motion.div
          className="relative z-10 flex flex-col items-center gap-0.5 text-black"
          animate={{
            y: isHovered ? -2 : 0,
          }}
        >
          {isExpanded ? (
            <Sparkles size={24} strokeWidth={3} />
          ) : (
            <>
              <Download size={22} strokeWidth={3} />
              <span className="text-[7px] font-black tracking-wider">
                GET APP
              </span>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Expanded menu */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute bottom-full right-0 mb-4 w-64"
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Glass card */}
            <div className="bg-black/90 backdrop-blur-xl border-4 border-white rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 bg-gradient-to-r from-[var(--acid)]/10 to-[var(--neon-pink)]/10">
                <h3 className="font-syne font-black text-white text-lg tracking-tight">
                  {content.stash}
                </h3>
                <p className="text-xs text-white/50 font-mono mt-1">
                  {content.tryNow}
                </p>
              </div>

              {/* Store buttons */}
              <div className="p-4 space-y-3">
                {/* App Store */}
                <motion.button
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--acid)] rounded-xl px-4 py-3 transition-all group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStoreClick('apple')}
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <Apple size={24} fill="black" strokeWidth={0} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold text-sm">
                      {content.appStore}
                    </div>
                    <div className="text-[var(--acid)] text-xs font-mono">
                      {content.comingSoon}
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-white/30 group-hover:text-[var(--acid)] transition-colors"
                  />
                </motion.button>

                {/* Play Store */}
                <motion.button
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--neon-pink)] rounded-xl px-4 py-3 transition-all group"
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStoreClick('google')}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 via-blue-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Play
                      size={20}
                      fill="white"
                      strokeWidth={0}
                      className="ml-0.5"
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-bold text-sm">
                      {content.playStore}
                    </div>
                    <div className="text-[var(--neon-pink)] text-xs font-mono">
                      {content.comingSoon}
                    </div>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-white/30 group-hover:text-[var(--neon-pink)] transition-colors"
                  />
                </motion.button>
              </div>

              {/* Footer note */}
              <div className="px-5 py-3 bg-[var(--acid)]/5 border-t border-white/5">
                <p className="text-[10px] text-white/30 font-mono text-center">
                  v1.0 BETA // INVITE ONLY
                </p>
              </div>
            </div>

            {/* Decorative arrow */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-black border-r-4 border-b-4 border-white rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close area when expanded */}
      {isExpanded && (
        <motion.div
          className="fixed inset-0 z-[-1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </motion.div>
  );
};

export default LiquidToken;

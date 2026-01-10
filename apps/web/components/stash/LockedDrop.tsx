'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Lock, Unlock, Zap, Clock, Sparkles } from 'lucide-react';

interface LockedDropProps {
  title: string;
  progress?: number;
  description?: string;
  releaseDate?: string;
  onUnlock?: () => void;
  variant?: 'default' | 'premium' | 'legendary';
  lang?: 'en' | 'tr';
}

const CONTENT = {
  en: {
    chargingReality: 'Charging Reality...',
    realityLeaked: 'REALITY LEAKED',
    scratchToReveal: 'SCRATCH TO REVEAL',
    unlocking: 'UNLOCKING...',
    comingSoon: 'COMING SOON',
    holdToCharge: 'HOLD TO CHARGE',
  },
  tr: {
    chargingReality: 'Gerçeklik Yükleniyor...',
    realityLeaked: 'GERÇEKLİK SIZDI',
    scratchToReveal: 'KAZIYARAK GÖSTER',
    unlocking: 'KİLİT AÇILIYOR...',
    comingSoon: 'ÇOK YAKINDA',
    holdToCharge: 'ŞARJ İÇİN BASILI TUT',
  },
};

export const LockedDrop = ({
  title,
  progress = 65,
  description,
  releaseDate,
  onUnlock,
  variant = 'default',
  lang = 'en',
}: LockedDropProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(progress);
  const [isRevealed, setIsRevealed] = useState(false);
  const content = CONTENT[lang];

  // Mouse position for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 150,
    damping: 20,
  });

  // Handle mouse movement for 3D effect
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY],
  );

  // Charging animation on hold
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isCharging && chargeLevel < 100) {
      interval = setInterval(() => {
        setChargeLevel((prev) => {
          const newLevel = prev + 0.5;
          if (newLevel >= 100) {
            setIsRevealed(true);
            onUnlock?.();
            return 100;
          }
          return newLevel;
        });
      }, 50);
    }

    return () => clearInterval(interval);
  }, [isCharging, chargeLevel, onUnlock]);

  // Variant-specific colors
  const variantColors = {
    default: {
      primary: 'var(--acid)',
      secondary: 'var(--neon-pink)',
      glow: '#CCFF00',
    },
    premium: {
      primary: 'var(--neon-pink)',
      secondary: 'var(--electric-blue)',
      glow: '#FF0099',
    },
    legendary: {
      primary: '#FFD700',
      secondary: '#FF6B00',
      glow: '#FFD700',
    },
  };

  const colors = variantColors[variant];

  return (
    <motion.div
      ref={containerRef}
      className="relative group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsCharging(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      onMouseDown={() => setIsCharging(true)}
      onMouseUp={() => setIsCharging(false)}
      onTouchStart={() => setIsCharging(true)}
      onTouchEnd={() => setIsCharging(false)}
      style={{
        cursor: isRevealed ? 'pointer' : 'crosshair',
      }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute -inset-4 rounded-3xl blur-3xl pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.glow} 0%, transparent 70%)`,
        }}
        animate={{
          opacity: isHovered ? 0.6 : 0.2,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main card with 3D transform */}
      <motion.div
        className="relative p-8 md:p-12 border-4 border-dashed border-white/20 rounded-2xl overflow-hidden backdrop-blur-sm"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          borderColor: isHovered
            ? colors.primary
            : isCharging
              ? colors.secondary
              : 'rgba(255, 255, 255, 0.2)',
          borderStyle: isRevealed ? 'solid' : 'dashed',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Background liquid fill animation */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${colors.primary}40, ${colors.primary}10, transparent)`,
          }}
          animate={{
            height: `${chargeLevel}%`,
          }}
          transition={{ duration: 0.1 }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(110deg, transparent 30%, ${colors.primary}20 50%, transparent 70%)`,
          }}
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Lock icon */}
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-white/20 mb-6"
            animate={{
              borderColor: isRevealed
                ? colors.primary
                : 'rgba(255, 255, 255, 0.2)',
              scale: isCharging ? 1.1 : 1,
            }}
          >
            {isRevealed ? (
              <Unlock size={28} className="text-[var(--acid)]" />
            ) : isCharging ? (
              <Zap
                size={28}
                className="text-[var(--neon-pink)] animate-pulse"
              />
            ) : (
              <Lock size={28} className="text-white/40" />
            )}
          </motion.div>

          {/* Title */}
          <motion.h3
            className="font-syne font-black text-3xl md:text-5xl mb-4 transition-all duration-500"
            style={{
              color: isRevealed
                ? colors.primary
                : isHovered
                  ? 'white'
                  : 'rgba(255, 255, 255, 0.3)',
              textShadow: isHovered ? `0 0 30px ${colors.glow}50` : 'none',
            }}
          >
            {title}
          </motion.h3>

          {/* Description */}
          {description && (
            <p className="text-white/40 font-grotesk text-sm max-w-xs mx-auto mb-4 group-hover:text-white/60 transition-colors">
              {description}
            </p>
          )}

          {/* Status text */}
          <motion.div className="flex items-center justify-center gap-2 mb-6">
            {isCharging ? (
              <motion.span
                className="font-mono text-xs tracking-[0.3em] text-[var(--neon-pink)]"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                {content.unlocking}
              </motion.span>
            ) : isRevealed ? (
              <span className="font-mono text-xs tracking-[0.3em] text-[var(--acid)] flex items-center gap-2">
                <Sparkles size={14} />
                {content.comingSoon}
              </span>
            ) : (
              <span className="font-mono text-xs tracking-[0.3em] text-gray-500 uppercase">
                {content.chargingReality}
              </span>
            )}
          </motion.div>

          {/* Progress bar */}
          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
              }}
              animate={{
                width: `${chargeLevel}%`,
              }}
              transition={{ duration: 0.1 }}
            />

            {/* Pulse effect on progress */}
            <motion.div
              className="absolute top-0 h-full w-8 rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
                left: `${chargeLevel - 4}%`,
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>

          {/* Progress percentage */}
          <div className="mt-4 flex items-center justify-between text-xs font-mono">
            <span className="text-white/40">{Math.round(chargeLevel)}%</span>
            <span style={{ color: colors.primary }}>
              {content.realityLeaked}
            </span>
          </div>

          {/* Release date */}
          {releaseDate && (
            <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs font-mono">
              <Clock size={12} />
              {releaseDate}
            </div>
          )}

          {/* Interaction hint */}
          {!isRevealed && (
            <motion.p
              className="mt-6 text-[10px] font-mono text-white/20 tracking-widest"
              animate={{
                opacity: isHovered ? 1 : 0,
              }}
            >
              {content.holdToCharge}
            </motion.p>
          )}
        </div>

        {/* Corner decorations */}
        <div
          className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 transition-colors duration-300"
          style={{
            borderColor: isHovered
              ? colors.primary
              : 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 transition-colors duration-300"
          style={{
            borderColor: isHovered
              ? colors.primary
              : 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 transition-colors duration-300"
          style={{
            borderColor: isHovered
              ? colors.primary
              : 'rgba(255, 255, 255, 0.1)',
          }}
        />
        <div
          className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 transition-colors duration-300"
          style={{
            borderColor: isHovered
              ? colors.primary
              : 'rgba(255, 255, 255, 0.1)',
          }}
        />
      </motion.div>

      {/* Variant badge */}
      {variant !== 'default' && (
        <motion.div
          className="absolute -top-3 -right-3 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest border-2 border-black"
          style={{
            backgroundColor: colors.primary,
            color: variant === 'legendary' ? 'black' : 'white',
          }}
          animate={{
            rotate: [0, 5, 0, -5, 0],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {variant === 'premium' ? 'PREMIUM' : 'LEGENDARY'}
        </motion.div>
      )}
    </motion.div>
  );
};

export default LockedDrop;

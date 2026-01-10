'use client';

/**
 * DisruptiveHero - Award-Winning Hero Section
 *
 * Features:
 * - Liquid Heartbeat Portal
 * - Romantic/Passionate copywriting
 * - 35mm film grain aesthetic
 * - Magnetic button interactions
 * - Scroll-responsive animations
 */

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Zap, Heart, Sparkles } from 'lucide-react';
import { LiquidMatchPortal } from './LiquidMatchPortal';

interface DisruptiveHeroProps {
  lang: 'tr' | 'en';
  onNotify?: (msg: string) => void;
}

const CONTENT = {
  tr: {
    badge: 'CANLI BETA V1.0 // DÜNYA ÇAPINDA',
    h1: 'ARAYIŞI BIRAK.',
    h1_sub: 'ARZUYLA TANIŞ.',
    subtitle: "Sıkıcı kaydırmalardan kurtul. TravelMatch'te niyetini bir jestle göster, elit dünyanın kapısını arala.",
    tagline: 'İlk adımın bir mesaj değil, unutulmaz bir hediye olsun.',
    cta: 'SIRAYI HACKLE',
    ctaSecondary: 'DEMOYU İZLE',
    protocol: 'PROTOKOL V1.0 // NİYET KANITI AKTİF',
  },
  en: {
    badge: 'LIVE BETA V1.0 // WORLDWIDE',
    h1: 'STOP SEARCHING.',
    h1_sub: 'FEEL THE CONNECTION.',
    subtitle: 'Skip the generic swiping. Prove your intent with a gesture, unlock elite access.',
    tagline: "Your first move shouldn't be a text—make it a gift.",
    cta: 'HACK THE QUEUE',
    ctaSecondary: 'WATCH DEMO',
    protocol: 'PROTOCOL V1.0 // PROOF OF INTENT ACTIVE',
  },
};

export function DisruptiveHero({ lang, onNotify }: DisruptiveHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = CONTENT[lang];

  // Scroll progress for parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const portalScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.6]);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black"
    >
      {/* Grain Overlay - 35mm Film Stock Aesthetic */}
      <div
        className="absolute inset-0 pointer-events-none z-50 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Background Gradient Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-black to-black" />

      {/* Ambient Light Blobs */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[120px]"
      />
      <motion.div
        animate={{
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]"
      />

      {/* The Liquid Match Portal - Centerpiece */}
      <motion.div
        style={{ scale: portalScale, opacity: portalOpacity }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px]">
          <LiquidMatchPortal className="w-full h-full" />
        </div>
      </motion.div>

      {/* Content Layer */}
      <motion.div
        style={{ y: textY }}
        className="relative z-20 text-center px-4 max-w-5xl mx-auto"
      >
        {/* Live Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full mb-10"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
          />
          <span className="font-mono text-sm font-bold tracking-widest text-white/70">
            {t.badge}
          </span>
        </motion.div>

        {/* Main Headline - Aggressive Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 50, letterSpacing: '0.2em' }}
          animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
          transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-syne font-black text-[12vw] md:text-[10vw] lg:text-[8vw] leading-[0.85] tracking-tighter mb-6"
        >
          <span className="block text-white italic">
            {t.h1}
          </span>
          <span className="block bg-gradient-to-r from-rose-400 via-amber-300 to-pink-400 bg-clip-text text-transparent italic">
            {t.h1_sub}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="font-grotesk text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-4 leading-relaxed"
        >
          {t.subtitle}
        </motion.p>

        {/* Tagline - Golden Accent */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="font-mono text-sm md:text-base text-amber-400/80 tracking-wide mb-12"
        >
          {t.tagline}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
          {/* Primary CTA - Magnetic Button */}
          <MagneticButton
            onClick={() => document.getElementById('stash')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="flex items-center gap-3">
              {t.cta} <Zap fill="currentColor" size={20} />
            </span>
          </MagneticButton>

          {/* Secondary CTA */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNotify?.('Coming Soon!')}
            className="flex items-center gap-3 px-8 py-4 rounded-full border border-white/20 text-white/70 font-syne font-bold hover:border-amber-400/50 hover:text-amber-400 transition-all"
          >
            <Heart size={18} /> {t.ctaSecondary}
          </motion.button>
        </motion.div>

        {/* Protocol Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 flex items-center justify-center gap-2"
        >
          <Sparkles size={14} className="text-amber-400/60" />
          <span className="font-mono text-xs text-white/30 tracking-[0.3em]">
            {t.protocol}
          </span>
          <Sparkles size={14} className="text-amber-400/60" />
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-7 h-12 border-2 border-white/20 rounded-full flex justify-center pt-2"
        >
          <motion.div
            animate={{ height: ['20%', '40%', '20%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 bg-gradient-to-b from-amber-400 to-rose-400 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Magnetic Button Component - Follows cursor
function MagneticButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Magnetic pull toward cursor
    x.set((e.clientX - centerX) * 0.3);
    y.set((e.clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.button
      ref={buttonRef}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="relative px-12 py-6 rounded-full font-syne font-black text-xl overflow-hidden group"
    >
      {/* Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-pink-500"
        animate={{
          backgroundPosition: isHovered ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%',
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Glow Effect */}
      <motion.div
        animate={{
          opacity: isHovered ? 0.8 : 0.4,
          scale: isHovered ? 1.2 : 1,
        }}
        className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-400 to-pink-500 blur-xl"
      />

      {/* Text */}
      <span className="relative z-10 text-black">{children}</span>

      {/* Border Glow */}
      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
        }}
        className="absolute inset-0 rounded-full border-2 border-white/50"
      />
    </motion.button>
  );
}

export default DisruptiveHero;

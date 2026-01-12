'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { GiftOrbScene } from '@/components/3d/GiftOrb';
import { MagneticButton, PremiumButton } from '@/components/ui/MagneticButton';

// Prevent Canvas from rendering on server (SSR fix for Hydration mismatch)
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-background" />,
  },
);

/**
 * Hero Section - "Unlock Sacred Moments"
 *
 * Awwwards-ready design with:
 * - Interactive 3D GiftOrb background
 * - Fluid typography (Clash Display)
 * - Magnetic interactions
 * - Tesla/Nvidia aesthetic
 */

const HERO_CONTENT = {
  en: {
    badge: 'The Future of Human Connection',
    headline: ['Unlock', 'Sacred', 'Moments'],
    subheadline:
      'Not just an app, a gifting revolution. No passports, just human stories and locked trust.',
    cta: {
      primary: 'Join the Movement',
      secondary: 'How it Works',
    },
    stats: [
      { value: '50K+', label: 'Connections Made' },
      { value: '100K+', label: 'Gifts Exchanged' },
      { value: '50+', label: 'Cities Worldwide' },
    ],
  },
  tr: {
    badge: 'İnsan Bağlantısının Geleceği',
    headline: ['Kutsal', 'Anları', 'Keşfet'],
    subheadline:
      'Sadece bir uygulama değil, bir hediyeleşme devrimi. Pasaport yok, sadece insan hikayeleri ve kilitli güven.',
    cta: {
      primary: 'Harekete Katıl',
      secondary: 'Nasıl Çalışır?',
    },
    stats: [
      { value: '50K+', label: 'Bağlantı Kuruldu' },
      { value: '100K+', label: 'Hediye Gönderildi' },
      { value: '50+', label: 'Şehirde Aktif' },
    ],
  },
};

export function Hero() {
  const content = HERO_CONTENT.en;

  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50">
        <Suspense fallback={null}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: true,
            }}
          >
            <GiftOrbScene />
          </Canvas>
        </Suspense>
      </div>

      {/* Radial gradient overlay for depth */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(2,2,2,0.8) 70%)',
        }}
      />

      {/* Content Layer */}
      <div className="section-container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-8 px-6 py-2 rounded-full glass-card text-xs
                       font-bold uppercase tracking-[0.2em] text-primary"
          >
            {content.badge}
          </motion.span>

          {/* Headline - Clash Display Brutal Style */}
          <h1 className="font-clash text-fluid-hero font-black uppercase italic tracking-tighter leading-[0.85] mb-8">
            <motion.span
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="block text-foreground"
            >
              {content.headline[0]}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="block gradient-text"
            >
              {content.headline[1]}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="block text-foreground"
            >
              {content.headline[2]}
            </motion.span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-fluid-lg text-muted max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            {content.subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <PremiumButton className="text-background">
              {content.cta.primary}
            </PremiumButton>

            <MagneticButton variant="ghost" size="md">
              <span className="text-muted group-hover:text-foreground transition-colors">
                {content.cta.secondary}
              </span>
            </MagneticButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="grid grid-cols-3 gap-8 mt-20 max-w-2xl mx-auto"
          >
            {content.stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="text-center group"
              >
                <div
                  className="text-fluid-3xl font-clash font-black text-primary
                                group-hover:text-glow transition-all duration-300"
                >
                  {stat.value}
                </div>
                <div className="text-fluid-xs text-muted uppercase tracking-wider mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Tesla Style */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </motion.div>

      {/* Corner Decorations - Premium Detail */}
      <div className="absolute top-24 left-8 w-16 h-16 border-l border-t border-border opacity-30" />
      <div className="absolute bottom-24 right-8 w-16 h-16 border-r border-b border-border opacity-30" />
    </section>
  );
}

export default Hero;

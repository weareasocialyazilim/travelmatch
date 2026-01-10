'use client';

/**
 * KralHero Component - Psychological Conversion Hero
 *
 * The main hero section that creates urgency and drives app downloads.
 * Features blurred "locked" content that teases users to unlock via app.
 */

import { motion } from 'framer-motion';
import { Lock, Sparkles, Zap, Gift, Heart, Crown } from 'lucide-react';
import { UnlockButton } from './UnlockButton';

interface KralHeroProps {
  city: string;
  citySlug: string;
  intent: string;
  lang: string;
  dictionary: {
    intents: Record<string, string>;
    actions: Record<string, string>;
    cta: string;
    tagline: string;
  };
}

const INTENT_ICONS: Record<string, typeof Heart> = {
  'dating-match': Heart,
  'love-fortune': Sparkles,
  'gifting-moment': Gift,
  'travel-match': Zap,
  'instant-love': Heart,
  'fortune-connection': Crown,
  'luxury-dating': Crown,
  'elite-match': Crown,
  'vip-access': Lock,
  'premium-gifting': Gift,
  'social-fortune': Sparkles,
  'travel-buddy': Zap,
  'skip-queue': Zap,
  'instant-access': Zap,
  'unlock-moment': Lock,
  'hack-dating': Zap,
  'fast-match': Zap,
  'direct-connect': Zap,
};

export function KralHero({ city, citySlug, intent, lang, dictionary }: KralHeroProps) {
  const IntentIcon = INTENT_ICONS[intent] || Sparkles;
  const intentTitle = dictionary.intents[intent] || dictionary.intents['dating-match'];
  const deepLink = `travelmatch://explore?city=${citySlug}&intent=${intent}&lang=${lang}&utm_source=hero`;

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-[128px]" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8"
        >
          <IntentIcon className="w-4 h-4 text-pink-400" />
          <span className="text-sm font-medium text-white/80">{intentTitle}</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6"
        >
          <span className="block text-white">
            {lang === 'tr' ? 'SIRAYI' : 'HACK THE'}
          </span>
          <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            {lang === 'tr' ? 'HACKLE' : 'QUEUE'}
          </span>
        </motion.h1>

        {/* Subheadline with City */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl mx-auto"
        >
          {lang === 'tr' ? (
            <>
              <span className="text-pink-400 font-semibold">{city}</span> konumunda anlık momentların kilidini aç.
              Hediyeleşme ekonomisiyle bekleme sırasını atla.
            </>
          ) : (
            <>
              Unlock instant moments in{' '}
              <span className="text-pink-400 font-semibold">{city}</span>.
              Skip the dating queue with our gifting economy.
            </>
          )}
        </motion.p>

        {/* Blurred Preview Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative w-full max-w-lg mx-auto aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 mb-12 group"
        >
          {/* Blurred Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-purple-800 opacity-50" />
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 opacity-60"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=60')`,
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Lock Icon & Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/50"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl md:text-3xl font-black mb-3 italic">
              {lang === 'tr' ? 'ERİŞİLEMEYENİ AÇ' : 'UNLOCK THE EXCLUSIVE'}
            </h3>

            <p className="text-white/70 mb-6 max-w-xs text-sm">
              {lang === 'tr'
                ? 'Bu moment bir hediye bekliyor. Sırayı hackle ve kilidi aç.'
                : 'This moment is waiting for a gift. Hack the queue and unlock.'}
            </p>

            {/* Active Moments Counter */}
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 font-mono">
                {Math.floor(Math.random() * 50 + 20)} {lang === 'tr' ? 'aktif moment' : 'active moments'}
              </span>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-4 right-4 bg-pink-500/20 backdrop-blur-md border border-pink-500/30 rounded-full px-3 py-1">
            <span className="text-xs font-bold text-pink-400">VIP</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <UnlockButton
            deepLink={deepLink}
            text={dictionary.cta}
            city={citySlug}
            intent={intent}
            size="large"
          />
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/40"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3" />
            <span>{lang === 'tr' ? 'Doğrulanmış Profiller' : 'Verified Profiles'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3" />
            <span>{lang === 'tr' ? '60sn Altı Eşleşme' : 'Under 60s Matching'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span>{lang === 'tr' ? 'Güvenli Ödeme' : 'Secure Payments'}</span>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

export default KralHero;

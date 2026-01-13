'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SacredAtmosphere } from '@/components/3d/SacredAtmosphere';
import { useLanguage } from '@/context/LanguageContext';

const DistortedHarf = ({ char, color }: { char: string; color?: string }) => (
  <motion.span
    className="inline-block"
    whileHover={{
      y: -25,
      scale: 1.3,
      rotate: 10,
      color: color || 'var(--neon-cyan)',
      transition: { type: 'spring', stiffness: 300 },
    }}
  >
    {char === ' ' ? '\u00A0' : char}
  </motion.span>
);

export function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const { t } = useLanguage();

  return (
    <section className="relative h-[120vh] w-full flex flex-col items-center justify-center">
      <div className="fixed inset-0 z-0 opacity-50">
        <SacredAtmosphere />
      </div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center select-none"
      >
        <h1 className="text-ritual-hero font-black italic uppercase mix-blend-difference mb-8">
          <div className="block">
            {t('hero.line1_1')
              .split('')
              .map((c, i) => (
                <DistortedHarf key={`l1-${i}`} char={c} />
              ))}{' '}
            <span>
              {t('hero.line1_2')
                .split('')
                .map((c, i) => (
                  <DistortedHarf key={`l1-plain-${i}`} char={c} />
                ))}
            </span>
          </div>
          <div className="block mt-[-2vw]">
            <span className="text-[var(--neon-pink)]">
              {t('hero.line2_1')
                .split('')
                .map((c, i) => (
                  <DistortedHarf
                    key={`l2-pink-${i}`}
                    char={c}
                    color="var(--neon-pink)"
                  />
                ))}
            </span>{' '}
            <span className="text-stroke">
              {t('hero.line2_2')
                .split('')
                .map((c, i) => (
                  <DistortedHarf key={`l2-stroke-${i}`} char={c} />
                ))}
            </span>
          </div>
        </h1>

        {/* Creator Application CTA */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col gap-2 items-center"
          >
            <button className="bg-white text-black px-12 py-6 text-xl font-black rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform">
              {t('hero.cta')}
            </button>
            <p className="text-[10px] font-black tracking-[0.4em] text-[var(--neon-pink)] uppercase mt-2">
              {t('hero.subcta')}
            </p>
          </motion.div>

          {/* Store Badges */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center">
            <div className="border-2 border-white/40 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-sm md:text-base uppercase font-bold hover:bg-white/20 transition-all cursor-pointer">
              App Store{' '}
              <span className="block text-xs md:text-sm opacity-80 mt-1">
                {t('hero.soon')}
              </span>
            </div>
            <div className="border-2 border-white/40 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-sm md:text-base uppercase font-bold hover:bg-white/20 transition-all cursor-pointer">
              Play Store{' '}
              <span className="block text-xs md:text-sm opacity-80 mt-1">
                {t('hero.soon')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

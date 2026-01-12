'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { SacredAtmosphere } from '@/components/3d/SacredAtmosphere';
import { PremiumButton } from '@/components/ui/MagneticButton';

export function Hero() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-[150vh] w-full flex flex-col items-center justify-start pt-32">
      <div className="fixed inset-0 z-0">
        <SacredAtmosphere />
      </div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="font-black italic tracking-tighter text-[12vw] leading-[0.8] uppercase mix-blend-difference">
          SADECE <span className="text-[var(--neon-pink)]">GEZME</span>,<br />
          ORADA <span className="text-stroke font-light">OL.</span>
        </h1>

        {/* Demo Vurgusu */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex flex-col gap-2 items-center">
            <PremiumButton className="bg-white text-black px-12 py-6 text-xl font-black rounded-full hover:scale-105 transition-transform">
              REQUEST DEMO ACCESS
            </PremiumButton>
            <p className="text-[10px] font-black tracking-[0.3em] text-[var(--neon-pink)] animate-pulse uppercase">
              Limited Slots for Beta Ritual
            </p>
          </div>

          {/* Store Badges - Grayscale & Soon */}
          <div className="flex gap-4 opacity-40 grayscale filter blur-[1px] hover:blur-0 transition-all">
            <div className="border border-white/20 px-4 py-2 rounded-xl text-[10px] uppercase font-bold text-center">
              App Store{' '}
              <span className="block text-[8px] opacity-60">Soon</span>
            </div>
            <div className="border border-white/20 px-4 py-2 rounded-xl text-[10px] uppercase font-bold text-center">
              Play Store{' '}
              <span className="block text-[8px] opacity-60">Soon</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
export default Hero;

'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export function ProofCeremony() {
  const { scrollYProgress } = useScroll();
  const ringScale = useTransform(scrollYProgress, [0.6, 0.8], [0.5, 3]);
  const ringOpacity = useTransform(scrollYProgress, [0.6, 0.7, 0.8], [0, 1, 0]);
  const { language } = useLanguage();

  return (
    <section className="relative h-[150vh] w-full bg-black flex items-center justify-center">
      {/* Immersive 3D Ring Effect */}
      <motion.div
        style={{ scale: ringScale, opacity: ringOpacity }}
        className="absolute w-[500px] h-[500px] rounded-full border-2 border-[var(--neon-cyan)] blur-sm"
      />

      <div className="relative z-10 text-center space-y-12 px-4">
        <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter mix-blend-difference">
          {language === 'tr' ? (
            <>
              ANLIK <br /> <span className="text-stroke">ÖNERİLER</span>
            </>
          ) : (
            <>
              MOMENT <br /> <span className="text-stroke">PROPOSALS</span>
            </>
          )}
        </h2>
        <div className="max-w-xl mx-auto glass-card p-6 md:p-8 rounded-[2rem] border-white/5 backdrop-blur-3xl">
          <p className="text-lg md:text-2xl font-bold italic leading-tight">
            {language === 'tr'
              ? '"Her moment için anlık öneriler. Seni tanıyan birinden, oradayken."'
              : '"Real-time suggestions for each moment. From someone who knows, while you\'re there."'}
          </p>
          <div className="mt-6 md:mt-8 h-1 w-full bg-white/10 overflow-hidden rounded-full">
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="h-full w-1/2 bg-[var(--neon-cyan)] shadow-[0_0_20px_var(--neon-cyan)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

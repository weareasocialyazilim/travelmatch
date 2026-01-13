'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export function ManifestoLoop() {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-white text-black py-2 md:py-3 overflow-hidden whitespace-nowrap border-y border-white">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="flex gap-20 text-[4vw] md:text-[3vw] font-black italic uppercase tracking-tight"
      >
        <span>{t('manifesto.loop1')}</span>
        <span>{t('manifesto.loop2')}</span>
        <span>{t('manifesto.loop3')}</span>
        <span>{t('manifesto.loop4')}</span>
        {/* Repeat for seamless loop illusion */}
        <span>{t('manifesto.loop1')}</span>
        <span>{t('manifesto.loop2')}</span>
      </motion.div>
    </div>
  );
}

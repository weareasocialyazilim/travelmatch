'use client';

import { motion } from 'framer-motion';
import { CONTENT, Language } from '@/constants/content';

interface DownloadCTAProps {
  lang?: Language;
}

export function DownloadCTA({ lang = 'tr' }: DownloadCTAProps) {
  const c = CONTENT[lang].download;

  return (
    <section
      id="download"
      className="py-32 px-6 bg-gradient-to-b from-black to-[#0a0a0a] relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] bg-[var(--accent)] rounded-full blur-[200px] opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black font-syne uppercase tracking-tighter mb-6"
        >
          {c.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-xl mb-12"
        >
          {c.subtitle}
        </motion.p>

        {/* Store Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* App Store Badge */}
          <a
            href="#"
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl hover:bg-[var(--acid)] transition-all"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider opacity-70">
                {lang === 'tr' ? "App Store'dan" : 'Download on the'}
              </div>
              <div className="font-bold text-lg">{c.appStore}</div>
            </div>
          </a>

          {/* Google Play Badge */}
          <a
            href="#"
            className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl hover:bg-[var(--acid)] transition-all"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.83.52-1.28 1.23-1.28.31 0 .65.09 1.02.31l13.5 7.5c.78.43.78 1.51 0 1.94l-13.5 7.5c-.37.22-.71.31-1.02.31C3.52 21.78 3 21.33 3 20.5zm2-2.3l8.87-5.2L5 7.8v10.4zm10.56-5.2L21 8.45l-2.45-1.36-3.02 1.7 2.03 4.21z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider opacity-70">
                {lang === 'tr' ? "Google Play'den" : 'Get it on'}
              </div>
              <div className="font-bold text-lg">{c.playStore}</div>
            </div>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

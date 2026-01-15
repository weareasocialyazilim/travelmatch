'use client';

import { useLanguage } from '@/context/LanguageContext';

export function Navbar() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
      <span
        onClick={scrollToTop}
        className="font-black tracking-tighter text-2xl pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
      >
        Lovendo.
      </span>

      <div className="flex items-center gap-4 pointer-events-auto">
        <button
          onClick={toggleLanguage}
          className="text-xs font-bold uppercase tracking-widest hover:text-[var(--neon-pink)] transition-colors"
        >
          {language === 'tr' ? 'EN' : 'TR'}
        </button>

        <button className="border border-white/20 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--neon-pink)] hover:text-white transition-all duration-300">
          {t('menu.ritual')}
        </button>
      </div>
    </nav>
  );
}

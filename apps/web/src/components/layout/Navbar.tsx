'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { CONTENT, Language } from '@/constants/content';

interface NavbarProps {
  lang: Language;
  setLang: (l: Language) => void;
}

export function Navbar({ lang, setLang }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const c = CONTENT[lang].nav;

  const navItems = [
    { key: 'works', href: '#how-it-works' },
    { key: 'moments', href: '#moments' },
    { key: 'trust', href: '#trust' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white text-black px-6 py-2 rounded-full font-syne font-black text-xl hover:bg-[var(--acid)] transition-colors cursor-pointer"
        >
          travelmatch.
        </motion.div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className="text-white/70 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider"
            >
              {c[item.key as keyof typeof c]}
            </a>
          ))}

          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
            className="flex items-center gap-2 text-white/70 hover:text-[var(--acid)] font-mono font-bold text-sm"
          >
            <Globe size={16} />
            <span className={lang === 'en' ? 'text-white' : ''}>EN</span>
            <span className="text-white/30">|</span>
            <span className={lang === 'tr' ? 'text-white' : ''}>TR</span>
          </button>

          {/* CTA Button */}
          <motion.a
            href="#download"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-[var(--acid)] text-black px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wider"
          >
            {c.app}
          </motion.a>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen(true)}
          className="md:hidden w-12 h-12 bg-white text-black rounded-full flex items-center justify-center"
        >
          <Menu size={24} />
        </motion.button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--accent)] z-[100] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-8 right-8 text-black hover:text-white"
            >
              <X size={48} />
            </button>

            <div className="flex flex-col gap-6 text-center">
              {navItems.map((item) => (
                <motion.a
                  key={item.key}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  whileHover={{ scale: 1.05 }}
                  className="font-syne font-black text-5xl text-black hover:text-white transition-colors uppercase"
                >
                  {c[item.key as keyof typeof c]}
                </motion.a>
              ))}

              <motion.button
                onClick={() => {
                  setLang(lang === 'en' ? 'tr' : 'en');
                  setMenuOpen(false);
                }}
                whileHover={{ scale: 1.05 }}
                className="font-syne font-black text-3xl text-black/60 hover:text-white transition-colors uppercase mt-8"
              >
                {lang === 'en' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

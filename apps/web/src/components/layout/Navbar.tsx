'use client';

import { useState, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import Link from 'next/link';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { CelestialToggle } from '@/components/ui/CelestialToggle';

/**
 * TravelMatch Premium Navbar
 * Features: Glass morphism, scroll-aware, magnetic interactions
 */

type Language = 'en' | 'tr';

const CONTENT = {
  en: {
    nav: {
      works: 'How it Works',
      moments: 'Moments',
      trust: 'Trust & Safety',
      app: 'Get the App',
    },
  },
  tr: {
    nav: {
      works: 'Nasıl Çalışır',
      moments: 'Anlar',
      trust: 'Güvenlik',
      app: 'Uygulamayı İndir',
    },
  },
};

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const { scrollY } = useScroll();

  // Track scroll for navbar visibility and style
  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    // Hide navbar on scroll down, show on scroll up
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }

    // Add glass effect after scrolling
    setIsScrolled(latest > 50);
  });

  const c = CONTENT[lang].nav;

  const navItems = [
    { key: 'works', href: '#how-it-works', label: c.works },
    { key: 'moments', href: '#moments', label: c.moments },
    { key: 'trust', href: '#trust', label: c.trust },
  ];

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'py-4 bg-background/80 backdrop-blur-xl border-b border-border'
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="section-container flex justify-between items-center">
          {/* Logo */}
          <Link href="/">
            <MagneticButton className="group" strength={0.2}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-primary text-background px-6 py-2 rounded-full font-clash font-bold text-xl
                           group-hover:shadow-glow-sm transition-shadow duration-300"
              >
                travelmatch.
              </motion.div>
            </MagneticButton>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.key}
                href={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="text-muted hover:text-foreground font-medium transition-colors text-sm
                           uppercase tracking-wider relative group"
              >
                {item.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary
                                 transition-all duration-300 group-hover:w-full"
                />
              </motion.a>
            ))}

            {/* Language Switcher */}
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
              className="flex items-center gap-2 text-muted hover:text-primary
                         font-mono font-bold text-sm transition-colors"
            >
              <Globe size={16} />
              <span className={lang === 'en' ? 'text-foreground' : ''}>EN</span>
              <span className="text-border">|</span>
              <span className={lang === 'tr' ? 'text-foreground' : ''}>TR</span>
            </motion.button>

            {/* Theme Toggle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <CelestialToggle />
            </motion.div>

            {/* CTA Button */}
            <MagneticButton strength={0.3}>
              <motion.a
                href="#download"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium btn-primary text-sm"
              >
                {c.app}
              </motion.a>
            </MagneticButton>
          </div>

          {/* Mobile Menu Button */}
          <MagneticButton
            className="md:hidden"
            strength={0.4}
            onClick={() => setMenuOpen(true)}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-primary text-background rounded-full
                         flex items-center justify-center shadow-glow-sm"
            >
              <Menu size={24} />
            </motion.div>
          </MagneticButton>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background z-[100] flex flex-col"
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-primary text-background
                         rounded-full flex items-center justify-center"
            >
              <X size={24} />
            </motion.button>

            {/* Menu Content */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-primary font-clash font-bold text-3xl mb-8"
              >
                travelmatch.
              </motion.div>

              {/* Nav Items */}
              {navItems.map((item, index) => (
                <motion.a
                  key={item.key}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                  className="font-clash font-bold text-4xl text-foreground
                             hover:text-primary transition-colors uppercase text-center"
                >
                  {item.label}
                </motion.a>
              ))}

              {/* Language Switcher */}
              <motion.button
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                onClick={() => {
                  setLang(lang === 'en' ? 'tr' : 'en');
                }}
                className="flex items-center gap-3 text-muted hover:text-primary
                           font-mono font-bold text-xl mt-8 transition-colors"
              >
                <Globe size={24} />
                <span>{lang === 'en' ? 'Türkçe' : 'English'}</span>
              </motion.button>

              {/* CTA Button */}
              <motion.a
                href="#download"
                onClick={() => setMenuOpen(false)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="btn-premium btn-primary text-lg mt-4"
              >
                {c.app}
              </motion.a>
            </div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="absolute bottom-10 left-10 w-32 h-32 bg-primary/10
                         rounded-full blur-3xl pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute top-20 right-10 w-24 h-24 bg-secondary/10
                         rounded-full blur-3xl pointer-events-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;

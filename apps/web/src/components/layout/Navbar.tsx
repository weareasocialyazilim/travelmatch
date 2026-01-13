'use client';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) =>
    setIsScrolled(latest > 50),
  );

  return (
    <motion.nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'py-4 bg-black/80 backdrop-blur-2xl border-b border-white/5'
          : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-8 flex justify-between items-center">
        {/* Logo: Web sitesinden giriş yok, sadece vizyon var */}
        <Link href="/">
          <span className="text-2xl font-black italic tracking-tighter uppercase select-none">
            travelmatch<span className="text-[var(--neon-pink)]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {/* Sadece en gerekli linkler */}
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            <a href="#network" className="hover:opacity-100 transition-opacity">
              Network
            </a>
            <a
              href="#prestige"
              className="hover:opacity-100 transition-opacity"
            >
              Prestige
            </a>
          </div>

          {/* Login Yok, Sadece Demo CTA */}
          <MagneticButton strength={0.2}>
            <button className="px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
              REQUEST ACCESS
            </button>
          </MagneticButton>
        </div>
      </div>
    </motion.nav>
  );
}

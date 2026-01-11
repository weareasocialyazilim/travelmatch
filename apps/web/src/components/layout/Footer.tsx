'use client';

import { motion } from 'framer-motion';
import { CONTENT, Language } from '@/constants/content';

interface FooterProps {
  lang?: Language;
}

export function Footer({ lang = 'tr' }: FooterProps) {
  const c = CONTENT[lang].footer;

  return (
    <footer className="bg-black py-20 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
          {/* Logo & Motto */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-syne font-black text-3xl md:text-4xl text-white mb-4"
            >
              travelmatch.
            </motion.div>
            <p className="text-white/40 text-lg max-w-sm">{c.motto}</p>
          </div>

          {/* Links */}
          <div className="flex gap-8">
            <a
              href="/privacy"
              className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-wider"
            >
              {c.links.privacy}
            </a>
            <a
              href="/terms"
              className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-wider"
            >
              {c.links.terms}
            </a>
            <a
              href="/contact"
              className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-wider"
            >
              {c.links.contact}
            </a>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-white/10">
          <div className="flex gap-6">
            {['Instagram', 'TikTok', 'Twitter'].map((social) => (
              <a
                key={social}
                href="#"
                className="text-white/40 hover:text-[var(--acid)] transition-colors text-sm uppercase tracking-wider"
              >
                {social}
              </a>
            ))}
          </div>

          <p className="text-white/30 text-sm">{c.copyright}</p>
        </div>
      </div>
    </footer>
  );
}

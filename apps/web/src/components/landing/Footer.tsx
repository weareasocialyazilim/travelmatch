'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FOOTER_CONTENT } from '@/constants/content';

/**
 * Footer Section
 *
 * Features:
 * - Clean layout
 * - Social links
 * - Legal links
 */

export function Footer() {
  const content = FOOTER_CONTENT.tr;

  return (
    <footer
      className="relative border-t border-white/10"
      style={{ padding: 'clamp(3rem, 8vw, 5rem) clamp(1rem, 5vw, 4rem)' }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div whileHover={{ scale: 1.02 }} className="inline-block">
              <h3
                className="font-syne font-bold text-[#ccff00] mb-4"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
              >
                TravelMatch
              </h3>
            </motion.div>
            <p
              className="text-gray-400 max-w-md"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
            >
              {content.tagline}
            </p>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <motion.a
                href="https://instagram.com/travelmatchapp"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ff0099] transition-colors"
                data-cursor-hover
              >
                <span className="text-lg">📸</span>
              </motion.a>
              <motion.a
                href="https://x.com/travelmatch"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#00f0ff] transition-colors"
                data-cursor-hover
              >
                <span className="text-lg">𝕏</span>
              </motion.a>
              <motion.a
                href="https://tiktok.com/@travelmatchapp"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#ccff00] transition-colors"
                data-cursor-hover
              >
                <span className="text-lg">🎵</span>
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4
              className="font-bold text-white mb-4"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
            >
              Şirket
            </h4>
            <ul className="space-y-3">
              {Object.entries(content.links)
                .slice(0, 3)
                .map(([key, value]) => (
                  <li key={key}>
                    <Link
                      href={`/${key}`}
                      className="text-gray-400 hover:text-[#ccff00] transition-colors"
                      style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                    >
                      {value}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4
              className="font-bold text-white mb-4"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1rem)' }}
            >
              Yasal
            </h4>
            <ul className="space-y-3">
              {Object.entries(content.links)
                .slice(3)
                .map(([key, value]) => (
                  <li key={key}>
                    <Link
                      href={`/${key}`}
                      className="text-gray-400 hover:text-[#ccff00] transition-colors"
                      style={{ fontSize: 'clamp(0.75rem, 2vw, 0.875rem)' }}
                    >
                      {value}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 text-center">
          <p
            className="text-gray-500"
            style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)' }}
          >
            {content.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

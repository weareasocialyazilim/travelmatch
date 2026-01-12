'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { PremiumButton } from '@/components/ui/MagneticButton';

/**
 * Premium Footer - Grand Finale
 *
 * Features:
 * - Large kinetic typography (Awwwards favorite)
 * - Link groups with hover effects
 * - CTA section
 * - Subtle animations
 */

const FOOTER_LINKS = {
  protocol: {
    title: 'Protocol',
    links: [
      { label: 'Escrow', href: '#escrow' },
      { label: 'Trust Ring', href: '#trust-ring' },
      { label: 'Ceremony', href: '#ceremony' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'Our Vision', href: '/about' },
      { label: 'Artifacts', href: '#sacred-moments' },
      { label: 'Legal', href: '/legal' },
    ],
  },
  connect: {
    title: 'Connect',
    links: [
      { label: 'Instagram', href: 'https://instagram.com/travelmatchapp' },
      { label: 'X (Twitter)', href: 'https://x.com/travelmatchapp' },
      { label: 'Discord', href: '#' },
    ],
  },
};

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <h4 className="text-[10px] font-bold text-muted uppercase tracking-[0.2em]">
        {title}
      </h4>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-sm font-medium text-foreground/60 hover:text-primary
                       transition-colors italic uppercase tracking-wide"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#030303] pt-24 md:pt-32 pb-8 border-t border-border overflow-hidden">
      <div className="section-container">
        {/* Top Section - CTA + Links */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-24 md:mb-32">
          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-md"
          >
            <h2 className="font-clash text-4xl md:text-5xl font-black text-foreground uppercase italic leading-[0.9] tracking-tight mb-8">
              Ready to
              <br />
              <span className="text-primary">Gift the World?</span>
            </h2>
            <PremiumButton className="text-background">
              Start Your Journey
            </PremiumButton>
          </motion.div>

          {/* Link Groups */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20"
          >
            <FooterLinkGroup {...FOOTER_LINKS.protocol} />
            <FooterLinkGroup {...FOOTER_LINKS.company} />
            <FooterLinkGroup {...FOOTER_LINKS.connect} />
          </motion.div>
        </div>

        {/* Giant Brand Text - Jüri Favorite */}
        <div className="relative pointer-events-none select-none overflow-hidden">
          <motion.h1
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 0.03 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[18vw] font-clash font-black text-foreground leading-none text-center uppercase italic whitespace-nowrap"
          >
            TRAVELMATCH
          </motion.h1>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-12 pt-8 border-t border-border">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold text-muted uppercase tracking-[0.15em]"
          >
            © {new Date().getFullYear()} TravelMatch Protocol. Built for the next generation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex gap-8"
          >
            <Link
              href="/privacy"
              className="text-[10px] font-bold text-muted hover:text-primary uppercase tracking-[0.15em] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-[10px] font-bold text-muted hover:text-primary uppercase tracking-[0.15em] transition-colors"
            >
              Terms
            </Link>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

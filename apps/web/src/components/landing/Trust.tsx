'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Heart,
  Lock,
  CheckCircle,
  type LucideIcon,
} from 'lucide-react';
import { CONTENT, Language } from '@/constants/content';

interface TrustProps {
  lang?: Language;
}

const icons: LucideIcon[] = [Shield, Heart, Lock, CheckCircle];

export function Trust({ lang = 'tr' }: TrustProps) {
  const { title, subtitle, items } = CONTENT[lang].trust;

  return (
    <section
      id="trust"
      className="py-32 px-6 bg-black relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black font-syne uppercase tracking-tighter mb-6"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 text-xl max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Trust Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((item, index) => {
            const Icon = icons[index % icons.length]!;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 group hover:border-[var(--acid)]/30 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[var(--acid)]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--acid)]/20 transition-colors">
                    <Icon className="w-7 h-7 text-[var(--acid)]" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold font-syne uppercase mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/50 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full">
            <Lock className="w-5 h-5 text-[var(--acid)]" />
            <span className="text-sm text-white/60">
              {lang === 'tr'
                ? 'Tüm işlemler 256-bit SSL ile şifrelenir'
                : 'All transactions encrypted with 256-bit SSL'}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

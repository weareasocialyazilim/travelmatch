'use client';

import { motion } from 'framer-motion';

/**
 * IdentityPulse - Futuristic Identity Card Section
 *
 * Features:
 * - 3D hover effect on card
 * - Nvidia control panel aesthetic
 * - Animated pulse indicators
 * - Trust metrics display
 */

const FEATURES = [
  'Encrypted Social Ties',
  'Proof of Ritual',
  'Zero Knowledge Trust',
  'Decentralized Identity',
];

const STATS = [
  { label: 'Sacred Gifts', value: '12', highlight: false },
  { label: 'Trust Rank', value: 'Top 1%', highlight: true },
];

export function IdentityPulse() {
  return (
    <section className="section-padding relative overflow-hidden" id="identity">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Technical Description */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <span className="text-secondary text-xs font-bold uppercase tracking-[0.3em] mb-4 block">
              Next-Gen Identity
            </span>
            <h2 className="font-clash text-fluid-display font-black text-foreground uppercase italic leading-[0.85] tracking-tighter mb-8">
              Identity
              <br />
              <span className="text-primary">Pulse</span>
            </h2>
            <p className="text-muted text-lg mb-10 max-w-md leading-relaxed">
              Forget traditional identities. In TravelMatch, your identity transforms into
              a living energy form through the rituals you perform and the proofs you present.
            </p>

            {/* Feature List */}
            <ul className="space-y-4">
              {FEATURES.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-foreground/70"
                >
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Futuristic Card (The Showpiece) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Background Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-border rounded-full -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-border/50 rounded-full -z-10" />

            {/* The Card */}
            <motion.div
              whileHover={{ rotateY: 8, rotateX: -5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="relative w-full max-w-[380px] aspect-[3/4] bg-card backdrop-blur-xl
                         border border-border rounded-[2.5rem] p-6 overflow-hidden group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Light Leak Effect */}
              <div
                className="absolute -inset-20 bg-gradient-to-tr from-primary/15 via-transparent to-secondary/15
                           blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"
              />

              {/* Inner Card Content */}
              <div className="relative h-full flex flex-col justify-between border border-border/50 rounded-[2rem] p-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 bg-card rounded-full border border-border flex items-center justify-center">
                    <div className="relative">
                      <div className="w-4 h-4 bg-primary rounded-full" />
                      <div className="absolute inset-0 w-4 h-4 bg-primary rounded-full animate-ping opacity-75" />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] text-muted uppercase tracking-wider block">
                      Status
                    </span>
                    <span className="font-mono text-[10px] text-primary uppercase tracking-wider">
                      Verified Pulse
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div>
                  <div className="h-1 w-16 bg-primary mb-4" />
                  <h4 className="font-clash text-3xl font-bold text-foreground uppercase italic leading-none mb-2">
                    Ritualist
                  </h4>
                  <span className="text-primary font-clash text-lg font-bold uppercase">
                    Level 04
                  </span>

                  {/* Stats Grid */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {STATS.map((stat, i) => (
                      <div
                        key={i}
                        className="bg-card p-4 rounded-xl border border-border"
                      >
                        <div className="text-[9px] text-muted uppercase tracking-wider mb-1">
                          {stat.label}
                        </div>
                        <div
                          className={`text-2xl font-clash font-black ${
                            stat.highlight ? 'text-primary' : 'text-foreground'
                          }`}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className="text-[8px] text-muted uppercase tracking-widest">
                    TravelMatch Protocol
                  </span>
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < 3 ? 'bg-primary' : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Corner Decoration */}
              <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-border/30" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b border-l border-border/30" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default IdentityPulse;

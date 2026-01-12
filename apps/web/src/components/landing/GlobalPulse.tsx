'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const ROUTES = [
  {
    from: 'PARİS',
    to: 'DUBAİ',
    gift: '☕️',
    text: 'Sabah kahvesi 5400 km yol katetti.',
  },
  {
    from: 'İSTANBUL',
    to: 'SEUL',
    gift: '🍵',
    text: "Boğaz'dan K-Life'a bir çay fırlatıldı.",
  },
  {
    from: 'TOKYO',
    to: 'NEW YORK',
    gift: '🍣',
    text: 'Lezzet sınır tanımaz bir jest.',
  },
  {
    from: 'REYKJAVIK',
    to: 'RİO',
    gift: '❄️',
    text: 'Kutuplardan Sambaya serin bir dokunuş.',
  },
  {
    from: 'ROMA',
    to: 'MARAKEŞ',
    gift: '🍦',
    text: 'Tatlı bir fısıltı çöl güneşine ulaştı.',
  },
];

export function GlobalPulse() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROUTES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const route = ROUTES[index];

  return (
    <div className="relative h-screen w-full flex items-center justify-center py-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative section-container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center z-10">
        <div className="space-y-8">
          <h2 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase">
            Global <br />
            <span className="text-stroke text-transparent">Frequency</span>
          </h2>
          <p className="text-2xl text-white/60 max-w-md font-mono">
            Distance is an illusion. Send a signal. From the underground of
            Berlin to the rooftops of Seoul. Instant. Visceral. Real.
          </p>
        </div>

        {/* Dynamic Route Animation */}
        <div className="relative h-[400px] w-full border border-white/10 glass-card bg-zinc-900/50 rounded-[3rem] flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* From City */}
              <div className="absolute top-10 left-10">
                <div className="text-xs font-mono text-white/40 tracking-widest mb-1">
                  ORIGIN
                </div>
                <div className="text-4xl font-black italic uppercase">
                  {route.from}
                </div>
              </div>

              {/* To City */}
              <div className="absolute bottom-10 right-10 text-right">
                <div className="text-xs font-mono text-white/40 tracking-widest mb-1">
                  DESTINATION
                </div>
                <div className="text-4xl font-black italic uppercase">
                  {route.to}
                </div>
              </div>

              {/* Route Text - Shows the story of the gift */}
              <div className="absolute bottom-10 left-10 max-w-[50%]">
                <p className="text-sm md:text-base text-[var(--neon-cyan)] font-medium leading-relaxed">
                  {route.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Moving Particle - Modified to carry the gift emoji */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[1px] bg-white/10 relative">
              <motion.div
                key={index}
                initial={{ left: '0%', opacity: 0, scale: 0.5 }}
                animate={{
                  left: '100%',
                  opacity: [0, 1, 1, 1, 0],
                  scale: [1, 1.5, 1.5, 1],
                }}
                transition={{
                  duration: 3,
                  ease: 'easeInOut',
                  times: [0, 0.1, 0.9, 1],
                }}
                className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center -ml-5 z-20"
              >
                <span className="text-5xl filter drop-shadow-[0_0_25px_rgba(255,255,255,0.6)]">
                  {route.gift}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

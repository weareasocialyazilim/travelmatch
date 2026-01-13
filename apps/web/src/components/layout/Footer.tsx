'use client';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="bg-black pt-32 pb-12 border-t border-white/5 overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-32">
          <div className="space-y-8">
            <h2 className="text-5xl font-black italic leading-none uppercase">
              Ready to enter <br /> the{' '}
              <span className="text-[var(--neon-pink)]">ritual?</span>
            </h2>
            <button className="px-12 py-5 bg-white text-black font-black uppercase rounded-full hover:scale-105 transition-transform">
              Apply for Demo
            </button>
          </div>

          <div className="flex gap-20 text-[10px] font-black uppercase tracking-widest opacity-30">
            <div className="flex flex-col gap-4">
              <span className="text-white">Protocol</span>
              <a href="#">Security</a>
              <a href="#">Aura System</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white">Legal</span>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
            </div>
          </div>
        </div>

        {/* Giant Kinetic Text */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 0.05 }}
          className="text-[20vw] font-black italic text-center leading-none select-none"
        >
          TRAVELMATCH
        </motion.h1>

        <div className="mt-12 text-center text-[8px] font-bold opacity-20 uppercase tracking-[0.5em]">
          © 2025 TravelMatch Protocol • All Rights Reserved
        </div>
      </div>
    </footer>
  );
}

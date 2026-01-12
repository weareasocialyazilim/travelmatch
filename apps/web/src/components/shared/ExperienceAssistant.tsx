'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ExperienceAssistant() {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const script = [
    'Seni tanımak üzereyim... Gece yürüyüşlerini mi seversin, yoksa gün doğumu keşiflerini mi?',
    'Harika. Bir yabancıya kahve ikram etmek sence bir jest midir, yoksa bir başlangıç mı?',
    "Aura'n TravelMatch ruhuna %94 uyumlu. Demo listesinde ön sıraya geçmek ister misin?",
  ];

  return (
    <div className="fixed bottom-10 left-10 z-[100] hidden md:block">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 glass-card w-64 rounded-[2rem] border-[var(--neon-purple)]"
          >
            <p className="text-sm italic font-medium leading-tight mb-4 text-white/90">
              "{script[step]}"
            </p>
            <div className="flex justify-between items-center">
              <button
                onClick={() =>
                  step < 2 ? setStep((s) => s + 1) : setIsVisible(false)
                }
                className="text-[var(--neon-cyan)] text-[10px] font-black uppercase tracking-tighter hover:text-white transition-colors"
              >
                {step < 2 ? 'CEVAPLA →' : 'ERİŞİM TALEP ET'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-12 h-12 rounded-full bg-[var(--neon-purple)] blur-lg animate-pulse mt-4 ml-4" />
    </div>
  );
}

'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const QUESTIONS = [
  {
    id: 'vibe',
    textTr: 'SENİN AURAN HANGİSİ?',
    textEn: 'WHAT IS YOUR AURA?',
    optionsTr: ['Aşık', 'Kâşif', 'Yaratıcı', 'Hayalperest'],
    optionsEn: ['Lover', 'Explorer', 'Creator', 'Dreamer'],
    color: '#FF007A',
  },
  {
    id: 'destination',
    textTr: 'SIĞINAĞINI SEÇ',
    textEn: 'PICK YOUR SANCTUARY',
    optionsTr: ['Tokyo', 'Paris', 'Bali', 'New York'],
    optionsEn: ['Tokyo', 'Paris', 'Bali', 'New York'],
    color: '#00F2FF',
  },
  {
    id: 'element',
    textTr: 'ELEMENTİNİ SEÇ',
    textEn: 'CHOOSE YOUR ELEMENT',
    optionsTr: ['Neon', 'Doğa', 'Lüks', 'Yeraltı'],
    optionsEn: ['Neon', 'Nature', 'Luxury', 'Underground'],
    color: '#CCFF00',
  },
];

export function AuraRitual() {
  const [step, setStep] = useState(0);
  const [, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [socialHandle, setSocialHandle] = useState('');
  const { language } = useLanguage();

  const currentQuestion = QUESTIONS[step];
  const getText = () =>
    language === 'tr' ? currentQuestion?.textTr : currentQuestion?.textEn;
  const getOptions = () =>
    language === 'tr' ? currentQuestion?.optionsTr : currentQuestion?.optionsEn;

  const handleAnswer = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));
    setStep((prev) => prev + 1);
  };

  return (
    <section className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--aura-color),_transparent_70%)] opacity-20 animate-pulse" />

      <div className="z-10 w-full max-w-4xl px-8 text-center">
        <AnimatePresence mode="wait">
          {step < QUESTIONS.length ? (
            <motion.div
              key={step}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="space-y-12"
            >
              <h2
                className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter"
                style={{ color: currentQuestion?.color }}
              >
                {getText()}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {getOptions()?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="px-8 py-6 rounded-2xl border border-white/10 hover:bg-white hover:text-black font-bold uppercase tracking-widest transition-all hover:scale-105"
                  >
                    {option}
                  </button>
                ))}
              </div>
              <div className="flex justify-center gap-2 mt-8">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === step ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.8] text-[var(--neon-pink)]">
                {language === 'tr'
                  ? 'AURANI BİZE GÖSTER.'
                  : 'SHOW US YOUR AURA.'}
              </h2>

              <div className="max-w-xl mx-auto space-y-4">
                {/* Email Input */}
                <div className="glass-card p-1 rounded-full border border-white/10 shadow-2xl">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      language === 'tr' ? 'E-POSTA GİR' : 'ENTER EMAIL'
                    }
                    className="bg-transparent px-8 py-4 w-full outline-none font-bold text-sm placeholder:text-white/30 text-white"
                  />
                </div>

                {/* Social Media Input */}
                <div className="glass-card p-1 rounded-full border border-white/10 shadow-2xl flex items-center bg-black/50">
                  <span className="pl-6 text-[var(--neon-cyan)] font-black text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    value={socialHandle}
                    onChange={(e) => setSocialHandle(e.target.value)}
                    placeholder={
                      language === 'tr'
                        ? 'INSTAGRAM / TIKTOK KULLANICI ADI'
                        : 'INSTAGRAM / TIKTOK HANDLE'
                    }
                    className="bg-transparent px-4 py-4 w-full outline-none font-bold text-sm placeholder:text-white/30 text-white"
                  />
                  <button className="bg-white text-black px-10 py-4 font-black uppercase text-xs rounded-full hover:bg-[var(--neon-pink)] hover:text-white transition-colors whitespace-nowrap">
                    {language === 'tr'
                      ? 'BAŞVURU GÖNDER'
                      : 'SUBMIT APPLICATION'}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-white/30 uppercase tracking-[0.5em]">
                {language === 'tr'
                  ? 'Küratörlerimiz auranı yakında inceleyecek.'
                  : 'Our curators will review your aura shortly.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

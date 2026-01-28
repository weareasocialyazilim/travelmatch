'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Gift,
  Instagram,
  MessageSquare,
  Twitter,
  Heart,
  Send,
  Zap,
  Sparkles,
} from 'lucide-react';
import { TRANSLATIONS, MOMENTS, Language, Moment } from '../data/content';
import StoreBadge from '../components/StoreBadge';

const PulseEngine = dynamic(() => import('../components/PulseEngine'), {
  ssr: false,
});

/**

--- 2. COMPONENTS ---
*/

const NoiseOverlay = () => (
  <div
    className="fixed inset-0 z-[5] pointer-events-none opacity-20 mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
      transform: 'translateZ(0)',
    }}
  />
);

/**
 * --- SARCASTIC MELTED CURSOR ---
 * Eriyen neon kalp şeklinde özel cursor
 */
const MeltedCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });
    const handleHover = () => setIsHovered(true);
    const handleUnhover = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMove);

    const interactiveElements = document.querySelectorAll(
      'button, a, input, textarea, .cursor-pointer, .hover-trigger',
    );
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHover);
      el.addEventListener('mouseleave', handleUnhover);
    });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHover);
        el.removeEventListener('mouseleave', handleUnhover);
      });
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[99999] hidden md:block"
      animate={{
        x: mousePos.x - 20,
        y: mousePos.y - 20,
        scale: isHovered ? 1.3 : 1,
        rotate: isHovered ? 10 : 0,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 400, mass: 0.4 }}
    >
      <svg width="44" height="55" viewBox="0 0 40 50">
        {/* Gift Box Body - Clean Rectangle */}
        <rect x="5" y="22" width="30" height="24" fill="#39FF14" rx="2" />

        {/* Gift Box Lid - Slightly wider */}
        <rect x="3" y="16" width="34" height="8" fill="#39FF14" rx="2" />

        {/* Lid shadow line */}
        <rect x="5" y="23" width="30" height="2" fill="#2BD910" />

        {/* Ribbon - Vertical on box */}
        <rect x="17" y="16" width="6" height="30" fill="#FF00FF" />

        {/* Ribbon - Horizontal on lid */}
        <rect x="3" y="18" width="34" height="5" fill="#FF00FF" />

        {/* Bow - Left Loop */}
        <ellipse cx="13" cy="12" rx="7" ry="6" fill="#FF00FF" />
        <ellipse cx="13" cy="12" rx="4" ry="3" fill="#CC00CC" />

        {/* Bow - Right Loop */}
        <ellipse cx="27" cy="12" rx="7" ry="6" fill="#FF00FF" />
        <ellipse cx="27" cy="12" rx="4" ry="3" fill="#CC00CC" />

        {/* Bow - Center Knot */}
        <ellipse cx="20" cy="14" rx="4" ry="5" fill="#FF00FF" />
        <ellipse cx="20" cy="14" rx="2" ry="3" fill="#CC00CC" />

        {/* Bow - Ribbon Tails */}
        <path d="M16,18 Q14,22 12,26 Q14,24 16,22 Z" fill="#FF00FF" />
        <path d="M24,18 Q26,22 28,26 Q26,24 24,22 Z" fill="#FF00FF" />

        {/* Melted Drips - Bottom (slow & subtle) */}
        <motion.ellipse
          cx="10"
          cy="46"
          rx="2.5"
          ry="3"
          fill="#39FF14"
          animate={{ cy: [46, 58], opacity: [1, 0], ry: [3, 6] }}
          transition={{ repeat: Infinity, duration: 2.0, ease: 'easeIn' }}
        />

        <motion.ellipse
          cx="20"
          cy="46"
          rx="3"
          ry="4"
          fill="#39FF14"
          animate={{ cy: [46, 62], opacity: [1, 0], ry: [4, 8] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            delay: 0.5,
            ease: 'easeIn',
          }}
        />

        <motion.ellipse
          cx="30"
          cy="46"
          rx="2.5"
          ry="3"
          fill="#39FF14"
          animate={{ cy: [46, 58], opacity: [1, 0], ry: [3, 6] }}
          transition={{
            repeat: Infinity,
            duration: 2.0,
            delay: 1.0,
            ease: 'easeIn',
          }}
        />
      </svg>
    </motion.div>
  );
};

/**
 * --- ANIMATED TITLE ---
 * Harflerin hover'da renk değiştirmesi (sarı-yeşil-mavi)
 */
const AnimatedTitle = ({ text }: { text: string }) => {
  const colors = ['#FFFF00', '#39FF14', '#00FFFF', '#FF00FF', '#FF6B35'];

  return (
    <span className="inline">
      {text.split('').map((char, index) => (
        <motion.span
          key={index}
          className="inline-block cursor-default"
          whileHover={{
            color: colors[index % colors.length],
            scale: 1.1,
            textShadow: `0 0 20px ${colors[index % colors.length]}`,
          }}
          transition={{ duration: 0.1 }}
          style={{
            display: char === ' ' || char === '\n' ? 'inline' : 'inline-block',
          }}
        >
          {char === '\n' ? <br /> : char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

/**

--- 3. MAIN APPLICATION ---
*/
export default function App() {
  const [lang, setLang] = useState<Language>('EN');
  const [selected, setSelected] = useState<Moment | null>(null);
  const [view, setView] = useState('home');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGiftSuccess, setShowGiftSuccess] = useState(false);
  const [showAltSuccess, setShowAltSuccess] = useState(false);
  const [igHandle, setIgHandle] = useState('');

  // Alternative Suggestion State
  const [showAltForm, setShowAltForm] = useState(false);
  const [altInput, setAltInput] = useState('');

  const t = TRANSLATIONS[lang];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!igHandle) return;
    setShowSuccess(true);
  };

  const handleAltSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAltForm(false);
    setShowAltSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Archivo_Black',sans-serif] selection:bg-[#FF00FF] selection:text-white overflow-x-hidden relative cursor-none md:cursor-none">
      <MeltedCursor />
      <NoiseOverlay />
      <PulseEngine />

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[1000] p-4 md:p-8 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md border-b border-zinc-900">
        <motion.div
          className="text-3xl md:text-4xl font-black italic tracking-tighter cursor-pointer group"
          onClick={() => setView('home')}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          LVND
          <span className="text-[#FF00FF] group-hover:animate-ping inline-block">
            .
          </span>
        </motion.div>
        <div className="flex items-center gap-4 md:gap-6">
          {/* LIQUID LANG TOGGLE */}
          <div
            onClick={() => setLang(lang === 'EN' ? 'TR' : 'EN')}
            className="relative cursor-pointer w-20 h-8 border-2 border-zinc-800 bg-black flex items-center px-0 overflow-hidden hover:border-[#00FFFF] transition-colors group"
          >
            <motion.div
              className="absolute top-0 bottom-0 w-1/2 bg-[#00FFFF] shadow-[0_0_10px_#00FFFF] mix-blend-difference"
              animate={{ x: lang === 'EN' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <div className="relative z-10 w-full flex justify-between px-2 pointer-events-none">
              <span
                className={`text-[10px] font-black transition-all duration-300 ${lang === 'EN' ? 'text-black scale-110' : 'text-zinc-600'}`}
              >
                EN
              </span>
              <span
                className={`text-[10px] font-black transition-all duration-300 ${lang === 'TR' ? 'text-black scale-110' : 'text-zinc-600'}`}
              >
                TR
              </span>
            </div>
          </div>

          <button
            onClick={() => setView('creator')}
            className="bg-[#39FF14] text-black px-4 md:px-6 py-2 text-[10px] md:text-xs font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-[4px_4px_0px_0px_#FF00FF]"
          >
            {t.nav_creator}
          </button>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="relative z-10 pt-40 md:pt-48 pb-20 px-6 max-w-7xl mx-auto text-center">
              <h1 className="text-[12vw] sm:text-[10vw] md:text-[9vw] font-black uppercase leading-[0.85] tracking-tighter italic mb-12 whitespace-pre-line">
                <AnimatedTitle text={t.hero_title} />
              </h1>
              <p className="text-[#00FFFF] font-black text-lg md:text-xl uppercase mb-12 tracking-wide">
                {t.hero_sub}
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-8 max-w-lg mx-auto sm:max-w-none">
                <StoreBadge
                  platform="App Store"
                  punchline={
                    lang === 'EN' ? 'Coming soon to iOS.' : "Yakında iOS'ta."
                  }
                  type="apple"
                  color="pink"
                  ribbonPos="left"
                />
                <StoreBadge
                  platform="Google Play"
                  punchline={
                    lang === 'EN'
                      ? 'Stop asking, it’s coming.'
                      : 'SORMAYI BIRAK, GELİYOR.'
                  }
                  type="google"
                  color="cyan"
                  ribbonPos="right"
                />
              </div>
            </header>

            {/* City Ticker - Full Width */}
            <div className="w-full bg-[#F0EEE9] py-6 border-y-[6px] border-black overflow-hidden flex whitespace-nowrap z-10 relative my-20 md:my-32">
              <div className="animate-marquee-slow inline-block text-black font-black uppercase italic text-2xl md:text-4xl tracking-tighter">
                {lang === 'EN'
                  ? 'ISTANBUL 🕌 • PARIS 🗼 • TOKYO 🍣 • NEW YORK 🗽 • LONDON 🎡 • BERLIN 🥨 • ROME 🍕 • RIO 🏖️ • SYDNEY 🐨 • CAIRO 🗿 • AMSTERDAM 🚲 • SEOUL 🥢 • MEXICO CITY 🌮 • BARCELONA ⚽ • DUBAI 🏗️ • SINGAPORE 🦁 • BANGKOK 🛺 • ATHENS 🏛️ • CAPE TOWN 🏔️ • TORONTO 🍁 •'
                  : 'İSTANBUL 🕌 • PARİS 🗼 • TOKYO 🍣 • NEW YORK 🗽 • LONDRA 🎡 • BERLİN 🥨 • ROMA 🍕 • RİO 🏖️ • SİDNEY 🐨 • KAHİRE 🗿 • AMSTERDAM 🚲 • SEUL 🥢 • MEKSİKO 🌮 • BARSELONA ⚽ • DUBAİ 🏗️ • SİNGAPUR 🦁 • BANGKOK 🛺 • ATİNA 🏛️ • CAPE TOWN 🏔️ • TORONTO 🍁 •'}
                &nbsp;
              </div>
              <div className="animate-marquee-slow inline-block text-black font-black uppercase italic text-2xl md:text-4xl tracking-tighter">
                {lang === 'EN'
                  ? 'ISTANBUL 🕌 • PARIS 🗼 • TOKYO 🍣 • NEW YORK 🗽 • LONDON 🎡 • BERLIN 🥨 • ROME 🍕 • RIO 🏖️ • SYDNEY 🐨 • CAIRO 🗿 • AMSTERDAM 🚲 • SEOUL 🥢 • MEXICO CITY 🌮 • BARCELONA ⚽ • DUBAI 🏗️ • SINGAPORE 🦁 • BANGKOK 🛺 • ATHENS 🏛️ • CAPE TOWN 🏔️ • TORONTO 🍁 •'
                  : 'İSTANBUL 🕌 • PARİS 🗼 • TOKYO 🍣 • NEW YORK 🗽 • LONDRA 🎡 • BERLİN 🥨 • ROMA 🍕 • RİO 🏖️ • SİDNEY 🐨 • KAHİRE 🗿 • AMSTERDAM 🚲 • SEUL 🥢 • MEKSİKO 🌮 • BARSELONA ⚽ • DUBAİ 🏗️ • SİNGAPUR 🦁 • BANGKOK 🛺 • ATİNA 🏛️ • CAPE TOWN 🏔️ • TORONTO 🍁 •'}
                &nbsp;
              </div>
            </div>

            <section
              id="manifesto"
              className="relative z-10 py-32 bg-zinc-950/90 border-y-4 border-black"
            >
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-[#FF00FF] leading-none">
                  {t.manifesto_title}
                </h2>
                <motion.p
                  className="text-xl md:text-3xl font-black uppercase leading-tight italic text-zinc-400 border-l-8 border-[#00FFFF] pl-8 cursor-default"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {t.manifesto_txt}
                </motion.p>
              </div>
            </section>

            {/* HOW IT WORKS SECTION */}
            <section id="howitworks" className="relative z-10 py-32 bg-black">
              <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter text-white mb-20 text-center">
                  {t.howitworks_title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                  {/* Step 1 */}
                  <div className="bg-zinc-900 p-8 border-4 border-[#FF00FF]">
                    <div className="text-[#FF00FF] text-6xl font-black italic mb-6">
                      01
                    </div>
                    <h3 className="text-2xl font-black uppercase text-white mb-4">
                      {t.howitworks_1_title}
                    </h3>
                    <p className="text-zinc-400 font-medium">
                      {t.howitworks_1_desc}
                    </p>
                  </div>
                  {/* Step 2 */}
                  <div className="bg-zinc-900 p-8 border-4 border-[#00FFFF]">
                    <div className="text-[#00FFFF] text-6xl font-black italic mb-6">
                      02
                    </div>
                    <h3 className="text-2xl font-black uppercase text-white mb-4">
                      {t.howitworks_2_title}
                    </h3>
                    <p className="text-zinc-400 font-medium">
                      {t.howitworks_2_desc}
                    </p>
                  </div>
                  {/* Step 3 */}
                  <div className="bg-zinc-900 p-8 border-4 border-[#39FF14]">
                    <div className="text-[#39FF14] text-6xl font-black italic mb-6">
                      03
                    </div>
                    <h3 className="text-2xl font-black uppercase text-white mb-4">
                      {t.howitworks_3_title}
                    </h3>
                    <p className="text-zinc-400 font-medium">
                      {t.howitworks_3_desc}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <main
              id="moments"
              className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-40"
            >
              {/* Sarcastic Header for Moments */}
              <div className="text-center mb-24 space-y-6">
                <h2 className="text-5xl md:text-9xl font-black uppercase italic tracking-tighter text-white hover:text-[#39FF14] transition-colors cursor-default leading-[0.8]">
                  {t.moments_title}.
                </h2>
                <p className="text-[#00FFFF] text-lg md:text-2xl font-black uppercase tracking-[0.5em] bg-black inline-block px-6 py-2 border-2 border-[#00FFFF] transform -rotate-1 hover:rotate-1 transition-transform">
                  {t.moments_sub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                {MOMENTS.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ y: -15, rotate: 1 }}
                    onClick={() => setSelected(m)}
                    className="relative aspect-[9/16] bg-zinc-900 border-[6px] border-black shadow-[10px_10px_0px_0px_#FF00FF] md:shadow-[15px_15px_0px_0px_#FF00FF] cursor-pointer overflow-hidden group"
                  >
                    <Image
                      src={m.image}
                      alt={m.title[lang]}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />

                    {/* Kart Üzerindeki Fiyat Rozeti */}
                    <div className="absolute top-6 right-6 bg-[#39FF14] text-black px-3 py-1 text-lg font-black italic border-2 border-black z-20">
                      ${m.price}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute top-6 left-6 bg-white text-black px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                      {m.location}
                    </div>
                    <div className="absolute bottom-8 left-8 right-8 flex flex-col gap-4">
                      <div className="text-[10px] font-black text-[#FF00FF] uppercase mb-[-12px]">
                        {m.creator}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black uppercase italic leading-[0.85] text-white">
                        {m.title[lang]}
                      </h3>
                      <div className="bg-[#00FFFF] text-black text-center py-4 text-[10px] font-black uppercase group-hover:bg-white transition-colors">
                        {t.unlock}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </main>

            <section className="relative z-10 py-32 px-6">
              <div className="max-w-5xl mx-auto bg-[#FF00FF] p-1 border-[6px] md:border-[12px] border-black shadow-[15px_15px_0px_0px_#00FFFF] md:shadow-[30px_30px_0px_0px_#00FFFF]">
                <div className="bg-[#0a0a0a] p-8 md:p-20 text-center space-y-12 border-4 border-black">
                  <h2 className="text-5xl md:text-8xl font-black uppercase italic leading-none tracking-tighter text-white">
                    {t.creator_cta_title}
                  </h2>
                  <p className="text-[#00FFFF] text-sm md:text-xl font-black uppercase tracking-[0.2em]">
                    {t.creator_cta_sub}
                  </p>
                  <button
                    onClick={() => setView('creator')}
                    className="w-full md:w-auto bg-[#39FF14] text-black px-10 md:px-16 py-6 md:py-8 text-2xl md:text-4xl font-black uppercase italic hover:scale-105 active:scale-95 transition-transform"
                  >
                    {t.creator_cta_btn}
                  </button>
                </div>
              </div>
            </section>
            {/* --- FOOTER --- */}
            <footer className="relative z-10 bg-zinc-950 border-t-[8px] border-black pt-20 overflow-hidden">
              {/* Manifesto Ticker */}
              <div className="w-full bg-[#FF00FF] py-4 border-y-4 border-black overflow-hidden flex whitespace-nowrap">
                <div className="animate-marquee inline-block text-black font-black uppercase italic text-sm md:text-xl tracking-tighter">
                  {lang === 'EN'
                    ? 'NO DIGITAL ROT • THE TALKING STAGE IS A SCAM • GO TOUCH GRASS • SYNC YOUR BIOLOGY • YAP LESS DO MORE • NOT YOUR AVERAGE DELULU • PHYSICAL REALITY ONLY • SHOW UP OR LOG OFF • NO GHOSTS ALLOWED •'
                    : 'DİJİTAL ÇÜRÜME YOK • SAHNE KONUŞMA YERİ DEĞİL • DAHA FAZLASI • SADECE FİZİKSEL GERÇEKLİK • GEL YA DA ÇIK • KAYBOLANLARA YER YOK • SIRADAN HAYAL ALEMİ DEĞİL •'}
                  &nbsp;
                </div>
                <div className="animate-marquee inline-block text-black font-black uppercase italic text-sm md:text-xl tracking-tighter">
                  {lang === 'EN'
                    ? 'NO DIGITAL ROT • THE TALKING STAGE IS A SCAM • GO TOUCH GRASS • SYNC YOUR BIOLOGY • YAP LESS DO MORE • NOT YOUR AVERAGE DELULU • PHYSICAL REALITY ONLY • SHOW UP OR LOG OFF • NO GHOSTS ALLOWED •'
                    : 'DİJİTAL ÇÜRÜME YOK • SAHNE KONUŞMA YERİ DEĞİL • DAHA FAZLASI • SADECE FİZİKSEL GERÇEKLİK • GEL YA DA ÇIK • KAYBOLANLARA YER YOK • SIRADAN HAYAL ALEMİ DEĞİL •'}
                  &nbsp;
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-4 gap-16 relative">
                <div className="col-span-1 md:col-span-2 space-y-8">
                  <div className="text-7xl font-black italic tracking-tighter text-white opacity-20">
                    LVND.
                  </div>
                  <p className="text-2xl font-black uppercase italic leading-none text-[#00FFFF]">
                    {t.footer_tag}
                  </p>
                </div>

                <div className="space-y-6">
                  <motion.h4
                    className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] cursor-default inline-block"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {lang === 'EN' ? 'SYSTEM' : 'SİSTEM'}
                  </motion.h4>
                  <div className="flex flex-col gap-6 font-black uppercase text-sm italic">
                    <button
                      onClick={() =>
                        document
                          .getElementById('manifesto')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="text-left hover:text-[#FF00FF] transition-colors"
                    >
                      {lang === 'EN' ? 'Manifesto' : 'MANİFESTO'}
                    </button>
                    <button
                      onClick={() => setView('creator')}
                      className="text-left hover:text-[#39FF14] transition-colors"
                    >
                      {lang === 'EN' ? 'Creators' : 'ÜRETİCİLER'}
                    </button>
                    <button
                      onClick={() =>
                        document
                          .getElementById('moments')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="text-left hover:text-[#00FFFF] transition-colors"
                    >
                      {lang === 'EN' ? 'Moments' : 'ANLAR'}
                    </button>
                    <button
                      onClick={() =>
                        document
                          .getElementById('howitworks')
                          ?.scrollIntoView({ behavior: 'smooth' })
                      }
                      className="text-left hover:text-[#39FF14] transition-colors"
                    >
                      {lang === 'EN' ? 'How It Works' : 'NASIL ÇALIŞIR'}
                    </button>
                    <a
                      href="#"
                      className="text-left hover:text-white transition-colors"
                    >
                      {lang === 'EN' ? 'Terms' : 'KOŞULLAR'}
                    </a>
                  </div>
                </div>

                <div className="space-y-6">
                  <motion.h4
                    className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] cursor-default inline-block"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    SOCIALS
                  </motion.h4>
                  <div className="flex flex-col gap-3 font-black uppercase text-sm italic">
                    <a
                      href="#"
                      className="flex items-center gap-2 hover:text-[#FF00FF] transition-colors"
                    >
                      <Instagram size={16} /> Instagram
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 hover:text-[#00FFFF] transition-colors"
                    >
                      <Twitter size={16} /> X / The platform formerly known as
                      Twitter
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      {t.nav_void}
                    </a>
                  </div>
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 pb-8 flex flex-col md:flex-row justify-between items-center border-t border-zinc-900 pt-8 gap-4 text-[10px] font-black text-zinc-600">
                <div>© 2026 {t.footer_rights}</div>
                <div className="flex gap-8 uppercase tracking-widest">
                  <span>{t.version}</span>
                </div>
              </div>
            </footer>
          </motion.div>
        )}

        {view === 'creator' && (
          <motion.div
            key="creator"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen pt-40 pb-20 px-6 max-w-3xl mx-auto relative z-20"
          >
            <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter text-[#39FF14] leading-none mb-12 underline decoration-white">
              {t.form_header}
            </h2>
            <form onSubmit={handleApply} className="space-y-12">
              <div className="border-b-4 border-zinc-800 pb-4 flex items-center gap-6 group focus-within:border-[#FF00FF] transition-colors">
                <Instagram className="text-[#FF00FF] group-focus-within:animate-pulse" />
                <input
                  type="text"
                  required
                  value={igHandle}
                  onChange={(e) => setIgHandle(e.target.value)}
                  placeholder={t.form_ig}
                  className="bg-transparent w-full text-2xl md:text-3xl font-black uppercase outline-none placeholder:text-zinc-500 placeholder:opacity-100"
                />
              </div>
              <div className="border-b-4 border-zinc-800 pb-4 flex items-start gap-6 group focus-within:border-[#00FFFF] transition-colors">
                <MessageSquare className="text-[#00FFFF] mt-2" />
                <textarea
                  placeholder={t.form_story}
                  className="bg-transparent w-full text-lg md:text-xl font-bold uppercase outline-none h-40 resize-none placeholder:text-zinc-500 placeholder:opacity-100"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#FF00FF] text-white py-8 text-2xl md:text-4xl font-black uppercase italic hover:bg-[#39FF14] hover:text-black transition-all shadow-[10px_10px_0px_0px_#00FFFF] md:shadow-[15px_15px_0px_0px_#FF00FF]"
              >
                {t.submit}
              </button>
              <button
                type="button"
                onClick={() => setView('home')}
                className="w-full text-zinc-600 font-black uppercase italic pt-6 hover:text-white transition-colors"
              >
                {t.gift_success_btn}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-[#39FF14] text-black p-8 md:p-12 max-w-2xl border-[6px] md:border-[10px] border-white shadow-[15px_15px_0px_0px_#FF00FF]"
            >
              <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none mb-6">
                {t.success_title}
              </h2>
              <p className="text-lg md:text-2xl font-black uppercase mb-12 tracking-tight">
                {t.success_msg}
              </p>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setView('home');
                }}
                className="bg-black text-white px-10 py-4 font-black uppercase italic hover:bg-white hover:text-black transition-colors w-full sm:w-auto"
              >
                {lang === 'EN' ? 'UNDERSTOOD.' : 'ANLAŞILDI.'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGiftSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 100, scale: 0.9 }}
              animate={{ y: 0, scale: 1 }}
              className="bg-[#FF00FF] text-white p-8 md:p-16 max-w-3xl border-[10px] border-black shadow-[30px_30px_0px_0px_#39FF14] relative"
            >
              <button
                onClick={() => setShowGiftSuccess(false)}
                className="absolute top-4 right-4 bg-black text-white p-2 border-2 border-white"
              >
                <X size={24} />
              </button>
              <div className="space-y-8 text-center sm:text-left">
                <div className="flex items-center gap-6 justify-center sm:justify-start">
                  <Heart className="text-black fill-black" size={64} />
                  <h2 className="text-5xl md:text-7xl font-black uppercase italic leading-[0.8]">
                    {t.gift_success_title}
                  </h2>
                </div>
                <div className="space-y-4 font-black uppercase italic text-lg md:text-2xl text-black">
                  <p>{t.gift_success_msg_1}</p>
                  <p>{t.gift_success_msg_2}</p>
                  <p>{t.gift_success_msg_3}</p>
                  <p className="bg-black text-[#39FF14] p-4 inline-block">
                    {t.gift_success_highlight}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowGiftSuccess(false);
                    setSelected(null);
                  }}
                  className="w-full bg-white text-black py-6 text-2xl font-black uppercase hover:bg-black hover:text-white transition-all"
                >
                  {t.gift_success_btn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAltSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-[#00FFFF] text-black p-8 md:p-16 max-w-3xl border-[10px] border-white shadow-[30px_30px_0px_0px_#FF00FF] relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 text-white opacity-20 rotate-12">
                <Zap size={200} />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="bg-black p-4 rotate-12 shadow-[5px_5px_0px_0px_#FFF]">
                    <Sparkles className="text-[#00FFFF]" size={48} />
                  </div>
                  <h2 className="text-5xl md:text-6xl font-black uppercase italic leading-none">
                    {t.alt_success_title}
                  </h2>
                </div>
                <div className="space-y-6 font-black uppercase italic text-lg md:text-2xl">
                  <p className="bg-white px-2 inline-block">
                    {t.alt_success_sub}
                  </p>
                  <p>{t.alt_success_msg}</p>
                  <div className="flex items-center gap-3 text-sm tracking-widest bg-black text-white p-4">
                    <Zap size={20} className="animate-pulse" />
                    {t.alt_success_footer}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAltSuccess(false);
                    setSelected(null);
                  }}
                  className="w-full bg-black text-white py-6 text-2xl font-black uppercase hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_#FF00FF]"
                >
                  {t.alt_success_btn}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected ? (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/98 p-4 backdrop-blur-3xl overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-[#111] border-[4px] md:border-[8px] border-black max-w-[480px] w-full my-auto relative overflow-hidden flex flex-col shadow-[20px_20px_0px_0px_#FF00FF]"
            >
              <div className="w-full relative aspect-[4/5] border-b-[8px] border-black">
                <div className="absolute top-6 left-6 z-30 bg-[#39FF14] border-2 border-black px-4 py-1">
                  <span className="text-2xl font-black italic text-black tracking-tighter">
                    ${selected.price}
                  </span>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-6 right-6 z-50 bg-black p-2 border-2 border-zinc-800 hover:border-[#FF00FF] transition-all text-white"
                >
                  <X size={24} />
                </button>
                <Image
                  src={selected.image}
                  alt={selected.title[lang]}
                  fill
                  sizes="(max-width: 640px) 100vw, 480px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-sm md:text-base font-black text-[#FF00FF] uppercase mb-0 tracking-widest drop-shadow-md">
                    {selected.creator}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-[0.85] text-white tracking-tighter drop-shadow-lg">
                    {selected.title[lang]}
                  </h2>
                </div>
              </div>

              <div className="w-full p-8 md:p-10 bg-[#0a0a0a] flex flex-col gap-8">
                <div className="flex justify-between items-center text-xs font-black uppercase text-zinc-600 border-b-2 border-zinc-900 pb-4">
                  <span className="bg-zinc-900 px-3 py-1 rounded-sm">
                    ID: {selected.id}
                  </span>
                  <span className="text-zinc-500">{selected.location}</span>
                </div>

                <div className="flex flex-col gap-4">
                  {!showAltForm ? (
                    <>
                      <button
                        onClick={() => setShowGiftSuccess(true)}
                        className="w-full bg-[#FF00FF] text-white py-5 text-sm font-black uppercase hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
                      >
                        <Gift size={20} /> {t.gift}
                      </button>
                      <button
                        onClick={() => setShowAltForm(true)}
                        className="w-full bg-white text-black py-4 text-xs font-black uppercase hover:bg-[#00FFFF] transition-all border-2 border-transparent hover:border-black"
                      >
                        {t.alternative}
                      </button>
                      <div className="text-[10px] text-zinc-600 font-black uppercase italic text-center pt-2">
                        {lang === 'EN' ? 'THE UPGRADE:' : 'LEVEL UP:'}{' '}
                        {selected.altSuggestion}
                      </div>
                    </>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleAltSubmit}
                      className="space-y-4 border-2 border-[#00FFFF] p-4 bg-black"
                    >
                      <div className="text-[10px] font-black text-[#00FFFF] uppercase mb-2 leading-tight">
                        {lang === 'EN'
                          ? `SAME VIBE, DIFFERENT PLACE? (MIN $${selected.price})`
                          : `AYNI ENERJİ, BAŞKA BİR YER? (MİN $${selected.price})`}
                      </div>
                      <textarea
                        required
                        value={altInput}
                        onChange={(e) => setAltInput(e.target.value)}
                        placeholder={
                          lang === 'EN'
                            ? `Suggest ${selected.title[lang]} alternative...`
                            : 'DAHA İYİ BİR ALTERNATİF ÖNER...'
                        }
                        className="bg-zinc-900 border border-zinc-800 w-full p-3 text-xs font-bold text-white outline-none focus:border-[#00FFFF] h-24 resize-none placeholder:text-zinc-600"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="flex-1 bg-[#39FF14] text-black py-3 text-[10px] font-black uppercase hover:bg-white transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={14} /> {lang === 'EN' ? 'SEND' : 'GÖNDER'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAltForm(false)}
                          className="bg-zinc-800 text-white px-4 py-3 text-[10px] font-black uppercase hover:bg-red-600 transition-all"
                        >
                          {lang === 'EN' ? 'CANCEL' : 'VAZGEÇ'}
                        </button>
                      </div>
                    </motion.form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

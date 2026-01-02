'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Zap,
  Menu,
  X,
  Star,
  Play,
  Send,
  Lock,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';

// --- CONTENT & TRANSLATIONS ---
const CONTENT = {
  en: {
    nav: {
      features: "FEATURES",
      howItWorks: "HOW IT WORKS",
      manifesto: "MANIFESTO",
      getApp: "GET THE APP"
    },
    hero: {
      badge: "LIVE BETA V1.0 // WORLDWIDE",
      title1: "SEND",
      title2: "REAL",
      title3: "MOMENTS",
      desc: (
        <>
          Virtual gifts are <span className="highlight-text">CRINGE.</span><br/>
          Send a real coffee to someone in Paris right now. Distance is just a number, the experience is universal. 🧢
        </>
      ),
      ctaStart: "START NOW",
      ctaDemo: "WATCH DEMO",
      soon: "SOON",
      sticker: "NO FILTER\nJUST LIFE"
    },
    stash: {
      subtitle: "/// CURATED DROPS",
      titleStart: "THE",
      titleEnd: "STASH",
      desc: "Forget boring gifts. This stash is strictly for the cool stuff. Real experiences, real people.",
      cta: "VIEW ALL DROPS",
      wants: "WANTS THIS",
      hot: "HOT 🔥"
    },
    manifesto: {
      subtitle: "/// THE MANIFESTO",
      titleStart: "We reject the",
      titleHighlight: "Metaverse.",
      titleEnd: "",
      p1: "We crave sugar, caffeine, and human connection. Pixels don't taste like anything.",
      p2: "TravelMatch is the anti-social social club. We use tech to get you OFF your phone and INTO a coffee shop.",
      cta: "JOIN THE RESISTANCE",
      videoBtn: "WATCH FILM",
      videoAlert: "Full Film Coming Soon 🎬",
      bgText: "REBEL AGAINST THE METAVERSE • "
    },
    footer: {
      spots: "SPOTS LIMITED",
      soon: "SOON",
      placeholder: "ENTER YOUR EMAIL...",
      join: "JOIN",
      comingSoon: "COMING SOON",
      rights: "TravelMatch Inc.",
      location: "Est. 2025 // Istanbul"
    },
    popup: {
      requesting: "IS REQUESTING THIS",
      amount: "TOTAL AMOUNT",
      fees: "FEES",
      waived: "WAIVED 🎉",
      cta: "CONFIRM & SEND",
      note: "Funds held in escrow until meetup is verified.",
      success: "MOMENT SENT SUCCESSFULLY! ✈️"
    },
    mailSubject: "TravelMatch Beta Access Request 🚀",
    mailBody: "Hey TravelMatch Team! \n\nI want to join the beta. \n\nMy Device: (Please keep one)\n[ ] iOS (iPhone)\n[ ] Android\n\nMy Email for TestFlight/PlayStore: "
  },
  tr: {
    nav: {
      features: "ÖZELLİKLER",
      howItWorks: "NASIL ÇALIŞIR",
      manifesto: "MANIFESTO",
      getApp: "UYGULAMAYI İNDİR"
    },
    hero: {
      badge: "CANLI BETA V1.0 // DÜNYA ÇAPINDA",
      title1: "GERÇEK",
      title2: "ANLAR",
      title3: "GÖNDER",
      desc: (
        <>
          Sanal hediyeler <span className="highlight-text">KRİNÇ.</span><br/>
          Şu an Paris&apos;teki birine gerçek bir kahve ısmarla. Mesafe sadece bir sayı, deneyim evrenseldir. 🧢
        </>
      ),
      ctaStart: "BAŞLA",
      ctaDemo: "DEMOYU İZLE",
      soon: "YAKINDA",
      sticker: "FİLTRE YOK\nSADECE HAYAT"
    },
    stash: {
      subtitle: "/// SEÇİLMİŞ DROPLAR",
      titleStart: "",
      titleEnd: "ZULA",
      desc: "Sıkıcı hediyeleri unut. Bu zula (stash) sadece havalı şeyler için. Gerçek deneyimler, gerçek insanlar.",
      cta: "TÜM DROPLARI GÖR",
      wants: "BUNU İSTİYOR",
      hot: "ATEŞ 🔥"
    },
    manifesto: {
      subtitle: "/// MANİFESTO",
      titleStart: "Biz",
      titleHighlight: "Metaverse'ü",
      titleEnd: "Reddediyoruz.",
      p1: "Şeker, kafein ve insan teması istiyoruz. Piksellerin tadı tuzu yok.",
      p2: "TravelMatch, anti-sosyal bir sosyal kulüptür. Teknolojiyi seni telefondan ÇIKARIP bir kafeye SOKMAK için kullanıyoruz.",
      cta: "DİRENİŞE KATIL",
      videoBtn: "FİLMİ İZLE",
      videoAlert: "Film Çok Yakında 🎬",
      bgText: "METAVERSE'E KARŞI DİRENİŞ • "
    },
    footer: {
      spots: "SINIRLI KONTENJAN",
      soon: "YAKINDA",
      placeholder: "E-POSTANI GİR...",
      join: "KATIL",
      comingSoon: "ÇOK YAKINDA",
      rights: "TravelMatch A.Ş.",
      location: "Kuruluş 2025 // İstanbul"
    },
    popup: {
      requesting: "BU ANI İSTİYOR",
      amount: "TOPLAM TUTAR",
      fees: "KOMİSYON",
      waived: "BİZDEN OLSUN 🎉",
      cta: "ONAYLA & GÖNDER",
      note: "Para, buluşma onaylanana kadar havuzda tutulur.",
      success: "ANINIZ BAŞARIYLA GÖNDERİLDİ! ✈️"
    },
    mailSubject: "TravelMatch Beta Erişim Talebi 🚀",
    mailBody: "Selam TravelMatch Ekibi! \n\nBeta sürümüne katılmak istiyorum. \n\nCihazım: (Lütfen birini seçin)\n[ ] iOS (iPhone)\n[ ] Android\n\nTestFlight/PlayStore E-postam: "
  }
};

// Type definitions
type Language = 'en' | 'tr';
type ContentType = typeof CONTENT.en;

interface GiftItem {
  id: number;
  title: string;
  loc: string;
  price: string;
  color: string;
  user: string;
  userImg: string;
  img: string;
}

// --- STYLES & ANIMATIONS ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500;700&display=swap');

    :root {
      --acid: #CCFF00;
      --neon-pink: #FF0099;
      --electric-blue: #00F0FF;
      --bg: #050505;
      --text: #ffffff;
    }

    html {
      scroll-behavior: smooth;
      cursor: none;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Space Grotesk', sans-serif;
      overflow-x: hidden;
      margin: 0;
      padding: 0;
    }

    a, button { cursor: none; }

    .font-syne { font-family: 'Syne', sans-serif; }
    .font-grotesk { font-family: 'Space Grotesk', sans-serif; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 10px; height: 10px; }
    ::-webkit-scrollbar-track { background: #111; }
    ::-webkit-scrollbar-thumb { background: var(--acid); border: 2px solid #111; }
    ::-webkit-scrollbar-thumb:hover { background: var(--neon-pink); }

    /* Utilities */
    .text-stroke { -webkit-text-stroke: 2px white; color: transparent; }
    .text-stroke:hover { color: var(--acid); -webkit-text-stroke: 0px; }

    .hide-scroll {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scroll::-webkit-scrollbar { display: none; }

    .highlight-text {
        background-color: var(--neon-pink);
        color: white;
        padding: 0px 8px;
        display: inline-block;
        transform: skew(-10deg);
        border: 2px solid black;
    }

    /* Animations */
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }

    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee { animation: marquee 60s linear infinite; }

    @keyframes marquee-reverse {
      0% { transform: translateX(-50%); }
      100% { transform: translateX(0); }
    }
    .animate-marquee-reverse { animation: marquee-reverse 80s linear infinite; }

    @keyframes popup-in {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes cursor-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}</style>
);

// --- COMPONENTS ---

// 1. CUSTOM CURSOR (ÖZEL İMLEÇ)
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        followerRef.current.animate({
          transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
        }, { duration: 500, fill: 'forwards' });
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div className="hidden md:block">
      <div ref={followerRef} className="fixed top-0 left-0 w-12 h-12 border-2 border-[#CCFF00] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference transition-transform duration-300 ease-out flex items-center justify-center opacity-50">
        <div className="w-full h-full border-t-2 border-[#FF0099] rounded-full animate-[cursor-spin_2s_linear_infinite]"></div>
      </div>
      <div ref={cursorRef} className="fixed top-0 left-0 w-3 h-3 bg-[#CCFF00] rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"></div>
    </div>
  );
};

const Navbar = ({ onMenuClick, lang, setLang, content }: { onMenuClick: () => void, lang: Language, setLang: (l: Language) => void, content: ContentType }) => {
  const handleBetaClick = () => {
    window.location.href = `mailto:beta@travelmatch.app?subject=${encodeURIComponent(content.mailSubject)}&body=${encodeURIComponent(content.mailBody)}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
      <div
        onClick={scrollToTop}
        className="bg-white text-black px-6 py-2 rounded-full font-syne font-black text-xl hover:bg-[#CCFF00] transition-colors cursor-pointer border-2 border-transparent hover:border-black pointer-events-auto shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
      >
        travelmatch.
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
        {/* Minimal Language Switcher */}
        <button
            onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
            className="hidden md:flex items-center gap-2 text-white/70 hover:text-[#CCFF00] font-mono font-bold text-sm transition-colors"
        >
            <span className={lang === 'en' ? 'text-white' : ''}>EN</span>
            <span className="text-white/30">|</span>
            <span className={lang === 'tr' ? 'text-white' : ''}>TR</span>
        </button>

        <button
          onClick={handleBetaClick}
          className="hidden md:block bg-white text-black px-6 py-2 rounded-full font-bold font-mono text-sm hover:bg-[#CCFF00] transition-all hover:scale-105"
        >
          {content.nav.getApp}
        </button>

        <button
          onClick={onMenuClick}
          className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[#CCFF00] hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_#fff]"
        >
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
};

const Marquee = () => {
  const CITIES = [
    "ISTANBUL 🇹🇷", "PARIS 🇫🇷", "TOKYO 🇯🇵", "NEW YORK 🇺🇸", "LONDON 🇬🇧",
    "ROME 🇮🇹", "BANGKOK 🇹🇭", "DUBAI 🇦🇪", "BARCELONA 🇪🇸", "AMSTERDAM 🇳🇱",
    "RIO 🇧🇷", "SYDNEY 🇦🇺", "CAPE TOWN 🇿🇦", "SINGAPORE 🇸🇬", "SEOUL 🇰🇷"
  ];

  return (
    <div className="bg-[#CCFF00] py-4 border-y-4 border-black overflow-hidden flex relative z-20 transform -rotate-1 scale-105 shadow-xl hover:rotate-0 transition-transform">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex">
            {CITIES.map((city, index) => (
              <span key={`${i}-${index}`} className="text-4xl font-syne font-black text-black mx-8 flex items-center gap-4 hover:text-white transition-colors cursor-default select-none">
                {city} <Star size={24} fill="black" className="text-black" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const Hero = ({ onNotify, content }: { onNotify: (msg: string) => void, content: ContentType }) => {
    const handleBetaClick = () => {
        window.location.href = `mailto:beta@travelmatch.app?subject=${encodeURIComponent(content.mailSubject)}&body=${encodeURIComponent(content.mailBody)}`;
    };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20 bg-[#050505]">
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#FF0099] rounded-full blur-[150px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00F0FF] rounded-full blur-[150px] opacity-20"></div>
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Floating Stickers */}
      <div className="absolute top-[25%] left-[10%] rotate-[-12deg] z-10 hidden lg:block animate-float">
         <div className="bg-white text-black font-mono font-black text-lg px-6 py-3 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] transform hover:scale-110 transition-transform cursor-pointer">
            ✈️ CATCH FLIGHTS
         </div>
      </div>
      <div className="absolute bottom-[20%] right-[10%] rotate-[6deg] z-10 animate-float" style={{ animationDelay: '1.5s' }}>
         <div className="bg-[#CCFF00] text-black font-mono font-black text-xl px-8 py-12 rounded-[50%] border-4 border-black flex items-center justify-center text-center leading-tight shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:rotate-12 transition-transform cursor-pointer whitespace-pre-line">
            {content.hero.sticker}
         </div>
      </div>

      <div className="relative z-20 text-center flex flex-col items-center max-w-6xl px-4">
         <button
           onClick={handleBetaClick}
           className="inline-flex items-center gap-3 bg-[#111] border border-white/30 px-6 py-2 rounded-full mb-10 hover:bg-[#CCFF00] hover:text-black hover:border-black transition-colors cursor-pointer group"
         >
            <span className="w-3 h-3 rounded-full bg-[#00F0FF] animate-pulse group-hover:bg-black"></span>
            <span className="font-mono text-sm font-bold tracking-widest">{content.hero.badge}</span>
         </button>

         <h1 className="font-syne font-black text-[13vw] leading-[0.8] text-white tracking-tighter mb-10 drop-shadow-2xl select-none">
            <span className="block hover:text-[#CCFF00] transition-colors duration-300">{content.hero.title1}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] via-[#FF0099] to-[#00F0FF]">{content.hero.title2}</span>
            <span className="block text-stroke transition-colors duration-300">{content.hero.title3}</span>
         </h1>

         <div className="bg-black/80 backdrop-blur-xl border-2 border-white/20 p-8 rounded-2xl max-w-3xl transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-2xl">
            <p className="font-grotesk text-xl md:text-3xl text-gray-200 font-medium leading-relaxed">
               {content.hero.desc}
            </p>
         </div>

         <div className="mt-16 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <button
               onClick={() => document.getElementById('stash')?.scrollIntoView()}
               className="bg-[#CCFF00] text-black px-12 py-6 rounded-2xl font-syne font-black text-2xl border-4 border-black shadow-[8px_8px_0px_#fff] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex items-center justify-center gap-3"
            >
               {content.hero.ctaStart} <Zap fill="black" size={28} />
            </button>
            <button
               onClick={() => onNotify(`${content.hero.soon} 🎥`)}
               className="bg-white text-black px-12 py-6 rounded-2xl font-syne font-black text-2xl border-4 border-black shadow-[8px_8px_0px_#00F0FF] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all relative group"
            >
               {content.hero.ctaDemo}
               <span className="absolute -top-4 -right-4 bg-[#FF0099] text-white text-xs font-mono px-3 py-1 border-2 border-black transform rotate-12 group-hover:rotate-0 transition-transform shadow-sm">{content.hero.soon}</span>
            </button>
         </div>
      </div>
    </section>
  );
};

const StashCard = ({ item, onSelect, content }: { item: GiftItem, onSelect: (i: GiftItem) => void, content: ContentType }) => (
  <div
    onClick={() => onSelect(item)}
    className="group relative min-w-[320px] md:min-w-[360px] aspect-[4/5] cursor-none snap-center perspective-1000"
  >
    <div className="w-full h-full relative transition-all duration-500 group-hover:-translate-y-4 group-hover:rotate-1">
      {/* Card Content */}
      <div className="absolute inset-0 bg-black border-4 border-white rounded-[30px] overflow-hidden z-10 flex flex-col">

         <div className="relative flex-1 overflow-hidden">
             <Image src={item.img} alt={item.title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110" unoptimized />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

             {/* Top User Badge */}
             <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 py-1.5 pl-1.5 pr-4 rounded-full flex items-center gap-3 shadow-lg">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative">
                    <Image src={item.userImg} fill className="object-cover" alt={item.user} unoptimized />
                </div>
                <div className="flex flex-col">
                    <span className="text-white text-xs font-bold leading-none">{item.user}</span>
                    <span className="text-[#CCFF00] text-[9px] font-mono leading-none mt-1">{content.stash.wants}</span>
                </div>
             </div>

             <div className="absolute top-4 right-4 bg-[#FF0099] text-white font-bold px-3 py-1 rounded-lg border-2 border-black text-xs rotate-3 shadow-sm">
                {content.stash.hot}
             </div>
         </div>

         {/* Bottom Info */}
         <div className="p-6 bg-black border-t-4 border-white relative">
            <div className={`absolute -top-5 left-6 inline-block px-4 py-1 border-2 border-black transform -skew-x-12 shadow-[4px_4px_0px_rgba(0,0,0,0.5)] ${item.color === 'pink' ? 'bg-[#FF0099] text-white' : 'bg-[#00F0FF] text-black'}`}>
               <span className="font-mono font-bold text-sm tracking-widest">{item.loc}</span>
            </div>

            <h3 className="text-5xl font-syne font-black text-white leading-none mb-4 uppercase mt-2">{item.title}</h3>

            <div className="flex justify-between items-center">
                <span className="bg-[#111] text-white font-mono font-bold text-2xl px-3 py-1 border border-white/30 rounded-lg">
                   {item.price}
                </span>
                <button className="w-14 h-14 bg-[#CCFF00] rounded-full border-4 border-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[4px_4px_0px_#000]">
                   <ArrowUpRight size={32} color="black" strokeWidth={2.5} />
                </button>
            </div>
         </div>
      </div>

      {/* Retro Shadow Layer */}
      <div className={`absolute top-5 left-5 w-full h-full rounded-[30px] border-4 border-white z-0 ${item.color === 'pink' ? 'bg-[#FF0099]' : 'bg-[#00F0FF]'}`}></div>
    </div>
  </div>
);

const TheStash = ({ onGiftSelect, onNotify, content }: { onGiftSelect: (item: GiftItem) => void, onNotify: (msg: string) => void, content: ContentType }) => {
  const items: GiftItem[] = [
    { id: 1, title: "Frappé", loc: "ATHENS", price: "$4.50", color: "pink", user: "@elena", userImg: "https://i.pravatar.cc/150?u=10", img: "https://images.unsplash.com/photo-1570535189745-f09dfd785721?q=80&w=600&auto=format&fit=crop" },
    { id: 2, title: "Croissant", loc: "PARIS", price: "$5.00", color: "blue", user: "@jean", userImg: "https://i.pravatar.cc/150?u=20", img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop" },
    { id: 3, title: "Gold Latte", loc: "DUBAI", price: "$24.00", color: "pink", user: "@sara", userImg: "https://i.pravatar.cc/150?u=30", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop" },
    { id: 4, title: "Baklava", loc: "ISTANBUL", price: "$9.00", color: "blue", user: "@can", userImg: "https://i.pravatar.cc/150?u=40", img: "https://images.unsplash.com/photo-1622485579953-6059d4c26a57?q=80&w=600&auto=format&fit=crop" },
    { id: 5, title: "Burger", loc: "NYC", price: "$12.00", color: "pink", user: "@mike", userImg: "https://i.pravatar.cc/150?u=50", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop" },
  ];

  return (
    <section id="stash" className="py-32 bg-[#111] relative border-t-8 border-[#CCFF00]">
       <div className="container mx-auto px-6 mb-20 flex flex-col md:flex-row items-end justify-between gap-10">
          <div>
             <div className="flex items-center gap-4 mb-4">
                <span className="text-[#CCFF00] font-mono text-sm tracking-widest bg-black px-2 py-1 border border-[#CCFF00]">{content.stash.subtitle}</span>
                <div className="h-[2px] w-32 bg-[#CCFF00]"></div>
             </div>
             <h2 className="text-6xl md:text-9xl font-syne font-black text-white leading-none drop-shadow-[4px_4px_0px_#000]">
                {content.stash.titleStart} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] to-[#00F0FF] hover:text-white transition-colors cursor-pointer">{content.stash.titleEnd}</span>
             </h2>
             <p className="font-grotesk text-gray-400 mt-6 text-xl max-w-lg">
                {content.stash.desc}
             </p>
          </div>
          <button
            onClick={() => onNotify(`Full Stash V2.0 🔒`)}
            className="group flex items-center gap-3 border-2 border-white px-8 py-4 rounded-full text-white font-mono text-lg font-bold hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
             {content.stash.cta} <Lock size={20} />
          </button>
       </div>

       <div className="flex overflow-x-auto gap-10 px-6 pb-24 hide-scroll snap-x">
          {items.map(item => (
             <StashCard key={item.id} item={item} onSelect={onGiftSelect} content={content} />
          ))}
          <div className="w-10 flex-shrink-0"></div>
       </div>
    </section>
  );
};

const Manifesto = ({ onNotify, content }: { onNotify: (msg: string) => void, content: ContentType }) => (
    <section id="manifesto" className="py-40 bg-[#CCFF00] border-y-8 border-black relative overflow-hidden">
        {/* HUGE Background Scrolling Text */}
        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 opacity-5 pointer-events-none select-none overflow-hidden">
            <div className="whitespace-nowrap font-black font-syne text-[20vw] leading-none text-black animate-marquee-reverse">
                {content.manifesto.bgText}{content.manifesto.bgText}{content.manifesto.bgText}
            </div>
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
            <div>
                <div className="bg-black text-white font-mono font-black text-sm inline-block px-5 py-2 border-2 border-white mb-8 transform -rotate-2 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                   {content.manifesto.subtitle}
                </div>
                <h2 className="font-syne font-black text-6xl md:text-8xl leading-[0.9] text-black mb-10 uppercase drop-shadow-lg">
                   {content.manifesto.titleStart} <br/><span className="text-[#FF0099] underline decoration-8 decoration-black">{content.manifesto.titleHighlight}</span> {content.manifesto.titleEnd}
                </h2>
                <div className="font-grotesk text-xl md:text-3xl font-bold text-black space-y-8 leading-tight">
                    <p className="border-l-8 border-black pl-8">{content.manifesto.p1}</p>
                    <p className="border-l-8 border-black pl-8">{content.manifesto.p2}</p>
                </div>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView()}
                  className="mt-12 bg-black text-white px-12 py-6 font-syne font-black text-2xl hover:bg-white hover:text-black transition-colors shadow-[10px_10px_0px_0px_#fff] border-4 border-white hover:border-black"
                >
                   {content.manifesto.cta}
                </button>
            </div>

            {/* Video Placeholder Box */}
            <div
              className="relative aspect-video bg-black border-[6px] border-black p-4 rotate-3 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)] group cursor-pointer hover:rotate-0 transition-transform duration-500"
              onClick={() => onNotify(content.manifesto.videoAlert)}
            >
                <div className="w-full h-full bg-[#1a1a1a] relative overflow-hidden border-2 border-white/20">
                    <Image src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 grayscale group-hover:grayscale-0" alt="Manifesto video" unoptimized />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center group-hover:scale-110 transition-transform bg-black/40 backdrop-blur-sm group-hover:bg-[#CCFF00] group-hover:border-black">
                            <Play fill="currentColor" size={40} className="ml-2 text-white group-hover:text-black" />
                        </div>
                    </div>
                </div>

                <div className="absolute -bottom-8 -right-8 bg-[#00F0FF] border-4 border-black px-8 py-4 font-mono font-black text-xl text-black shadow-[6px_6px_0px_#000] z-20 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform">
                   {content.manifesto.videoBtn}
                </div>
            </div>
        </div>

        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(#000 3px, transparent 3px)', backgroundSize: '40px 40px'}}></div>
    </section>
);

const Footer = ({ content }: { content: ContentType }) => {
    const [email, setEmail] = useState('');

    const handleJoin = () => {
        if(!email) return;
        window.location.href = `mailto:beta@travelmatch.app?subject=${encodeURIComponent(content.mailSubject)}&body=${encodeURIComponent(content.mailBody + email)}`;
    };

    const handleStoreClick = () => {
        window.location.href = `mailto:beta@travelmatch.app?subject=${encodeURIComponent(content.mailSubject)}&body=${encodeURIComponent(content.mailBody)}`;
    };

    return (
        <footer id="contact" className="bg-black pt-32 pb-16 px-6 relative overflow-hidden border-t-8 border-white">
            <div className="container mx-auto relative z-10 text-center">

            <div className="inline-block mb-8">
                <span className="bg-[#FF0099] text-white font-mono font-bold px-4 py-1 text-sm border-2 border-white transform -rotate-3 inline-block">{content.footer.spots}</span>
            </div>

            <h2 className="font-syne font-black text-[15vw] leading-[0.8] text-[#222] mb-12 uppercase tracking-tighter hover:text-[#CCFF00] transition-colors cursor-default select-none drop-shadow-lg">
                {content.footer.soon}
            </h2>

            <div className="max-w-2xl mx-auto mb-24 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#CCFF00] to-[#00F0FF] transform translate-x-4 translate-y-4 rounded-2xl blur-none border-2 border-black"></div>
                <div className="relative flex flex-col md:flex-row border-4 border-white bg-black rounded-2xl overflow-hidden p-2 gap-2">
                    <input
                        type="email"
                        placeholder={content.footer.placeholder}
                        className="flex-1 bg-[#111] text-white font-mono text-xl px-6 py-4 focus:outline-none placeholder-gray-600 uppercase rounded-xl border border-transparent focus:border-[#CCFF00]"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    <button
                      onClick={handleJoin}
                      className="bg-white text-black px-10 py-4 font-bold font-syne text-xl uppercase hover:bg-[#CCFF00] transition-colors flex items-center justify-center gap-3 rounded-xl border-2 border-transparent hover:border-black"
                    >
                      {content.footer.join} <Send size={24} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-10 mb-24">
                {['APP STORE', 'PLAY STORE'].map((store, i) => (
                    <div key={i} className="relative group w-full md:w-auto">
                        <button
                            onClick={handleStoreClick}
                            className="bg-[#111] text-white w-full md:w-72 py-5 rounded-2xl font-bold font-syne text-2xl border-4 border-[#333] flex items-center justify-center gap-4 group-hover:border-white group-hover:bg-black transition-all"
                        >
                            <span className="text-3xl">{store === 'APP STORE' ? '' : '▶'}</span> {store}
                        </button>
                        <div className={`absolute -top-4 -right-4 ${i===0 ? 'bg-[#CCFF00] text-black' : 'bg-[#FF0099] text-white'} text-xs font-black font-mono py-1.5 px-4 border-2 border-black transform ${i===0 ? 'rotate-6' : '-rotate-6'} shadow-[4px_4px_0px_#000] z-20 pointer-events-none`}>
                            {content.footer.comingSoon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-[#333] pt-12 flex flex-col md:flex-row justify-between items-center font-mono font-bold text-gray-500 text-sm uppercase">
                <div className="text-left mb-6 md:mb-0">
                    <p className="text-white text-lg font-syne">{content.footer.rights}</p>
                    <p>{content.footer.location}</p>
                </div>
                <div className="flex gap-8 text-lg">
                    <a href="#" className="hover:text-[#CCFF00] transition-colors">Instagram</a>
                    <a href="#" className="hover:text-[#CCFF00] transition-colors">TikTok</a>
                    <a href="#" className="hover:text-[#CCFF00] transition-colors">Twitter</a>
                </div>
            </div>
            </div>
        </footer>
    );
};

// --- MODALS ---

const GiftPopup = ({ item, onClose, onConfirm, content }: { item: GiftItem, onClose: () => void, onConfirm: () => void, content: ContentType }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-[popup-in_0.3s_ease-out]">
    <div className="relative bg-[#050505] border-[6px] border-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 shadow-[20px_20px_0px_#CCFF00]">
      <button onClick={onClose} className="absolute top-6 right-6 text-white hover:text-[#CCFF00] hover:rotate-90 transition-all z-20 bg-black border border-white rounded-full p-2">
        <X size={24} />
      </button>

      <div className="flex flex-col items-center mt-4 mb-8">
         <div className="relative mb-4 group cursor-pointer">
            <div className="absolute inset-0 bg-[#CCFF00] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <Image src={item.userImg} width={112} height={112} className="rounded-full border-4 border-[#CCFF00] relative z-10 object-cover" alt={item.user} unoptimized />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-sm font-bold px-4 py-1 border-2 border-white rounded-full z-20 whitespace-nowrap">
               {item.user}
            </div>
         </div>
         <div className="text-gray-500 font-mono text-sm tracking-[0.2em] mt-4">{content.popup.requesting}</div>
      </div>

      <div className="text-center">
        <h3 className="font-syne font-black text-6xl text-white mb-4 uppercase leading-none">{item.title}</h3>
        <p className="font-mono text-[#00F0FF] text-xl mb-10 tracking-widest flex items-center justify-center gap-2 border-y border-white/10 py-4">
            <MapPin size={20} /> {item.loc}
        </p>

        {/* REVISED: No FEES box, full width TOTAL box */}
        <div className="w-full bg-[#111] border border-white/20 p-4 rounded-xl text-center mb-8">
            <div className="text-gray-500 font-mono text-xs mb-1">{content.popup.amount}</div>
            <div className="text-white font-syne font-bold text-4xl">{item.price}</div>
        </div>

        <button
            onClick={onConfirm}
            className="w-full bg-[#FF0099] text-white py-6 font-syne font-black text-2xl border-4 border-black hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-wide flex items-center justify-center gap-4 group"
        >
          {content.popup.cta} <Send size={28} className="group-hover:translate-x-2 transition-transform" />
        </button>

        <p className="text-gray-500 text-xs mt-6 font-mono">{content.popup.note}</p>
      </div>
    </div>
  </div>
);

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] animate-[float_0.5s_ease-out] w-full max-w-md px-4">
        <div className="bg-[#CCFF00] border-4 border-black px-8 py-5 shadow-[8px_8px_0px_0px_#000] flex items-center gap-5 justify-center transform rotate-1">
            <span className="text-3xl animate-pulse">⚡️</span>
            <span className="font-mono font-bold text-black uppercase tracking-wide text-lg">{message}</span>
        </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function Home() {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  const c = CONTENT[lang];

  const handleGiftConfirm = () => {
      setSelectedGift(null);
      setNotification(c.popup.success);
  };

  const handleMenuClick = () => {
      setMenuOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#CCFF00] selection:text-black">
      <GlobalStyles />

      {/* Noise Overlay */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Custom Cursor */}
      <CustomCursor />

      <Navbar onMenuClick={handleMenuClick} lang={lang} setLang={setLang} content={c} />

      {/* Full Screen Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 bg-[#FF0099] z-[100] flex flex-col items-center justify-center animate-[popup-in_0.3s_ease-out]">
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-8 right-8 text-black hover:text-white transition-colors cursor-pointer"
            >
                <X size={48} />
            </button>
            <div className="flex flex-col gap-6 text-center">
                {[c.nav.features, c.stash.titleEnd, c.nav.manifesto, 'CONTACT'].map((item) => (
                    <button
                        key={item}
                        onClick={() => {
                            setMenuOpen(false);
                            const id = item === c.nav.features ? 'home' :
                                       item === c.stash.titleEnd ? 'stash' :
                                       item === c.nav.manifesto ? 'manifesto' : 'contact';
                            document.getElementById(id)?.scrollIntoView();
                        }}
                        className="font-syne font-black text-6xl md:text-8xl text-black hover:text-white transition-colors uppercase tracking-tighter cursor-pointer"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
      )}

      <main>
        <Hero onNotify={setNotification} content={c} />
        <Marquee />
        <TheStash onGiftSelect={setSelectedGift} onNotify={setNotification} content={c} />
        <Manifesto onNotify={setNotification} content={c} />
        <Footer content={c} />
      </main>

      {/* Modals */}
      {selectedGift && (
        <GiftPopup
            item={selectedGift}
            onClose={() => setSelectedGift(null)}
            onConfirm={handleGiftConfirm}
            content={c}
        />
      )}

      {notification && (
        <Toast message={notification} onClose={() => setNotification(null)} />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
  Globe,
} from 'lucide-react';

// Dynamic imports for 3D (client-side only)
const Scene3D = dynamic(() => import('@/components/3d/Scene3D'), {
  ssr: false,
});
const SentientOrb = dynamic(
  () =>
    import('@/components/3d/SentientOrb').then((m) => ({
      default: m.SentientOrb,
    })),
  { ssr: false },
);
const ParticleField = dynamic(
  () =>
    import('@/components/3d/ParticleField').then((m) => ({
      default: m.ParticleField,
    })),
  { ssr: false },
);
const RealtimeStarsField = dynamic(
  () =>
    import('@/components/3d/ParticleField').then((m) => ({
      default: m.RealtimeStarsField,
    })),
  { ssr: false },
);

// Regular imports
import { LiquidToken } from '@/components/shared/LiquidToken';
import { LockedDrop } from '@/components/stash/LockedDrop';
import { CinematicOverlay } from '@/components/shared/NoiseOverlay';
import { GiftCursor } from '@/components/shared/GiftCursor';
import { useSunsetAtmosphere } from '@/hooks/useSunsetAtmosphere';
import { useRealtimeStars } from '@/hooks/useRealtimeStars';

// --- CONTENT ---
const CONTENT = {
  en: {
    nav: {
      features: 'FEATURES',
      howItWorks: 'HOW IT WORKS',
      manifesto: 'MANIFESTO',
      getApp: 'GET THE APP',
    },
    hero: {
      badge: 'LIVE BETA V1.0 // WORLDWIDE',
      title1: 'STOP WAITING.',
      title2: 'CONNECT INSTANTLY.',
      subtitle: 'Quit the algorithm loop. Prove your intent with a gift, hack the queue, and teleport to the real world.',
      desc: 'Not for the scrollers, but for those who live for the moment.',
      ctaStart: 'ENTER THE STASH',
      ctaDemo: 'WATCH DEMO',
      soon: 'SOON',
    },
    powerPillars: {
      subtitle: '/// WHY TRAVELMATCH',
      title: 'THE POWER PROTOCOL',
      proofOfIntent: {
        title: 'PROOF OF INTENT',
        subtitle: 'Action Over Words',
        desc: 'Skip the small talk. Move to the front of the line with a simple gesture. Show your intent, get noticed instantly.',
      },
      unbufferedMoments: {
        title: 'UNBUFFERED MOMENTS',
        subtitle: 'No Filter Reality',
        desc: 'Stop being a spectator. Real people sharing real moments in real places. Catch a moment and join the scene.',
      },
      engineeredLuck: {
        title: 'ENGINEERED LUCK',
        subtitle: 'Velocity Controlled',
        desc: "Luck isn't random; we control the velocity. The shortest path to meeting the right person at the right place. Hack your social life.",
      },
    },
    stash: {
      subtitle: '/// CURATED DROPS',
      titleStart: 'THE',
      titleEnd: 'STASH',
      desc: 'Forget boring gifts. This stash is strictly for the cool stuff.',
      cta: 'VIEW ALL DROPS',
      wants: 'WANTS THIS',
      hot: 'HOT',
    },
    manifesto: {
      subtitle: '/// THE MANIFESTO',
      titleStart: 'We reject the',
      titleHighlight: 'Metaverse.',
      titleEnd: '',
      p1: 'We crave sugar, caffeine, and human connection.',
      p2: 'TravelMatch gets you OFF your phone and INTO a coffee shop.',
      cta: 'JOIN THE RESISTANCE',
      videoBtn: 'WATCH FILM',
    },
    footer: {
      spots: 'SPOTS LIMITED',
      soon: 'SOON',
      placeholder: 'ENTER YOUR EMAIL...',
      join: 'JOIN',
      comingSoon: 'COMING SOON',
      rights: 'TravelMatch Inc.',
      location: 'Est. 2025 // Istanbul',
    },
    popup: {
      requesting: 'IS REQUESTING THIS',
      amount: 'TOTAL AMOUNT',
      cta: 'CONFIRM & SEND',
      note: 'Funds held in escrow until verified.',
      success: 'MOMENT SENT!',
    },
  },
  tr: {
    nav: {
      features: 'ÖZELLİKLER',
      howItWorks: 'NASIL ÇALIŞIR',
      manifesto: 'MANIFESTO',
      getApp: 'UYGULAMAYI İNDİR',
    },
    hero: {
      badge: 'CANLI BETA V1.0 // DÜNYA ÇAPINDA',
      title1: 'BEKLEMEYİ BIRAK.',
      title2: 'ANINDA BAĞ KUR.',
      subtitle: 'Algoritma döngülerinden çık. Niyetini bir hediye ile kanıtla, bekleme sırasını hackle ve gerçek dünyaya ışınlan.',
      desc: "Tinder'da kaybolanlar için değil, anı yaşayanlar için.",
      ctaStart: "ZULA'YA GİR",
      ctaDemo: 'DEMOYU İZLE',
      soon: 'YAKINDA',
    },
    powerPillars: {
      subtitle: '/// NEDEN TRAVELMATCH',
      title: 'GÜÇ PROTOKOLÜ',
      proofOfIntent: {
        title: 'NİYETİNİ KANITLA',
        subtitle: 'Laf Değil, Eylem',
        desc: 'Boş mesajlarla zaman kaybetme. Küçük bir jest ile etkileşim sırasının en önüne geç. Gerçek niyetini göster, anında fark edil.',
      },
      unbufferedMoments: {
        title: 'FİLTRESİZ GERÇEKLİK',
        subtitle: 'Ekran Yok, Hayat Var',
        desc: 'Ekranın arkasına saklanma. Gerçek insanlar, gerçek mekanlarda, gerçek anlar paylaşıyor. Bir anı yakala ve o sahneye dahil ol.',
      },
      engineeredLuck: {
        title: 'TASARLANMIŞ ŞANS',
        subtitle: 'Hız Bizim Elimizde',
        desc: 'Şans tesadüf değildir, hızı biz ayarlarız. Doğru insanla doğru koordinatta karşılaşmanın en kestirme yolu. Sosyal hayatını hackle.',
      },
    },
    stash: {
      subtitle: '/// SEÇİLMİŞ DROPLAR',
      titleStart: '',
      titleEnd: 'ZULA',
      desc: 'Sıkıcı hediyeleri unut. Bu zula sadece havalı şeyler için.',
      cta: 'TÜM DROPLARI GÖR',
      wants: 'BUNU İSTİYOR',
      hot: 'ATEŞ',
    },
    manifesto: {
      subtitle: '/// MANİFESTO',
      titleStart: 'Biz',
      titleHighlight: "Metaverse'ü",
      titleEnd: 'Reddediyoruz.',
      p1: 'Şeker, kafein ve insan bağlantısı istiyoruz.',
      p2: 'TravelMatch seni telefondan ÇIKARIP kafeye SOKUYOR.',
      cta: 'DİRENİŞE KATIL',
      videoBtn: 'FİLMİ İZLE',
    },
    footer: {
      spots: 'SINIRLI KONTENJAN',
      soon: 'YAKINDA',
      placeholder: 'E-POSTANI GİR...',
      join: 'KATIL',
      comingSoon: 'ÇOK YAKINDA',
      rights: 'TravelMatch A.Ş.',
      location: 'Kuruluş 2025 // İstanbul',
    },
    popup: {
      requesting: 'BU ANI İSTİYOR',
      amount: 'TOPLAM TUTAR',
      cta: 'ONAYLA & GÖNDER',
      note: 'Para onaylanana kadar havuzda.',
      success: 'AN GÖNDERİLDİ!',
    },
  },
};

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

// Custom Cursor
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current && followerRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        followerRef.current.animate(
          { transform: `translate3d(${e.clientX}px, ${e.clientY}px, 0)` },
          { duration: 500, fill: 'forwards' },
        );
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <div className="hidden md:block">
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-12 h-12 border-2 border-[var(--acid)] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference opacity-50"
      />
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-[var(--acid)] rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      />
    </div>
  );
};

// Navbar
const Navbar = ({
  onMenuClick,
  lang,
  setLang,
}: {
  onMenuClick: () => void;
  lang: Language;
  setLang: (l: Language) => void;
  content: ContentType;
}) => (
  <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference pointer-events-none">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white text-black px-6 py-2 rounded-full font-syne font-black text-xl hover:bg-[var(--acid)] transition-colors cursor-pointer pointer-events-auto shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
    >
      travelmatch.
    </motion.div>
    <div className="flex items-center gap-6 pointer-events-auto">
      <button
        onClick={() => setLang(lang === 'en' ? 'tr' : 'en')}
        className="hidden md:flex items-center gap-2 text-white/70 hover:text-[var(--acid)] font-mono font-bold text-sm"
      >
        <Globe size={16} />
        <span className={lang === 'en' ? 'text-white' : ''}>EN</span>
        <span className="text-white/30">|</span>
        <span className={lang === 'tr' ? 'text-white' : ''}>TR</span>
      </button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMenuClick}
        className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center border-2 border-white hover:bg-[var(--acid)] hover:text-black transition-all shadow-[4px_4px_0px_#fff]"
      >
        <Menu size={24} />
      </motion.button>
    </div>
  </nav>
);

// Hero with 3D Orb
const ImmersiveHero = ({
  content,
  onNotify,
}: {
  content: ContentType;
  onNotify: (msg: string) => void;
}) => {
  const { stars } = useRealtimeStars({ maxStars: 50 });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Scene3D className="w-full h-full">
          <SentientOrb speed={0.8} scale={2.5} intensity={1.2} />
          <ParticleField count={3000} size={0.01} speed={0.3} />
          <RealtimeStarsField stars={stars} baseSize={0.08} />
        </Scene3D>
      </div>

      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80 z-10 pointer-events-none" />

      <div className="relative z-20 text-center px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="inline-flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/20 px-6 py-2 rounded-full mb-10"
        >
          <span className="w-3 h-3 rounded-full bg-[var(--acid)] animate-pulse" />
          <span className="font-mono text-sm font-bold tracking-widest text-white/80">
            {content.hero.badge}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="font-syne font-black text-[15vw] md:text-[12vw] leading-[0.85] text-white tracking-tighter mb-6"
        >
          <span className="block bg-gradient-to-r from-[var(--acid)] via-white to-[var(--neon-pink)] bg-clip-text text-transparent">
            {content.hero.title1}
          </span>
          <span className="block text-stroke hover:text-[var(--acid)] transition-colors">
            {content.hero.title2}
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="max-w-3xl mx-auto mb-12 space-y-4"
        >
          <p className="font-grotesk text-xl md:text-2xl text-white/70">
            {content.hero.subtitle}
          </p>
          <p className="font-mono text-sm md:text-base text-[var(--acid)] tracking-wide">
            {content.hero.desc}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              document
                .getElementById('stash')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="bg-[var(--acid)] text-black px-12 py-6 rounded-2xl font-syne font-black text-xl border-4 border-black shadow-[8px_8px_0px_#fff] hover:shadow-[4px_4px_0px_#fff] transition-all flex items-center justify-center gap-3"
          >
            {content.hero.ctaStart} <Zap fill="black" size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNotify(`${content.hero.soon} 🎥`)}
            className="bg-white/10 backdrop-blur-xl text-white px-12 py-6 rounded-2xl font-syne font-bold text-xl border-2 border-white/30 hover:border-[var(--acid)] transition-all flex items-center gap-3 justify-center"
          >
            <Play size={20} /> {content.hero.ctaDemo}
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-3 bg-[var(--acid)] rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Marquee
const Marquee = () => {
  const CITIES = [
    'ISTANBUL 🇹🇷',
    'PARIS 🇫🇷',
    'TOKYO 🇯🇵',
    'NEW YORK 🇺🇸',
    'LONDON 🇬🇧',
    'DUBAI 🇦🇪',
    'BARCELONA 🇪🇸',
    'SEOUL 🇰🇷',
  ];
  return (
    <div className="bg-[var(--acid)] py-4 border-y-4 border-black overflow-hidden relative z-20 transform -rotate-1 scale-105">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex">
            {CITIES.map((city, index) => (
              <span
                key={`${i}-${index}`}
                className="text-3xl md:text-4xl font-syne font-black text-black mx-8 flex items-center gap-4"
              >
                {city} <Star size={20} fill="black" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Power Pillars - The Triple Force
const PowerPillars = ({ content }: { content: ContentType }) => {
  const pillars = [
    {
      key: 'proofOfIntent',
      icon: '⚡',
      gradient: 'from-[var(--acid)] to-[var(--electric-blue)]',
      borderColor: 'border-[var(--acid)]',
    },
    {
      key: 'unbufferedMoments',
      icon: '🎯',
      gradient: 'from-[var(--neon-pink)] to-[var(--acid)]',
      borderColor: 'border-[var(--neon-pink)]',
    },
    {
      key: 'engineeredLuck',
      icon: '🚀',
      gradient: 'from-[var(--electric-blue)] to-[var(--neon-pink)]',
      borderColor: 'border-[var(--electric-blue)]',
    },
  ];

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-[var(--acid)] font-mono text-sm tracking-widest bg-black px-4 py-2 border border-[var(--acid)] inline-block mb-6">
            {content.powerPillars.subtitle}
          </span>
          <h2 className="text-5xl md:text-7xl font-syne font-black text-white leading-none">
            {content.powerPillars.title}
          </h2>
        </div>

        {/* Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => {
            const pillarContent = content.powerPillars[pillar.key as keyof typeof content.powerPillars];
            if (typeof pillarContent === 'string') return null;

            return (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                {/* Card Background Shadow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient} translate-x-3 translate-y-3 rounded-[24px] opacity-50`} />

                {/* Main Card */}
                <div className={`relative bg-[#0a0a0a] border-2 ${pillar.borderColor} rounded-[24px] p-8 h-full transition-all duration-300 group-hover:border-white`}>
                  {/* Icon */}
                  <div className="text-6xl mb-6">{pillar.icon}</div>

                  {/* Number Badge */}
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <span className="text-white/40 font-mono text-lg font-bold">0{index + 1}</span>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl md:text-3xl font-syne font-black text-white mb-2 uppercase tracking-tight">
                    {pillarContent.title}
                  </h3>
                  <p className={`text-sm font-mono tracking-widest mb-4 bg-gradient-to-r ${pillar.gradient} bg-clip-text text-transparent`}>
                    {pillarContent.subtitle}
                  </p>
                  <p className="text-gray-400 font-grotesk text-base leading-relaxed">
                    {pillarContent.desc}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-white/0 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-white transition-all duration-300">
                    <ArrowUpRight size={20} className="text-black" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Stash Card
const StashCard = ({
  item,
  onSelect,
  content,
}: {
  item: GiftItem;
  onSelect: (i: GiftItem) => void;
  content: ContentType;
}) => (
  <motion.div
    whileHover={{ y: -10, rotate: 1 }}
    onClick={() => onSelect(item)}
    className="group relative min-w-[300px] md:min-w-[360px] aspect-[4/5] cursor-pointer snap-center"
  >
    <div className="absolute inset-0 bg-black border-4 border-white rounded-[30px] overflow-hidden">
      <div className="relative h-2/3 overflow-hidden">
        <Image
          src={item.img}
          alt={item.title}
          fill
          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/20 py-1.5 pl-1.5 pr-4 rounded-full flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative">
            <Image
              src={item.userImg}
              fill
              className="object-cover"
              alt={item.user}
              unoptimized
            />
          </div>
          <div className="flex flex-col">
            <span className="text-white text-xs font-bold">{item.user}</span>
            <span className="text-[var(--acid)] text-[9px] font-mono">
              {content.stash.wants}
            </span>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-[var(--neon-pink)] text-white font-bold px-3 py-1 rounded-lg border-2 border-black text-xs rotate-3">
          {content.stash.hot} 🔥
        </div>
      </div>
      <div className="p-6 bg-black border-t-4 border-white">
        <div
          className={`absolute -top-5 left-6 px-4 py-1 border-2 border-black -skew-x-12 ${item.color === 'pink' ? 'bg-[var(--neon-pink)] text-white' : 'bg-[var(--electric-blue)] text-black'}`}
        >
          <span className="font-mono font-bold text-sm tracking-widest">
            {item.loc}
          </span>
        </div>
        <h3 className="text-4xl font-syne font-black text-white uppercase mt-2 mb-4">
          {item.title}
        </h3>
        <div className="flex justify-between items-center">
          <span className="bg-[#111] text-white font-mono font-bold text-xl px-3 py-1 border border-white/30 rounded-lg">
            {item.price}
          </span>
          <div className="w-12 h-12 bg-[var(--acid)] rounded-full border-4 border-black flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight size={24} color="black" />
          </div>
        </div>
      </div>
    </div>
    <div
      className={`absolute top-4 left-4 w-full h-full rounded-[30px] border-4 border-white -z-10 ${item.color === 'pink' ? 'bg-[var(--neon-pink)]' : 'bg-[var(--electric-blue)]'}`}
    />
  </motion.div>
);

// The Stash
const TheStash = ({
  onGiftSelect,
  onNotify,
  content,
  lang,
}: {
  onGiftSelect: (item: GiftItem) => void;
  onNotify: (msg: string) => void;
  content: ContentType;
  lang: Language;
}) => {
  const items: GiftItem[] = [
    {
      id: 1,
      title: 'Frappé',
      loc: 'ATHENS',
      price: '$4.50',
      color: 'pink',
      user: '@elena',
      userImg: 'https://i.pravatar.cc/150?u=10',
      img: 'https://images.unsplash.com/photo-1570535189745-f09dfd785721?q=80&w=600',
    },
    {
      id: 2,
      title: 'Croissant',
      loc: 'PARIS',
      price: '$5.00',
      color: 'blue',
      user: '@jean',
      userImg: 'https://i.pravatar.cc/150?u=20',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600',
    },
    {
      id: 3,
      title: 'Gold Latte',
      loc: 'DUBAI',
      price: '$24.00',
      color: 'pink',
      user: '@sara',
      userImg: 'https://i.pravatar.cc/150?u=30',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600',
    },
    {
      id: 4,
      title: 'Baklava',
      loc: 'ISTANBUL',
      price: '$9.00',
      color: 'blue',
      user: '@can',
      userImg: 'https://i.pravatar.cc/150?u=40',
      img: 'https://images.unsplash.com/photo-1622485579953-6059d4c26a57?q=80&w=600',
    },
  ];

  return (
    <section
      id="stash"
      className="py-32 bg-[#111] relative border-t-8 border-[var(--acid)]"
    >
      <div className="container mx-auto px-6 mb-16">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10 mb-12">
          <div>
            <span className="text-[var(--acid)] font-mono text-sm tracking-widest bg-black px-2 py-1 border border-[var(--acid)]">
              {content.stash.subtitle}
            </span>
            <h2 className="text-6xl md:text-8xl font-syne font-black text-white leading-none mt-4">
              {content.stash.titleStart}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--acid)] to-[var(--electric-blue)]">
                {content.stash.titleEnd}
              </span>
            </h2>
            <p className="font-grotesk text-gray-400 mt-4 text-lg max-w-lg">
              {content.stash.desc}
            </p>
          </div>
          <button
            onClick={() => onNotify('Coming Soon! 🚀')}
            className="flex items-center gap-3 border-2 border-white px-8 py-4 rounded-full text-white font-mono font-bold hover:bg-white hover:text-black transition-all"
          >
            {content.stash.cta} <Lock size={18} />
          </button>
        </div>
        <div className="flex overflow-x-auto gap-8 pb-8 hide-scroll snap-x">
          {items.map((item) => (
            <StashCard
              key={item.id}
              item={item}
              onSelect={onGiftSelect}
              content={content}
            />
          ))}
        </div>
      </div>
      <div className="container mx-auto px-6 mt-20">
        <h3 className="text-2xl font-syne font-bold text-white/40 mb-8 tracking-widest">
          {/* COMING SOON */}
          {'/// COMING SOON'}
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <LockedDrop
            title="CITY EXPANSION"
            progress={72}
            description="More cities unlocking"
            variant="default"
            lang={lang}
          />
          <LockedDrop
            title="THE FILM"
            progress={34}
            description="Documentary"
            variant="premium"
            lang={lang}
          />
          <LockedDrop
            title="VIP ACCESS"
            progress={15}
            description="Exclusive experiences"
            variant="legendary"
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
};

// Manifesto
const Manifesto = ({
  onNotify,
  content,
}: {
  onNotify: (msg: string) => void;
  content: ContentType;
}) => (
  <section
    id="manifesto"
    className="py-40 bg-[var(--acid)] border-y-8 border-black relative overflow-hidden"
  >
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <div className="whitespace-nowrap font-black font-syne text-[20vw] leading-none text-black animate-marquee-reverse">
        REBEL AGAINST THE METAVERSE • REBEL AGAINST THE METAVERSE •
      </div>
    </div>
    <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center relative z-10">
      <div>
        <div className="bg-black text-white font-mono font-black text-sm inline-block px-5 py-2 border-2 border-white mb-8 transform -rotate-2">
          {content.manifesto.subtitle}
        </div>
        <h2 className="font-syne font-black text-5xl md:text-7xl leading-[0.9] text-black mb-10 uppercase">
          {content.manifesto.titleStart} <br />
          <span className="text-[var(--neon-pink)] underline decoration-8 decoration-black">
            {content.manifesto.titleHighlight}
          </span>{' '}
          {content.manifesto.titleEnd}
        </h2>
        <div className="font-grotesk text-xl md:text-2xl font-bold text-black space-y-6">
          <p className="border-l-8 border-black pl-6">{content.manifesto.p1}</p>
          <p className="border-l-8 border-black pl-6">{content.manifesto.p2}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() =>
            document
              .getElementById('contact')
              ?.scrollIntoView({ behavior: 'smooth' })
          }
          className="mt-10 bg-black text-white px-10 py-5 font-syne font-black text-xl hover:bg-white hover:text-black transition-colors shadow-[8px_8px_0px_#fff] border-4 border-white hover:border-black"
        >
          {content.manifesto.cta}
        </motion.button>
      </div>
      <motion.div
        whileHover={{ rotate: 0 }}
        className="relative aspect-video bg-black border-[6px] border-black p-4 rotate-3 shadow-[20px_20px_0px_rgba(0,0,0,0.2)] cursor-pointer"
        onClick={() => onNotify('Full Film Coming Soon 🎬')}
      >
        <div className="w-full h-full bg-[#1a1a1a] relative overflow-hidden border-2 border-white/20">
          <Image
            src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000"
            fill
            className="object-cover opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
            alt="Handheld camera style, grainy cinematic 35mm film stock, a candid shot of a stylish young woman laughing in a dimly lit, high-end Istanbul lounge, blurred Bosphorus lights in background, wearing quiet luxury fashion, authentic Gen Z aesthetic, raw emotions, 8k resolution"
            unoptimized
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm hover:bg-[var(--acid)] hover:border-black transition-all">
              <Play fill="white" size={32} className="ml-1" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 bg-[var(--electric-blue)] border-4 border-black px-6 py-3 font-mono font-black text-lg text-black">
          {content.manifesto.videoBtn}
        </div>
      </motion.div>
    </div>
  </section>
);

// Footer
const Footer = ({ content }: { content: ContentType }) => {
  const [email, setEmail] = useState('');
  return (
    <footer
      id="contact"
      className="bg-black pt-32 pb-16 px-6 relative border-t-8 border-white"
    >
      <div className="container mx-auto relative z-10 text-center">
        <span className="bg-[var(--neon-pink)] text-white font-mono font-bold px-4 py-1 text-sm border-2 border-white transform -rotate-3 inline-block mb-8">
          {content.footer.spots}
        </span>
        <h2 className="font-syne font-black text-[12vw] leading-[0.8] text-[#222] mb-12 uppercase tracking-tighter hover:text-[var(--acid)] transition-colors cursor-default">
          {content.footer.soon}
        </h2>
        <div className="max-w-2xl mx-auto mb-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--acid)] to-[var(--electric-blue)] translate-x-3 translate-y-3 rounded-2xl" />
          <div className="relative flex flex-col md:flex-row border-4 border-white bg-black rounded-2xl overflow-hidden p-2 gap-2">
            <input
              type="email"
              placeholder={content.footer.placeholder}
              className="flex-1 bg-[#111] text-white font-mono text-lg px-6 py-4 focus:outline-none placeholder-gray-600 uppercase rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="bg-white text-black px-8 py-4 font-bold font-syne text-lg uppercase hover:bg-[var(--acid)] transition-colors flex items-center justify-center gap-3 rounded-xl">
              {content.footer.join} <Send size={20} />
            </button>
          </div>
        </div>
        <div className="border-t border-[#333] pt-12 flex flex-col md:flex-row justify-between items-center font-mono text-gray-500 text-sm uppercase">
          <div className="text-left mb-6 md:mb-0">
            <p className="text-white text-lg font-syne">
              {content.footer.rights}
            </p>
            <p>{content.footer.location}</p>
          </div>
          <div className="flex gap-8 text-lg">
            {['Instagram', 'TikTok', 'Twitter'].map((s) => (
              <a
                key={s}
                href="#"
                className="hover:text-[var(--acid)] transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// Gift Popup
const GiftPopup = ({
  item,
  onClose,
  onConfirm,
  content,
}: {
  item: GiftItem;
  onClose: () => void;
  onConfirm: () => void;
  content: ContentType;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className="relative bg-[#050505] border-[6px] border-white w-full max-w-lg p-8 shadow-[20px_20px_0px_var(--acid)]"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-[var(--acid)]"
      >
        <X size={24} />
      </button>
      <div className="flex flex-col items-center mt-4 mb-8">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-[var(--acid)] rounded-full blur-md opacity-50" />
          <Image
            src={item.userImg}
            width={100}
            height={100}
            className="rounded-full border-4 border-[var(--acid)] relative z-10 object-cover"
            alt={item.user}
            unoptimized
          />
        </div>
        <div className="text-gray-500 font-mono text-sm tracking-widest mt-4">
          {content.popup.requesting}
        </div>
      </div>
      <div className="text-center">
        <h3 className="font-syne font-black text-5xl text-white mb-4 uppercase">
          {item.title}
        </h3>
        <p className="font-mono text-[var(--electric-blue)] text-lg mb-8 flex items-center justify-center gap-2">
          <MapPin size={18} /> {item.loc}
        </p>
        <div className="bg-[#111] border border-white/20 p-4 rounded-xl text-center mb-8">
          <div className="text-gray-500 font-mono text-xs mb-1">
            {content.popup.amount}
          </div>
          <div className="text-white font-syne font-bold text-3xl">
            {item.price}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirm}
          className="w-full bg-[var(--neon-pink)] text-white py-5 font-syne font-black text-xl border-4 border-black hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_#fff] uppercase flex items-center justify-center gap-4"
        >
          {content.popup.cta} <Send size={24} />
        </motion.button>
        <p className="text-gray-500 text-xs mt-6 font-mono">
          {content.popup.note}
        </p>
      </div>
    </motion.div>
  </motion.div>
);

// Toast
const Toast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200]"
    >
      <div className="bg-[var(--acid)] border-4 border-black px-8 py-5 shadow-[8px_8px_0px_#000] flex items-center gap-5 transform rotate-1">
        <span className="text-2xl">⚡️</span>
        <span className="font-mono font-bold text-black uppercase tracking-wide">
          {message}
        </span>
      </div>
    </motion.div>
  );
};

// Main App
export default function Home() {
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  useSunsetAtmosphere();

  const c = CONTENT[lang];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-white selection:bg-[var(--acid)] selection:text-black">
      <CinematicOverlay noiseOpacity={0.03} vignetteIntensity={0.4} />
      <GiftCursor />
      <Navbar
        onMenuClick={() => setMenuOpen(true)}
        lang={lang}
        setLang={setLang}
        content={c}
      />

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--neon-pink)] z-[100] flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-8 right-8 text-black hover:text-white"
            >
              <X size={48} />
            </button>
            <div className="flex flex-col gap-6 text-center">
              {[c.stash.titleEnd, c.nav.manifesto, 'CONTACT'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMenuOpen(false);
                    document
                      .getElementById(
                        item === c.stash.titleEnd
                          ? 'stash'
                          : item === c.nav.manifesto
                            ? 'manifesto'
                            : 'contact',
                      )
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="font-syne font-black text-6xl md:text-8xl text-black hover:text-white transition-colors uppercase"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <ImmersiveHero content={c} onNotify={setNotification} />
        <Marquee />
        <PowerPillars content={c} />
        <TheStash
          onGiftSelect={setSelectedGift}
          onNotify={setNotification}
          content={c}
          lang={lang}
        />
        <Manifesto onNotify={setNotification} content={c} />
        <Footer content={c} />
      </main>

      <LiquidToken lang={lang} />

      <AnimatePresence>
        {selectedGift && (
          <GiftPopup
            item={selectedGift}
            onClose={() => setSelectedGift(null)}
            onConfirm={() => {
              setSelectedGift(null);
              setNotification(c.popup.success);
            }}
            content={c}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <Toast message={notification} onClose={() => setNotification(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

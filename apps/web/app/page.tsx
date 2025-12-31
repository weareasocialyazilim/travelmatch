'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowUpRight,
  Zap,
  Menu,
  X,
  Star,
  Play,
  Send,
  Lock,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// ═══════════════════════════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════════════════════════

const GenZCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hidden md:flex fixed top-0 left-0 pointer-events-none z-[10000] mix-blend-difference items-center justify-center -translate-x-1/2 -translate-y-1/2"
    >
      <div className="w-6 h-6 bg-[#CCFF00] rounded-full animate-pulse blur-[1px]"></div>
      <div className="absolute w-12 h-12 border border-[#CCFF00] rounded-full opacity-50 animate-[spin_4s_linear_infinite]"></div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════════

interface ToastProps {
  message: string;
  onClose: () => void;
}

const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10001] animate-[toast-in_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
      <div className="bg-[#CCFF00] border-4 border-black px-8 py-4 shadow-[8px_8px_0px_0px_#000] flex items-center gap-4 min-w-[300px] justify-center text-center">
        <span className="text-2xl animate-pulse">⚡️</span>
        <span className="font-mono font-bold text-black uppercase tracking-wide text-sm md:text-base">
          {message}
        </span>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════════════════════════

interface NavbarProps {
  toggleMenu: () => void;
}

const Navbar = ({ toggleMenu }: NavbarProps) => (
  <nav className="fixed top-6 left-0 w-full px-6 z-50 flex justify-between items-center mix-blend-difference">
    <div
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="bg-white text-black px-6 py-3 rounded-full font-display font-extrabold text-2xl tracking-tighter hover:bg-[#CCFF00] transition-colors cursor-pointer border-2 border-transparent hover:border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]"
    >
      travelmatch.
    </div>
    <button
      onClick={toggleMenu}
      aria-label="Menu"
      className="bg-black text-white w-14 h-14 rounded-full flex items-center justify-center border-2 border-white hover:bg-[#CCFF00] hover:text-black hover:border-black transition-colors interactive shadow-[4px_4px_0px_0px_#fff]"
    >
      <Menu size={24} strokeWidth={3} />
    </button>
  </nav>
);

// ═══════════════════════════════════════════════════════════════════
// MARQUEE
// ═══════════════════════════════════════════════════════════════════

interface MarqueeProps {
  text: string;
  color?: string;
  rotate?: number;
  direction?: string;
}

const Marquee = ({
  text,
  color = 'bg-[#CCFF00]',
  rotate = 0,
  direction = 'normal',
}: MarqueeProps) => (
  <div
    className={`${color} py-4 border-y-4 border-black absolute w-[120%] left-[-10%] z-20 flex items-center shadow-xl`}
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <div className="marquee-container">
      <div
        className="marquee-content"
        style={{ animationDirection: direction }}
      >
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className="text-4xl font-display font-black text-black mx-8 uppercase tracking-tighter flex items-center gap-4"
          >
            {text} <Star fill="black" size={24} />
          </span>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// GIFT POPUP
// ═══════════════════════════════════════════════════════════════════

interface GiftItem {
  id: number;
  title: string;
  loc: string;
  price: string;
  color: string;
  img: string;
}

interface GiftPopupProps {
  item: GiftItem;
  onClose: () => void;
  onConfirm: () => void;
}

const GiftPopup = ({ item, onClose, onConfirm }: GiftPopupProps) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 isolate">
    <div className="relative bg-[#050505] border-4 border-white w-full max-w-md p-8 shadow-[15px_15px_0px_0px_#CCFF00] animate-[popup-in_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
      <div className="absolute top-0 left-0 w-full h-4 bg-[#CCFF00]"></div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-[#CCFF00] hover:rotate-90 transition-all z-20 bg-black rounded-full p-1 border border-white"
      >
        <X size={24} />
      </button>
      <div className="text-center mt-4">
        <div className="bg-[#CCFF00] text-black font-mono font-bold text-xs inline-block px-3 py-1 mb-6 border-2 border-black transform -skew-x-12 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)]">
          SENDING REAL VIBE...
        </div>
        <h3 className="font-display font-black text-5xl text-white mb-1 uppercase tracking-tighter leading-none">
          {item.title}
        </h3>
        <p className="font-mono text-[#00F0FF] text-xl mb-8 tracking-widest">
          📍 {item.loc}
        </p>
        <div className="w-full h-56 bg-gray-900 mb-8 border-4 border-white overflow-hidden relative group shadow-inner">
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_2s_infinite] pointer-events-none"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-white border-t-[#FF0099] animate-spin"></div>
          </div>
        </div>
        <div className="flex justify-between items-center text-left border-t-2 border-white/20 pt-6 mb-8">
          <div>
            <div className="text-gray-500 text-[10px] font-mono tracking-widest mb-1">
              TOTAL
            </div>
            <div className="text-white font-bold text-3xl font-display">
              {item.price}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-[10px] font-mono tracking-widest mb-1">
              FEES
            </div>
            <div className="text-[#CCFF00] font-bold text-xl font-mono">
              $0.00
            </div>
          </div>
        </div>
        <button
          onClick={onConfirm}
          className="w-full bg-[#FF0099] text-white py-4 font-display font-black text-xl border-4 border-black hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_#fff] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none uppercase tracking-wide group relative overflow-hidden"
        >
          <span className="relative z-10">CONFIRM & SEND</span>
        </button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════

interface HeroProps {
  onNotify: (message: string) => void;
}

const Hero = ({ onNotify }: HeroProps) => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#FF0099] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00F0FF] rounded-full blur-[120px] opacity-20 animate-float"></div>
      <div className="absolute top-[20%] left-[10%] z-30 animate-float hidden lg:block hover:z-50">
        <div className="sticker bg-white text-black font-bold font-mono p-4 rotate-[-12deg] border-2 border-black rounded-lg">
          ✈️ CATCH FLIGHTS
        </div>
      </div>
      <div
        className="absolute bottom-[20%] right-[10%] z-30 animate-float hover:z-50"
        style={{ animationDelay: '1.5s' }}
      >
        <div className="sticker bg-[#CCFF00] text-black font-bold font-mono p-4 rotate-[12deg] border-2 border-black rounded-full w-32 h-32 flex items-center justify-center text-center leading-none text-xl">
          NO
          <br />
          FEELINGS
          <br />
          JUST
          <br />
          VIBES
        </div>
      </div>
      <div className="relative z-20 text-center flex flex-col items-center max-w-6xl mx-auto px-4">
        <div className="bg-black border-2 border-white text-white px-6 py-2 rounded-full font-mono text-xs font-bold mb-8 flex items-center gap-2 hover:bg-white hover:text-black hover:border-black transition-colors cursor-pointer shadow-[4px_4px_0px_0px_#fff]">
          <span className="w-3 h-3 bg-[#00F0FF] rounded-full animate-pulse"></span>
          LIVE BETA V1.0 // WORLDWIDE
        </div>
        <h1 className="font-display font-black text-[13vw] leading-[0.85] text-white tracking-tighter select-none cursor-default colorful-shadow">
          <span className="block glitch-hover">SEND</span>
          <span
            className="block text-[#CCFF00] glitch-hover"
            style={{ textShadow: '4px 4px 0px #FF0099' }}
          >
            REAL
          </span>
          <span className="block glitch-hover">VIBES</span>
        </h1>
        <div className="mt-12 bg-black border-2 border-white p-8 rounded-xl max-w-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          <p className="font-grotesk text-xl md:text-2xl text-white leading-relaxed font-medium">
            Virtual gifts are <span className="highlight-box">CRINGE.</span>{' '}
            <br />
            Send a real coffee to someone in Paris right now. Distance is just a
            number, the vibe is universal. 🧢
          </p>
        </div>
        <div className="mt-12 flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => scrollToSection('stash')}
            className="sticker bg-[#FF0099] text-white px-10 py-5 font-display font-black text-2xl rounded-xl border-4 border-black hover:bg-white hover:text-black interactive flex items-center justify-center gap-3"
          >
            START VIBING <Zap fill="white" size={24} />
          </button>
          <div className="relative group">
            <button
              onClick={() => onNotify('Demo Video Dropping Next Week 🎥')}
              className="sticker bg-white text-black px-10 py-5 font-display font-bold text-2xl rounded-xl border-4 border-black hover:bg-[#00F0FF] interactive w-full"
            >
              WATCH DEMO
            </button>
            <div className="absolute -top-4 -right-4 bg-[#CCFF00] text-black text-[10px] font-black font-mono py-1 px-3 border-2 border-black transform rotate-12 shadow-[2px_2px_0px_0px_#000] z-20 pointer-events-none">
              SOON
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 w-full z-10 pointer-events-none">
        <Marquee text="ATHENS • PARIS • DUBAI • ISTANBUL • NYC •" rotate={-2} />
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════
// STASH CARD
// ═══════════════════════════════════════════════════════════════════

interface StashCardProps {
  item: GiftItem;
  color: string;
  onSelect: (item: GiftItem) => void;
}

const StashCard = ({ item, onSelect }: StashCardProps) => (
  <div className="group relative min-w-[320px] aspect-[4/5] perspective-1000 interactive snap-center">
    <div className="w-full h-full relative preserve-3d transition-transform duration-500 group-hover:rotate-y-12 group-hover:rotate-x-6">
      <div className="absolute inset-0 bg-black border-4 border-white rounded-2xl overflow-hidden">
        <img
          src={item.img}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110"
        />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col items-start gap-2">
          <div className="bg-[#CCFF00] text-black font-mono text-xs font-extrabold px-3 py-1 border-2 border-black transform -skew-x-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase">
            {item.loc}
          </div>
          <h3 className="text-5xl font-display font-black text-white leading-none uppercase drop-shadow-[4px_4px_0px_#000]">
            <span className="text-backdrop">{item.title}</span>
          </h3>
          <div className="flex justify-between items-center w-full mt-2">
            <span className="text-2xl font-mono font-bold text-black bg-[#00F0FF] px-2 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {item.price}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(item);
              }}
              className="bg-white text-black w-12 h-12 rounded-full flex items-center justify-center border-2 border-black hover:bg-[#FF0099] hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer z-20"
            >
              <ArrowUpRight size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-[#FF0099] text-white font-bold px-3 py-1 rounded-md border-2 border-black text-sm rotate-3 group-hover:rotate-12 transition-transform shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          HOT 🔥
        </div>
      </div>
      <div
        className={`absolute -z-10 top-4 left-4 w-full h-full rounded-2xl border-4 border-white ${
          item.color === 'pink' ? 'bg-[#FF0099]' : 'bg-[#00F0FF]'
        }`}
      ></div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// THE STASH
// ═══════════════════════════════════════════════════════════════════

interface TheStashProps {
  onGiftSelect: (item: GiftItem) => void;
  onNotify: (message: string) => void;
}

const TheStash = ({ onGiftSelect, onNotify }: TheStashProps) => {
  const items: GiftItem[] = [
    {
      id: 1,
      title: 'Frappé',
      loc: 'ATHENS',
      price: '$4.50',
      color: 'pink',
      img: 'https://images.unsplash.com/photo-1570535189745-f09dfd785721?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Croissant',
      loc: 'PARIS',
      price: '$5.00',
      color: 'blue',
      img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Gold Latte',
      loc: 'DUBAI',
      price: '$24.00',
      color: 'pink',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 4,
      title: 'Baklava',
      loc: 'ISTANBUL',
      price: '$9.00',
      color: 'blue',
      img: 'https://images.unsplash.com/photo-1622485579953-6059d4c26a57?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 5,
      title: 'Smash Burger',
      loc: 'NEW YORK',
      price: '$12.00',
      color: 'pink',
      img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
    },
  ];
  return (
    <section id="stash" className="py-32 bg-[#111] relative overflow-hidden">
      <div className="container mx-auto px-6 mb-16 relative z-10 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <h2 className="font-display font-black text-6xl md:text-8xl text-white mb-4 drop-shadow-[6px_6px_0px_#000]">
            THE{' '}
            <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#CCFF00] to-[#00F0FF]"
              style={{ filter: 'drop-shadow(4px 4px 0px #000)' }}
            >
              STASH
            </span>
          </h2>
          <p className="font-grotesk text-xl text-gray-300 max-w-md bg-black border border-white/20 p-4 rounded-lg">
            Forget boring gifts. This stash is strictly for the cool stuff.
          </p>
        </div>
        <button
          onClick={() => onNotify('Full Stash Unlocking in V2.0 🔒')}
          className="bg-black text-white border-2 border-white px-8 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-colors uppercase tracking-widest interactive shadow-[4px_4px_0px_0px_#fff] flex items-center gap-2"
        >
          View All Drops <Lock size={16} />
        </button>
      </div>
      <div className="flex overflow-x-auto px-6 pb-20 gap-12 hide-scroll snap-x">
        {items.map((item) => (
          <StashCard
            key={item.id}
            item={item}
            color={item.color}
            onSelect={onGiftSelect}
          />
        ))}
      </div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MANIFESTO
// ═══════════════════════════════════════════════════════════════════

interface ManifestoProps {
  onNotify: (message: string) => void;
}

const Manifesto = ({ onNotify }: ManifestoProps) => {
  return (
    <section
      id="manifesto"
      className="py-24 bg-[#CCFF00] border-y-8 border-black relative overflow-hidden"
    >
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="bg-black text-white font-mono font-bold text-xs inline-block px-4 py-2 border-2 border-white mb-6 transform -rotate-2">
            /// THE MANIFESTO
          </div>
          <h2 className="font-display font-black text-6xl md:text-7xl leading-[0.9] text-black mb-8 uppercase drop-shadow-[4px_4px_0px_#fff]">
            We reject the <span className="text-[#FF0099]">Metaverse.</span>
          </h2>
          <div className="font-grotesk text-xl md:text-2xl font-bold text-black space-y-6">
            <p className="border-l-4 border-black pl-6">
              We crave sugar, caffeine, and human connection. Pixels don&apos;t
              taste like anything.
            </p>
            <p className="border-l-4 border-black pl-6">
              TravelMatch is the anti-social social club. We use tech to get you
              OFF your phone and INTO a coffee shop.
            </p>
          </div>
          <button
            onClick={() => scrollToSection('contact')}
            className="mt-10 bg-black text-white px-10 py-5 rounded-none font-bold text-xl hover:bg-white hover:text-black transition-colors shadow-[8px_8px_0px_0px_#fff] interactive"
          >
            JOIN THE RESISTANCE
          </button>
        </div>
        <div
          className="relative h-[500px] border-4 border-black bg-white p-4 rotate-2 shadow-[12px_12px_0px_0px_#000] cursor-pointer"
          onClick={() => onNotify('Full Film Coming Soon 🎬')}
        >
          <div className="w-full h-full bg-black overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-500 group">
            <img
              src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop"
              alt="Manifesto"
              loading="lazy"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Play
                size={64}
                fill="white"
                className="text-white drop-shadow-[4px_4px_0px_#000] group-hover:scale-110 transition-transform"
              />
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="bg-black text-[#CCFF00] px-3 py-1 font-mono font-bold text-lg border-2 border-white">
                VIDEO SOON
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 bg-[#00F0FF] border-4 border-black px-6 py-3 font-mono font-bold text-black shadow-[4px_4px_0px_0px_#000]">
            WATCH MANIFESTO
          </div>
        </div>
      </div>
      <div
        className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 2px, transparent 2px)',
          backgroundSize: '20px 20px',
        }}
      ></div>
    </section>
  );
};

// ═══════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════

interface FooterProps {
  onNotify: (message: string) => void;
}

const Footer = ({ onNotify }: FooterProps) => {
  const [email, setEmail] = useState('');

  const handleJoin = () => {
    if (!email) return;
    onNotify('Welcome to the Resistance ✊');
    setEmail('');
  };

  return (
    <footer
      id="contact"
      className="bg-black pt-24 pb-12 px-6 relative overflow-hidden"
    >
      <div className="container mx-auto relative z-10 text-center">
        <h2 className="font-display font-black text-[12vw] leading-[0.8] text-white mb-8 uppercase tracking-tighter hover:text-[#CCFF00] transition-colors cursor-pointer select-none drop-shadow-[4px_4px_0px_#333]">
          Coming Soon
        </h2>
        <div className="max-w-xl mx-auto mb-16 relative group">
          <div className="absolute inset-0 bg-[#CCFF00] transform translate-x-2 translate-y-2 rounded-xl group-hover:translate-x-3 group-hover:translate-y-3 transition-transform"></div>
          <div className="relative flex border-4 border-white bg-black rounded-xl overflow-hidden p-1">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL..."
              className="flex-1 bg-transparent text-white font-mono text-lg px-4 focus:outline-none placeholder-gray-600 uppercase"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={handleJoin}
              className="bg-white text-black px-6 py-3 font-bold font-display uppercase hover:bg-[#CCFF00] transition-colors flex items-center gap-2"
            >
              Join <Send size={18} />
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-center gap-10 mb-20">
          <div className="relative group w-full md:w-auto">
            <button className="sticker bg-[#111] text-white px-10 py-5 rounded-xl font-bold text-xl border-2 border-[#333] flex items-center justify-center gap-3 interactive group-hover:border-white w-full">
              <span className="text-3xl"></span> APP STORE
            </button>
            <div className="absolute -top-3 -right-3 bg-[#CCFF00] text-black text-[10px] font-black font-mono py-1 px-3 border-2 border-black transform rotate-12 shadow-[2px_2px_0px_0px_#000] group-hover:rotate-0 transition-transform z-20">
              COMING SOON
            </div>
          </div>
          <div className="relative group w-full md:w-auto">
            <button className="sticker bg-[#111] text-white px-10 py-5 rounded-xl font-bold text-xl border-2 border-[#333] flex items-center justify-center gap-3 interactive group-hover:border-white w-full">
              <span className="text-3xl">▶</span> PLAY STORE
            </button>
            <div className="absolute -top-3 -right-3 bg-[#FF0099] text-white text-[10px] font-black font-mono py-1 px-3 border-2 border-black transform -rotate-6 shadow-[2px_2px_0px_0px_#000] group-hover:rotate-0 transition-transform z-20">
              DROPPING SOON
            </div>
          </div>
        </div>
        <div className="border-t border-[#333] pt-8 flex flex-col md:flex-row justify-between items-center font-mono font-bold text-gray-500 text-sm uppercase">
          <div className="text-left">
            <p className="text-white">TravelMatch Inc.</p>
            <p>Est. 2025 // Istanbul</p>
          </div>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#CCFF00]">
              Instagram
            </a>
            <a href="#" className="hover:text-[#CCFF00]">
              TikTok
            </a>
            <a href="#" className="hover:text-[#CCFF00]">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ═══════════════════════════════════════════════════════════════════
// FULL MENU
// ═══════════════════════════════════════════════════════════════════

interface FullMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullMenu = ({ isOpen, onClose }: FullMenuProps) => {
  const handleScroll = (id: string) => {
    onClose();
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  return (
    <div
      className={`fixed inset-0 bg-[#FF0099] z-[99999] flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-8 right-8 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center border-4 border-white hover:rotate-90 transition-transform"
      >
        <X size={32} strokeWidth={3} />
      </button>
      <div className="flex flex-col gap-2 text-center">
        {[
          { label: 'HOME', id: 'home' },
          { label: 'THE STASH', id: 'stash' },
          { label: 'MANIFESTO', id: 'manifesto' },
          { label: 'CONTACT', id: 'contact' },
        ].map((item, i) => (
          <button
            key={i}
            onClick={() => handleScroll(item.id)}
            className="font-display font-black text-[12vw] leading-none text-black hover:text-white hover:tracking-widest transition-all cursor-pointer uppercase stroke-black interactive drop-shadow-[4px_4px_0px_rgba(255,255,255,0.3)] bg-transparent border-none"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (selectedGift || menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedGift, menuOpen]);

  const handleGiftConfirm = () => {
    setSelectedGift(null);
    setNotification('VIBE SENT SUCCESSFULLY! ✈️');
  };

  return (
    <div className="fade-in">
      <div className="noise-overlay"></div>
      <GenZCursor />
      <Navbar toggleMenu={() => setMenuOpen(true)} />
      <FullMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      {selectedGift && (
        <GiftPopup
          item={selectedGift}
          onClose={() => setSelectedGift(null)}
          onConfirm={handleGiftConfirm}
        />
      )}
      {notification && (
        <Toast message={notification} onClose={() => setNotification(null)} />
      )}
      <main>
        <Hero onNotify={setNotification} />
        <TheStash onGiftSelect={setSelectedGift} onNotify={setNotification} />
        <Manifesto onNotify={setNotification} />
        <Footer onNotify={setNotification} />
      </main>
    </div>
  );
}

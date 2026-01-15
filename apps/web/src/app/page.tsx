'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from 'framer-motion';
import {
  X,
  Zap,
  MapPin,
  ArrowRight,
  Fingerprint,
  Smartphone,
  ShieldAlert,
  Ghost,
  Activity,
  Cpu,
  ShoppingBag,
  Utensils,
  Palette,
  Glasses,
  Trophy,
  Lock,
} from 'lucide-react';

// --- 01. KINETIC HEART CURSOR (Snappy & High Precision) ---
const LovendoCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Maksimum hız ve tepkisellik için ayarlar
  const cursorX = useSpring(mouseX, {
    stiffness: 1500,
    damping: 80,
    mass: 0.1,
  });
  const cursorY = useSpring(mouseY, {
    stiffness: 1500,
    damping: 80,
    mass: 0.1,
  });

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      const target = e.target as HTMLElement;
      setIsHovering(
        !!(
          target.closest('button') ||
          target.closest('input') ||
          target.closest('a') ||
          target.closest('.moment-card')
        ),
      );
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
      style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
    >
      <motion.svg
        width="44"
        height="44"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isHovering ? '#00F5FF' : '#FF3366'}
        strokeWidth="1.5"
        animate={{ scale: isHovering ? 1.5 : 1, rotate: isHovering ? 15 : 0 }}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={
            isHovering ? 'rgba(0, 245, 255, 0.3)' : 'rgba(255, 51, 102, 0.3)'
          }
        />
      </motion.svg>
      <div className="absolute w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />
    </motion.div>
  );
};

// --- 02. FLUID ILLUSION SCENE (Uçuk Kaçık İlüzyonlar) ---
const LovendoFluid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Işıklar
    const p1 = new THREE.PointLight(0xff3366, 2);
    p1.position.set(5, 5, 5);
    scene.add(p1);
    const p2 = new THREE.PointLight(0x00f5ff, 2);
    p2.position.set(-5, -5, 5);
    scene.add(p2);

    // Akışkan Form (Illusion Blob)
    const geometry = new THREE.IcosahedronGeometry(1.8, 64);
    const material = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 1,
      roughness: 0.1,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Floating Fragments (Anı Parçacıkları)
    const fragments: { mesh: THREE.Mesh; speed: number }[] = [];
    const fragGeom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    for (let i = 0; i < 60; i++) {
      const frag = new THREE.Mesh(
        fragGeom,
        new THREE.MeshPhongMaterial({
          color: i % 2 === 0 ? 0xf0eee9 : 0xff3366,
          transparent: true,
          opacity: 0.6,
        }),
      );
      frag.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
      );
      scene.add(frag);
      fragments.push({ mesh: frag, speed: Math.random() * 0.02 + 0.01 });
    }

    const animate = () => {
      mesh.rotation.y += 0.003;
      mesh.rotation.z += 0.002;
      mesh.scale.setScalar(1 + Math.sin(Date.now() * 0.001) * 0.05);

      fragments.forEach((f) => {
        f.mesh.position.y += f.speed;
        f.mesh.rotation.x += 0.02;
        if (f.mesh.position.y > 8) f.mesh.position.y = -8;
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (containerRef.current)
        containerRef.current.removeChild(renderer.domElement);
    };
  }, []);
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-[#1A1A1B]"
    />
  );
};

// --- 03. GLOBAL CITIES BAND (With Symbols) ---
const GlobalCitiesBand = () => {
  const cities = [
    { name: 'ISTANBUL', sym: '🕌' },
    { name: 'PARIS', sym: '†' },
    { name: 'TOKYO', sym: 'Ξ' },
    { name: 'NYC', sym: '▰' },
    { name: 'LONDON', sym: '⌘' },
    { name: 'ROME', sym: '▼' },
    { name: 'BERLIN', sym: 'Ø' },
    { name: 'SEOUL', sym: '◈' },
    { name: 'DUBAI', sym: '✦' },
    { name: 'LISBON', sym: '≋' },
    { name: 'MEXICO', sym: '◬' },
    { name: 'RIO', sym: '☀' },
  ];
  return (
    <div className="w-full bg-black py-16 border-y border-white/5 relative z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, -3500] }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="flex gap-40 px-12 whitespace-nowrap"
      >
        {[...cities, ...cities].map((city, i) => (
          <div
            key={i}
            className="flex items-center gap-8 group cursor-default opacity-40 hover:opacity-100 transition-opacity"
          >
            <span className="text-[20px] font-black uppercase tracking-[0.8em] text-white">
              {city.name}
            </span>
            <span className="text-[#FF3366] text-2xl font-mono grayscale group-hover:grayscale-0 transition-all">
              {city.sym}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- 04. DROP ICON SELECTOR ---
const LovendoIcon = ({ type }: { type: string }) => {
  const icons: Record<string, React.ReactNode> = {
    fashion: <ShoppingBag size={14} className="text-[#FF3366]" />,
    food: <Utensils size={14} className="text-black" />,
    culture: <Palette size={14} className="text-[#00A3FF]" />,
    experience: <Zap size={14} className="text-[#FF3366]" />,
    accessory: <Glasses size={14} className="text-black" />,
    object: <Trophy size={14} className="text-black" />,
  };
  return icons[type] || <Activity size={14} />;
};

interface MomentData {
  title: string;
  location: string;
  price: string;
  creator: string;
  type: string;
  ritualTag: string;
  image: string;
}

// --- 05. LOVENDO DROP CARD (Cloud Dancer Color & Anthracite Accent) ---
const MomentCard = ({
  data,
  onClick,
}: {
  data: MomentData;
  index: number;
  onClick: (data: MomentData) => void;
}) => {
  const [rotation, setRotation] = useState('0');

  useEffect(() => {
    setRotation((Math.random() * 4 - 2).toFixed(2));
  }, []);

  return (
    <motion.div
      whileHover={{ y: -15, scale: 1.02, zIndex: 50 }}
      className="moment-card relative group mb-48 px-6 cursor-none"
      onClick={() => onClick(data)}
    >
      <div
        className="bg-[#F0EEE9] p-6 shadow-[0_60px_130px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-1000 border border-white/5 group-hover:border-[#00F5FF]/40"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className="absolute -right-12 top-6 z-30 bg-black text-white font-black text-[10px] px-12 py-1 rotate-45 shadow-xl uppercase tracking-widest flex items-center gap-2">
          ACTIVATE DO
        </div>

        <div className="flex justify-between items-center mb-6 text-[11px] font-mono font-black tracking-widest text-black/40 uppercase">
          <div className="flex items-center gap-2">
            <MapPin size={12} className="text-[#FF3366]" /> {data.location}
          </div>
          <div className="flex items-center gap-2 italic">
            {LovendoIcon({ type: data.type })} {data.type}
          </div>
        </div>

        <div className="relative aspect-[1/1.2] bg-white overflow-hidden mb-10 border border-black/5 shadow-inner">
          <motion.img
            src={data.image}
            className="w-full h-full object-cover filter contrast-[1.1] transition-all duration-[1500ms] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/10 z-10 mix-blend-multiply opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="text-[14px] font-black text-white italic uppercase tracking-tighter border-l-4 border-[#FF3366] pl-4 mb-2 drop-shadow-xl">
              {data.ritualTag}
            </div>
            <div className="text-[10px] font-mono text-white uppercase tracking-widest italic opacity-80">
              Signal Verified
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-10">
          <h3 className="text-6xl font-black tracking-tighter leading-[0.8] uppercase italic transition-all duration-700 text-black">
            {data.title.split(' ')[0]}
          </h3>
          <h3 className="text-4xl font-black tracking-tighter leading-[0.8] uppercase italic opacity-20 group-hover:opacity-100 transition-opacity text-[#00F5FF]">
            {data.title.split(' ')[1] || 'DROP'}
          </h3>
        </div>

        <div className="flex justify-between items-end border-t border-black/10 pt-8 -mx-6 -mb-6 p-6 bg-black/[0.03]">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-black/40 uppercase tracking-widest italic font-bold">
              Source
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm grayscale group-hover:grayscale-0 transition-all">
                <img
                  src={`https://i.pravatar.cc/100?u=${data.creator.split(' ')[0]}`}
                  alt="creator"
                />
              </div>
              <span className="text-[16px] font-black text-black/80">
                {data.creator}
              </span>
            </div>
          </div>
          <div className="bg-black text-white px-6 py-4 rotate-[-1deg] shadow-2xl">
            <div className="text-[10px] font-mono font-black uppercase leading-none opacity-50 mb-1">
              Value Floor
            </div>
            <div className="text-3xl font-black italic tracking-tighter shadow-sm">
              ${data.price}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 06. SCENE EXECUTION MODAL ---
const Modal = ({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: MomentData;
}) => {
  const [activeTab, setActiveTab] = useState('match');
  const [suggestion, setSuggestion] = useState({ place: '', reason: '' });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full max-w-4xl bg-[#111111] border border-white/10 shadow-[0_0_200px_rgba(0,245,255,0.2)] p-12 md:p-24 overflow-y-auto max-h-[95vh] custom-scrollbar rounded-sm"
      >
        <button
          onClick={onClose}
          className="absolute top-10 right-10 text-zinc-700 hover:text-[#00F5FF] transition-colors z-50"
        >
          <X size={40} />
        </button>

        <div className="space-y-20">
          <header className="space-y-8 text-center">
            <div className="flex items-center justify-center gap-4 text-[#00F5FF] font-mono text-[14px] font-black uppercase tracking-[1.5em] italic">
              <Fingerprint size={22} /> Signal_v0.0.5
            </div>
            <h2 className="text-8xl md:text-[140px] font-black italic uppercase tracking-tighter leading-[0.6] text-[#F0EEE9] drop-shadow-xl">
              {data?.title}
            </h2>
          </header>

          <p className="text-4xl md:text-7xl text-white font-black leading-[0.85] uppercase italic tracking-tighter text-center">
            Floor is Fixed. <br />{' '}
            <span className="text-[#FF3366] shadow-glow-white">
              Upgrade the Move.
            </span>
          </p>

          <div className="grid grid-cols-2 gap-6 bg-white/5 p-2 rounded-sm border border-white/5">
            <button
              onClick={() => setActiveTab('match')}
              className={`py-10 text-[18px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all ${activeTab === 'match' ? 'bg-[#F0EEE9] text-black shadow-3xl' : 'text-zinc-600 hover:text-white'}`}
            >
              Match
            </button>
            <button
              onClick={() => setActiveTab('upgrade')}
              className={`py-10 text-[18px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all relative overflow-hidden ${activeTab === 'upgrade' ? 'text-black' : 'text-zinc-600 hover:text-white'}`}
            >
              {activeTab === 'upgrade' && (
                <motion.div
                  layoutId="rit"
                  className="absolute inset-0 bg-[#00F5FF]"
                />
              )}
              <span className="relative z-10 flex items-center gap-4 text-shadow-glow">
                Upgrade <Zap size={24} fill="currentColor" />
              </span>
            </button>
          </div>

          <div className="space-y-16">
            {activeTab === 'match' ? (
              <div className="p-16 bg-zinc-900 border-l-[12px] border-[#FF3366] shadow-inner space-y-10 rounded-sm">
                <div className="text-[14px] font-mono text-[#FF3366] font-black uppercase tracking-[1em] italic">
                  Integrity confirmed
                </div>
                <div className="text-8xl font-black italic uppercase tracking-tighter text-white">
                  ${data?.price} • {data?.location}
                </div>
                <p className="text-zinc-500 font-mono text-[12px] font-bold uppercase tracking-widest italic underline underline-offset-4">
                  Match the creator's floor value.
                </p>
              </div>
            ) : (
              <div className="space-y-12 animate-in slide-in-from-right-10 duration-700">
                <div className="flex justify-between items-center border-b border-white/5 pb-8">
                  <div className="text-[14px] font-mono text-zinc-500 font-black uppercase tracking-[1.2em]">
                    Execution Request
                  </div>
                  <div className="text-[#FF3366] font-black text-[16px] uppercase tracking-widest flex items-center gap-4 italic">
                    <Lock size={20} /> Price Locked: ${data?.price}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[12px] font-mono text-zinc-600 font-black uppercase tracking-widest italic">
                      New Peak Venue
                    </label>
                    <input
                      type="text"
                      placeholder="Drop the name..."
                      className="w-full bg-transparent border-b-2 border-white/10 py-6 text-4xl font-black italic uppercase focus:border-[#00F5FF] focus:outline-none text-white placeholder:text-zinc-900"
                      value={suggestion.place}
                      onChange={(e) =>
                        setSuggestion({ ...suggestion, place: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[12px] font-mono text-zinc-600 font-black uppercase tracking-widest italic">
                      Reasoning
                    </label>
                    <input
                      type="text"
                      placeholder="Why is this better?"
                      className="w-full bg-transparent border-b-2 border-white/10 py-6 text-4xl font-black italic uppercase focus:border-[#00F5FF] focus:outline-none text-white placeholder:text-zinc-900"
                      value={suggestion.reason}
                      onChange={(e) =>
                        setSuggestion({ ...suggestion, reason: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
            <button className="w-full bg-[#F0EEE9] text-black py-18 font-black uppercase tracking-[1.5em] hover:bg-[#FF3366] hover:text-white transition-all text-5xl active:scale-95 shadow-[0_40px_120px_rgba(255,51,102,0.3)] flex items-center justify-center gap-12 group rounded-sm">
              {activeTab === 'upgrade' ? 'ACTIVATE' : 'SEND'}{' '}
              <ArrowRight
                size={64}
                className="group-hover:translate-x-12 transition-transform"
              />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- 07. MANIFESTO TEXTS ---
const ManifestoSection = () => (
  <section className="py-80 px-10 relative z-10 space-y-40">
    <div className="max-w-4xl space-y-12">
      <h4 className="text-[#00F5FF] font-mono text-sm uppercase tracking-[1em] font-bold italic border-l-4 border-[#00F5FF] pl-8">
        The_Logic
      </h4>
      <p className="text-5xl md:text-8xl font-black italic tracking-tighter text-[#F0EEE9] leading-[0.75] lowercase">
        Most platforms sell destinations. <br /> Lovendo sells attraction.{' '}
        <br /> We believe closeness starts with deeds.
      </p>
    </div>
    <div className="max-w-4xl ml-auto text-right space-y-12">
      <h4 className="text-[#FF3366] font-mono text-sm uppercase tracking-[1em] font-bold italic border-r-4 border-[#FF3366] pr-8">
        The_Level_Protocol
      </h4>
      <p className="text-5xl md:text-8xl font-black italic tracking-tighter text-zinc-600 leading-[0.75] lowercase">
        A Moment sets the floor. <br /> Offers can only match or upgrade. <br />{' '}
        No downgrades. No ghosting.
      </p>
    </div>
  </section>
);

// --- 08. MAIN APP ---
export default function App() {
  const [selectedMoment, setSelectedMoment] = useState<MomentData | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.1]);

  const moments: MomentData[] = [
    {
      title: '3AM LEATHER',
      location: 'Paris',
      price: '2400',
      creator: 'Lucas Van der Woodsen',
      type: 'fashion',
      ritualTag: 'Pure Desire. No Backups.',
      image:
        'https://images.unsplash.com/photo-1521223344201-d169129f7b7d?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'VINYL NIGHT',
      location: 'Tokyo',
      price: '180',
      creator: 'Kenji Tanaka',
      type: 'culture',
      ritualTag: 'Analogue Love in Shibuya.',
      image:
        'https://images.unsplash.com/photo-1539375665275-f9ad415ef9ac?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'UNMARKED DOOR',
      location: 'Istanbul',
      price: '450',
      creator: 'Elif Demirok',
      type: 'food',
      ritualTag: 'Secret Bosphorus Scene.',
      image:
        'https://images.unsplash.com/photo-1550966841-39148bc73021?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'KINETIC FLOW',
      location: 'Berlin',
      price: '95',
      creator: 'Maximilian Schulz',
      type: 'experience',
      ritualTag: 'Industrial Signal.',
      image:
        'https://images.unsplash.com/photo-1514525253361-b996b5c57df4?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'CUSTOM SKIN',
      location: 'Stockholm',
      price: '520',
      creator: 'Ebba Andersson',
      type: 'accessory',
      ritualTag: 'Limited Edge.',
      image:
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
    },
    {
      title: 'MANHATTAN PEAK',
      location: 'NYC',
      price: '750',
      creator: 'Sarah J. Harrington',
      type: 'experience',
      ritualTag: 'High-Rise Flow.',
      image:
        'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A1A1B] text-white font-sans selection:bg-[#00F5FF] selection:text-black overflow-x-hidden">
      <LovendoFluid />

      <div
        className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      <nav className="fixed top-0 left-0 w-full z-50 px-10 py-10 md:px-20 flex justify-between items-center mix-blend-difference">
        <div className="text-8xl font-black tracking-tighter uppercase italic group cursor-pointer leading-none">
          LVND
          <span className="text-[#FF3366] group-hover:text-[#00F5FF] transition-all">
            .
          </span>
        </div>
        <div className="text-[12px] font-mono font-black tracking-[1em] text-zinc-600 uppercase border-b border-[#00F5FF]/20 pb-1 hidden lg:block">
          System_v0.0.5_Protocol
        </div>
      </nav>

      {/* HERO */}
      <motion.section
        style={{ opacity: heroOpacity }}
        className="relative min-h-screen flex flex-col items-center justify-center px-10 pt-32 z-10"
      >
        <div className="max-w-[1600px] w-full text-center space-y-48">
          <div className="flex flex-col items-center gap-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-8 text-[18px] font-mono font-black uppercase tracking-[2.5em] text-zinc-800 italic"
            >
              <Activity size={32} className="text-[#FF3366] animate-pulse" />{' '}
              Stop matching. Start executing.
            </motion.div>
            <h1 className="text-[140px] md:text-[520px] font-black tracking-tighter leading-[0.4] uppercase italic select-none text-[#F0EEE9] drop-shadow-2xl">
              Love <br />{' '}
              <span
                className="border-text text-transparent"
                style={{ WebkitTextStroke: '4px rgba(255,255,255,0.06)' }}
              >
                & Do
              </span>
            </h1>
          </div>
          <div className="text-zinc-600 font-mono text-[16px] uppercase tracking-[2.5em] opacity-40 italic">
            Signals are Lust. Deeds are Ritual.
          </div>
        </div>
      </motion.section>

      <GlobalCitiesBand />

      <ManifestoSection />

      {/* FEED */}
      <section className="py-20 px-10 relative z-10">
        <div className="max-w-[1800px] mx-auto">
          <div className="mb-80 flex flex-col md:flex-row justify-between items-end gap-20 border-b border-white/5 pb-40">
            <div className="space-y-16 text-left">
              <div className="flex items-center gap-10 text-[24px] font-mono font-black text-[#FF3366] uppercase tracking-[3em] italic">
                The_Archive
              </div>
              <h2 className="text-[20vw] font-black italic uppercase leading-[0.5] tracking-tighter opacity-10 select-none text-[#F0EEE9]">
                Latest_Drops
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-32">
            {moments.map((moment, i) => (
              <MomentCard
                key={i}
                index={i}
                data={moment}
                onClick={(data) => setSelectedMoment(data)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ACCESS & APPS SECTION */}
      <section className="py-80 px-12 bg-black relative z-10 border-t border-[#FF3366]/20">
        <div className="max-w-[1600px] mx-auto space-y-60">
          <div className="max-w-6xl mx-auto text-center space-y-32">
            <div className="space-y-20">
              <div className="flex items-center justify-center gap-10 text-[#00F5FF] font-mono text-[16px] uppercase tracking-[2.5em] italic font-bold">
                <ShieldAlert size={32} /> Access_The_Field
              </div>
              <h2 className="text-8xl md:text-[16vw] font-black italic uppercase tracking-tighter leading-[0.7] text-[#F0EEE9]">
                ACCESS <br /> THE FIELD.
              </h2>
              <div className="text-zinc-700 font-mono text-xl uppercase tracking-[1.5em] max-w-3xl mx-auto italic">
                Not for the casuals. Join the elite ritual of closeness.
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-0 max-w-6xl mx-auto border-[6px] border-[#F0EEE9]/10 bg-zinc-950 p-3 group hover:border-[#00F5FF]/40 transition-all duration-1000 shadow-3xl">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER SIGNAL ID..."
                className="flex-1 bg-transparent px-12 py-14 text-6xl font-black uppercase tracking-tighter focus:outline-none placeholder:text-zinc-900 italic text-[#00F5FF]"
              />
              <button
                onClick={() => {
                  if (email) setIsSubmitted(true);
                }}
                className="bg-[#F0EEE9] text-black px-28 py-14 font-black uppercase tracking-[1em] hover:bg-[#FF3366] hover:text-white transition-all text-5xl active:scale-95"
              >
                ENTER
              </button>
            </div>
            {isSubmitted && (
              <div className="text-[#00F5FF] text-[20px] font-black uppercase tracking-[3em] animate-pulse">
                Identity_Stored. 👀
              </div>
            )}
          </div>

          <div className="space-y-40">
            <div className="flex flex-col items-center gap-12 text-center">
              <div className="text-zinc-800 font-mono text-[16px] uppercase tracking-[2.5em] font-bold">
                The_App_Protocol
              </div>
              <div className="bg-[#FF3366]/10 text-[#FF3366] px-10 py-6 text-[14px] font-black uppercase tracking-[0.5em] rounded-sm border-2 border-[#FF3366]/40 hover:bg-[#FF3366] hover:text-white transition-all cursor-help">
                <Ghost size={24} className="inline mr-4" /> Uninstall Tinder
                first. This is for real life.
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-24 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
              <div className="flex items-center gap-10 border-4 border-white/5 bg-zinc-900 px-20 py-14 rounded-sm cursor-not-allowed relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Smartphone size={64} />
                <div className="text-left font-black uppercase leading-none text-4xl">
                  App Store
                  <br />
                  <span className="text-[16px] text-[#FF3366] font-mono tracking-widest italic mt-4 inline-block underline underline-offset-4">
                    SOON_BETA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-10 border-4 border-white/5 bg-zinc-900 px-20 py-14 rounded-sm cursor-not-allowed relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#00F5FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Cpu size={64} />
                <div className="text-left font-black uppercase leading-none text-4xl">
                  Google Play
                  <br />
                  <span className="text-[16px] text-[#00F5FF] font-mono tracking-widest italic mt-4 inline-block underline underline-offset-4">
                    SOON_DLC
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-end gap-32 pt-60 border-t border-white/5">
            <div className="text-[25vw] font-black tracking-tighter uppercase italic text-zinc-900 leading-none select-none pointer-events-none text-shadow-glow-cyan opacity-40">
              LVND.
            </div>
            <div className="flex flex-wrap gap-24 text-zinc-800 font-black text-7xl italic uppercase tracking-tighter">
              <a
                href="#"
                className="hover:text-[#FF3366] transition-all hover:tracking-[0.15em] border-b-4 border-transparent hover:border-[#FF3366]"
              >
                IG
              </a>
              <a
                href="#"
                className="hover:text-[#00F5FF] transition-all hover:tracking-[0.15em] border-b-4 border-transparent hover:border-[#00F5FF]"
              >
                TK
              </a>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedMoment && (
          <Modal
            isOpen={!!selectedMoment}
            onClose={() => setSelectedMoment(null)}
            data={selectedMoment}
          />
        )}
      </AnimatePresence>
      <LovendoCursor />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Space Grotesk', sans-serif; background-color: #1A1A1B; color: white; cursor: none; overflow-x: hidden; }
        .border-text { -webkit-text-fill-color: transparent; -webkit-text-stroke: 3px rgba(255,255,255,0.08); }
        .text-shadow-glow { text-shadow: 0 0 40px rgba(0, 245, 255, 0.3); }
        .shadow-glow-white { box-shadow: 0 40px 120px rgba(0, 0, 0, 0.2); }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #00F5FF; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #1A1A1B; }
        ::-webkit-scrollbar-thumb { background: #333; }
        ::-webkit-scrollbar-thumb:hover { background: #FF3366; }
        @media (max-width: 768px) { body { cursor: auto; } .border-text { -webkit-text-stroke: 1.5px rgba(255,255,255,0.1); } }
      `}</style>
    </div>
  );
}

'use client';

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type RefObject,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import type { Mesh, Group } from 'three';

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */
type Locale = 'en' | 'tr';
type StashItem = {
  id: number;
  label: string;
  title: string;
  desc: string;
  tags: string[];
  offers: { title: string; meta: string }[];
};

/* ─────────────────────────────────────────────────────────────────
   COPY (TR/EN)
───────────────────────────────────────────────────────────────── */
const COPY = {
  en: {
    nav: ['Philosophy', 'How It Works', 'Stash', 'Join'],
    hero: {
      kicker: 'THE SOCIAL LAYER FOR MOMENTS',
      headline: 'LOVENDO',
      sub: 'No likes. No follows. Just real people, real moments.',
    },
    sections: [
      {
        title: 'MOMENTS ARE SIGNALS.\nNOT PLANS. NOT PROMISES.',
        body: 'A rooftop sunset in Lisbon. A jazz bar at 2 AM in Tokyo. Lovendo reads the moment — and connects you to someone feeling the same energy, right now.',
      },
      {
        title: 'THE ALGORITHM\nIS SERENDIPITY.',
        body: "We don't match profiles. We match presence. Your location, your vibe, your openness — translated into a single pulse that finds its echo.",
      },
      {
        title: 'PROOF OF MOMENT.\nNOT PROOF OF INFLUENCER.',
        body: "Forget follower counts. Here, your currency is spontaneity. A coffee offered, a story shared, a detour taken together. That's your proof.",
      },
    ],
    cta: 'JOIN THE BETA',
    stashTitle: 'THE STASH',
    stashSub: 'Curated moments from the community',
    email: 'Your email',
    submit: 'Notify Me',
    footer: 'Lovendo © 2025 — The social layer for moments.',
    modalOffer: 'OFFER SUGGESTION',
    modalHint: "Choose how you'd like to connect",
  },
  tr: {
    nav: ['Felsefe', 'Nasıl Çalışır', 'Stash', 'Katıl'],
    hero: {
      kicker: 'ANLAR İÇİN SOSYAL KATMAN',
      headline: 'LOVENDO',
      sub: 'Beğeni yok. Takip yok. Sadece gerçek insanlar, gerçek anlar.',
    },
    sections: [
      {
        title: 'ANLAR SİNYALDİR.\nPLAN DEĞİL. SÖZ DEĞİL.',
        body: "Lizbon'da bir çatı katı gün batımı. Tokyo'da gece 2'de bir caz barı. Lovendo anı okur — ve şu an aynı enerjiyi hisseden biriyle seni buluşturur.",
      },
      {
        title: 'ALGORİTMA\nTESADÜFTÜR.',
        body: 'Profil eşleştirmiyoruz. Varlık eşleştiriyoruz. Konumun, enerjin, açıklığın — yankısını bulan tek bir nabza dönüşür.',
      },
      {
        title: 'AN KANITI.\nİNFLUENCER KANITI DEĞİL.',
        body: 'Takipçi sayısını unut. Burada para birimin kendiliğindenliktir. İkram edilen bir kahve, paylaşılan bir hikaye, birlikte yapılan bir sapma. İşte kanıtın bu.',
      },
    ],
    cta: "BETA'YA KATIL",
    stashTitle: 'STASH',
    stashSub: 'Topluluktan küratörlü anlar',
    email: 'E-posta adresin',
    submit: 'Beni Bilgilendir',
    footer: 'Lovendo © 2025 — Anlar için sosyal katman.',
    modalOffer: 'ÖNERI',
    modalHint: 'Nasıl bağlanmak istediğini seç',
  },
};

const STASH: Record<Locale, StashItem[]> = {
  en: [
    {
      id: 1,
      label: 'LISBON',
      title: 'Rooftop Sunset',
      desc: 'Golden hour vibes at Miradouro da Senhora do Monte. Someone offered sangria.',
      tags: ['sunset', 'rooftop', 'social'],
      offers: [
        { title: 'I can offer a drink', meta: 'Sangria at the bar nearby' },
        { title: "Let's watch together", meta: 'Best spot in 10 mins' },
        { title: 'Share a story', meta: 'I have travel tales' },
      ],
    },
    {
      id: 2,
      label: 'TOKYO',
      title: '2 AM Jazz',
      desc: 'Found a hidden bar in Golden Gai. Piano, whiskey, strangers who became friends.',
      tags: ['nightlife', 'jazz', 'intimate'],
      offers: [
        { title: 'Know a better spot', meta: 'Hidden gem 2 blocks away' },
        { title: 'Join for a set', meta: 'They play until 4 AM' },
        { title: 'Grab breakfast after', meta: 'Ramen at sunrise' },
      ],
    },
    {
      id: 3,
      label: 'PARIS',
      title: 'Canal Picnic',
      desc: 'Baguette, cheese, wine by Canal Saint-Martin. A painter joined us.',
      tags: ['picnic', 'art', 'spontaneous'],
      offers: [
        { title: 'Bring some wine', meta: 'Natural wine shop nearby' },
        { title: 'Sketch together', meta: 'I have extra pencils' },
        { title: 'Stay for sunset', meta: 'The light is perfect' },
      ],
    },
    {
      id: 4,
      label: 'ISTANBUL',
      title: 'Bosphorus Tea',
      desc: 'Çay on the ferry at dusk. The city split between two continents, so were we.',
      tags: ['tea', 'ferry', 'contemplative'],
      offers: [
        { title: 'Catch the next ferry', meta: 'Every 20 mins' },
        { title: 'Tea on me', meta: 'The vendor knows me' },
        { title: 'Walk the shore', meta: 'Best views after dark' },
      ],
    },
    {
      id: 5,
      label: 'MEXICO CITY',
      title: 'Mercado Brunch',
      desc: 'Tacos at La Merced. A local showed us the best stall. Mezcal followed.',
      tags: ['food', 'local', 'adventure'],
      offers: [
        { title: 'Show you around', meta: 'I know all the stalls' },
        { title: 'Mezcal tasting', meta: 'Small batch, smoky' },
        { title: 'Cook together', meta: 'My kitchen, your story' },
      ],
    },
  ],
  tr: [
    {
      id: 1,
      label: 'LİZBON',
      title: 'Çatı Katı Gün Batımı',
      desc: "Miradouro da Senhora do Monte'de altın saat. Biri sangria ikram etti.",
      tags: ['gün batımı', 'çatı', 'sosyal'],
      offers: [
        { title: 'İçki ısmarlayabilirim', meta: 'Yakındaki barda sangria' },
        { title: 'Birlikte izleyelim', meta: "10 dk'da en iyi nokta" },
        { title: 'Hikaye paylaş', meta: 'Seyahat hikayeleri' },
      ],
    },
    {
      id: 2,
      label: 'TOKYO',
      title: 'Gece 2 Cazı',
      desc: "Golden Gai'de gizli bir bar bulduk. Piyano, viski, dost olan yabancılar.",
      tags: ['gece hayatı', 'caz', 'samimi'],
      offers: [
        { title: 'Daha iyi yer biliyorum', meta: '2 blok ötede gizli mekan' },
        { title: 'Sete katıl', meta: "Sabah 4'e kadar çalıyorlar" },
        { title: 'Sonra kahvaltı', meta: 'Gün doğumunda ramen' },
      ],
    },
    {
      id: 3,
      label: 'PARİS',
      title: 'Kanal Pikniği',
      desc: "Canal Saint-Martin'de baget, peynir, şarap. Bir ressam bize katıldı.",
      tags: ['piknik', 'sanat', 'spontan'],
      offers: [
        { title: 'Şarap getir', meta: 'Yakında doğal şarap dükkanı' },
        { title: 'Birlikte çiz', meta: 'Ekstra kalemim var' },
        { title: 'Gün batımına kal', meta: 'Işık mükemmel' },
      ],
    },
    {
      id: 4,
      label: 'İSTANBUL',
      title: 'Boğaz Çayı',
      desc: 'Alacakaranlıkta vapurda çay. İki kıta arasında bölünmüş şehir, biz de öyle.',
      tags: ['çay', 'vapur', 'düşünceli'],
      offers: [
        { title: 'Sonraki vapuru yakala', meta: "Her 20 dk'da bir" },
        { title: 'Çay benden', meta: 'Satıcı beni tanıyor' },
        { title: 'Sahilde yürü', meta: 'Karanlıkta en iyi manzara' },
      ],
    },
    {
      id: 5,
      label: 'MEKSİKA',
      title: 'Mercado Brunch',
      desc: "La Merced'de taco. Yerel biri en iyi tezgahı gösterdi. Ardından mezcal.",
      tags: ['yemek', 'yerel', 'macera'],
      offers: [
        { title: 'Gezdireyim', meta: 'Tüm tezgahları biliyorum' },
        { title: 'Mezcal tadımı', meta: 'Küçük parti, dumanlı' },
        { title: 'Birlikte pişir', meta: 'Benim mutfak, senin hikaye' },
      ],
    },
  ],
};

const CITIES = [
  'PARIS',
  'TOKYO',
  'LISBON',
  'ISTANBUL',
  'MEXICO CITY',
  'BERLIN',
  'NEW YORK',
  'SEOUL',
];

/* ─────────────────────────────────────────────────────────────────
   LOCALE DETECTION
───────────────────────────────────────────────────────────────── */
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language || 'en';
  return lang.toLowerCase().startsWith('tr') ? 'tr' : 'en';
}

/* ─────────────────────────────────────────────────────────────────
   3D ORB COMPONENT
───────────────────────────────────────────────────────────────── */
function Orb() {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere ref={meshRef} args={[1.6, 64, 64]}>
        <MeshDistortMaterial
          color="#1a1a1a"
          attach="material"
          distort={0.35}
          speed={1.5}
          roughness={0.15}
          metalness={0.9}
          envMapIntensity={0.8}
        />
      </Sphere>
      {/* Moment pins */}
      {[
        { pos: [1.2, 0.8, 0.9] as [number, number, number], color: '#ff2bd6' },
        { pos: [-1.0, 1.1, 0.5] as [number, number, number], color: '#00ff88' },
        { pos: [0.5, -1.2, 1.0] as [number, number, number], color: '#ffcc00' },
        {
          pos: [-0.8, -0.6, 1.3] as [number, number, number],
          color: '#00ccff',
        },
      ].map((pin, i) => (
        <mesh key={i} position={pin.pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color={pin.color} />
        </mesh>
      ))}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, -5, 5]} intensity={0.3} color="#ff2bd6" />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────────────────────────── */

// Lenis smooth scroll
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);
}

// GSAP ScrollTrigger
function useGsapReveal() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(
        el,
        { y: 60, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        },
      );
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);
}

// Cursor position tracker
function usePointerGlow() {
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--px', `${e.clientX}px`);
      document.documentElement.style.setProperty('--py', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
}

// Magnetic hover effect
function useMagnet() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-magnet]');
    const handlers: Array<{
      el: HTMLElement;
      move: (e: MouseEvent) => void;
      leave: () => void;
    }> = [];

    els.forEach((el) => {
      const move = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      };
      const leave = () => {
        el.style.transform = 'translate(0, 0)';
      };
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
      handlers.push({ el, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);
}

// Custom cursor
function useCustomCursor() {
  useEffect(() => {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;
    let ringX = 0;
    let ringY = 0;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const down = () => {
      dot.style.transform = 'translate(-50%, -50%) scale(0.7)';
      ring.style.transform = 'translate(-50%, -50%) scale(0.85)';
    };

    const up = () => {
      dot.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);

    let rafId: number;
    const animate = () => {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      ringX += (mouseX - ringX) * 0.08;
      ringY += (mouseY - ringY) * 0.08;
      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      rafId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      cancelAnimationFrame(rafId);
      dot.remove();
      ring.remove();
    };
  }, []);
}

// Rail drag with momentum
function useRailDrag(railRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velX = 0;
    let lastX = 0;
    let rafId: number;

    const mouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
      lastX = e.pageX;
      rail.style.cursor = 'grabbing';
    };

    const mouseLeave = () => {
      if (isDown) coast();
      isDown = false;
      rail.style.cursor = 'grab';
    };

    const mouseUp = () => {
      if (isDown) coast();
      isDown = false;
      rail.style.cursor = 'grab';
    };

    const mouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      const walk = (x - startX) * 1.2;
      rail.scrollLeft = scrollLeft - walk;
      velX = e.pageX - lastX;
      lastX = e.pageX;
    };

    const coast = () => {
      const friction = 0.92;
      const step = () => {
        if (Math.abs(velX) > 0.5) {
          rail.scrollLeft -= velX;
          velX *= friction;
          rafId = requestAnimationFrame(step);
        }
      };
      step();
    };

    rail.addEventListener('mousedown', mouseDown);
    rail.addEventListener('mouseleave', mouseLeave);
    rail.addEventListener('mouseup', mouseUp);
    rail.addEventListener('mousemove', mouseMove);

    return () => {
      rail.removeEventListener('mousedown', mouseDown);
      rail.removeEventListener('mouseleave', mouseLeave);
      rail.removeEventListener('mouseup', mouseUp);
      rail.removeEventListener('mousemove', mouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [railRef]);
}

// 3D tilt effect
function useTilt() {
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');
    const handlers: Array<{
      el: HTMLElement;
      move: (e: MouseEvent) => void;
      leave: () => void;
    }> = [];

    cards.forEach((card) => {
      const move = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.setProperty('--rx', `${rotateX}deg`);
        card.style.setProperty('--ry', `${rotateY}deg`);
        card.style.setProperty('--sx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--sy', `${(y / rect.height) * 100}%`);
      };
      const leave = () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      };
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseleave', leave);
      handlers.push({ el: card, move, leave });
    });

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener('mousemove', move);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);
}

/* ─────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [email, setEmail] = useState('');
  const [modalItem, setModalItem] = useState<StashItem | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const t = COPY[locale];
  const stash = STASH[locale];

  // Initialize locale
  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  // Hooks
  useLenis();
  useGsapReveal();
  usePointerGlow();
  useMagnet();
  useCustomCursor();
  useRailDrag(railRef);
  useTilt();

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'en' ? 'tr' : 'en'));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Demo: ${email} added to beta list!`);
    setEmail('');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* ─── NAV ─── */}
      <nav className="nav">
        <div className="navInner">
          <span className="logo">Lovendo</span>
          <div className="navLinks">
            {t.nav.map((item, i) => (
              <button
                key={i}
                onClick={() =>
                  scrollTo(
                    ['philosophy', 'how', 'stash', 'join'][i] ?? 'philosophy',
                  )
                }
                className="navLink"
                data-magnet
              >
                {item}
              </button>
            ))}
          </div>
          <button onClick={toggleLocale} className="langToggle" data-magnet>
            {locale.toUpperCase()}
          </button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="hero">
        <div className="heroContent">
          <span className="kicker">{t.hero.kicker}</span>
          <h1 className="headline">
            {t.hero.headline.split('\n').map((line, i) => (
              <span key={i} className="headlineLine">
                {line}
              </span>
            ))}
          </h1>
          <p className="heroSub">{t.hero.sub}</p>
          <button
            className="cta liquid"
            data-magnet
            onClick={() => scrollTo('join')}
          >
            <span className="ctaLabel">{t.cta}</span>
            <span className="ctaBlob" />
          </button>
        </div>
        <div className="orbWrap">
          <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 45 }}>
            <Orb />
          </Canvas>
        </div>
        <div className="ticker">
          <div className="tickerTrack">
            {[...CITIES, ...CITIES].map((city, i) => (
              <span key={i} className="tickerItem">
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL SECTIONS ─── */}
      <section id="philosophy" className="editorial">
        {t.sections.map((sec, i) => (
          <div key={i} className="editorialBlock" data-reveal>
            <h2 className="editorialTitle">
              {sec.title.split('\n').map((line, j) => (
                <span key={j} className="editorialLine">
                  {line}
                </span>
              ))}
            </h2>
            <p className="editorialBody">{sec.body}</p>
          </div>
        ))}
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="howSection" data-reveal>
        <div className="howInner">
          <h2 className="howTitle">
            {locale === 'en' ? 'HOW IT WORKS' : 'NASIL ÇALIŞIR'}
          </h2>
          <div className="howSteps">
            {[
              {
                icon: '📍',
                en: 'Share your moment signal',
                tr: 'An sinyalini paylaş',
              },
              {
                icon: '✨',
                en: 'Algorithm finds your echo',
                tr: 'Algoritma yankını bulur',
              },
              {
                icon: '🤝',
                en: 'Connect in real life',
                tr: 'Gerçek hayatta bağlan',
              },
            ].map((step, i) => (
              <div key={i} className="howStep" data-magnet>
                <span className="howIcon">{step.icon}</span>
                <span className="howText">{step[locale]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STASH ─── */}
      <section id="stash" className="stashSection">
        <div className="stashHeader" data-reveal>
          <h2 className="stashTitle">{t.stashTitle}</h2>
          <p className="stashSub">{t.stashSub}</p>
        </div>
        <div className="stashRail" ref={railRef}>
          {stash.map((item) => (
            <article
              key={item.id}
              className="card"
              data-tilt
              data-magnet
              onClick={() => setModalItem(item)}
            >
              <div className="cardMedia">
                <span className="cardLabel">{item.label}</span>
              </div>
              <div className="cardBody">
                <h3 className="cardTitle">{item.title}</h3>
                <p className="cardDesc">{item.desc}</p>
                <div className="cardTags">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="cardTag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── JOIN ─── */}
      <section id="join" className="joinSection" data-reveal>
        <div className="joinInner">
          <h2 className="joinTitle">{t.cta}</h2>
          <form className="joinForm" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="joinInput"
              required
            />
            <button type="submit" className="joinBtn" data-magnet>
              {t.submit}
            </button>
          </form>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="footer">
        <p>{t.footer}</p>
      </footer>

      {/* ─── MODAL ─── */}
      {modalItem && (
        <div className="modal" onClick={() => setModalItem(null)}>
          <div className="modalCard" onClick={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div className="modalTags">
                {modalItem.tags.map((tag, i) => (
                  <span key={i} className="cardTag">
                    {tag}
                  </span>
                ))}
              </div>
              <button className="modalClose" onClick={() => setModalItem(null)}>
                ✕
              </button>
            </div>
            <h3 className="modalTitle">{modalItem.title}</h3>
            <p className="modalBody">{modalItem.desc}</p>

            {/* Fake Map */}
            <div className="fakeMap">
              <div className="mapGrid">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="mapCell" />
                ))}
              </div>
              <div className="mapPins">
                <span className="mapPin" style={{ top: '30%', left: '40%' }} />
                <span className="mapPin" style={{ top: '60%', left: '65%' }} />
                <span className="mapPin" style={{ top: '45%', left: '25%' }} />
              </div>
              <span className="mapBadge">MAP · LIVE</span>
            </div>

            {/* Offer Suggestions */}
            <div className="offerBox">
              <div className="offerHead">
                <span className="offerKicker">{t.modalOffer}</span>
                <span className="offerHint">{t.modalHint}</span>
              </div>
              <div className="offerList">
                {modalItem.offers.map((offer, i) => (
                  <button key={i} className="offerRow" data-magnet>
                    <span className="offerTitle">{offer.title}</span>
                    <span className="offerMeta">{offer.meta}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modalActions">
              <button className="cta liquid" data-magnet>
                <span className="ctaLabel">
                  {locale === 'en' ? 'CONNECT' : 'BAĞLAN'}
                </span>
              </button>
              <button className="ghost" data-magnet>
                {locale === 'en' ? 'SAVE FOR LATER' : 'SONRA KAYDET'}
              </button>
            </div>
            <p className="modalNote">
              {locale === 'en'
                ? 'NO LIKES. NO FOLLOWS. JUST MOMENTS.'
                : 'BEĞENİ YOK. TAKİP YOK. SADECE ANLAR.'}
            </p>
          </div>
        </div>
      )}

      {/* ─── STYLES ─── */}
      <style jsx>{`
        /* Reset & Base */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Custom Cursor */
        :global(.cursor-dot) {
          position: fixed;
          width: 8px;
          height: 8px;
          background: rgba(255, 43, 214, 0.9);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease;
        }
        :global(.cursor-ring) {
          position: fixed;
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255, 43, 214, 0.4);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease;
        }

        /* Cursor Glow */
        :global(body)::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          background:
            radial-gradient(
              260px 260px at var(--px, 50vw) var(--py, 50vh),
              rgba(255, 43, 214, 0.14),
              transparent 60%
            ),
            radial-gradient(
              520px 520px at calc(var(--px, 50vw) - 120px)
                calc(var(--py, 50vh) + 80px),
              rgba(255, 43, 214, 0.08),
              transparent 65%
            );
          mix-blend-mode: screen;
        }

        [data-magnet] {
          transition: transform 220ms cubic-bezier(0.2, 0.9, 0.2, 1);
          will-change: transform;
        }

        /* NAV */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 16px 24px;
          background: rgba(10, 10, 12, 0.72);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .navInner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .logo {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #f2f2f2;
        }
        .navLinks {
          display: none;
          gap: 8px;
        }
        @media (min-width: 768px) {
          .navLinks {
            display: flex;
          }
        }
        .navLink {
          background: transparent;
          border: none;
          color: rgba(242, 242, 242, 0.72);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 10px 14px;
          cursor: pointer;
          border-radius: 8px;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }
        .navLink:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #f2f2f2;
        }
        .langToggle {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f2f2f2;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.1em;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .langToggle:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        /* HERO */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
          padding: 120px 24px 80px;
          background: radial-gradient(
            ellipse 80% 60% at 50% 40%,
            rgba(255, 43, 214, 0.08),
            transparent 70%
          );
          overflow: hidden;
        }
        .heroContent {
          text-align: center;
          z-index: 10;
          max-width: 900px;
        }
        .kicker {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(255, 43, 214, 0.9);
          margin-bottom: 16px;
          padding: 8px 16px;
          background: rgba(255, 43, 214, 0.08);
          border-radius: 999px;
          border: 1px solid rgba(255, 43, 214, 0.2);
        }
        .headline {
          font-size: clamp(48px, 12vw, 140px);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.9;
          color: #f2f2f2;
          margin-bottom: 24px;
        }
        .headlineLine {
          display: block;
        }
        .heroSub {
          font-size: clamp(16px, 2.5vw, 22px);
          color: rgba(242, 242, 242, 0.65);
          line-height: 1.5;
          margin-bottom: 40px;
        }

        /* CTA */
        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 56px;
          padding: 0 32px;
          background: linear-gradient(135deg, #ff2bd6 0%, #ff6b9d 100%);
          border: none;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          isolation: isolate;
          box-shadow: 0 4px 30px rgba(255, 43, 214, 0.35);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }
        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(255, 43, 214, 0.5);
        }
        .ctaLabel {
          position: relative;
          z-index: 2;
        }
        .ctaBlob {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: radial-gradient(
            240px 140px at var(--px, 50%) var(--py, 50%),
            rgba(255, 255, 255, 0.2),
            transparent
          );
          opacity: 0.5;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
        .liquid::before {
          content: '';
          position: absolute;
          inset: -40px;
          background:
            radial-gradient(
              circle at 40% 40%,
              rgba(255, 255, 255, 0.45),
              transparent 48%
            ),
            radial-gradient(
              circle at 70% 60%,
              rgba(0, 0, 0, 0.25),
              transparent 55%
            );
          opacity: 0;
          transform: translate3d(-10%, 10%, 0) scale(0.9);
          transition:
            opacity 220ms ease,
            transform 420ms cubic-bezier(0.2, 0.9, 0.2, 1);
          z-index: 1;
          mix-blend-mode: overlay;
        }
        .liquid:hover::before {
          opacity: 0.85;
          transform: translate3d(0, 0, 0) scale(1);
        }

        /* ORB */
        .orbWrap {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(500px, 80vw);
          height: min(500px, 80vw);
          z-index: 1;
          opacity: 0.6;
        }

        /* TICKER */
        .ticker {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(10, 10, 12, 0.5);
        }
        .tickerTrack {
          display: flex;
          animation: tickerScroll 30s linear infinite;
          white-space: nowrap;
        }
        @keyframes tickerScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .tickerItem {
          flex-shrink: 0;
          padding: 14px 40px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(242, 242, 242, 0.45);
        }

        /* EDITORIAL */
        .editorial {
          padding: 120px 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .editorialBlock {
          margin-bottom: 120px;
        }
        .editorialBlock:last-child {
          margin-bottom: 0;
        }
        .editorialTitle {
          font-size: clamp(28px, 6vw, 56px);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: #f2f2f2;
          margin-bottom: 24px;
        }
        .editorialLine {
          display: block;
        }
        .editorialBody {
          font-size: clamp(16px, 2vw, 20px);
          color: rgba(242, 242, 242, 0.65);
          line-height: 1.7;
          max-width: 600px;
        }

        /* HOW */
        .howSection {
          padding: 100px 24px;
          background: rgba(255, 43, 214, 0.03);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .howInner {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }
        .howTitle {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 900;
          letter-spacing: 0.1em;
          color: #f2f2f2;
          margin-bottom: 60px;
        }
        .howSteps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
        }
        .howStep {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 32px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
        }
        .howIcon {
          font-size: 40px;
        }
        .howText {
          font-size: 14px;
          font-weight: 600;
          color: rgba(242, 242, 242, 0.8);
          text-align: center;
        }

        /* STASH */
        .stashSection {
          padding: 100px 0;
        }
        .stashHeader {
          padding: 0 24px;
          max-width: 900px;
          margin: 0 auto 60px;
          text-align: center;
        }
        .stashTitle {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #f2f2f2;
          margin-bottom: 12px;
        }
        .stashSub {
          font-size: 16px;
          color: rgba(242, 242, 242, 0.55);
        }
        .stashRail {
          display: flex;
          gap: 24px;
          padding: 0 24px;
          overflow-x: auto;
          scrollbar-width: none;
          cursor: grab;
          -webkit-overflow-scrolling: touch;
        }
        .stashRail::-webkit-scrollbar {
          display: none;
        }

        /* CARD */
        .card {
          flex-shrink: 0;
          width: 320px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(18, 18, 22, 0.8);
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transform-style: preserve-3d;
          transform: perspective(900px) rotateX(var(--rx, 0deg))
            rotateY(var(--ry, 0deg)) translateY(0);
          will-change: transform;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
        }
        .card:hover {
          transform: perspective(900px) rotateX(var(--rx, 0deg))
            rotateY(var(--ry, 0deg)) translateY(-4px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        .card::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          background: radial-gradient(
            340px 240px at var(--px, 50vw) var(--py, 50vh),
            rgba(255, 43, 214, 0.22),
            transparent 60%
          );
          opacity: 0;
          transition: opacity 220ms ease;
          pointer-events: none;
          mix-blend-mode: screen;
        }
        .card:hover::before {
          opacity: 1;
        }
        .card::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 24px;
          background: radial-gradient(
            420px 260px at var(--sx, 50%) var(--sy, 50%),
            rgba(255, 255, 255, 0.22),
            transparent 62%
          );
          opacity: 0;
          transition: opacity 180ms ease;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        .card:hover::after {
          opacity: 0.95;
        }
        .cardMedia {
          height: 180px;
          background: linear-gradient(
            135deg,
            rgba(255, 43, 214, 0.2),
            rgba(0, 204, 255, 0.1)
          );
          position: relative;
          transform: translateZ(18px);
        }
        .cardLabel {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: rgba(242, 242, 242, 0.9);
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          padding: 6px 12px;
          border-radius: 999px;
        }
        .cardBody {
          padding: 20px;
          transform: translateZ(18px);
        }
        .cardTitle {
          font-size: 18px;
          font-weight: 800;
          color: #f2f2f2;
          margin-bottom: 8px;
        }
        .cardDesc {
          font-size: 14px;
          color: rgba(242, 242, 242, 0.6);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .cardTags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .cardTag {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 43, 214, 0.85);
          background: rgba(255, 43, 214, 0.1);
          padding: 6px 10px;
          border-radius: 999px;
        }

        /* JOIN */
        .joinSection {
          padding: 120px 24px;
          background: radial-gradient(
            ellipse 60% 40% at 50% 100%,
            rgba(255, 43, 214, 0.1),
            transparent 70%
          );
        }
        .joinInner {
          max-width: 500px;
          margin: 0 auto;
          text-align: center;
        }
        .joinTitle {
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #f2f2f2;
          margin-bottom: 32px;
        }
        .joinForm {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 480px) {
          .joinForm {
            flex-direction: row;
          }
        }
        .joinInput {
          flex: 1;
          height: 56px;
          padding: 0 20px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          font-size: 15px;
          color: #f2f2f2;
          outline: none;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }
        .joinInput::placeholder {
          color: rgba(242, 242, 242, 0.4);
        }
        .joinInput:focus {
          border-color: rgba(255, 43, 214, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }
        .joinBtn {
          height: 56px;
          padding: 0 28px;
          background: #f2f2f2;
          border: none;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0a0a0c;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }
        .joinBtn:hover {
          background: #fff;
          transform: translateY(-2px);
        }

        /* FOOTER */
        .footer {
          padding: 40px 24px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .footer p {
          font-size: 13px;
          color: rgba(242, 242, 242, 0.4);
          letter-spacing: 0.05em;
        }

        /* MODAL */
        .modal {
          position: fixed;
          inset: 0;
          z-index: 60;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(10px);
          animation: modalIn 220ms ease;
        }
        @keyframes modalIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .modalCard {
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 26px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(16, 16, 20, 0.92);
          box-shadow: 0 30px 120px rgba(0, 0, 0, 0.7);
          padding: 24px;
          position: relative;
        }
        .modalCard::before {
          content: '';
          position: absolute;
          inset: -120px;
          background:
            radial-gradient(
              420px 340px at 35% 30%,
              rgba(255, 43, 214, 0.18),
              transparent 62%
            ),
            radial-gradient(
              520px 420px at 80% 70%,
              rgba(255, 43, 214, 0.1),
              transparent 65%
            );
          pointer-events: none;
        }
        .modalTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: relative;
        }
        .modalTags {
          display: inline-flex;
          gap: 8px;
        }
        .modalClose {
          height: 40px;
          width: 40px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.28);
          color: rgba(242, 242, 242, 0.85);
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s ease;
        }
        .modalClose:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .modalTitle {
          margin-top: 16px;
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #f2f2f2;
          position: relative;
        }
        .modalBody {
          margin-top: 10px;
          color: rgba(242, 242, 242, 0.65);
          line-height: 1.65;
          position: relative;
        }

        /* Fake Map */
        .fakeMap {
          margin-top: 20px;
          height: 180px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: linear-gradient(
            135deg,
            rgba(26, 26, 30, 0.9),
            rgba(18, 18, 22, 0.9)
          );
          position: relative;
          overflow: hidden;
        }
        .mapGrid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          opacity: 0.15;
        }
        .mapCell {
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .mapPins {
          position: absolute;
          inset: 0;
        }
        .mapPin {
          position: absolute;
          width: 12px;
          height: 12px;
          background: #ff2bd6;
          border-radius: 50%;
          box-shadow: 0 0 20px rgba(255, 43, 214, 0.6);
          animation: pinPulse 2s ease-in-out infinite;
        }
        .mapPin:nth-child(2) {
          animation-delay: 0.5s;
          background: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
        }
        .mapPin:nth-child(3) {
          animation-delay: 1s;
          background: #00ccff;
          box-shadow: 0 0 20px rgba(0, 204, 255, 0.6);
        }
        @keyframes pinPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }
        .mapBadge {
          position: absolute;
          bottom: 10px;
          left: 12px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.28);
          color: rgba(242, 242, 242, 0.72);
          backdrop-filter: blur(10px);
        }

        /* Offer Box */
        .offerBox {
          margin-top: 20px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 16px;
          position: relative;
        }
        .offerHead {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .offerKicker {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(242, 242, 242, 0.78);
          font-weight: 700;
        }
        .offerHint {
          font-size: 12px;
          color: rgba(242, 242, 242, 0.55);
        }
        .offerList {
          margin-top: 12px;
          display: grid;
          gap: 8px;
        }
        .offerRow {
          width: 100%;
          text-align: left;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.26);
          padding: 12px 14px;
          cursor: pointer;
          color: rgba(242, 242, 242, 0.85);
          transition: background 0.2s ease;
        }
        .offerRow:hover {
          background: rgba(255, 255, 255, 0.06);
        }
        .offerTitle {
          display: block;
          font-weight: 900;
          letter-spacing: -0.01em;
          font-size: 14px;
        }
        .offerMeta {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: rgba(242, 242, 242, 0.55);
        }

        .modalActions {
          margin-top: 20px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          position: relative;
        }
        .ghost {
          height: 48px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(242, 242, 242, 0.82);
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 0 20px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .ghost:hover {
          background: rgba(255, 255, 255, 0.09);
        }
        .modalNote {
          margin-top: 20px;
          font-size: 12px;
          color: rgba(242, 242, 242, 0.45);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-align: center;
          position: relative;
        }
      `}</style>
    </>
  );
}

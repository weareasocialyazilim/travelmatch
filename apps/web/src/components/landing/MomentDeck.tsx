'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { WhisperUI } from './WhisperUI';

const MOMENTS = [
  {
    id: 1,
    user: 'Elena',
    city: 'Roma',
    img: '/moments/roma.jpg',
    vibe: 'Sweet & Secret',
    aura: '#FF007A',
  },
  {
    id: 2,
    user: 'Nikos',
    city: 'Atina',
    img: '/moments/athens.jpg',
    vibe: 'Ancient Echoes',
    aura: '#8B5CF6',
  },
  {
    id: 3,
    user: 'Zayed',
    city: 'Dubai',
    img: '/moments/dubai.jpg',
    vibe: 'Golden Heights',
    aura: '#FACC15',
  },
  {
    id: 4,
    user: 'Jade',
    city: 'New York',
    img: '/moments/ny.jpg',
    vibe: 'Concrete Jungle',
    aura: '#00F2FF',
  },
  {
    id: 5,
    user: 'Sky',
    city: 'Los Angeles',
    img: '/moments/la.jpg',
    vibe: 'Neon Sunset',
    aura: '#FF8A65',
  },
  {
    id: 6,
    user: 'Kenji',
    city: 'Tokyo',
    img: '/moments/tokyo.jpg',
    vibe: 'Cyber Silence',
    aura: '#CCFF00',
  },
  {
    id: 7,
    user: 'Chloe',
    city: 'Paris',
    img: '/moments/paris.jpg',
    vibe: 'Midnight Stroll',
    aura: '#FF007A',
  },
  {
    id: 8,
    user: 'Lars',
    city: 'Amsterdam',
    img: '/moments/amsterdam.jpg',
    vibe: 'Canal Magic',
    aura: '#8B5CF6',
  },
  {
    id: 9,
    user: 'Can',
    city: 'İstanbul',
    img: '/moments/istanbul.jpg',
    vibe: 'Two Continents',
    aura: '#FACC15',
  },
  {
    id: 10,
    user: 'Li',
    city: 'Singapur',
    img: '/moments/singapore.jpg',
    vibe: 'Garden City',
    aura: '#00F2FF',
  },
  {
    id: 11,
    user: 'Ji-Hoon',
    city: 'Seul',
    img: '/moments/seoul.jpg',
    vibe: 'K-Energy',
    aura: '#FF007A',
  },
  {
    id: 12,
    user: 'Beatriz',
    city: 'Rio',
    img: '/moments/rio.jpg',
    vibe: 'Samba Soul',
    aura: '#CCFF00',
  },
  {
    id: 13,
    user: 'Amira',
    city: 'Marakeş',
    img: '/moments/marrakech.jpg',
    vibe: 'Desert Ritual',
    aura: '#FF8A65',
  },
  {
    id: 14,
    user: 'Oliver',
    city: 'Sidney',
    img: '/moments/sydney.jpg',
    vibe: 'Harbour Life',
    aura: '#00F2FF',
  },
  {
    id: 15,
    user: 'Arna',
    city: 'Reykjavik',
    img: '/moments/reykjavik.jpg',
    vibe: 'Aurora Dance',
    aura: '#8B5CF6',
  },
];

export function MomentDeck() {
  return (
    <section className="relative min-h-[400vh] w-full bg-black">
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <h2 className="absolute top-20 left-10 text-4xl md:text-6xl font-black italic opacity-20 uppercase tracking-tighter z-0">
          The Network
        </h2>

        <div className="relative w-[90vw] md:w-[35vw] h-[65vh] md:h-[75vh]">
          {MOMENTS.map((moment, index) => (
            <MomentCard
              key={moment.id}
              moment={moment}
              index={index}
              total={MOMENTS.length}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function MomentCard({
  moment,
  index,
  total,
}: {
  moment: any;
  index: number;
  total: number;
}) {
  const { scrollYProgress } = useScroll();

  // Her kartın kendi scroll aralığında belirmesi ve kaybolması
  const start = index / total;
  const end = (index + 1) / total;

  // Fade in faster, stay longer
  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.05, end - 0.05, end],
    [0, 1, 1, 0],
  );

  const scale = useTransform(scrollYProgress, [start, end], [0.9, 1.05]);
  const rotate = useTransform(
    scrollYProgress,
    [start, end],
    [index % 2 === 0 ? -3 : 3, 0],
  );

  return (
    <motion.div
      style={{ scale, opacity, rotate }}
      // Note the data-aura and cursor-pointer attributes for CustomCursor interaction
      data-aura={moment.aura}
      className={`absolute inset-0 rounded-[2rem] overflow-hidden border glass-card bg-zinc-900 shadow-2xl cursor-pointer`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform hover:scale-110 grayscale hover:grayscale-0"
        style={{ backgroundImage: `url(${moment.img})` }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

      {/* Whisper UI - Social Proof */}
      <WhisperUI momentId={moment.id} active={true} />

      <div className="absolute bottom-10 left-8 right-8 text-white z-20">
        <span
          style={{ borderColor: `${moment.aura}80`, color: moment.aura }}
          className={`inline-block px-3 py-1 mb-3 text-xs font-mono uppercase tracking-[0.2em] border rounded-full bg-black/50 backdrop-blur-md`}
        >
          {moment.vibe}
        </span>
        <h3 className="text-5xl font-black italic uppercase leading-[0.85] tracking-tight">
          {moment.user} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
            {moment.city}
          </span>
        </h3>
      </div>
    </motion.div>
  );
}

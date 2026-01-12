'use client';
import { motion } from 'framer-motion';

const WHISPERS = [
  {
    text: 'Orası çok turistik, 2 sokak ötede gerçek artisan dondurmacı var, gel orada yiyelim!',
    color: 'var(--neon-pink)',
  },
  {
    text: 'Bu manzaraya karşı bir kahve ikram etmek isterim ☕️',
    color: 'var(--warm-coffee)',
  },
  {
    text: 'Bugün hava tam yürüyüşlük, bana katılmak ister misin?',
    color: 'var(--neon-cyan)',
  },
];

export function WhisperUI({
  momentId,
  active,
}: {
  momentId: number;
  active: boolean;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none p-10">
      {WHISPERS.map((whisper, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, y: 50 }}
          animate={
            active
              ? {
                  opacity: 1,
                  x: i % 2 === 0 ? 20 : 150,
                  y: i * 80 + 100,
                  scale: [1, 1.05, 1],
                }
              : {}
          }
          transition={{
            delay: i * 0.5,
            duration: 2,
            repeat: Infinity,
            repeatType: 'mirror',
          }}
          className="absolute max-w-[250px] p-4 rounded-2xl border backdrop-blur-xl pointer-events-auto cursor-pointer group"
          style={{
            borderColor: whisper.color,
            backgroundColor: `${whisper.color}15`,
            color: whisper.color,
          }}
        >
          <p className="text-sm font-bold leading-tight">{whisper.text}</p>
          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] uppercase font-black tracking-tighter">
              Match & Meet →
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

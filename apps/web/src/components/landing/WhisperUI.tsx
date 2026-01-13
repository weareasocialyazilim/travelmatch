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
    <div className="absolute inset-0 pointer-events-none p-4 md:p-10">
      {WHISPERS.map((whisper, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50, y: 50 }}
          animate={{
            opacity: active ? 1 : 0,
            x: i % 2 === 0 ? 15 : -15,
            y: i * 90 + 60,
            scale: 1,
          }}
          transition={{
            delay: i * 0.3,
            duration: 0.5,
          }}
          className="absolute max-w-[220px] md:max-w-[280px] p-3 md:p-4 rounded-xl md:rounded-2xl border-2 backdrop-blur-xl pointer-events-auto cursor-pointer group shadow-lg"
          style={{
            borderColor: whisper.color,
            backgroundColor: `${whisper.color}25`,
            color: whisper.color,
          }}
        >
          <p className="text-sm md:text-base font-bold leading-tight">
            {whisper.text}
          </p>
          <div className="mt-2 md:mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] md:text-xs uppercase font-black tracking-tighter">
              Match & Meet →
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

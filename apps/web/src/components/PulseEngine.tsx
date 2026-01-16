'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * --- SARCASTIC FLOATING ELEMENTS ---
 * Uçuşan sarkastik, komik, date-related emojiler ve metinler
 */

const SARCASTIC_ITEMS = [
  // Emojis
  '💀',
  '🍑',
  '🍆',
  '👀',
  '🔥',
  '💅',
  '🙄',
  '😏',
  '🥵',
  '💋',
  '🫠',
  '✨',
  '🦋',
  '🌶️',
  '💜',
  '🖤',
  '👻',
  '🎭',
  '🍷',
  '🌙',
  '💔',
  '🫦',
  '💕',
  '🥀',
  '🎪',
  '🎰',
  '🃏',
  '🪩',
  '🌹',
  '⚡',
  // Sarcastic texts
  'NO GHOSTS',
  'DELULU',
  'MID',
  'SLAY',
  'TOXIC',
  'MAIN CHARACTER',
  'SITUATIONSHIP',
  'RED FLAG',
  'GREEN FLAG',
  'ICK',
  'YAPPING',
  'NPC',
  'REAL',
  'VALID',
  'UNHINGED',
  'ERA',
  'BASED',
  'NO CAP',
  'SIKE',
  'BYE',
];

interface FloatingItem {
  id: number;
  content: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
  isEmoji: boolean;
  moveX: number;
  rotateDir: number;
}

const PulseEngine = () => {
  const [items, setItems] = useState<FloatingItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Generate floating items
    const generateItems = () => {
      const newItems: FloatingItem[] = [];
      for (let i = 0; i < 40; i++) {
        const content =
          SARCASTIC_ITEMS[Math.floor(Math.random() * SARCASTIC_ITEMS.length)];
        const isEmoji = content.length <= 2;
        newItems.push({
          id: i,
          content,
          x: Math.random() * 100,
          y: Math.random() * 100,
          duration: 20 + Math.random() * 30,
          delay: Math.random() * 5,
          size: isEmoji ? 24 + Math.random() * 32 : 10 + Math.random() * 8,
          rotation: Math.random() * 360,
          isEmoji,
          moveX: Math.random() > 0.5 ? 30 : -30,
          rotateDir: Math.random() > 0.5 ? 180 : -180,
        });
      }
      setItems(newItems);
    };

    generateItems();

    // Regenerate periodically
    const interval = setInterval(() => {
      generateItems();
    }, 50000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 z-0 bg-[#0a0a0a]" />;
  }

  return (
    <div className="fixed inset-0 z-0 bg-[#0a0a0a] overflow-hidden pointer-events-none">
      {items.map((item) => (
        <motion.div
          key={`${item.id}-${item.content}`}
          className={`absolute select-none ${
            item.isEmoji
              ? ''
              : 'font-black uppercase italic tracking-tighter text-[#FF00FF]'
          }`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
          }}
          initial={{
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: item.isEmoji ? [0, 0.3, 0.3, 0] : [0, 0.15, 0.15, 0],
            scale: [0.5, 1, 1, 0.5],
            y: [0, -200],
            x: [0, item.moveX],
            rotate: [item.rotation, item.rotation + item.rotateDir],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.content}
        </motion.div>
      ))}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]/80 pointer-events-none" />
    </div>
  );
};

export default React.memo(PulseEngine);

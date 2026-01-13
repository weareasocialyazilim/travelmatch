'use client';
import { motion } from 'framer-motion';

export function RitualStatCard({
  title,
  value,
  aura,
}: {
  title: string;
  value: string;
  aura: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="admin-glass p-8 flex flex-col justify-between h-[200px]"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
          {title}
        </span>
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: aura, boxShadow: `0 0 10px ${aura}` }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-6xl font-black italic tracking-tighter">{value}</h3>
      </div>
    </motion.div>
  );
}

'use client';
import { motion } from 'framer-motion';
import { RitualStatCard } from '@/components/common/stat-card';
import {
  CheckBadgeIcon,
  XCircleIcon,
  CameraIcon,
} from '@heroicons/react/24/solid';

const MOCK_APPLICATIONS = [
  {
    id: 1,
    email: 'chloe@paris.com',
    handle: 'chloe.vogue',
    city: 'PARİS',
    aura: 'Chic',
    score: 98,
    color: '#FF007A',
  },
  {
    id: 2,
    email: 'kenji@tokyo.jp',
    handle: 'kenji_future',
    city: 'TOKYO',
    aura: 'Zen-Tech',
    score: 94,
    color: '#CCFF00',
  },
  {
    id: 3,
    email: 'can@istanbul.tr',
    handle: 'storybycan',
    city: 'İSTANBUL',
    aura: 'Storyteller',
    score: 91,
    color: '#FACC15',
  },
];

export default function RitualQueuePage() {
  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <header className="space-y-2">
        <span className="text-[10px] font-black tracking-[0.5em] text-[var(--ritual-pink)] uppercase">
          COMMAND CENTER
        </span>
        <h1 className="text-ritual-title font-black italic uppercase">
          The Ritual <br /> Queue
        </h1>
      </header>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RitualStatCard
          title="Creator Applications"
          value="842"
          aura="var(--ritual-pink)"
        />
        <RitualStatCard
          title="Vibe Check Pass"
          value="%42"
          aura="var(--ritual-cyan)"
        />
        <RitualStatCard
          title="Active Hubs"
          value="15/15"
          aura="var(--ritual-purple)"
        />
      </div>

      {/* Başvuru Kartları */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold opacity-30 uppercase tracking-widest">
          Pending Creators
        </h2>
        {MOCK_APPLICATIONS.map((app) => (
          <motion.div
            key={app.id}
            whileHover={{ x: 10 }}
            className="admin-glass p-6 flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer"
          >
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div
                className="w-12 h-12 rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: app.color }}
              />
              <div>
                <p className="font-black italic text-xl uppercase tracking-tighter">
                  {app.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] opacity-40 font-bold uppercase">
                    {app.city} • {app.aura} Aura
                  </span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 text-[var(--ritual-cyan)]">
                    <CameraIcon className="w-3 h-3" /> @{app.handle}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-end">
              <div className="text-right hidden md:block">
                <p
                  className="text-2xl font-black italic"
                  style={{ color: app.color }}
                >
                  %{app.score}
                </p>
                <p className="text-[8px] opacity-30 font-bold uppercase tracking-widest">
                  Match Score
                </p>
              </div>

              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-black/50 hover:bg-red-500/20 text-red-500 border border-red-500/20 flex items-center justify-center transition-all">
                  <XCircleIcon className="w-6 h-6" />
                </button>
                <button className="px-6 py-3 rounded-full bg-white text-black font-black uppercase text-[10px] hover:bg-[var(--ritual-acid)] hover:scale-105 transition-all flex items-center gap-2">
                  <CheckBadgeIcon className="w-4 h-4" />
                  ADMIT CREATOR
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

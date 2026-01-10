'use client';

/**
 * MomentGrid Component - Blurred FOMO Content Grid
 *
 * Displays a grid of "locked" moments that users can only access via the app.
 * Uses blur effect to tease content while creating urgency to download.
 */

import { motion } from 'framer-motion';
import { Lock, Heart, Gift, Clock, MapPin, Sparkles } from 'lucide-react';

interface MomentGridProps {
  city: string;
  intent: string;
  lang: string;
}

interface Moment {
  id: string;
  title: string;
  location: string;
  price: string;
  likes: number;
  timeAgo: string;
  image: string;
  category: string;
  isVip: boolean;
}

// Sample moments - in production, fetch from Supabase
const SAMPLE_MOMENTS: Moment[] = [
  {
    id: '1',
    title: 'Sunset Rooftop Dinner',
    location: 'Marina District',
    price: '$85',
    likes: 234,
    timeAgo: '2h',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&auto=format&fit=crop&q=60',
    category: 'dining',
    isVip: true,
  },
  {
    id: '2',
    title: 'Coffee & Art Walk',
    location: 'Old Town',
    price: '$25',
    likes: 156,
    timeAgo: '4h',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&auto=format&fit=crop&q=60',
    category: 'coffee',
    isVip: false,
  },
  {
    id: '3',
    title: 'Night Club VIP Table',
    location: 'Downtown',
    price: '$250',
    likes: 412,
    timeAgo: '1h',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=400&auto=format&fit=crop&q=60',
    category: 'nightlife',
    isVip: true,
  },
  {
    id: '4',
    title: 'Yacht Day Trip',
    location: 'Harbor',
    price: '$180',
    likes: 328,
    timeAgo: '30m',
    image: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=400&auto=format&fit=crop&q=60',
    category: 'adventure',
    isVip: true,
  },
  {
    id: '5',
    title: 'Spa & Wellness Day',
    location: 'Luxury Hotel',
    price: '$120',
    likes: 189,
    timeAgo: '3h',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&auto=format&fit=crop&q=60',
    category: 'wellness',
    isVip: false,
  },
  {
    id: '6',
    title: 'Private Chef Experience',
    location: 'Penthouse',
    price: '$300',
    likes: 567,
    timeAgo: '5h',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&auto=format&fit=crop&q=60',
    category: 'dining',
    isVip: true,
  },
];

const TRANSLATIONS = {
  en: {
    unlock: 'Unlock with Gift',
    waiting: 'Waiting for gift',
    vip: 'VIP',
    active: 'Active Now',
  },
  tr: {
    unlock: 'Hediye ile Aç',
    waiting: 'Hediye bekliyor',
    vip: 'VIP',
    active: 'Şu An Aktif',
  },
};

export function MomentGrid({ city, intent, lang }: MomentGridProps) {
  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {SAMPLE_MOMENTS.map((moment, index) => (
        <motion.div
          key={moment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="group relative"
        >
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            {/* Blurred Image */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-60 transition-all duration-500 group-hover:blur-2xl"
              style={{ backgroundImage: `url('${moment.image}')` }}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* VIP Badge */}
            {moment.isVip && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-3 py-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white uppercase">{t.vip}</span>
              </div>
            )}

            {/* Active Indicator */}
            <div className="absolute top-3 left-3 bg-green-500/20 backdrop-blur-md border border-green-500/30 rounded-full px-3 py-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">{t.active}</span>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/80 to-pink-500/80 backdrop-blur-md flex items-center justify-center mb-4 shadow-xl"
              >
                <Lock className="w-8 h-8 text-white" />
              </motion.div>
              <button className="bg-white text-black font-bold text-sm px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors flex items-center gap-2">
                <Gift className="w-4 h-4" />
                {t.unlock}
              </button>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3 text-white/50" />
                <span className="text-xs text-white/50">{moment.location}</span>
              </div>

              <h3 className="font-bold text-lg text-white mb-2 blur-[2px] group-hover:blur-[4px] transition-all">
                {moment.title}
              </h3>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span className="text-xs text-white/70">{moment.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-xs text-white/50">{moment.timeAgo}</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-white blur-[3px]">{moment.price}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Waiting Message */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40">
            <Gift className="w-3 h-3" />
            <span>{t.waiting}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default MomentGrid;

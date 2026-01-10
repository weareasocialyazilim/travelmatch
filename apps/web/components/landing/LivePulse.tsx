'use client';

/**
 * LivePulse Component - Real-time Social Activity Ticker
 *
 * Creates FOMO by showing live gifting/matching activity worldwide.
 * Bloomberg-style ticker that makes users feel "left out" of the action.
 */

import { useEffect, useState } from 'react';

interface LivePulseProps {
  city: string;
  lang: string;
}

interface PulseEvent {
  id: string;
  city: string;
  action: string;
  moment: string;
  timeAgo: string;
  emoji: string;
}

// Sample events for demonstration - in production, fetch from Supabase
const SAMPLE_EVENTS: PulseEvent[] = [
  { id: '1', city: 'Dubai', action: 'unlocked', moment: 'VIP Desert Safari', timeAgo: '12s', emoji: '🏜️' },
  { id: '2', city: 'Istanbul', action: 'sent gift', moment: 'Bosphorus Dinner', timeAgo: '28s', emoji: '🌉' },
  { id: '3', city: 'London', action: 'matched', moment: 'West End Theatre', timeAgo: '45s', emoji: '🎭' },
  { id: '4', city: 'Tokyo', action: 'unlocked', moment: 'Sakura Moment', timeAgo: '1m', emoji: '🌸' },
  { id: '5', city: 'Paris', action: 'sent gift', moment: 'Eiffel Sunset', timeAgo: '2m', emoji: '🗼' },
  { id: '6', city: 'Miami', action: 'matched', moment: 'Yacht Party', timeAgo: '3m', emoji: '🛥️' },
  { id: '7', city: 'Bali', action: 'unlocked', moment: 'Temple Sunrise', timeAgo: '4m', emoji: '🌅' },
  { id: '8', city: 'New York', action: 'sent gift', moment: 'Rooftop Cocktails', timeAgo: '5m', emoji: '🍸' },
  { id: '9', city: 'Berlin', action: 'matched', moment: 'Underground Club', timeAgo: '6m', emoji: '🎵' },
  { id: '10', city: 'Singapore', action: 'unlocked', moment: 'Marina Bay Night', timeAgo: '7m', emoji: '✨' },
];

const TRANSLATIONS = {
  en: {
    unlocked: 'unlocked',
    'sent gift': 'sent gift for',
    matched: 'matched on',
    live: 'LIVE',
  },
  tr: {
    unlocked: 'kilidi açtı',
    'sent gift': 'hediye gönderdi',
    matched: 'eşleşti',
    live: 'CANLI',
  },
};

export function LivePulse({ city, lang }: LivePulseProps) {
  const [events, setEvents] = useState<PulseEvent[]>(SAMPLE_EVENTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  const t = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  // Rotate through events
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [events.length]);

  // Prioritize events from current city
  useEffect(() => {
    const sortedEvents = [...SAMPLE_EVENTS].sort((a, b) => {
      if (a.city.toLowerCase() === city.toLowerCase()) return -1;
      if (b.city.toLowerCase() === city.toLowerCase()) return 1;
      return 0;
    });
    setEvents(sortedEvents);
  }, [city]);

  const currentEvent = events[currentIndex];

  return (
    <>
      {/* Fixed Top Ticker Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="overflow-hidden py-2">
          <div className="animate-marquee flex gap-16 whitespace-nowrap">
            {[...events, ...events].map((event, idx) => (
              <span
                key={`${event.id}-${idx}`}
                className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider"
              >
                <span className="text-purple-400">{event.emoji}</span>
                <span className="text-white/80">{event.city}:</span>
                <span className="text-pink-400">
                  {t[event.action as keyof typeof t] || event.action}
                </span>
                <span className="text-white/60">&quot;{event.moment}&quot;</span>
                <span className="text-white/40">({event.timeAgo})</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Notification (appears occasionally) */}
      <div className="fixed top-16 right-4 z-50 pointer-events-none">
        <div
          key={currentEvent.id}
          className="animate-slideIn bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-lg border border-pink-500/30 rounded-2xl px-4 py-3 shadow-2xl shadow-purple-500/20 max-w-xs"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">
              {currentEvent.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {t.live}
                </span>
                <span className="text-[10px] text-white/40">{currentEvent.timeAgo}</span>
              </div>
              <p className="text-xs text-white/90 truncate">
                <span className="font-semibold text-pink-400">{currentEvent.city}</span>
                {' - '}
                {t[currentEvent.action as keyof typeof t] || currentEvent.action}{' '}
                <span className="text-white/70">&quot;{currentEvent.moment}&quot;</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LivePulse;

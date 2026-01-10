'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

// Star data representing a real-time verification event
export interface RealtimeStar {
  id: string;
  x: number;
  y: number;
  z: number;
  color: string;
  intensity: number;
  createdAt: number;
  type: 'verification' | 'gift' | 'moment' | 'match';
  location?: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
}

interface UseRealtimeStarsOptions {
  maxStars?: number;
  fadeAfterMs?: number;
  supabaseUrl?: string;
  supabaseKey?: string;
  enableSimulation?: boolean;
}

// Color mapping for different event types
const EVENT_COLORS = {
  verification: '#CCFF00', // Acid Green
  gift: '#FF0099', // Neon Pink
  moment: '#00F0FF', // Electric Blue
  match: '#FFD700', // Gold
};

// Simulated cities for demo mode
const DEMO_CITIES = [
  { city: 'Istanbul', country: 'TR', lat: 41.0082, lng: 28.9784 },
  { city: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522 },
  { city: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
  { city: 'New York', country: 'US', lat: 40.7128, lng: -74.006 },
  { city: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
  { city: 'Dubai', country: 'AE', lat: 25.2048, lng: 55.2708 },
  { city: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198 },
  { city: 'Barcelona', country: 'ES', lat: 41.3851, lng: 2.1734 },
  { city: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 },
  { city: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.978 },
];

export const useRealtimeStars = (options: UseRealtimeStarsOptions = {}) => {
  const {
    maxStars = 100,
    fadeAfterMs = 10000,
    enableSimulation = true, // Enable demo mode by default
  } = options;

  const [stars, setStars] = useState<RealtimeStar[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const lastEventTimeRef = useRef<number>(Date.now());

  // Generate a random star for demo mode
  const generateDemoStar = useCallback((): RealtimeStar => {
    const types: RealtimeStar['type'][] = [
      'verification',
      'gift',
      'moment',
      'match',
    ];
    const typeIndex = Math.floor(Math.random() * types.length);
    const type = types[typeIndex] ?? 'verification';
    const locationIndex = Math.floor(Math.random() * DEMO_CITIES.length);
    const location = DEMO_CITIES[locationIndex] ?? DEMO_CITIES[0]!;

    return {
      id: `star-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10,
      z: Math.random() * 5 - 2.5,
      color: EVENT_COLORS[type],
      intensity: 0.5 + Math.random() * 0.5,
      createdAt: Date.now(),
      type,
      location: {
        city: location.city,
        country: location.country,
        lat: location.lat,
        lng: location.lng,
      },
    };
  }, []);

  // Add a new star to the constellation
  const addStar = useCallback(
    (star: RealtimeStar) => {
      setStars((prev) => {
        const newStars = [...prev, star];
        // Remove oldest stars if we exceed max
        if (newStars.length > maxStars) {
          return newStars.slice(-maxStars);
        }
        return newStars;
      });
      setTotalEvents((prev) => prev + 1);
      lastEventTimeRef.current = Date.now();
    },
    [maxStars],
  );

  // Remove faded stars
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setStars((prev) =>
        prev.filter((star) => now - star.createdAt < fadeAfterMs),
      );
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, [fadeAfterMs]);

  // Simulation mode for demo
  useEffect(() => {
    if (!enableSimulation) return;

    // Mark as connected in simulation mode
    setIsConnected(true);

    // Add stars at random intervals
    const addRandomStar = () => {
      const star = generateDemoStar();
      addStar(star);

      // Schedule next star with random delay (faster during "active" periods)
      const delay = 800 + Math.random() * 3000;
      return setTimeout(addRandomStar, delay);
    };

    // Start with a few initial stars
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        addStar(generateDemoStar());
      }, i * 500);
    }

    const timeoutId = addRandomStar();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enableSimulation, generateDemoStar, addStar]);

  // Real Supabase connection (when credentials provided)
  useEffect(() => {
    const supabaseUrl =
      options.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      options.supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || enableSimulation) return;

    // Dynamic import to avoid SSR issues
    const connectToSupabase = async () => {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Subscribe to verifications table
        const channel = supabase
          .channel('realtime-verifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'verifications',
            },
            (payload) => {
              const verification = payload.new as {
                id: string;
                latitude?: number;
                longitude?: number;
                city?: string;
                country?: string;
                type?: string;
              };

              const star: RealtimeStar = {
                id: verification.id,
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10,
                z: Math.random() * 5 - 2.5,
                color: EVENT_COLORS.verification,
                intensity: 0.8,
                createdAt: Date.now(),
                type: 'verification',
                location: verification.latitude
                  ? {
                      city: verification.city || 'Unknown',
                      country: verification.country || 'XX',
                      lat: verification.latitude,
                      lng: verification.longitude || 0,
                    }
                  : undefined,
              };

              addStar(star);
            },
          )
          .subscribe((status) => {
            setIsConnected(status === 'SUBSCRIBED');
          });

        return () => {
          supabase.removeChannel(channel);
        };
      } catch {
        // Failed to connect to Supabase - fallback to simulation mode
        setIsConnected(false);
      }
    };

    connectToSupabase();
  }, [options.supabaseUrl, options.supabaseKey, enableSimulation, addStar]);

  // Get stars with calculated opacity based on age
  const starsWithOpacity = stars.map((star) => {
    const age = Date.now() - star.createdAt;
    const opacity = Math.max(0, 1 - age / fadeAfterMs);
    return { ...star, opacity };
  });

  // Stats for display
  const stats = {
    total: totalEvents,
    active: stars.length,
    byType: {
      verification: stars.filter((s) => s.type === 'verification').length,
      gift: stars.filter((s) => s.type === 'gift').length,
      moment: stars.filter((s) => s.type === 'moment').length,
      match: stars.filter((s) => s.type === 'match').length,
    },
    lastEventTime: lastEventTimeRef.current,
  };

  return {
    stars: starsWithOpacity,
    isConnected,
    stats,
    addStar,
  };
};

export default useRealtimeStars;

/**
 * useRecentPlaces - Recent Places Cache Hook
 *
 * Caches recent searches in AsyncStorage for offline access
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CachedPlace {
  id: string;
  name: string;
  place_name: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'poi' | 'address';
  cachedAt: number;
}

const RECENT_PLACES_KEY = '@recent_places';
const MAX_CACHED_PLACES = 10;
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface UseRecentPlacesReturn {
  recentPlaces: CachedPlace[];
  addRecentPlace: (place: Omit<CachedPlace, 'cachedAt'>) => void;
  removeRecentPlace: (placeId: string) => void;
  clearRecentPlaces: () => Promise<void>;
  isLoading: boolean;
}

export const useRecentPlaces = (): UseRecentPlacesReturn => {
  const [recentPlaces, setRecentPlaces] = useState<CachedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached places on mount
  useEffect(() => {
    const loadCachedPlaces = async () => {
      try {
        const cached = await AsyncStorage.getItem(RECENT_PLACES_KEY);
        if (cached) {
          const places: CachedPlace[] = JSON.parse(cached);
          const now = Date.now();

          // Filter out expired entries
          const validPlaces = places.filter(
            (p) => now - p.cachedAt < CACHE_EXPIRY_MS,
          );

          setRecentPlaces(validPlaces);

          // Save cleaned list if any were removed
          if (validPlaces.length !== places.length) {
            await AsyncStorage.setItem(
              RECENT_PLACES_KEY,
              JSON.stringify(validPlaces),
            );
          }
        }
      } catch (error) {
        console.error('[useRecentPlaces] Failed to load cache:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedPlaces();
  }, []);

  const addRecentPlace = useCallback(
    async (place: Omit<CachedPlace, 'cachedAt'>) => {
      try {
        const newPlace: CachedPlace = {
          ...place,
          cachedAt: Date.now(),
        };

        setRecentPlaces((prev) => {
          // Remove if already exists
          const filtered = prev.filter((p) => p.id !== newPlace.id);
          // Add new place at the beginning
          const updated = [newPlace, ...filtered];
          // Limit to max
          const limited = updated.slice(0, MAX_CACHED_PLACES);

          // Save to AsyncStorage
          AsyncStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(limited));

          return limited;
        });
      } catch (error) {
        console.error('[useRecentPlaces] Failed to add place:', error);
      }
    },
    [],
  );

  const removeRecentPlace = useCallback(async (placeId: string) => {
    try {
      setRecentPlaces((prev) => {
        const updated = prev.filter((p) => p.id !== placeId);
        AsyncStorage.setItem(RECENT_PLACES_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('[useRecentPlaces] Failed to remove place:', error);
    }
  }, []);

  const clearRecentPlaces = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECENT_PLACES_KEY);
      setRecentPlaces([]);
    } catch (error) {
      console.error('[useRecentPlaces] Failed to clear cache:', error);
    }
  }, []);

  return {
    recentPlaces,
    addRecentPlace,
    removeRecentPlace,
    clearRecentPlaces,
    isLoading,
  };
};

export default useRecentPlaces;

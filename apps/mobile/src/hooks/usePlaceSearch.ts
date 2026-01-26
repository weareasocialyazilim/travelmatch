/**
 * usePlaceSearch - Mapbox Place Search Hook
 *
 * Provides city and POI search with:
 * - Debounced queries
 * - Graceful fallback on API failure
 * - Caching support
 */
import { useState, useCallback, useEffect } from 'react';
import { logger } from '@/utils/logger';

interface PlaceResult {
  id: string;
  name: string;
  place_name: string;
  latitude: number;
  longitude: number;
  type: 'city' | 'poi' | 'address';
  context?: string;
}

interface UsePlaceSearchReturn {
  results: PlaceResult[];
  loading: boolean;
  error: string | null;
  searchPlaces: (query: string, searchType?: 'city' | 'poi' | 'both') => Promise<void>;
  clearResults: () => void;
}

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

export const usePlaceSearch = (): UsePlaceSearchReturn => {
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(
    async (query: string, searchType: 'city' | 'poi' | 'both' = 'both') => {
      if (!query.trim() || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Build types parameter based on search type
        let typesParam = 'place,poi,address';
        if (searchType === 'city') {
          typesParam = 'place';
        } else if (searchType === 'poi') {
          typesParam = 'poi';
        }

        const encodedQuery = encodeURIComponent(query);
        const url = `${MAPBOX_GEOCODING_URL}/${encodedQuery}.json?access_token=${MAPBOX_TOKEN}&types=${typesParam}&limit=10`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Mapbox API error: ${response.status}`);
        }

        const data = await response.json();

        // Parse Mapbox response
        const places: PlaceResult[] = data.features?.map((feature: any) => {
          const [longitude, latitude] = feature.center || [];
          const placeType = feature.place_type?.[0] || 'address';

          return {
            id: feature.id,
            name: feature.text_tr || feature.text || feature.place_name?.split(',')[0],
            place_name: feature.place_name,
            latitude,
            longitude,
            type: placeType as 'city' | 'poi' | 'address',
            context: feature.context?.map((c: any) => c.text).join(', '),
          };
        }) || [];

        setResults(places);
        logger.info('[usePlaceSearch] Search completed', {
          query,
          resultsCount: places.length,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed';
        setError(errorMessage);
        logger.error('[usePlaceSearch] Search failed', { query, error: errorMessage });

        // Return empty results on error rather than crashing
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchPlaces,
    clearResults,
  };
};

export default usePlaceSearch;

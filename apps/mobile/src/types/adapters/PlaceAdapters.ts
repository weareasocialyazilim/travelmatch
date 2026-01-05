/**
 * Place Adapters
 *
 * Normalizes Place API responses (snake_case) to canonical types (camelCase)
 */

// ============================================
// TYPES
// ============================================

export interface Place {
  id?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  distance?: string;
  logo?: string;
}

// ============================================
// API TYPES (snake_case from backend)
// ============================================

export interface ApiPlace {
  id?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  city?: string;
  country?: string;
  distance?: number;
  logo?: string;
}

// ============================================
// NORMALIZER FUNCTIONS
// ============================================

/**
 * Convert numeric distance to formatted string (e.g., "1.5 km")
 */
function formatDistance(dist: number | undefined): string | undefined {
  if (dist === undefined) return undefined;
  if (dist < 1) return `${Math.round(dist * 1000)} m`;
  return `${dist.toFixed(1)} km`;
}

/**
 * Normalize place from API response
 */
export function normalizePlaceFromAPI(apiPlace: ApiPlace): Place {
  return {
    id: apiPlace.id,
    name: apiPlace.name,
    address: apiPlace.address,
    latitude: apiPlace.latitude ?? apiPlace.lat,
    longitude: apiPlace.longitude ?? apiPlace.lng,
    city: apiPlace.city,
    country: apiPlace.country,
    distance: formatDistance(apiPlace.distance),
    logo: apiPlace.logo,
  };
}

/**
 * Normalize array of places from API
 */
export function normalizePlacesFromAPI(apiPlaces: ApiPlace[]): Place[] {
  return apiPlaces.map(normalizePlaceFromAPI);
}

/**
 * Multi-Region Infrastructure Configuration
 * CDN, edge caching, and global distribution setup
 */

// Cloudflare Workers configuration for edge computing
export const EDGE_REGIONS = {
  primary: {
    region: 'eu-west-1', // Frankfurt (Turkey'ye en yakın)
    name: 'Europe West',
    cdnEndpoint: 'https://eu-west.travelmatch.app',
  },
  secondary: {
    region: 'us-east-1', // N. Virginia
    name: 'US East',
    cdnEndpoint: 'https://us-east.travelmatch.app',
  },
  tertiary: {
    region: 'ap-southeast-1', // Singapore
    name: 'Asia Pacific',
    cdnEndpoint: 'https://ap-southeast.travelmatch.app',
  },
} as const;

// CDN configuration for static assets
export const CDN_CONFIG = {
  provider: 'cloudflare', // or 'cloudfront', 'fastly'
  
  // Cache headers
  cacheControl: {
    images: 'public, max-age=31536000, immutable', // 1 year
    fonts: 'public, max-age=31536000, immutable', // 1 year
    css: 'public, max-age=86400, must-revalidate', // 1 day
    js: 'public, max-age=86400, must-revalidate', // 1 day
    html: 'public, max-age=3600, must-revalidate', // 1 hour
    api: 'private, no-cache, no-store, must-revalidate', // No cache
  },

  // Image optimization
  imageOptimization: {
    enabled: true,
    formats: ['webp', 'avif'], // Modern formats
    quality: 85,
    sizes: [320, 640, 768, 1024, 1280, 1920], // Responsive sizes
    lazy: true,
  },

  // Compression
  compression: {
    brotli: true,
    gzip: true,
    minSize: 1024, // 1KB minimum
  },

  // Purge cache
  purge: {
    onDeploy: true,
    selective: true, // Only purge changed files
  },
};

// Edge caching strategies
export const CACHE_STRATEGIES = {
  // Static assets (images, fonts, CSS, JS)
  static: {
    ttl: 31536000, // 1 year
    staleWhileRevalidate: 86400, // 1 day
    cacheKey: (request: Request) => {
      const url = new URL(request.url);
      return `${url.pathname}${url.search}`;
    },
  },

  // API responses
  api: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 60, // 1 minute
    cacheKey: (request: Request) => {
      const url = new URL(request.url);
      const userId = request.headers.get('x-user-id');
      return `${url.pathname}:${userId}`;
    },
    varyHeaders: ['Authorization', 'Accept-Language'],
  },

  // User-generated content
  ugc: {
    ttl: 3600, // 1 hour
    staleWhileRevalidate: 300, // 5 minutes
    cacheKey: (request: Request) => {
      const url = new URL(request.url);
      return url.pathname;
    },
  },

  // Personalized content (moments feed)
  personalized: {
    ttl: 60, // 1 minute
    staleWhileRevalidate: 30, // 30 seconds
    cacheKey: (request: Request) => {
      const url = new URL(request.url);
      const userId = request.headers.get('x-user-id');
      const preferences = request.headers.get('x-preferences-hash');
      return `${url.pathname}:${userId}:${preferences}`;
    },
    varyHeaders: ['Authorization', 'Accept-Language', 'x-preferences-hash'],
  },
};

// Geographic routing
export function getClosestRegion(userLat: number, userLon: number): keyof typeof EDGE_REGIONS {
  // Simple distance calculation (could use more sophisticated routing)
  const distances = Object.entries(EDGE_REGIONS).map(([key, region]) => {
    const regionCoords = getRegionCoordinates(region.region);
    const distance = calculateDistance(userLat, userLon, regionCoords.lat, regionCoords.lon);
    return { key: key as keyof typeof EDGE_REGIONS, distance };
  });

  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].key;
}

function getRegionCoordinates(region: string): { lat: number; lon: number } {
  const coords: Record<string, { lat: number; lon: number }> = {
    'eu-west-1': { lat: 50.1109, lon: 8.6821 }, // Frankfurt
    'us-east-1': { lat: 38.9072, lon: -77.0369 }, // Virginia
    'ap-southeast-1': { lat: 1.3521, lon: 103.8198 }, // Singapore
  };
  return coords[region] || coords['eu-west-1'];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Cloudflare Workers edge function
// Note: This code is designed to run in Cloudflare Workers environment
 
export const edgeHandler = {
  async fetch(request: Request, _env: Record<string, unknown>): Promise<Response> {
    const url = new URL(request.url);

    // Determine cache strategy based on path
    let strategy = CACHE_STRATEGIES.static;
    if (url.pathname.startsWith('/api/')) {
      strategy = CACHE_STRATEGIES.api;
    } else if (url.pathname.startsWith('/moments/feed')) {
      strategy = CACHE_STRATEGIES.personalized;
    } else if (url.pathname.startsWith('/moments/')) {
      strategy = CACHE_STRATEGIES.ugc;
    }

    // Generate and sanitize cache key to prevent injection attacks
    const rawCacheKey = strategy.cacheKey(request);
    // Sanitize: only allow alphanumeric, dash, underscore, colon, slash
    const cacheKey = rawCacheKey.replace(/[^a-zA-Z0-9\-_:\/]/g, '');
    
    // caches.default is Cloudflare Workers API
    const cache = (caches as unknown as { default: Cache }).default;
    let response = await cache.match(cacheKey);

    if (!response) {
      // Fetch from origin
      response = await fetch(request);

      // Cache successful responses
      if (response.ok) {
        const clonedResponse = response.clone();
        const headers = new Headers(clonedResponse.headers);
        
        // Add cache headers
        headers.set('Cache-Control', `max-age=${strategy.ttl}, stale-while-revalidate=${strategy.staleWhileRevalidate}`);
        headers.set('CDN-Cache-Control', `max-age=${strategy.ttl}`);
        headers.set('Cloudflare-CDN-Cache-Control', `max-age=${strategy.ttl}`);

        const cachedResponse = new Response(clonedResponse.body, {
          status: clonedResponse.status,
          statusText: clonedResponse.statusText,
          headers,
        });

        await cache.put(cacheKey, cachedResponse);
      }
    } else {
      // Add cache hit header
      const headers = new Headers(response.headers);
      headers.set('X-Cache', 'HIT');
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};

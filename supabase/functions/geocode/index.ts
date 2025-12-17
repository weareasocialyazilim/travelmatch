/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

/**
 * Geocoding Proxy - Server-side Mapbox Geocoding API wrapper
 *
 * Prevents exposing Mapbox secret token in client bundle
 * Implements rate limiting and caching for cost optimization
 *
 * Endpoints:
 * - POST /geocode - Address to coordinates
 * - POST /reverse-geocode - Coordinates to address
 *
 * Security:
 * - Secret token stored server-side only
 * - Rate limiting via Upstash Redis
 * - Request validation
 * - Response caching (1 hour)
 *
 * Mapbox Geocoding API:
 * - Free tier: 100,000 requests/month
 * - Docs: https://docs.mapbox.com/api/search/geocoding/
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createUpstashRateLimiter, RateLimitPresets } from '../_shared/upstashRateLimit.ts';
import { corsHeaders } from '../_shared/security-middleware.ts';
import {
  ErrorCode,
  createErrorResponse,
  createSuccessResponse,
  createRateLimitError,
  createValidationError,
  toHttpResponse,
  toHttpSuccessResponse,
  handleUnexpectedError,
} from '../_shared/errorHandler.ts';

const MAPBOX_SECRET_TOKEN = Deno.env.get('MAPBOX_SECRET_TOKEN');
const CACHE_TTL = 3600; // 1 hour

if (!MAPBOX_SECRET_TOKEN) {
  throw new Error('MAPBOX_SECRET_TOKEN is required');
}

// Rate limiter: 100 requests per minute
const rateLimiter = createUpstashRateLimiter(RateLimitPresets.RELAXED);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const rateLimit = await rateLimiter.check(req);
    if (!rateLimit.success) {
      const retryAfter = Math.ceil((rateLimit.reset - Date.now()) / 1000);
      const { response, headers: rateLimitHeaders } = createRateLimitError(retryAfter, rateLimit.remaining);
      return toHttpResponse(response, { ...corsHeaders, ...rateLimitHeaders });
    }

    const { address, lat, lng, type = 'geocode' } = await req.json();

    // Validate request
    if (type === 'geocode' && !address) {
      const error = createValidationError({
        fields: { address: ['Address is required for geocoding'] },
      });
      return toHttpResponse(error, corsHeaders);
    }

    if (type === 'reverse' && (!lat || !lng)) {
      const error = createValidationError({
        fields: {
          lat: !lat ? ['Latitude is required'] : [],
          lng: !lng ? ['Longitude is required'] : [],
        },
      });
      return toHttpResponse(error, corsHeaders);
    }

    // Build Mapbox Geocoding API URL
    let apiUrl: string;
    if (type === 'geocode') {
      // Forward geocoding: address → coordinates
      apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_SECRET_TOKEN}&limit=1`;
    } else {
      // Reverse geocoding: coordinates → address
      // Note: Mapbox uses longitude,latitude (opposite of Google Maps)
      apiUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_SECRET_TOKEN}&limit=1`;
    }

    // Call Mapbox Geocoding API
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Check for errors (Mapbox returns 200 even for 0 results)
    if (!response.ok) {
      console.error('Mapbox API error:', data);
      const error = createErrorResponse(
        'Geocoding service failed',
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        { details: data.message || 'Unknown error' },
      );
      return toHttpResponse(error, corsHeaders);
    }

    // Transform Mapbox response to match expected format
    const transformedData = {
      results: data.features || [],
      status: data.features && data.features.length > 0 ? 'OK' : 'ZERO_RESULTS',
    };

    const success = createSuccessResponse(transformedData);
    return new Response(JSON.stringify(success), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return toHttpResponse(handleUnexpectedError(error), corsHeaders);
  }
});

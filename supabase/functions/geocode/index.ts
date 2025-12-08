/**
 * Geocoding Proxy - Server-side Google Maps API wrapper
 * 
 * Prevents exposing Google Maps API key in client bundle
 * Implements rate limiting and caching for cost optimization
 * 
 * Endpoints:
 * - POST /geocode - Address to coordinates
 * - POST /reverse-geocode - Coordinates to address
 * 
 * Security:
 * - API key stored server-side only
 * - Rate limiting via Upstash Redis
 * - Request validation
 * - Response caching (1 hour)
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

const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_SERVER_KEY');
const CACHE_TTL = 3600; // 1 hour

if (!GOOGLE_MAPS_API_KEY) {
  throw new Error('GOOGLE_MAPS_SERVER_KEY is required');
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

    // Build Google Maps API URL
    let apiUrl: string;
    if (type === 'geocode') {
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
    } else {
      apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
    }

    // Call Google Maps API
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Maps API error:', data);
      const error = createErrorResponse(
        'Geocoding service failed',
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        { details: data.status },
      );
      return toHttpResponse(error, corsHeaders);
    }

    const success = createSuccessResponse(data);
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

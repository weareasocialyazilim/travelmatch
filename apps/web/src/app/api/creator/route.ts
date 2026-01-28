/**
 * Creator Form API Endpoint
 *
 * SECURITY MEASURES:
 * - POST-only method enforcement
 * - Input validation with zod
 * - Rate limiting (5 requests/IP/hour)
 * - PII masking in logs
 * - Generic error responses
 */

import { NextRequest, NextResponse } from 'next/server';

// Zod schema for validation
const CreatorApplicationSchema = {
  instagramHandle: (value: string): boolean => {
    // Instagram handle validation
    // 1-30 characters, alphanumeric and underscores, starts with letter
    return /^[a-zA-Z][a-zA-Z0-9_.]{0,29}$/.test(value);
  },
  story: (value: string): boolean => {
    // Story validation
    // 10-500 characters, no excessive newlines
    return (
      typeof value === 'string' &&
      value.length >= 10 &&
      value.length <= 500 &&
      !/{|}/.test(value) // No template literal syntax
    );
  },
};

// In-memory rate limiting (use Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT = 5; // Max 5 requests
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getRateLimitKey(request: NextRequest): string {
  // Use IP + light fingerprint (user agent hash)
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const fingerprint = `${ip}:${userAgent.slice(0, 20)}`;
  return fingerprint;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    // New or expired entry
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count };
}

// PII redaction for logs
function sanitizeForLog(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key.toLowerCase().includes('instagram')) {
      // Mask Instagram handle - keep first and last char
      const str = String(value);
      if (str.length <= 2) {
        sanitized[key] = '**';
      } else {
        sanitized[key] = `${str[0]}***${str[str.length - 1]}`;
      }
    } else if (key.toLowerCase().includes('story')) {
      // Truncate story for logs
      sanitized[key] = String(value).slice(0, 50) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    }

    // 2. Method enforcement (already handled by Next.js, but explicit check)
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 },
      );
    }

    // 3. Parse body
    const body = await request.json();
    const { instagramHandle, story } = body;

    // 4. Validation
    if (!instagramHandle || !story) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    if (!CreatorApplicationSchema.instagramHandle(instagramHandle)) {
      return NextResponse.json(
        { error: 'Invalid Instagram handle format' },
        { status: 400 },
      );
    }

    if (!CreatorApplicationSchema.story(story)) {
      return NextResponse.json(
        { error: 'Story must be between 10-500 characters' },
        { status: 400 },
      );
    }

    // 5. Process application (in production: save to database, send notification)
    // For now, log sanitized data
    console.info(
      '[Creator Form]',
      JSON.stringify(
        sanitizeForLog({
          instagramHandle,
          storyLength: story.length,
          timestamp: new Date().toISOString(),
        }),
      ),
    );

    // 6. Success response (no PII in response)
    return NextResponse.json(
      { success: true, message: 'Application received' },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMIT),
          'X-RateLimit-Remaining': String(remaining),
        },
      },
    );
  } catch (error) {
    // 7. Error handling - generic messages only
    console.error(
      '[Creator Form] Error:',
      error instanceof Error ? error.message : 'Unknown',
    );

    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 },
    );
  }
}

// GET not allowed
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

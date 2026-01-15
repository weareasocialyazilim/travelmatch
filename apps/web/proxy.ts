/**
 * Lovendo Bot Tracking Proxy
 *
 * Intercepts all requests to:
 * 1. Track bot visits (Google, Bing, Apple)
 * 2. Log which pages are being crawled most
 * 3. Enable analytics for SEO performance monitoring
 *
 * Note: In production, replace the console.log with actual logging
 * to Supabase or your analytics service.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Bot User-Agent patterns
const BOT_PATTERNS = [
  { name: 'Googlebot', pattern: /googlebot/i },
  { name: 'Bingbot', pattern: /bingbot/i },
  { name: 'Applebot', pattern: /applebot/i },
  { name: 'DuckDuckBot', pattern: /duckduckbot/i },
  { name: 'YandexBot', pattern: /yandexbot/i },
  { name: 'Baiduspider', pattern: /baiduspider/i },
  { name: 'FacebookBot', pattern: /facebookexternalhit/i },
  { name: 'TwitterBot', pattern: /twitterbot/i },
  { name: 'LinkedInBot', pattern: /linkedinbot/i },
  { name: 'ChatGPT', pattern: /chatgpt|gptbot/i },
  { name: 'ClaudeBot', pattern: /claude|anthropic/i },
  { name: 'PerplexityBot', pattern: /perplexitybot/i },
];

// Detect bot from User-Agent
function detectBot(userAgent: string): string | null {
  for (const bot of BOT_PATTERNS) {
    if (bot.pattern.test(userAgent)) {
      return bot.name;
    }
  }
  return null;
}

// Extract page info from URL
function extractPageInfo(pathname: string): {
  lang?: string;
  city?: string;
  intent?: string;
  type: string;
} {
  // Dynamic pSEO pages: /[lang]/[city]/[intent]
  const dynamicMatch = pathname.match(/^\/([a-z]{2})\/([a-z-]+)\/([a-z-]+)$/);
  if (dynamicMatch) {
    return {
      lang: dynamicMatch[1],
      city: dynamicMatch[2],
      intent: dynamicMatch[3],
      type: 'dynamic_pseo',
    };
  }

  // Static pages
  const staticPages = [
    '/download',
    '/partner',
    '/safety',
    '/privacy',
    '/terms',
  ];
  if (staticPages.includes(pathname)) {
    return { type: 'static' };
  }

  // Home page
  if (pathname === '/') {
    return { type: 'home' };
  }

  return { type: 'other' };
}

export async function proxy(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;

  // Detect if request is from a bot
  const botName = detectBot(userAgent);

  if (botName) {
    const pageInfo = extractPageInfo(pathname);
    const timestamp = new Date().toISOString();

    // Log bot visit data
    const logData = {
      timestamp,
      bot: botName,
      url: request.url,
      pathname,
      ...pageInfo,
      headers: {
        referer: request.headers.get('referer'),
        acceptLanguage: request.headers.get('accept-language'),
      },
    };

    // In production, send this to Supabase or your analytics service
    // Example:
    // await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-bot`, {
    //   method: 'POST',
    //   body: JSON.stringify(logData),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
    //   }
    // }).catch(() => {});

    // For now, log to console (visible in Vercel logs)
    console.log('[BOT_TRACKING]', JSON.stringify(logData));

    // Add response header for debugging (not visible to users)
    const response = NextResponse.next();
    response.headers.set('x-bot-detected', botName);
    response.headers.set('x-page-type', pageInfo.type);

    return response;
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};

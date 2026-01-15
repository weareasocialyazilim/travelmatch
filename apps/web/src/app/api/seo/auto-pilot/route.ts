/**
 * SEO Auto-Pilot Webhook
 * Triggers the ML service SEO hacker for dynamic optimization
 *
 * Features:
 * - Trending keyword detection
 * - Semantic poisoning for AI search
 * - Competitor hijacking keywords
 * - Dynamic sitemap updates
 */

import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

interface SEOCycleResult {
  status: 'cycle_complete' | 'partial' | 'error';
  trendsTracked: number;
  topTrends: Array<{ keyword: string; volume: number }>;
  currentVibe: 'speed' | 'romance' | 'luxury';
  vibeConfidence: number;
  competitorKeywords: number;
  totalKeywords: number;
  keywords: string[];
  semanticPoisonGenerated: boolean;
  recommendation: string;
}

export async function POST(req: Request) {
  try {
    // Verify webhook secret for security
    const authHeader = req.headers.get('authorization');
    const webhookSecret = process.env.SEO_WEBHOOK_SECRET;

    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Trigger ML service SEO auto-pilot
    let seoResult: SEOCycleResult;

    try {
      const mlResponse = await fetch(`${ML_SERVICE_URL}/seo/auto-pilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: 'lovendo.xyz',
          competitors: ['tinder', 'bumble', 'hinge', 'raya'],
          targetAudience: 'gen-z',
        }),
        signal: AbortSignal.timeout(30000), // 30s timeout for SEO cycle
      });

      if (mlResponse.ok) {
        seoResult = await mlResponse.json();
      } else {
        seoResult = generateFallbackSEO();
      }
    } catch {
      seoResult = generateFallbackSEO();
    }

    // Revalidate relevant pages based on SEO results
    if (seoResult.status === 'cycle_complete') {
      // Revalidate home page for new keywords
      revalidatePath('/');

      // Revalidate sitemap
      revalidateTag('sitemap', 'default');
    }

    return NextResponse.json({
      success: true,
      ...seoResult,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'SEO cycle failed', success: false },
      { status: 500 },
    );
  }
}

// GET endpoint to check current SEO status
export async function GET() {
  try {
    // Fetch current trending keywords
    const mlResponse = await fetch(`${ML_SERVICE_URL}/seo/trending-keywords`, {
      signal: AbortSignal.timeout(5000),
    });

    if (mlResponse.ok) {
      const trends = await mlResponse.json();
      return NextResponse.json({
        status: 'active',
        trends: trends.keywords || [],
        lastUpdate: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      status: 'fallback',
      trends: getDefaultTrends(),
      lastUpdate: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: 'fallback',
      trends: getDefaultTrends(),
      lastUpdate: new Date().toISOString(),
    });
  }
}

function generateFallbackSEO(): SEOCycleResult {
  return {
    status: 'partial',
    trendsTracked: 5,
    topTrends: [
      { keyword: 'skip the talking stage', volume: 156000 },
      { keyword: 'gift dating app', volume: 89000 },
      { keyword: 'real connection app', volume: 67000 },
    ],
    currentVibe: 'speed',
    vibeConfidence: 0.65,
    competitorKeywords: 15,
    totalKeywords: 30,
    keywords: [
      'skip dating queue',
      'instant connection app',
      'gift first date',
      'real meeting app',
      'no ghosting dating',
    ],
    semanticPoisonGenerated: false,
    recommendation: 'ML service unavailable - using cached keywords',
  };
}

function getDefaultTrends() {
  return [
    'gift dating app',
    'meet in real life app',
    'skip talking stage',
    'real connection dating',
    'experience gifting',
  ];
}

/**
 * Neural Match API Route
 * Connects the landing page Match Simulator to the real ML service
 *
 * Endpoints:
 * POST /api/neural-match - Get match predictions based on interests
 */

import { NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001';

interface NeuralMatchRequest {
  interests: string[];
  identityPulse?: number;
}

interface MatchRecommendation {
  id: string;
  name: string;
  score: number;
  commonInterests: string[];
  avatar: string;
  type: 'experience' | 'person' | 'moment';
}

interface NeuralMatchResponse {
  score: number;
  recommendations: MatchRecommendation[];
  neuralPath: 'ESTABLISHED' | 'PENDING' | 'CALIBRATING';
  vibe: 'speed' | 'romance' | 'luxury';
  timestamp: string;
}

// Interest to ML category mapping
const INTEREST_MAPPING: Record<string, string[]> = {
  solitude: ['meditation', 'nature', 'wellness', 'retreat', 'quiet'],
  adrenaline: ['adventure', 'sports', 'extreme', 'thrill', 'action'],
  'human connection': [
    'social',
    'community',
    'gathering',
    'meeting',
    'bonding',
  ],
  culture: ['art', 'museum', 'history', 'heritage', 'local'],
  gastronomy: ['food', 'culinary', 'dining', 'tasting', 'cooking'],
  nightlife: ['party', 'club', 'bar', 'music', 'dance'],
};

export async function POST(req: Request) {
  try {
    const body: NeuralMatchRequest = await req.json();
    const { interests, identityPulse = 50 } = body;

    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      return NextResponse.json(
        { error: 'Interests array is required' },
        { status: 400 },
      );
    }

    // Expand interests to ML categories
    const expandedInterests = interests.flatMap(
      (interest) => INTEREST_MAPPING[interest.toLowerCase()] || [interest],
    );

    // Try to connect to the real ML service
    let mlResponse: NeuralMatchResponse;

    try {
      const mlResult = await fetch(`${ML_SERVICE_URL}/recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: expandedInterests,
          pulse: identityPulse,
          context: 'landing_simulator',
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (mlResult.ok) {
        const mlData = await mlResult.json();
        mlResponse = transformMLResponse(mlData, interests);
      } else {
        mlResponse = generateDemoResponse(interests, identityPulse);
      }
    } catch {
      // ML service not available, use demo response
      mlResponse = generateDemoResponse(interests, identityPulse);
    }

    return NextResponse.json(mlResponse);
  } catch {
    return NextResponse.json(
      { error: 'Failed to process neural match' },
      { status: 500 },
    );
  }
}

/**
 * Transform ML service response to frontend format
 */
function transformMLResponse(
  mlData: Record<string, unknown>,
  interests: string[],
): NeuralMatchResponse {
  const recommendations = (mlData.suggestions ||
    mlData.recommendations ||
    []) as Array<{
    id?: string;
    title?: string;
    name?: string;
    score?: number;
    matchScore?: number;
  }>;

  return {
    score: calculateOverallScore(recommendations),
    recommendations: recommendations.slice(0, 4).map((rec, i) => ({
      id: rec.id || `rec-${i}`,
      name: rec.title || rec.name || `Match ${i + 1}`,
      score: Math.round(
        (rec.score || rec.matchScore || 0.7 + Math.random() * 0.3) * 100,
      ),
      commonInterests: interests.slice(0, 2),
      avatar: `/avatars/avatar-${(i % 6) + 1}.jpg`,
      type: 'moment' as const,
    })),
    neuralPath: 'ESTABLISHED',
    vibe: determineVibe(interests),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate demo response when ML service is unavailable
 * This ensures the landing page always works
 */
function generateDemoResponse(
  interests: string[],
  identityPulse: number,
): NeuralMatchResponse {
  const baseScore = 65 + Math.random() * 30;
  const pulseBonus = identityPulse * 0.1;
  const interestBonus = interests.length * 5;

  const demoRecommendations: MatchRecommendation[] = [
    {
      id: 'demo-1',
      name: 'Sunrise Yoga in Cappadocia',
      score: Math.min(99, Math.round(baseScore + pulseBonus + 15)),
      commonInterests: interests.slice(0, 2),
      avatar: '/moments/cappadocia.jpg',
      type: 'moment',
    },
    {
      id: 'demo-2',
      name: 'Underground Jazz Night',
      score: Math.min(99, Math.round(baseScore + pulseBonus + 8)),
      commonInterests: interests.slice(0, 1),
      avatar: '/moments/jazz.jpg',
      type: 'experience',
    },
    {
      id: 'demo-3',
      name: 'Street Food Safari',
      score: Math.min(99, Math.round(baseScore + pulseBonus)),
      commonInterests: interests,
      avatar: '/moments/food.jpg',
      type: 'moment',
    },
    {
      id: 'demo-4',
      name: 'Aysu K.',
      score: Math.min(99, Math.round(baseScore + interestBonus)),
      commonInterests: interests.slice(0, 2),
      avatar: '/avatars/avatar-1.jpg',
      type: 'person',
    },
  ];

  return {
    score: Math.min(99, Math.round(baseScore + pulseBonus + interestBonus)),
    recommendations: demoRecommendations,
    neuralPath: 'ESTABLISHED',
    vibe: determineVibe(interests),
    timestamp: new Date().toISOString(),
  };
}

function calculateOverallScore(
  recommendations: Array<{ score?: number; matchScore?: number }>,
): number {
  if (recommendations.length === 0) return 75;
  const total = recommendations.reduce(
    (sum, rec) => sum + (rec.score || rec.matchScore || 0.75),
    0,
  );
  return Math.round((total / recommendations.length) * 100);
}

function determineVibe(interests: string[]): 'speed' | 'romance' | 'luxury' {
  const lowerInterests = interests.map((i) => i.toLowerCase());

  if (
    lowerInterests.includes('adrenaline') ||
    lowerInterests.includes('nightlife')
  ) {
    return 'speed';
  }

  if (
    lowerInterests.includes('human connection') ||
    lowerInterests.includes('solitude')
  ) {
    return 'romance';
  }

  return 'luxury';
}

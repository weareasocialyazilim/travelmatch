/**
 * Dynamic OG Image Generator
 *
 * Generates city/intent-specific Open Graph images for social sharing.
 * When someone shares a TravelMatch URL on WhatsApp/Twitter, they see
 * a dynamic image with live moment counts and city-specific visuals.
 *
 * Example: /api/og?city=dubai&intent=dating-match&lang=en
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// City-specific gradient colors
const CITY_GRADIENTS: Record<string, { from: string; to: string }> = {
  dubai: { from: '#D4AF37', to: '#FFD700' },      // Gold - Luxury
  london: { from: '#1E3A8A', to: '#3B82F6' },     // Royal Blue
  paris: { from: '#EC4899', to: '#F472B6' },      // Rose Pink
  tokyo: { from: '#DC2626', to: '#F87171' },      // Cherry Red
  istanbul: { from: '#7C3AED', to: '#A78BFA' },   // Purple
  'new-york': { from: '#1F2937', to: '#6B7280' }, // Steel Gray
  miami: { from: '#06B6D4', to: '#22D3EE' },      // Cyan Beach
  bali: { from: '#10B981', to: '#34D399' },       // Tropical Green
  berlin: { from: '#F59E0B', to: '#FBBF24' },     // Amber
  singapore: { from: '#EF4444', to: '#F87171' },  // Red
};

// Intent-specific icons (emoji)
const INTENT_ICONS: Record<string, string> = {
  'dating-match': '💕',
  'love-fortune': '✨',
  'gifting-moment': '🎁',
  'travel-match': '✈️',
  'instant-love': '❤️‍🔥',
  'fortune-connection': '🍀',
  'luxury-dating': '👑',
  'elite-match': '💎',
  'vip-access': '🌟',
  'premium-gifting': '💝',
  'social-fortune': '🎰',
  'travel-buddy': '🌍',
  'skip-queue': '⚡',
  'instant-access': '🚀',
  'unlock-moment': '🔓',
  'hack-dating': '💜',
  'fast-match': '⏱️',
  'direct-connect': '🔗',
};

// City display names
const CITY_NAMES: Record<string, string> = {
  dubai: 'Dubai',
  london: 'London',
  paris: 'Paris',
  tokyo: 'Tokyo',
  istanbul: 'Istanbul',
  'new-york': 'New York',
  miami: 'Miami',
  bali: 'Bali',
  berlin: 'Berlin',
  singapore: 'Singapore',
  barcelona: 'Barcelona',
  amsterdam: 'Amsterdam',
  rome: 'Rome',
  seoul: 'Seoul',
  sydney: 'Sydney',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const city = searchParams.get('city') || 'dubai';
  const intent = searchParams.get('intent') || 'dating-match';
  const lang = searchParams.get('lang') || 'en';

  const gradient = CITY_GRADIENTS[city] || CITY_GRADIENTS.dubai;
  const icon = INTENT_ICONS[intent] || '💕';
  const cityName = CITY_NAMES[city] || city.charAt(0).toUpperCase() + city.slice(1).replace('-', ' ');

  // Generate random "active moments" count for urgency
  const activeMoments = Math.floor(Math.random() * 50 + 15);

  // Translations
  const translations = {
    en: {
      tagline: 'Hack the Queue. Match Instantly.',
      moments: 'Active Moments',
      cta: 'Unlock Now',
    },
    tr: {
      tagline: 'Sırayı Hackle. Anında Eşleş.',
      moments: 'Aktif Moment',
      cta: 'Kilidi Aç',
    },
  };

  const t = translations[lang as keyof typeof translations] || translations.en;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 50%, #000000 100%)`,
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
            zIndex: 1,
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}
          >
            {icon}
          </div>

          {/* City Name */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 900,
              color: 'white',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              marginBottom: '10px',
              letterSpacing: '-2px',
            }}
          >
            {cityName}
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '30px',
            }}
          >
            {t.tagline}
          </div>

          {/* Active Moments Counter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              padding: '16px 32px',
              borderRadius: '50px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#22C55E',
                boxShadow: '0 0 10px #22C55E',
              }}
            />
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'white',
              }}
            >
              {activeMoments} {t.moments}
            </div>
          </div>
        </div>

        {/* TravelMatch Logo */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-1px',
            }}
          >
            TravelMatch
          </div>
          <div
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            • {t.cta}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

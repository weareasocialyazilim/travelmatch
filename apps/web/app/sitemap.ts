/**
 * TravelMatch Dynamic Sitemap - "The Neural Mesh" URL Engine
 *
 * Generates 100,000+ dynamic URLs for all city/intent combinations.
 * This tells Google "I have everything you're looking for."
 *
 * URL Structure: /{lang}/{city}/{intent}
 * Example: /en/london/dating-match
 */

import { MetadataRoute } from 'next';
import { SUPPORTED_LANGUAGES, GLOBAL_CITIES } from '@/lib/seo-engine';

const BASE_URL = 'https://travelmatch.app';

// Priority tiers for different page types
const PRIORITY_TIERS = {
  home: 1.0,
  primaryMarket: 0.9, // en, tr - major cities
  secondaryMarket: 0.8, // de, fr, es - major cities
  tertiaryMarket: 0.7, // ar, ru, it - major cities
  expandedMarket: 0.6, // all languages - secondary cities
  staticPages: 0.5, // privacy, terms, etc.
};

// Tier 1 Languages (highest priority)
const TIER1_LANGS = ['en', 'tr'];
// Tier 2 Languages
const TIER2_LANGS = ['de', 'fr', 'es', 'ar'];
// Tier 3 Languages
const TIER3_LANGS = ['ru', 'it', 'pt', 'ja', 'ko'];

// Primary cities (pre-rendered, highest priority)
const PRIMARY_CITIES = [
  'london',
  'new-york',
  'dubai',
  'paris',
  'tokyo',
  'istanbul',
  'berlin',
  'miami',
  'singapore',
  'los-angeles',
];

// Secondary cities (important markets)
const SECONDARY_CITIES = [
  'barcelona',
  'amsterdam',
  'rome',
  'milan',
  'madrid',
  'vienna',
  'zurich',
  'munich',
  'bali',
  'ibiza',
  'hong-kong',
  'san-francisco',
  'seoul',
  'bangkok',
  'sydney',
];

// Primary intents (most searched)
const PRIMARY_INTENTS = [
  'dating-match',
  'love-fortune',
  'gifting-moment',
  'travel-match',
  'instant-love',
  'fortune-connection',
];

// Secondary intents (long-tail keywords)
const SECONDARY_INTENTS = [
  'luxury-dating',
  'elite-match',
  'vip-access',
  'premium-gifting',
  'social-fortune',
  'travel-buddy',
  'skip-queue',
  'instant-access',
  'unlock-moment',
  'hack-dating',
  'fast-match',
  'direct-connect',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  // ============================================================================
  // STATIC PAGES (Core site structure)
  // ============================================================================

  const staticPages = [
    {
      url: '',
      priority: PRIORITY_TIERS.home,
      changeFrequency: 'daily' as const,
    },
    { url: '/download', priority: 0.9, changeFrequency: 'weekly' as const },
    {
      url: '/features/proof-ceremony',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    { url: '/partner', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/safety', priority: 0.6, changeFrequency: 'monthly' as const },
    {
      url: '/privacy',
      priority: PRIORITY_TIERS.staticPages,
      changeFrequency: 'yearly' as const,
    },
    {
      url: '/terms',
      priority: PRIORITY_TIERS.staticPages,
      changeFrequency: 'yearly' as const,
    },
  ];

  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}${page.url}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });
  }

  // ============================================================================
  // TIER 1: Primary Markets (en, tr) x Primary Cities x Primary Intents
  // These are the most important pages - highest crawl priority
  // ============================================================================

  for (const lang of TIER1_LANGS) {
    for (const city of PRIMARY_CITIES) {
      for (const intent of PRIMARY_INTENTS) {
        entries.push({
          url: `${BASE_URL}/${lang}/${city}/${intent}`,
          lastModified: now,
          changeFrequency: 'hourly',
          priority: PRIORITY_TIERS.primaryMarket,
        });
      }
    }
  }

  // ============================================================================
  // TIER 2: Secondary Languages x Primary Cities x Primary Intents
  // ============================================================================

  for (const lang of TIER2_LANGS) {
    for (const city of PRIMARY_CITIES) {
      for (const intent of PRIMARY_INTENTS) {
        entries.push({
          url: `${BASE_URL}/${lang}/${city}/${intent}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: PRIORITY_TIERS.secondaryMarket,
        });
      }
    }
  }

  // ============================================================================
  // TIER 3: Tertiary Languages x Primary Cities x Primary Intents
  // ============================================================================

  for (const lang of TIER3_LANGS) {
    for (const city of PRIMARY_CITIES) {
      for (const intent of PRIMARY_INTENTS) {
        entries.push({
          url: `${BASE_URL}/${lang}/${city}/${intent}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: PRIORITY_TIERS.tertiaryMarket,
        });
      }
    }
  }

  // ============================================================================
  // TIER 4: All Languages x Secondary Cities x Primary Intents
  // Expanded geographic coverage
  // ============================================================================

  for (const lang of SUPPORTED_LANGUAGES) {
    for (const city of SECONDARY_CITIES) {
      for (const intent of PRIMARY_INTENTS) {
        entries.push({
          url: `${BASE_URL}/${lang}/${city}/${intent}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: PRIORITY_TIERS.expandedMarket,
        });
      }
    }
  }

  // ============================================================================
  // TIER 5: Primary Languages x Primary Cities x Secondary Intents (Long-tail)
  // Long-tail keyword coverage
  // ============================================================================

  for (const lang of TIER1_LANGS) {
    for (const city of PRIMARY_CITIES) {
      for (const intent of SECONDARY_INTENTS) {
        entries.push({
          url: `${BASE_URL}/${lang}/${city}/${intent}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.65,
        });
      }
    }
  }

  // ============================================================================
  // TIER 6: Expanded Coverage - All remaining global cities
  // Maximum geographic reach
  // ============================================================================

  const remainingCities = GLOBAL_CITIES.filter(
    (city) =>
      !PRIMARY_CITIES.includes(city) && !SECONDARY_CITIES.includes(city),
  );

  for (const lang of ['en', 'tr', 'ar']) {
    for (const city of remainingCities) {
      for (const intent of PRIMARY_INTENTS.slice(0, 3)) {
        // Top 3 intents only
        entries.push({
          url: `${BASE_URL}/${lang}/${city}/${intent}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.55,
        });
      }
    }
  }

  // ============================================================================
  // ALTERNATE LANGUAGE HUBS (Language-specific landing pages)
  // ============================================================================

  for (const lang of SUPPORTED_LANGUAGES) {
    entries.push({
      url: `${BASE_URL}/${lang}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    });
  }

  return entries;
}

// ============================================================================
// SITEMAP STATISTICS (for debugging/monitoring)
// ============================================================================

export function getSitemapStats() {
  const tier1Count =
    TIER1_LANGS.length * PRIMARY_CITIES.length * PRIMARY_INTENTS.length;
  const tier2Count =
    TIER2_LANGS.length * PRIMARY_CITIES.length * PRIMARY_INTENTS.length;
  const tier3Count =
    TIER3_LANGS.length * PRIMARY_CITIES.length * PRIMARY_INTENTS.length;
  const tier4Count =
    SUPPORTED_LANGUAGES.length *
    SECONDARY_CITIES.length *
    PRIMARY_INTENTS.length;
  const tier5Count =
    TIER1_LANGS.length * PRIMARY_CITIES.length * SECONDARY_INTENTS.length;

  const remainingCitiesCount =
    GLOBAL_CITIES.length - PRIMARY_CITIES.length - SECONDARY_CITIES.length;
  const tier6Count = 3 * remainingCitiesCount * 3; // 3 langs, remaining cities, 3 intents

  const totalDynamicPages =
    tier1Count + tier2Count + tier3Count + tier4Count + tier5Count + tier6Count;
  const staticPagesCount = 7;
  const languageHubsCount = SUPPORTED_LANGUAGES.length;

  return {
    tier1: tier1Count,
    tier2: tier2Count,
    tier3: tier3Count,
    tier4: tier4Count,
    tier5: tier5Count,
    tier6: tier6Count,
    staticPages: staticPagesCount,
    languageHubs: languageHubsCount,
    totalPages: totalDynamicPages + staticPagesCount + languageHubsCount,
  };
}

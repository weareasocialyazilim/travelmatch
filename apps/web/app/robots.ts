/**
 * TravelMatch Robots.txt Configuration
 *
 * Optimized for maximum crawl efficiency:
 * - Allows all major search engine bots
 * - Prioritizes dynamic pSEO pages
 * - Protects API and admin routes
 * - Enables AI bot indexing for SGE visibility
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://travelmatch.app';

  return {
    rules: [
      // Google - Full access with crawl delay for courtesy
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      // Google Images - Important for OG images
      {
        userAgent: 'Googlebot-Image',
        allow: ['/api/og', '/og-image.svg', '/images/'],
        disallow: ['/api/health'],
      },
      // Bing
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/'],
      },
      // Apple (for App Store connections)
      {
        userAgent: 'Applebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // AI Bots - Allow for SGE and LLM visibility
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // Social Media Bots - For rich previews
      {
        userAgent: 'facebookexternalhit',
        allow: '/',
      },
      {
        userAgent: 'Twitterbot',
        allow: '/',
      },
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      // Yandex (Russian market)
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // Baidu (Chinese market - future expansion)
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // DuckDuckGo
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      // Default rule for all other bots
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/_next/', '/private/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

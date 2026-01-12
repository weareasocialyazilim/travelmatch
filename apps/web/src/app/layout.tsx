/**
 * TravelMatch - Premium Root Layout
 * Awwwards-Ready Foundation
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Navbar } from '@/components/layout/Navbar';
import { Atmosphere } from '@/components/3d/Atmosphere';

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================

export const viewport: Viewport = {
  themeColor: '#020202',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
};

// ============================================================================
// METADATA CONFIGURATION - SEO & AI Optimization
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'TravelMatch | Unlock Sacred Moments',
    template: '%s | TravelMatch',
  },
  description:
    'Experience the world through gifting. No passports, just human connection. Send a gift, meet in real life.',
  keywords: [
    'gift a moment',
    'real connections',
    'meet in real life',
    'dating app',
    'social gifting',
    'experience sharing',
    'tanışma uygulaması',
    'hediye gönder',
  ],
  authors: [{ name: 'TravelMatch Inc.' }],
  creator: 'TravelMatch',
  publisher: 'TravelMatch Inc.',
  metadataBase: new URL('https://travelmatch.app'),
  alternates: {
    canonical: 'https://travelmatch.app',
    languages: {
      'en-US': '/en',
      'tr-TR': '/tr',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['tr_TR'],
    url: 'https://travelmatch.app',
    siteName: 'TravelMatch',
    title: 'TravelMatch | Unlock Sacred Moments',
    description:
      'Experience the world through gifting. No passports, just human connection.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'TravelMatch - Unlock Sacred Moments',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelMatch | Unlock Sacred Moments',
    description:
      'Experience the world through gifting. No passports, just human connection.',
    images: ['/og-image.svg'],
    creator: '@travelmatch',
    site: '@travelmatch',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
  category: 'Social Networking',
};

// ============================================================================
// JSON-LD STRUCTURED DATA
// ============================================================================

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://travelmatch.app/#organization',
      name: 'TravelMatch',
      url: 'https://travelmatch.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://travelmatch.app/og-image.svg',
        width: 1200,
        height: 630,
      },
      sameAs: [
        'https://instagram.com/travelmatchapp',
        'https://tiktok.com/@travelmatchapp',
        'https://x.com/travelmatchapp',
      ],
      description: 'Real connections start with genuine gestures.',
    },
    {
      '@type': 'MobileApplication',
      '@id': 'https://travelmatch.app/#app',
      name: 'TravelMatch',
      operatingSystem: ['iOS', 'Android'],
      applicationCategory: 'SocialNetworkingApplication',
      description:
        'Send a gift, meet in real life. Build meaningful connections.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Gift-first matching',
        'Discover people nearby',
        'Safe meetups',
        'Experience assistant',
      ],
    },
  ],
};

// ============================================================================
// ROOT LAYOUT COMPONENT
// ============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Favicon & App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>

      <body className="font-inter antialiased">
        {/* 3D Atmosphere Background */}
        <Atmosphere />

        {/* Custom Cursor (Desktop Only) */}
        <CustomCursor />

        {/* Navigation */}
        <Navbar />

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer will be added per-page or as a shared component */}
      </body>
    </html>
  );
}

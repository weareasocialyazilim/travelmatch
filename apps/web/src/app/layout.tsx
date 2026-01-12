/**
 * TravelMatch - Premium Root Layout
 * Awwwards-Ready Foundation with Preloader & Smooth Scroll
 */

import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import { SacredAtmosphere } from '@/components/3d/SacredAtmosphere';

// ============================================================================
// FONT OPTIMIZATION - Local Font Loading (No External Requests)
// ============================================================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
});

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
    default: 'TravelMatch | The Social Gifting Protocol',
    template: '%s | TravelMatch',
  },
  description:
    'Identity Pulse and Sacred Moments exchange. No passports, no boundaries. Experience the world through human connection.',
  keywords: [
    'gift a moment',
    'real connections',
    'meet in real life',
    'social gifting',
    'experience sharing',
    'identity pulse',
    'sacred moments',
    'escrow protocol',
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
    title: 'TravelMatch | The Social Gifting Protocol',
    description:
      'The future of human experience exchange. No passports, no boundaries.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TravelMatch - The Social Gifting Protocol',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelMatch Protocol',
    description: 'Experience the world through gifting.',
    images: ['/og-image.png'],
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
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
        url: 'https://travelmatch.app/og-image.png',
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
        'Send a gift, meet in real life. Build meaningful connections through the Social Gifting Protocol.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Gift-first matching',
        'Identity Pulse verification',
        'Escrow-protected exchanges',
        'Sacred Moments gallery',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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

      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-inter antialiased`}
      >
        {/* Sacred Atmosphere - Minimalist particle flow background */}
        <SacredAtmosphere />

        {/* App Provider: Preloader + Smooth Scroll + Cursor + Navbar */}
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}

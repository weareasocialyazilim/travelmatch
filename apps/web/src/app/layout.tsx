/**
 * TravelMatch V2 Root Layout
 * Clean, modern, performant
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Atmosphere } from '@/components/3d/Atmosphere';

// ============================================================================
// VIEWPORT CONFIGURATION
// ============================================================================

export const viewport: Viewport = {
  themeColor: '#000000',
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
    default: 'TravelMatch | Anı Hediye Et - Gerçek Bağlantılar Kur',
    template: '%s | TravelMatch',
  },
  description:
    "Bir kahve gönder, gerçek hayatta tanış. TravelMatch ile anlamlı bağlantılar kur. Swipe'lamayı bırak, samimi ol.",
  keywords: [
    'tanışma uygulaması',
    'hediye gönder',
    'gerçek buluşma',
    'kahve ısmarla',
    'dating app',
    'gift a moment',
    'real connections',
    'meet in real life',
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
    title: 'TravelMatch | Anı Hediye Et',
    description:
      'Bir kahve gönder, gerçek hayatta tanış. Gerçek bağlantılar samimi jestlerle başlar.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'TravelMatch - Anı Hediye Et',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelMatch | Anı Hediye Et',
    description:
      'Bir kahve gönder, gerçek hayatta tanış. Gerçek bağlantılar samimi jestlerle başlar.',
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
      description: 'Gerçek bağlantılar, samimi jestlerle başlar.',
    },
    {
      '@type': 'MobileApplication',
      '@id': 'https://travelmatch.app/#app',
      name: 'TravelMatch',
      operatingSystem: ['iOS', 'Android'],
      applicationCategory: 'SocialNetworkingApplication',
      description:
        'Bir kahve gönder, gerçek hayatta tanış. Anlamlı bağlantılar kur.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Hediye göndererek tanış',
        'Yakınındaki kişileri keşfet',
        'Güvenli buluşma',
        'Deneyim asistanı',
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
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Grotesk:wght@300;400;500;700&display=swap"
          rel="stylesheet"
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

      <body className="antialiased bg-black text-white selection:bg-[#ccff00] selection:text-black">
        {/* 3D Atmosphere Background */}
        <Atmosphere />

        {/* Custom Cursor */}
        <CustomCursor />

        {/* Noise Overlay */}
        <div className="noise-overlay" />

        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}

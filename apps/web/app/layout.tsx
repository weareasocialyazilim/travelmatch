/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'TravelMatch - Send Real Vibes',
    template: '%s | TravelMatch',
  },
  description:
    'Virtual gifts are cringe. Send a real coffee to someone in Paris right now. Distance is just a number, the vibe is universal.',
  keywords: [
    'travel gifts',
    'experience gifting',
    'real vibes',
    'send gifts worldwide',
    'travel matching',
    'hediye deneyim',
  ],
  authors: [{ name: 'TravelMatch Inc.' }],
  creator: 'TravelMatch',
  publisher: 'TravelMatch Inc.',
  metadataBase: new URL('https://travelmatch.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'tr_TR',
    url: 'https://travelmatch.app',
    siteName: 'TravelMatch',
    title: 'TravelMatch - Send Real Vibes',
    description:
      'Virtual gifts are cringe. Send a real coffee to someone in Paris right now.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'TravelMatch - Send Real Vibes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TravelMatch - Send Real Vibes',
    description:
      'Virtual gifts are cringe. Send a real coffee to someone in Paris right now.',
    images: ['/og-image.svg'],
    creator: '@travelmatch',
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
};

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
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@travelmatch.app',
        contactType: 'customer service',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://travelmatch.app/#website',
      url: 'https://travelmatch.app',
      name: 'TravelMatch',
      description:
        'Virtual gifts are cringe. Send a real coffee to someone in Paris right now.',
      publisher: {
        '@id': 'https://travelmatch.app/#organization',
      },
      inLanguage: ['en-US', 'tr-TR'],
    },
    {
      '@type': 'MobileApplication',
      '@id': 'https://travelmatch.app/#app',
      name: 'TravelMatch',
      operatingSystem: ['iOS', 'Android'],
      applicationCategory: 'TravelApplication',
      description:
        'Send real vibes. Gift experiences worldwide. Distance is just a number.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '10000',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

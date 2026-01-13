import type { Metadata, Viewport } from 'next';
import { RitualProvider } from '@/context/RitualContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { Navbar } from '@/components/shared/Navbar';
import { CookieConsent } from '@/components/ui/CookieConsent';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#050505',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://travelmatch.app'),
  title: 'The Night Journey | TravelMatch',
  description:
    'Access the 15 Global Hubs. A ritual of connection. Dubai. Tokyo. NYC. Enter the frequency.',
  openGraph: {
    title: 'The Night Journey | TravelMatch',
    description: 'Join the waitlist for the most exclusive connection ritual.',
    url: 'https://travelmatch.app',
    siteName: 'TravelMatch',
    images: [
      {
        url: '/og-night-journey.png', // Placeholder for the dark vibe OG
        width: 1200,
        height: 630,
        alt: 'The Network Frequency',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="overflow-x-hidden selection:bg-[var(--neon-purple)] selection:text-white"
        style={{
          backgroundColor: 'var(--bg-deep)',
        }}
      >
        <RitualProvider>
          <LanguageProvider>
            <Navbar />
            {children}
            <CookieConsent />

            {/* Global SVG Filters */}
            <svg className="hidden">
              <filter id="goo">
                <feGaussianBlur
                  in="SourceGraphic"
                  stdDeviation="10"
                  result="blur"
                />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
                  result="goo"
                />
                <feComposite in="SourceGraphic" in2="goo" operator="atop" />
              </filter>
            </svg>
          </LanguageProvider>
        </RitualProvider>
      </body>
    </html>
  );
}

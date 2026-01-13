import type { Metadata, Viewport } from 'next';
import { RitualProvider } from '@/context/RitualContext';
import { LanguageProvider } from '@/context/LanguageContext';
// import { Navbar } from '@/components/shared/Navbar';
import { CookieConsent } from '@/components/ui/CookieConsent';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#050505',
};

export const metadata: Metadata = {
  title: 'TravelMatch - Find Your Sacred Journey',
  description:
    'Discover destinations that resonate with your soul through our AI-powered travel matching.',
};
/* Lines 12-43 omitted */
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
            {/* <Navbar /> */}
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

import type { Metadata, Viewport } from 'next';
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
        <nav className="fixed top-0 w-full z-50 px-6 md:px-10 py-6 md:py-8 flex justify-between items-center mix-blend-difference text-white pointer-events-none">
          <span className="font-black tracking-tighter text-2xl pointer-events-auto cursor-pointer">
            TM.
          </span>
          <button className="pointer-events-auto border border-white/20 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[var(--neon-pink)] hover:text-white transition-all duration-300">
            Ritual Menu
          </button>
        </nav>
        {children}

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
      </body>
    </html>
  );
}

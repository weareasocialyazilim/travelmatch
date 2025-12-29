import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { initializeRedis } from '@/lib/redis';

// Initialize Redis for rate limiting on server startup
initializeRedis();

// Force all routes to be dynamically rendered - admin panel requires authentication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'TravelMatch Admin',
  description: 'TravelMatch Platform Admin Panel',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

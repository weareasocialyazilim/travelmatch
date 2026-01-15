import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

// Force all routes to be dynamically rendered - admin panel requires authentication
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Lovendo Admin',
  description: 'Lovendo Platform Admin Panel',
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

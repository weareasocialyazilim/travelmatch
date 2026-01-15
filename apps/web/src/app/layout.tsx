import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#050505',
};

export const metadata: Metadata = {
  title: 'Lovendo - Find Your Sacred Journey',
  description:
    'Discover destinations that resonate with your soul through our AI-powered matching.',
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
        {children}
      </body>
    </html>
  );
}

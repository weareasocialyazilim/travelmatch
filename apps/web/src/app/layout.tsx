import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LOVENDO - Create Real Moments',
  description: 'Matching is for ghosts. Real moments are for humans.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

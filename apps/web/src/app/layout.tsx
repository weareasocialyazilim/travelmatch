import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TravelMatch | The Art of Gifting',
  description: 'Experience the world through human connection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body
        className="overflow-x-hidden"
        style={{
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        <nav className="fixed top-0 w-full z-50 px-10 py-8 flex justify-between items-center mix-blend-difference text-white">
          <span className="font-black tracking-tighter text-2xl">TM.</span>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest">
            <a href="#about">Story</a>
            <a href="#ritual">Ritual</a>
            <a href="#join" style={{ color: 'var(--accent)' }}>
              Join Now
            </a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}

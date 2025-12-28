import Link from 'next/link';

// Icon components
const GiftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

// TrustRing component for landing page
const TrustRingMini = ({
  score,
  avatarUrl,
}: {
  score: number;
  avatarUrl: string;
}) => {
  const size = 44;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-stone-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#trustGradientMini)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
        <defs>
          <linearGradient
            id="trustGradientMini"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <img
        src={avatarUrl}
        alt="User"
        className="rounded-full object-cover"
        style={{ width: 36, height: 36 }}
      />
    </div>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary-500/10 rounded-full blur-3xl" />

        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-button">
                  <GiftIcon className="w-8 h-8 text-white" />
                </div>
                <span className="text-2xl font-bold text-stone-900">
                  TravelMatch
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-hero-mobile md:text-hero">
                <span className="gradient-text">Give a moment.</span>
                <br />
                <span className="text-stone-900">See it happen.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-stone-600 max-w-lg">
                The first platform where you can gift real travel experiences
                and see the proof when they happen.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link href="#download" className="btn-primary">
                  Download App
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
                <Link
                  href="/partner"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-primary-500 text-primary-500 hover:bg-primary-500/10 transition-all duration-200"
                >
                  Partner with Us
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <TrustRingMini
                    score={92}
                    avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  />
                  <TrustRingMini
                    score={87}
                    avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                  />
                  <TrustRingMini
                    score={95}
                    avatarUrl="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
                  />
                </div>
                <p className="text-sm text-stone-500">
                  <span className="font-semibold text-stone-900">10,000+</span>{' '}
                  trusted travelers
                </p>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative hidden lg:block">
              <div className="relative z-10 animate-float">
                <div className="bg-gradient-to-br from-stone-800 to-stone-900 rounded-[3rem] p-3 shadow-2xl border border-stone-700/50 max-w-xs mx-auto">
                  <div className="bg-gradient-to-br from-stone-900 to-black rounded-[2.5rem] overflow-hidden aspect-[9/19]">
                    <div className="w-full h-full bg-gradient-card-overlay flex items-center justify-center">
                      <div className="text-center p-8">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-hero rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/50">
                          <GiftIcon className="w-14 h-14 text-white" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">
                          Gift Moments
                        </p>
                        <p className="text-sm text-stone-400">
                          See them happen
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-display-mobile md:text-display mb-4">
              Why <span className="gradient-text">TravelMatch</span>?
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              We&apos;re reinventing how people gift experiences to each other.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Gift Moments */}
            <div className="card-base p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-button group-hover:scale-110 transition-transform">
                <GiftIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gift Moments</h3>
              <p className="text-stone-600">
                Send coffee, tickets, or experiences to travelers you connect
                with.
              </p>
            </div>

            {/* Proof System */}
            <div className="card-base p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-trust rounded-2xl flex items-center justify-center trust-glow group-hover:scale-110 transition-transform">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Proof System</h3>
              <p className="text-stone-600">
                See photo/video proof when your gift is used. Real moments,
                verified.
              </p>
            </div>

            {/* Trust Score */}
            <div className="card-base p-8 text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-discover rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trust Score</h3>
              <p className="text-stone-600">
                Build your reputation through verified interactions and proofs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-cream">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-display-mobile md:text-display mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-stone-900">
                  Create a moment
                </h3>
                <p className="text-stone-600">
                  Choose an experience to gift - coffee, tickets, dinner, or any
                  local adventure.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-full bg-secondary-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-stone-900">
                  Gift it to a traveler
                </h3>
                <p className="text-stone-600">
                  Send your gift to someone exploring your city or a destination
                  you love.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-stone-900">
                  See the proof
                </h3>
                <p className="text-stone-600">
                  Receive photos and videos when they experience your gift.
                  Watch the magic happen.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group hover:translate-x-2 transition-transform">
              <div className="w-12 h-12 rounded-full bg-trust-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-stone-900">
                  Build trust together
                </h3>
                <p className="text-stone-600">
                  Grow your trust score with each verified interaction. Meet
                  better.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="download"
        className="py-24 bg-gradient-hero text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-radial-glow opacity-50" />
        <div className="section-container relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start gifting moments today
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join thousands of travelers who are making meaningful connections
            through the gift of experiences.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="https://apps.apple.com"
              target="_blank"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 hover:bg-white/20 transition-all duration-300 flex items-center gap-3 shadow-lg">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-white/60">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </div>
            </Link>

            <Link
              href="https://play.google.com"
              target="_blank"
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-4 hover:bg-white/20 transition-all duration-300 flex items-center gap-3 shadow-lg">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-white/60">GET IT ON</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <GiftIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900">TravelMatch</span>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-8 mb-8">
            <Link
              href="https://instagram.com"
              target="_blank"
              className="text-stone-400 hover:text-secondary-500 transition-colors transform hover:scale-110 duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </Link>
            <Link
              href="https://tiktok.com"
              target="_blank"
              className="text-stone-400 hover:text-primary-500 transition-colors transform hover:scale-110 duration-300"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </Link>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <Link
              href="/terms"
              className="text-stone-500 hover:text-primary-500 transition-colors"
            >
              Terms and Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-stone-500 hover:text-primary-500 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/partner"
              className="text-stone-500 hover:text-secondary-500 transition-colors font-medium"
            >
              Partner with TravelMatch
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-stone-400 text-sm">
            © {new Date().getFullYear()} TravelMatch Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

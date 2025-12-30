/**
 * TravelMatch Landing Page
 * "Cinematic Travel + Trust Jewelry" Design System
 *
 * Motto: "Give a moment. See it happen."
 *
 * Sections: Hero, Features, How It Works, Trust, CTA, Footer
 * (Testimonials removed per design decision)
 */

import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { TrustRing } from "@/components/ui/TrustRing";

// ═══════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════

const GiftIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4H6a4 4 0 00-4 4v2h10zm0 0V6a4 4 0 014-4h2a4 4 0 014 4v2H12zM4 8h16v13a1 1 0 01-1 1H5a1 1 0 01-1-1V8z" />
  </svg>
);

const CheckBadgeIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const PlayStoreIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════
// SMALL TRUST RING (for social proof)
// ═══════════════════════════════════════════════════════════════════

function SmallTrustRing({ score, size = 40 }: { score: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="text-stone-200 dark:text-stone-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#trustGradSmall)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="trustGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  return (
    <div className="min-h-screen bg-cream dark:bg-stone-950">
      {/* NAVBAR */}
      <Navbar />

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial-glow opacity-50" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse-soft animation-delay-500" />

        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Logo */}
              <div className="flex items-center gap-3 justify-center lg:justify-start animate-fade-in-down">
                <div className="w-14 h-14 bg-gradient-hero rounded-2xl flex items-center justify-center shadow-button text-white">
                  <MapPinIcon />
                </div>
                <span className="text-2xl font-bold text-stone-900 dark:text-white">
                  TravelMatch
                </span>
              </div>

              {/* Headline */}
              <h1 className="heading-hero animate-fade-in-up animation-delay-100">
                <span className="gradient-text">Give a moment.</span>
                <br />
                <span className="text-stone-900 dark:text-white">See it happen.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-stone-600 dark:text-stone-400 max-w-lg mx-auto lg:mx-0 animate-fade-in-up animation-delay-200">
                The first platform where you can gift real travel experiences
                and see the proof when they happen. Build trust. Meet better.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-300">
                <Link href="https://apps.apple.com" className="btn-primary">
                  <AppleIcon />
                  Download for iOS
                </Link>
                <Link href="https://play.google.com" className="btn-outline">
                  <PlayStoreIcon />
                  Get on Android
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4 justify-center lg:justify-start pt-4 animate-fade-in-up animation-delay-400">
                <div className="flex -space-x-2">
                  <SmallTrustRing score={92} size={40} />
                  <SmallTrustRing score={87} size={40} />
                  <SmallTrustRing score={95} size={40} />
                  <SmallTrustRing score={89} size={40} />
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  <span className="font-semibold text-stone-900 dark:text-white">10,000+</span>
                  {' '}trusted travelers
                </p>
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="relative hidden lg:flex justify-center animate-fade-in-up animation-delay-500">
              <div className="relative animate-float">
                {/* Phone Frame */}
                <div className="w-[320px] h-[650px] bg-stone-900 rounded-[3rem] p-3 shadow-2xl border border-stone-700">
                  <div className="w-full h-full bg-gradient-to-br from-cream to-cream-dark dark:from-stone-900 dark:to-stone-950 rounded-[2.5rem] overflow-hidden">
                    {/* App Screen Preview */}
                    <div className="p-6 space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gradient-hero rounded-xl" />
                          <span className="font-bold text-stone-900 dark:text-white">Discover</span>
                        </div>
                        <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 rounded-full" />
                      </div>

                      {/* Category Pills */}
                      <div className="flex gap-2 overflow-hidden">
                        <span className="px-4 py-2 bg-gradient-hero text-white rounded-full text-sm font-medium">Coffee</span>
                        <span className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-sm">Events</span>
                        <span className="px-4 py-2 bg-stone-100 dark:bg-stone-800 rounded-full text-sm">Food</span>
                      </div>

                      {/* Card Preview */}
                      <div className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-card">
                        <div className="h-40 bg-gradient-sunset" />
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-stone-900 dark:text-white">Coffee in Kadikoy</h3>
                            <span className="badge-trust text-xs">92</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-stone-500">$15</span>
                            <button className="px-4 py-2 bg-gradient-hero text-white rounded-xl text-sm font-medium">
                              Send Gift
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-hero opacity-20 blur-3xl -z-10 scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="section-padding bg-white dark:bg-stone-900">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="heading-display mb-4">
              Why <span className="gradient-text">TravelMatch</span>?
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              The only platform designed for meaningful travel connections through verified experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Gift Moments */}
            <div className="card-base p-8 text-center group hover-lift">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-hero rounded-2xl flex items-center justify-center text-white shadow-button group-hover:scale-110 transition-transform duration-300">
                <GiftIcon />
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-white">Gift Experiences</h3>
              <p className="text-stone-600 dark:text-stone-400">
                Send coffee, dinner, or unique local experiences to travelers anywhere in the world.
              </p>
            </div>

            {/* Proof System */}
            <div className="card-base p-8 text-center group hover-lift">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-trust rounded-2xl flex items-center justify-center text-white trust-glow group-hover:scale-110 transition-transform duration-300">
                <CheckBadgeIcon />
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-white">See the Proof</h3>
              <p className="text-stone-600 dark:text-stone-400">
                Receive verified photos and videos when your gift is experienced. No more wondering.
              </p>
            </div>

            {/* Trust Score */}
            <div className="card-base p-8 text-center group hover-lift">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-discover rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon />
              </div>
              <h3 className="text-xl font-bold mb-3 text-stone-900 dark:text-white">Build Trust</h3>
              <p className="text-stone-600 dark:text-stone-400">
                Our Trust Score system helps you connect with verified, reliable travelers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="section-padding">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="heading-display mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              Four simple steps to gift meaningful travel experiences.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {[
              { step: '01', title: 'Discover', desc: 'Browse unique local experiences created by travelers around the world.', color: 'text-primary' },
              { step: '02', title: 'Gift', desc: 'Choose an experience and send it as a gift. Payment is held securely.', color: 'text-secondary' },
              { step: '03', title: 'Experience', desc: 'The recipient enjoys the experience you gifted.', color: 'text-accent' },
              { step: '04', title: 'Prove', desc: 'They submit proof, you see it happen, and payment is released.', color: 'text-trust' },
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-6 group hover:translate-x-2 transition-transform duration-300"
              >
                <span className="text-4xl font-bold text-stone-200 dark:text-stone-800 tabular-nums">
                  {item.step}
                </span>
                <div>
                  <h3 className={`text-xl font-bold ${item.color} mb-1`}>{item.title}</h3>
                  <p className="text-stone-600 dark:text-stone-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUST SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section className="section-padding bg-gradient-to-br from-stone-900 to-stone-950 text-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="badge bg-trust/20 text-trust">Trust System</span>
              <h2 className="text-4xl md:text-5xl font-bold">
                Trust is our<br />
                <span className="bg-clip-text text-transparent bg-gradient-trust">currency</span>
              </h2>
              <p className="text-lg text-stone-400">
                Every user builds a Trust Score through verified experiences.
                Higher scores unlock more features and build credibility in our community.
              </p>

              <div className="space-y-4">
                {[
                  { label: 'Verified identity', desc: 'KYC verification for added security' },
                  { label: 'AI proof verification', desc: 'Smart detection ensures authentic experiences' },
                  { label: 'Community ratings', desc: 'Build reputation through completed gifts' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-trust flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-sm text-stone-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="glass-dark px-4 py-3 rounded-xl">
                  <span className="text-2xl font-bold text-trust tabular-nums">92</span>
                  <span className="text-stone-400 ml-2">Platinum Traveler</span>
                </div>
                <div className="glass-dark px-4 py-3 rounded-xl">
                  <span className="text-2xl font-bold text-primary tabular-nums">156</span>
                  <span className="text-stone-400 ml-2">Gifts Given</span>
                </div>
              </div>
            </div>

            {/* Trust Ring Demo */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-trust opacity-20 blur-3xl absolute inset-0" />
                <TrustRing score={92} size={200} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          APP DOWNLOAD CTA SECTION
          ═══════════════════════════════════════════════════════════ */}
      <section id="download" className="section-padding bg-gradient-hero text-white overflow-hidden">
        <div className="section-container">
          <div className="relative">
            {/* Background decoration */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Start gifting moments today
              </h2>
              <p className="text-xl text-white/80 mb-10">
                Download TravelMatch and join thousands of travelers creating
                meaningful connections through gifted experiences.
              </p>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://apps.apple.com"
                  className="inline-flex items-center gap-4 bg-white text-stone-900 px-8 py-4 rounded-2xl font-semibold hover:bg-white/90 transition-colors"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-stone-500">Download on the</div>
                    <div className="text-lg font-bold">App Store</div>
                  </div>
                </Link>

                <Link
                  href="https://play.google.com"
                  className="inline-flex items-center gap-4 bg-white/10 backdrop-blur border border-white/20 px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-colors"
                >
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs text-white/60">GET IT ON</div>
                    <div className="text-lg font-bold">Google Play</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PARTNER CTA
          ═══════════════════════════════════════════════════════════ */}
      <section className="py-12 bg-secondary/5">
        <div className="section-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
                Are you a business?
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                Partner with TravelMatch and reach engaged travelers.
              </p>
            </div>
            <Link href="/partner" className="btn-secondary">
              Partner with Us
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <footer className="py-12 bg-stone-900 text-white">
        <div className="section-container">
          {/* Logo & Social */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-8 border-b border-stone-800">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
                <MapPinIcon />
              </div>
              <span className="text-xl font-bold">TravelMatch</span>
            </div>
            <div className="flex gap-6">
              <Link href="https://instagram.com" className="text-stone-400 hover:text-secondary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </Link>
              <Link href="https://tiktok.com" className="text-stone-400 hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </Link>
              <Link href="https://twitter.com" className="text-stone-400 hover:text-accent transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-sm">
            <Link href="/terms" className="text-stone-400 hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-stone-400 hover:text-white transition-colors">Privacy</Link>
            <Link href="/safety" className="text-stone-400 hover:text-white transition-colors">Safety</Link>
            <Link href="mailto:hello@travelmatch.app" className="text-stone-400 hover:text-white transition-colors">Contact</Link>
          </div>

          {/* Copyright */}
          <div className="text-center text-stone-500 text-sm">
            &copy; {new Date().getFullYear()} TravelMatch Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * TravelMatch - Awwwards-Ready Landing Page
 *
 * Premium design with:
 * - Hero with 3D GiftOrb
 * - TrustRing scrollytelling
 * - MatchSimulator ML demo
 * - SacredMoments Bento Grid
 * - RitualSection process steps
 * - Grand Footer finale
 */

import { Hero } from '@/components/landing/Hero';
import { TrustRing } from '@/components/landing/TrustRing';
import { MatchSimulator } from '@/components/landing/MatchSimulator';
import { SacredMoments } from '@/components/landing/SacredMoments';
import { RitualSection } from '@/components/landing/RitualSection';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full selection:bg-primary selection:text-background">
      {/* 01: Hero & 3D Atmosphere */}
      <Hero />

      {/* 02: Trust Ring Scrollytelling */}
      <TrustRing />

      {/* 03: ML Neural Match Simulator */}
      <MatchSimulator />

      {/* 04: Sacred Moments Bento Grid */}
      <SacredMoments />

      {/* 05: The Ritual of Gifting Process */}
      <RitualSection />

      {/* 06: Grand Finale Footer */}
      <Footer />
    </div>
  );
}

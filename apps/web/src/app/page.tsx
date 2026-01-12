/**
 * TravelMatch - Awwwards-Ready Landing Page
 *
 * Premium design with:
 * - Hero with 3D GiftOrb
 * - TrustRing scrollytelling
 * - CinematicReveal Apple-style text mask
 * - MatchSimulator ML demo (connected to Neural Nexus API)
 * - LiveTrustCounter real-time platform stats
 * - IdentityPulse futuristic card
 * - SacredMoments Bento Grid
 * - RitualSection process steps
 * - Grand Footer finale
 */

import { Hero } from '@/components/landing/Hero';
import { TrustRing } from '@/components/landing/TrustRing';
import { CinematicReveal } from '@/components/landing/CinematicReveal';
import { MatchSimulator } from '@/components/landing/MatchSimulator';
import { LiveTrustCounter } from '@/components/landing/LiveTrustCounter';
import { IdentityPulse } from '@/components/landing/IdentityPulse';
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

      {/* 03: Cinematic Reveal - Apple-style text mask */}
      <CinematicReveal />

      {/* 04: ML Neural Match Simulator */}
      <MatchSimulator />

      {/* 05: Identity Pulse - Futuristic ID Card */}
      <IdentityPulse />

      {/* 06: Live Trust Counter - Real-time Platform Stats */}
      <LiveTrustCounter />

      {/* 07: Sacred Moments Bento Grid */}
      <SacredMoments />

      {/* 08: The Ritual of Gifting Process */}
      <RitualSection />

      {/* 09: Grand Finale Footer */}
      <Footer />
    </div>
  );
}

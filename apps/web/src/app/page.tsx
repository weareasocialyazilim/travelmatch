/**
 * TravelMatch - Awwwards-Ready Landing Page
 *
 * Section-Based Reveal Architecture:
 * Each section owns its viewport - no cognitive overload
 *
 * Premium design with:
 * - Hero with 3D GiftOrb
 * - TrustRing scrollytelling
 * - CinematicReveal Apple-style text mask
 * - MatchSimulator ML demo (connected to Neural Nexus API)
 * - IdentityPulse futuristic card
 * - LiveTrustCounter real-time platform stats
 * - SacredMoments Bento Grid
 * - RitualSection process steps
 * - Grand Footer finale
 *
 * Fixed Overlays (don't interfere with flow):
 * - LiveHeartbeat (bottom-right) - Real-time social proof
 * - NeuralChat (bottom-left) - AI vibe assistant
 */

import { Hero } from '@/components/landing/Hero';
import { TrustRing } from '@/components/landing/TrustRing';
import { CinematicReveal } from '@/components/landing/CinematicReveal';
import { MatchSimulator } from '@/components/landing/MatchSimulator';
import { IdentityPulse } from '@/components/landing/IdentityPulse';
import { LiveTrustCounter } from '@/components/landing/LiveTrustCounter';
import { SacredMoments } from '@/components/landing/SacredMoments';
import { RitualSection } from '@/components/landing/RitualSection';
import { Manifesto } from '@/components/landing/Manifesto';
import { ActivityPulse } from '@/components/landing/ActivityPulse';
import { Footer } from '@/components/layout/Footer';
import { LiveHeartbeat } from '@/components/landing/LiveHeartbeat';
import { NeuralChat } from '@/components/shared/NeuralChat';
import { SectionWrapper } from '@/components/ui/SectionWrapper';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-background selection:bg-primary selection:text-background">
      {/* ═══════════════════════════════════════════════════════════
          FIXED OVERLAYS - These don't interfere with page flow
          Bottom corners, minimalist, appear/hide on interaction
      ═══════════════════════════════════════════════════════════ */}
      <LiveHeartbeat />
      <ActivityPulse />
      <NeuralChat />

      {/* ═══════════════════════════════════════════════════════════
          MAIN FLOW (CHAPTERS) - Section-Based Reveal
          Each section is 'relative' and 'overflow-hidden'
          viewport={{ once: true, amount: 0.5 }} triggers animations
      ═══════════════════════════════════════════════════════════ */}

      {/* Chapter 01: Hero & 3D Atmosphere */}
      <SectionWrapper>
        <Hero />
      </SectionWrapper>

      {/* Chapter 01.5: Manifesto - Philosophy & Kinetic Typography */}
      <SectionWrapper>
        <Manifesto />
      </SectionWrapper>

      {/* Chapter 02: Trust Ring Scrollytelling */}
      <SectionWrapper className="bg-black">
        <TrustRing />
      </SectionWrapper>

      {/* Chapter 03: Cinematic Reveal - Apple-style text mask */}
      <SectionWrapper>
        <CinematicReveal />
      </SectionWrapper>

      {/* Chapter 04: ML Neural Match Simulator */}
      <SectionWrapper>
        <MatchSimulator />
      </SectionWrapper>

      {/* Chapter 05: Identity Pulse - Futuristic ID Card */}
      <SectionWrapper className="bg-[#050505]">
        <IdentityPulse />
      </SectionWrapper>

      {/* Chapter 06: Live Trust Counter - Real-time Platform Stats */}
      <SectionWrapper>
        <LiveTrustCounter />
      </SectionWrapper>

      {/* Chapter 07: Sacred Moments Bento Grid */}
      <SectionWrapper>
        <SacredMoments />
      </SectionWrapper>

      {/* Chapter 08: The Ritual of Gifting Process */}
      <SectionWrapper className="bg-black">
        <RitualSection />
      </SectionWrapper>

      {/* Chapter 09: Grand Finale Footer */}
      <Footer />
    </div>
  );
}

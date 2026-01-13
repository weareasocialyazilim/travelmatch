import {
  Hero,
  GlobalPulse,
  MomentDeck,
  GoldenGlow,
  ProofCeremony,
  AuraRitual,
  ManifestoLoop,
} from '@/components/landing';
import { ExperienceAssistant } from '@/components/shared/ExperienceAssistant';
import { Footer } from '@/components/layout/Footer';
import { SacredAtmosphere } from '@/components/3d/SacredAtmosphere';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-background selection:bg-primary selection:text-background overflow-x-hidden">
      <ExperienceAssistant />

      {/* Background Layer with Aura Sync */}
      <div className="fixed inset-0 z-0 pointer-events-none sacred-bg-overlay" />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen">
        <SacredAtmosphere />
      </div>

      <main className="z-10 bg-transparent flex flex-col gap-0">
        <Hero />
        <ManifestoLoop />
        <GlobalPulse />
        <MomentDeck />
        <GoldenGlow />
        <ProofCeremony />
        <AuraRitual />
      </main>
      <Footer />
    </div>
  );
}

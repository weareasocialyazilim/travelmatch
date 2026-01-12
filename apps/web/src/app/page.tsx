import { Hero } from '@/components/landing/Hero';
import { GlobalPulse } from '@/components/landing/GlobalPulse';
import { MomentDeck } from '@/components/landing/MomentDeck';
import { GoldenGlow } from '@/components/landing/GoldenGlow';
import { ProofCeremony } from '@/components/landing/ProofCeremony';
import { DemoApplication } from '@/components/landing/DemoApplication';
import { ExperienceAssistant } from '@/components/shared/ExperienceAssistant';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full bg-background selection:bg-primary selection:text-background overflow-x-hidden">
      <CustomCursor />
      <ExperienceAssistant />
      <Hero /> {/* 15 Şehir & Demo Access */}
      <GlobalPulse /> {/* Paris -> Dubai Traffic */}
      <MomentDeck /> {/* 15 Sacred Moments & Whispers */}
      <GoldenGlow /> {/* Prestige System */}
      <ProofCeremony />
      {/* Trust Ritual */}
      <DemoApplication /> {/* Global Hub Selection */}
      <Footer />
    </div>
  );
}

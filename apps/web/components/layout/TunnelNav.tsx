'use client';

import { useEffect, useRef, ReactNode, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface TunnelNavProps {
  children: ReactNode;
  scrollDistance?: number;
  scrubSpeed?: number;
  perspective?: number;
  easing?: string;
}

export const TunnelNav = ({
  children,
  scrollDistance = 5000,
  scrubSpeed = 1.5,
  perspective = 2000,
  easing = 'power2.inOut',
}: TunnelNavProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [, setIsInitialized] = useState(false);

  useEffect(() => {
    if (
      !containerRef.current ||
      !contentRef.current ||
      typeof window === 'undefined'
    )
      return;

    // Wait for DOM to be ready
    const initAnimation = () => {
      const sections = gsap.utils.toArray<HTMLElement>('.tunnel-section');

      if (sections.length === 0) {
        // No tunnel sections found - this is expected in test environments
        return;
      }

      // Create master timeline with ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${scrollDistance}`,
          scrub: scrubSpeed,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // markers: process.env.NODE_ENV === 'development', // Debug markers
        },
      });

      // Animate each section through the Z-axis tunnel
      sections.forEach((section, i) => {
        // Initial state
        gsap.set(section, {
          zIndex: sections.length - i,
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        });

        // Z-axis tunnel animation - flying towards and past camera
        tl.to(
          section,
          {
            z: 2500,
            opacity: 0,
            scale: 4,
            rotateX: () => gsap.utils.random(-5, 5),
            rotateY: () => gsap.utils.random(-5, 5),
            ease: easing,
            duration: 1,
          },
          i * 0.6,
        );
      });

      setIsInitialized(true);
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initAnimation, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [scrollDistance, scrubSpeed, easing]);

  return (
    <div
      ref={containerRef}
      className="relative h-screen overflow-hidden bg-black"
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: '50% 50%',
      }}
    >
      <div
        ref={contentRef}
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: '50% 50%',
        }}
      >
        {children}
      </div>

      {/* Vignette overlay for depth */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  );
};

// Individual tunnel section component
interface TunnelSectionProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export const TunnelSection = ({
  children,
  className = '',
  index = 0,
}: TunnelSectionProps) => {
  return (
    <section
      className={`tunnel-section absolute inset-0 flex flex-col items-center justify-center ${className}`}
      style={{
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d',
      }}
      data-index={index}
    >
      {children}
    </section>
  );
};

// Scroll progress indicator
export const TunnelProgress = () => {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressRef.current || typeof window === 'undefined') return;

    const updateProgress = () => {
      const scrollProgress =
        window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleY(${scrollProgress})`;
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden md:block">
      <div className="relative h-32 w-1 bg-white/10 rounded-full overflow-hidden">
        <div
          ref={progressRef}
          className="absolute bottom-0 left-0 w-full bg-[#CCFF00] origin-bottom"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>
      <div className="mt-4 text-xs font-mono text-white/40 writing-vertical">
        SCROLL
      </div>
    </div>
  );
};

// Text layers that fly by
interface TunnelTextLayerProps {
  text: string;
  delay?: number;
  className?: string;
}

export const TunnelTextLayer = ({
  text,
  delay = 0,
  className = '',
}: TunnelTextLayerProps) => {
  return (
    <div
      className={`tunnel-layer absolute inset-0 flex items-center justify-center pointer-events-none ${className}`}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <h2 className="text-[12vw] font-syne font-black text-white leading-none tracking-tighter text-center whitespace-nowrap">
        {text}
      </h2>
    </div>
  );
};

export default TunnelNav;

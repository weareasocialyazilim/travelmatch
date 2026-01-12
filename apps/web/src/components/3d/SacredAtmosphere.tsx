'use client';

import { useRef, useMemo, Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Sacred Atmosphere - Silky Particle Flow
 *
 * Subtle, organic particle system with warm golden colors.
 * Optimized: Disabled on mobile (< 768px) to improve performance
 */

const Particles = ({ count = 1500 }: { count?: number }) => {
  const points = useRef<THREE.Points>(null!);
  const geometry = useRef<THREE.BufferGeometry>(null!);

  useMemo(() => {
    if (!geometry.current) {
      geometry.current = new THREE.BufferGeometry();
    }

    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 15; // X
      positions[i + 1] = (Math.random() - 0.5) * 15; // Y
      positions[i + 2] = (Math.random() - 0.5) * 15; // Z
    }

    geometry.current.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3),
    );
    return geometry.current;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const time = state.clock.getElapsedTime();
    points.current.rotation.y = time * 0.02;
    points.current.rotation.x = Math.sin(time * 0.05) * 0.15;
    points.current.rotation.z = Math.cos(time * 0.03) * 0.1;
  });

  return (
    <points ref={points} geometry={geometry.current}>
      <pointsMaterial
        size={0.03}
        color="#facc15"
        transparent
        opacity={0.25}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const CanvasComponent = dynamic(
  async () => {
    const { Canvas: CanvasComp } = await import('@react-three/fiber');
    return function DynamicCanvas(props: any) {
      return (
        <CanvasComp
          {...props}
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{
            antialias: false,
            powerPreference: 'low-power',
            alpha: true,
          }}
        >
          <Particles count={1200} />
        </CanvasComp>
      );
    };
  },
  { ssr: false, loading: () => null },
);

export function SacredAtmosphere() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Only render on desktop (>= 768px width)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop) return null; // Don't render 3D on mobile

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-60 dark:opacity-40">
      <Suspense fallback={null}>
        {/* @ts-ignore */}
        <CanvasComponent />
      </Suspense>
    </div>
  );
}

export default SacredAtmosphere;

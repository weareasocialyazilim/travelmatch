'use client';

import { Suspense, ReactNode, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  Preload,
  AdaptiveDpr,
  AdaptiveEvents,
  PerformanceMonitor,
} from '@react-three/drei';
import {
  useAdaptiveQuality,
  useReducedMotion,
} from '@/hooks/usePerformanceMonitor';

interface Scene3DProps {
  children: ReactNode;
  className?: string;
  quality?: 'auto' | 'high' | 'medium' | 'low';
  onPerformanceChange?: (tier: 'high' | 'low') => void;
}

// Loading fallback
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="#CCFF00" wireframe />
  </mesh>
);

// Camera controller
const CameraController = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
};

export const Scene3D = ({
  children,
  className = '',
  quality = 'auto',
  onPerformanceChange,
}: Scene3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { settings } = useAdaptiveQuality();

  // Determine actual settings level based on quality prop
  const effectiveSettings =
    quality === 'auto'
      ? settings
      : {
          high: {
            particleCount: 10000,
            antialias: true,
            pixelRatio: Math.min(window?.devicePixelRatio || 1, 2),
          },
          medium: {
            particleCount: 5000,
            antialias: true,
            pixelRatio: 1.5,
          },
          low: {
            particleCount: 1000,
            antialias: false,
            pixelRatio: 1,
          },
        }[quality];

  // Client-side only rendering
  const isClient = typeof window !== 'undefined';

  // Reduced motion fallback
  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`bg-gradient-to-br from-[#050505] via-[#111] to-[#050505] ${className}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#CCFF00] to-[#FF0099] opacity-50 blur-xl" />
        </div>
      </div>
    );
  }

  if (!isClient) {
    return <div ref={containerRef} className={`bg-[#050505] ${className}`} />;
  }

  return (
    <div ref={containerRef} className={className}>
      <Canvas
        dpr={effectiveSettings?.pixelRatio || 1}
        camera={{ position: [0, 0, 5], fov: 75, near: 0.1, far: 1000 }}
        gl={{
          antialias: effectiveSettings?.antialias ?? true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.5 }}
      >
        <PerformanceMonitor
          onIncline={() => onPerformanceChange?.('high')}
          onDecline={() => onPerformanceChange?.('low')}
        />

        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <CameraController />

        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

// Simple 3D scene for background use
export const BackgroundScene = ({
  children,
  className = 'fixed inset-0 z-0',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <Scene3D className={className}>
    <ambientLight intensity={0.3} />
    <directionalLight position={[5, 10, 5]} intensity={1} />
    <pointLight position={[3, 0, 3]} color="#FF0099" intensity={0.5} />
    <pointLight position={[-3, 0, -3]} color="#00F0FF" intensity={0.5} />
    {children}
  </Scene3D>
);

export default Scene3D;

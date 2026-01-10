'use client';

/**
 * Scene3D - Fixed Background 3D Scene
 *
 * Simple, performant 3D background with LovePortal3D.
 * No complex hooks, just clean WebGL rendering.
 */

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { LovePortal3D } from './LovePortal3D';

// Simple particle field for ambient effect
const SimpleParticles = ({ count = 100 }: { count?: number }) => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20;     // x
    positions[i + 1] = (Math.random() - 0.5) * 20; // y
    positions[i + 2] = (Math.random() - 0.5) * 10; // z
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#BE123C"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export const Scene3D = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050000]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#BE123C" />
          <pointLight position={[-10, -10, -5]} intensity={0.8} color="#7E22CE" />

          {/* Main Portal */}
          <LovePortal3D />

          {/* Ambient Particles */}
          <SimpleParticles count={150} />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  );
};

export default Scene3D;

'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * TravelMatch Premium Atmosphere
 *
 * Features:
 * - Floating gradient blobs (Cyber Mint, Electric Purple, Liquid Gold)
 * - Particle field with premium colors
 * - Smooth, hypnotic movement
 * - Performance optimized
 */

interface BlobProps {
  position: [number, number, number];
  color: string;
  scale: number;
  speed: number;
  distort: number;
}

function Blob({ position, color, scale, speed, distort }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.15;
    }
  });

  return (
    <Float
      speed={speed}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[-0.5, 0.5]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          transparent
          opacity={0.25}
          distort={distort}
          speed={speed * 0.5}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}

function FloatingBlobs() {
  // Premium color palette blobs
  const blobs = useMemo(
    () => [
      // Cyber Mint (Primary)
      {
        position: [-4, 2, -5] as [number, number, number],
        color: '#00FF88',
        scale: 2,
        speed: 0.5,
        distort: 0.4,
      },
      // Electric Purple (Secondary)
      {
        position: [4, -1, -6] as [number, number, number],
        color: '#8B5CF6',
        scale: 1.5,
        speed: 0.7,
        distort: 0.5,
      },
      // Liquid Gold (Accent)
      {
        position: [0, 3, -8] as [number, number, number],
        color: '#FACC15',
        scale: 2.5,
        speed: 0.3,
        distort: 0.3,
      },
      // More Cyber Mint
      {
        position: [-3, -2, -4] as [number, number, number],
        color: '#00FF88',
        scale: 1,
        speed: 0.8,
        distort: 0.6,
      },
      // Electric Purple
      {
        position: [3, 1, -7] as [number, number, number],
        color: '#8B5CF6',
        scale: 1.8,
        speed: 0.4,
        distort: 0.35,
      },
      // Liquid Gold
      {
        position: [0, -3, -5] as [number, number, number],
        color: '#FACC15',
        scale: 1.2,
        speed: 0.6,
        distort: 0.45,
      },
    ],
    [],
  );

  return (
    <>
      {blobs.map((blob, index) => (
        <Blob key={index} {...blob} />
      ))}
    </>
  );
}

// Seeded pseudo-random number generator for deterministic particle positions
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 150; // Slightly reduced for performance

  const [positions, colors] = useMemo(() => {
    const random = seededRandom(42);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Premium color palette
    const colorPalette = [
      new THREE.Color('#00FF88'), // Cyber Mint
      new THREE.Color('#8B5CF6'), // Electric Purple
      new THREE.Color('#FACC15'), // Liquid Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (random() - 0.5) * 20;
      positions[i * 3 + 1] = (random() - 0.5) * 20;
      positions[i * 3 + 2] = (random() - 0.5) * 20 - 5;

      const colorIndex = Math.floor(random() * colorPalette.length);
      const color = colorPalette[colorIndex]!;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        transparent
        opacity={0.5}
        vertexColors
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#00FF88" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#8B5CF6" />
      <pointLight position={[0, 10, -5]} intensity={0.2} color="#FACC15" />

      <FloatingBlobs />
      <ParticleField />
    </>
  );
}

export function Atmosphere() {
  return (
    <div
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background:
          'linear-gradient(180deg, #020202 0%, #050508 50%, #020202 100%)',
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: false,
            powerPreference: 'high-performance',
            alpha: true,
          }}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </Suspense>

      {/* Gradient overlay for better text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(2,2,2,0.7) 100%)',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px 100px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  );
}

export default Atmosphere;

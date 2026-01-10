'use client';

import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Atmosphere - Gen Z Ambient Background
 *
 * Features:
 * - Soft, dreamy floating blobs
 * - Subtle color gradients (acid green, neon pink, electric blue)
 * - Slow, hypnotic movement
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
          opacity={0.3}
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
  const blobs = useMemo(
    () => [
      {
        position: [-4, 2, -5] as [number, number, number],
        color: '#ccff00',
        scale: 2,
        speed: 0.5,
        distort: 0.4,
      },
      {
        position: [4, -1, -6] as [number, number, number],
        color: '#ff0099',
        scale: 1.5,
        speed: 0.7,
        distort: 0.5,
      },
      {
        position: [0, 3, -8] as [number, number, number],
        color: '#00f0ff',
        scale: 2.5,
        speed: 0.3,
        distort: 0.3,
      },
      {
        position: [-3, -2, -4] as [number, number, number],
        color: '#ff0099',
        scale: 1,
        speed: 0.8,
        distort: 0.6,
      },
      {
        position: [3, 1, -7] as [number, number, number],
        color: '#ccff00',
        scale: 1.8,
        speed: 0.4,
        distort: 0.35,
      },
      {
        position: [0, -3, -5] as [number, number, number],
        color: '#00f0ff',
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

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color('#ccff00'),
      new THREE.Color('#ff0099'),
      new THREE.Color('#00f0ff'),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;

      const colorIndex = Math.floor(Math.random() * colorPalette.length);
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
        size={0.05}
        transparent
        opacity={0.6}
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ccff00" />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#ff0099" />

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
          'linear-gradient(135deg, #050505 0%, #0a0a0a 50%, #050505 100%)',
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
            'radial-gradient(ellipse at center, transparent 0%, rgba(5,5,5,0.8) 100%)',
        }}
      />
    </div>
  );
}

export default Atmosphere;

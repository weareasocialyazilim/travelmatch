'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

/**
 * GiftOrb - Interactive 3D Sphere
 *
 * Tesla/Nvidia inspired liquid metal effect
 * Represents the "Sacred Moment" - the heart of TravelMatch
 */

interface GiftOrbProps {
  color?: string;
  emissiveColor?: string;
  scale?: number;
  distort?: number;
  speed?: number;
  metalness?: number;
  roughness?: number;
}

export function GiftOrb({
  color = '#00FF88',
  emissiveColor = '#00FF88',
  scale = 2.4,
  distort = 0.4,
  speed = 3,
  metalness = 0.8,
  roughness = 0.1,
}: GiftOrbProps) {
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (sphereRef.current) {
      // Subtle mouse-following rotation (Nvidia vibe)
      sphereRef.current.rotation.x = THREE.MathUtils.lerp(
        sphereRef.current.rotation.x,
        state.mouse.y * 0.3,
        0.05,
      );
      sphereRef.current.rotation.y = THREE.MathUtils.lerp(
        sphereRef.current.rotation.y,
        state.mouse.x * 0.3,
        0.05,
      );

      // Subtle breathing scale effect
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02 + 1;
      sphereRef.current.scale.setScalar(scale * breathe);
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1.5}
      floatingRange={[-0.2, 0.2]}
    >
      <Sphere ref={sphereRef} args={[1, 128, 128]} scale={scale}>
        <MeshDistortMaterial
          ref={materialRef}
          color={color}
          speed={speed}
          distort={distort}
          radius={1}
          metalness={metalness}
          roughness={roughness}
          emissive={emissiveColor}
          emissiveIntensity={0.15}
          envMapIntensity={1}
        />
      </Sphere>

      {/* Inner glow core */}
      <Sphere args={[0.8, 32, 32]} scale={scale * 0.4}>
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </Sphere>
    </Float>
  );
}

/**
 * GiftOrbScene - Complete scene with lighting
 */
export function GiftOrbScene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#8B5CF6" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#00FF88" />
      <spotLight
        position={[0, 10, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#FACC15"
        castShadow
      />
      <GiftOrb />
    </>
  );
}

export default GiftOrb;

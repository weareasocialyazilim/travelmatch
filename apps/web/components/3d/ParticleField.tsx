'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { RealtimeStar } from '@/hooks/useRealtimeStars';

interface ParticleFieldProps {
  count?: number;
  size?: number;
  speed?: number;
  interactive?: boolean;
}

export const ParticleField = ({
  count = 5000,
  size = 0.008,
  speed = 0.2,
  interactive = true,
}: ParticleFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorPalette = [
      new THREE.Color('#CCFF00'),
      new THREE.Color('#FF0099'),
      new THREE.Color('#00F0FF'),
      new THREE.Color('#ffffff'),
    ];

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 3 + Math.random() * 10;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const colorChoice =
        Math.random() > 0.9 ? Math.floor(Math.random() * 3) : 3;
      const particleColor = colorPalette[colorChoice] ?? colorPalette[3]!;
      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;
    }

    return { positions, colors };
  }, [count]);

  useFrame(() => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.x += 0.0001 * speed;
    pointsRef.current.rotation.y += 0.0002 * speed;

    if (interactive) {
      const targetX = mouse.x * 0.1;
      const targetY = mouse.y * 0.1;
      pointsRef.current.rotation.x +=
        (targetY - pointsRef.current.rotation.x) * 0.01;
      pointsRef.current.rotation.y +=
        (targetX - pointsRef.current.rotation.y) * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

interface RealtimeStarsFieldProps {
  stars: RealtimeStar[];
  baseSize?: number;
}

export const RealtimeStarsField = ({
  stars,
  baseSize = 0.05,
}: RealtimeStarsFieldProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const meshesRef = useRef<THREE.Group>(null);

  const { positions, colors } = useMemo(() => {
    const posArray = new Float32Array(Math.max(stars.length, 1) * 3);
    const colorArray = new Float32Array(Math.max(stars.length, 1) * 3);

    stars.forEach((star, i) => {
      posArray[i * 3] = star.x;
      posArray[i * 3 + 1] = star.y;
      posArray[i * 3 + 2] = star.z;

      const color = new THREE.Color(star.color);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    });

    return { positions: posArray, colors: colorArray };
  }, [stars]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
  });

  if (stars.length === 0) return null;

  return (
    <group ref={meshesRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={baseSize}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {stars.slice(-10).map((star) => (
        <RealtimeStarMesh key={star.id} star={star} />
      ))}
    </group>
  );
};

const RealtimeStarMesh = ({
  star,
}: {
  star: RealtimeStar & { opacity?: number };
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const pulse =
      Math.sin(state.clock.elapsedTime * 3 + star.createdAt) * 0.3 + 1;
    meshRef.current.scale.setScalar(pulse * star.intensity * 0.1);

    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse * star.intensity * 0.3);
    }
  });

  const opacity = star.opacity ?? 1;

  return (
    <group position={[star.x, star.y, star.z]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color={star.color} transparent opacity={opacity} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={star.color}
          transparent
          opacity={opacity * 0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default ParticleField;

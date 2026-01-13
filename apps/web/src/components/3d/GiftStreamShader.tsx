'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function GiftStreamShader({ color = '#FACC15' }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Akış yolunu belirleyen eğri
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, 2, 0), // Başlangıç (Örn: Paris)
      new THREE.Vector3(0, 4, -2), // Yay tepe noktası
      new THREE.Vector3(5, -2, 0), // Bitiş (Örn: Dubai)
    ]);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Zamanla değişen akış hızı
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity =
        0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 100, 0.03, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={5}
        transparent
      />
    </mesh>
  );
}

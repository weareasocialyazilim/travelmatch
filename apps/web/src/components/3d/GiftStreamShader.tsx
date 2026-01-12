/* Bu dosya Three.js kullanarak Paris koordinatlarından 
  Dubai koordinatlarına bir "Beziler Eğrisi" çizer ve 
  üzerinden neon partiküller akıtır.
*/
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function GiftStreamShader() {
  const points = [
    new THREE.Vector3(-4, 2, 0), // Paris (Soyut)
    new THREE.Vector3(0, 5, -2), // Yay tepe noktası
    new THREE.Vector3(4, -2, 0), // Dubai (Soyut)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const lineRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (lineRef.current) {
      // Shader hızı ve akışkanlık ayarları
      (lineRef.current.material as any).uniforms.uTime.value =
        state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={lineRef}>
      <tubeGeometry args={[curve, 64, 0.05, 8, false]} />
      <meshStandardMaterial
        color="var(--warm-coffee)"
        emissive="var(--warm-coffee)"
        emissiveIntensity={10}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

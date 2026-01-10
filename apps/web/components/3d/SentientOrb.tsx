'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Vertex Shader - Biologically-inspired organic movement
const vertexShader = `
  varying vec2 vUv;
  varying float vDistortion;
  varying vec3 vNormal;
  varying vec3 vPosition;
  uniform float uTime;
  uniform float uFrequency;
  uniform float uAmplitude;
  uniform vec2 uMouse;

  // Simplex 3D Noise - optimized for organic feel
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normal;
    vPosition = position;

    // Multi-layered organic noise - like a living cell
    float noise1 = snoise(position * uFrequency + uTime * 0.3);
    float noise2 = snoise(position * uFrequency * 2.0 + uTime * 0.5) * 0.5;
    float noise3 = snoise(position * uFrequency * 4.0 + uTime * 0.7) * 0.25;

    // Mouse influence - the orb responds to user
    float mouseInfluence = length(uMouse) * 0.5;
    float mousePulse = sin(uTime * 3.0 + mouseInfluence * 10.0) * mouseInfluence;

    // Combined distortion
    float distortion = (noise1 + noise2 + noise3) * uAmplitude + mousePulse * 0.1;
    vDistortion = distortion;

    // Apply displacement along normals
    vec3 newPosition = position + normal * distortion;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

// Fragment Shader - Acid Green to Neon Pink chromatic aberration
const fragmentShader = `
  varying float vDistortion;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform float uOpacity;
  uniform float uChromaticIntensity;

  void main() {
    // Fresnel effect for edge glow
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);

    // Dynamic color mixing based on distortion and fresnel
    float colorMix = vDistortion * 0.5 + 0.5;
    float timePulse = sin(uTime * 0.5) * 0.5 + 0.5;

    // Chromatic aberration effect
    vec3 color1 = mix(uColorA, uColorB, colorMix + sin(uTime * 2.0) * 0.2);
    vec3 color2 = mix(uColorB, uColorC, fresnel + timePulse * 0.3);
    vec3 finalColor = mix(color1, color2, fresnel * uChromaticIntensity);

    // Add subtle iridescence
    float iridescence = sin(vUv.x * 20.0 + uTime) * cos(vUv.y * 20.0 - uTime) * 0.1;
    finalColor += iridescence;

    // Edge glow
    finalColor += fresnel * uColorA * 0.5;

    // Final alpha with edge fade
    float alpha = uOpacity * (1.0 - fresnel * 0.3);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface SentientOrbProps {
  speed?: number;
  scale?: number;
  colorA?: string;
  colorB?: string;
  colorC?: string;
  intensity?: number;
}

export const SentientOrb = ({
  speed = 1,
  scale = 1.8,
  colorA = '#CCFF00', // Acid Green
  colorB = '#FF0099', // Neon Pink
  colorC = '#00F0FF', // Electric Blue
  intensity = 1,
}: SentientOrbProps) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const { mouse, viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrequency: { value: 2.5 },
      uAmplitude: { value: 0.25 * intensity },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uColorC: { value: new THREE.Color(colorC) },
      uOpacity: { value: 0.85 },
      uChromaticIntensity: { value: 0.8 },
    }),
    [colorA, colorB, colorC, intensity],
  );

  useFrame((state, delta) => {
    if (!mesh.current) return;

    const { clock } = state;

    // Time progression
    uniforms.uTime.value = clock.elapsedTime * speed;

    // Smooth mouse following
    const targetX = (mouse.x * viewport.width) / 20;
    const targetY = (mouse.y * viewport.height) / 20;
    uniforms.uMouse.value.x += (targetX - uniforms.uMouse.value.x) * 0.05;
    uniforms.uMouse.value.y += (targetY - uniforms.uMouse.value.y) * 0.05;

    // Gentle rotation
    mesh.current.rotation.x += delta * 0.1 * speed;
    mesh.current.rotation.y += delta * 0.15 * speed;
    mesh.current.rotation.z = Math.sin(clock.elapsedTime * 0.3) * 0.1;

    // Breathing scale effect
    const breathe = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.03;
    mesh.current.scale.setScalar(scale * breathe);
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Inner glow core */}
      <mesh scale={0.6}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={colorA}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </Float>
  );
};

// Simplified version for performance-constrained devices
export const SentientOrbSimple = ({
  scale = 1.8,
  color = '#CCFF00',
}: {
  scale?: number;
  color?: string;
}) => {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.1;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={mesh} scale={scale}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          speed={2}
          distort={0.4}
          radius={1}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
};

export default SentientOrb;

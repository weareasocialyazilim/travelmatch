'use client';

/**
 * LovePortal3D - Award-Winning 3D Shader Portal
 *
 * Awwwards/FWA quality liquid portal with:
 * - Custom vertex/fragment shaders for liquid distortion
 * - Fresnel rim lighting with gold accents
 * - Perlin noise for organic movement
 * - Heartbeat sync pulsing
 * - Interactive mouse-reactive distortion
 * - Deep Orchid (#7E22CE) -> Crimson (#BE123C) -> Gold (#FDE047) gradient
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader material for liquid desire effect
const LiquidDesireShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uColorA: { value: new THREE.Color('#7E22CE') }, // Deep Orchid
    uColorB: { value: new THREE.Color('#BE123C') }, // Crimson
    uColorC: { value: new THREE.Color('#FDE047') }, // Champagne Gold
    uDistortionIntensity: { value: 0.3 },
    uFresnelPower: { value: 2.5 },
    uPulsePhase: { value: 0 },
  },
  vertexShader: `
    uniform float uTime;
    uniform float uDistortionIntensity;
    uniform vec2 uMouse;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDistortion;
    varying vec3 vViewPosition;

    // Simplex 3D Noise
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
      vNormal = normalize(normalMatrix * normal);

      // Multi-layered noise for organic liquid movement
      float noise1 = snoise(position * 2.0 + uTime * 0.3);
      float noise2 = snoise(position * 4.0 - uTime * 0.5) * 0.5;
      float noise3 = snoise(position * 8.0 + uTime * 0.7) * 0.25;

      float totalNoise = noise1 + noise2 + noise3;

      // Mouse influence on distortion
      vec2 mouseOffset = (uMouse - 0.5) * 2.0;
      float mouseInfluence = length(mouseOffset) * 0.2;

      // Heartbeat pulse effect
      float heartbeat = sin(uTime * 2.0) * 0.5 + 0.5;
      heartbeat = pow(heartbeat, 3.0) * 0.1;

      // Apply distortion
      float distortion = totalNoise * uDistortionIntensity * (1.0 + mouseInfluence + heartbeat);
      vDistortion = distortion;

      vec3 newPosition = position + normal * distortion;

      vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
      vViewPosition = -mvPosition.xyz;
      vPosition = newPosition;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    uniform float uFresnelPower;
    uniform float uPulsePhase;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying float vDistortion;
    varying vec3 vViewPosition;

    void main() {
      // Fresnel effect for rim lighting
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);

      // Dynamic color mixing based on distortion and position
      float colorMix1 = (sin(vDistortion * 10.0 + uTime) + 1.0) * 0.5;
      float colorMix2 = (cos(vPosition.y * 3.0 + uTime * 0.5) + 1.0) * 0.5;

      // Three-way color gradient: Orchid -> Crimson -> Gold
      vec3 baseColor = mix(uColorA, uColorB, colorMix1);
      baseColor = mix(baseColor, uColorC, fresnel * 0.6);

      // Add gold rim glow
      vec3 rimColor = uColorC * fresnel * 1.5;

      // Pulsing alpha for depth
      float alpha = 0.85 + sin(uTime * 1.5 + uPulsePhase) * 0.1;

      // Final color with rim light
      vec3 finalColor = baseColor + rimColor * 0.5;

      // Add inner glow
      float innerGlow = smoothstep(0.0, 0.5, 1.0 - fresnel) * 0.3;
      finalColor += uColorB * innerGlow;

      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
};

// The 3D Portal Mesh Component
function LiquidPortalMesh({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { ...LiquidDesireShader.uniforms },
      vertexShader: LiquidDesireShader.vertexShader,
      fragmentShader: LiquidDesireShader.fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
      materialRef.current.uniforms.uMouse.value.set(
        mousePosition.x,
        mousePosition.y
      );

      // Heartbeat scale animation
      const heartbeat = Math.sin(time * 2) * 0.5 + 0.5;
      const pulse = Math.pow(heartbeat, 3) * 0.08;
      meshRef.current.scale.setScalar(1 + pulse);
    }

    // Slow rotation for organic feel
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.35, 256, 64]} />
        <primitive object={shaderMaterial} ref={materialRef} attach="material" />
      </mesh>
    </Float>
  );
}

// Ambient particles floating around the portal
function AmbientParticles() {
  const particlesRef = useRef<THREE.Points>(null!);
  const count = 200;

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorA = new THREE.Color('#7E22CE');
    const colorB = new THREE.Color('#FDE047');

    for (let i = 0; i < count; i++) {
      // Distribute in a sphere around the portal
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 3;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      // Random color between orchid and gold
      const mixRatio = Math.random();
      const color = colorA.clone().lerp(colorB, mixRatio);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    particlesRef.current.rotation.y = time * 0.05;
    particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main Scene Component
function PortalScene() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: 1 - e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#FDE047" />
      <pointLight position={[-5, -5, -5]} intensity={0.5} color="#7E22CE" />
      <spotLight
        position={[0, 10, 0]}
        intensity={0.8}
        color="#BE123C"
        angle={0.5}
        penumbra={1}
      />

      <LiquidPortalMesh mousePosition={mousePosition} />
      <AmbientParticles />

      <Environment preset="night" />
    </>
  );
}

// Exported Component
interface LovePortal3DProps {
  className?: string;
}

export function LovePortal3D({ className = '' }: LovePortal3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <PortalScene />
      </Canvas>
    </div>
  );
}

// Simpler 2D version for fallback
export function LovePortal2D({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Outer glow layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-rose-500/20 to-amber-400/30 rounded-full blur-[100px] animate-pulse" />

      {/* Middle layer */}
      <div
        className="absolute inset-[10%] bg-gradient-to-br from-purple-700/40 via-rose-600/30 to-amber-500/40 rounded-full blur-[60px]"
        style={{
          animation: 'pulse 3s ease-in-out infinite',
        }}
      />

      {/* Core */}
      <div
        className="absolute inset-[30%] bg-gradient-conic from-purple-600 via-rose-500 via-amber-400 to-purple-600 rounded-full blur-[20px]"
        style={{
          animation: 'spin 20s linear infinite',
        }}
      />

      {/* Inner highlight */}
      <div className="absolute inset-[40%] bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full" />
    </div>
  );
}

export default LovePortal3D;

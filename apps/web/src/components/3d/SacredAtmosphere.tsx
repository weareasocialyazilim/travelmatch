'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';

const FluidShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#050505'), // Deep BG
    uColor2: new THREE.Color('#ff007a'), // Neon Pink
    uColor3: new THREE.Color('#8b5cf6'), // Neon Purple
    uColor4: new THREE.Color('#00f2ff'), // Neon Cyan
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    varying vec2 vUv;

    // Simple noise function
    float random (in vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise (in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    #define NUM_OCTAVES 5
    float fbm ( in vec2 _st) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < NUM_OCTAVES; ++i) {
            v += a * noise(_st);
            _st = rot * _st * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
        vec2 uv = vUv;
        float time = uTime * 0.1; // Slow movement
        
        vec2 q = vec2(0.);
        q.x = fbm( uv + 0.00*time);
        q.y = fbm( uv + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm( uv + 1.0*q + vec2(1.7,9.2)+ 0.15*time );
        r.y = fbm( uv + 1.0*q + vec2(8.3,2.8)+ 0.126*time);

        float f = fbm(uv+r);

        // Mix colors based on noise patterns 
        // More subtle dark fluid with neon highlights
        vec3 color = mix(uColor1, uColor2, clamp((f*f)*2.0, 0.0, 1.0));
        color = mix(color, uColor3, clamp(length(q), 0.0, 1.0));
        color = mix(color, uColor4, clamp(length(r.x), 0.0, 1.0));

        // Darken the overall result to keep it "Night Journey"
        gl_FragColor = vec4(color * 0.6, 1.0); 
    }
  `,
);

extend({ FluidShaderMaterial });

const FluidPlane = () => {
  const ref = useRef<any>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.uTime = clock.getElapsedTime();
    }
  });

  return (
    <mesh scale={[2, 2, 1]}>
      {' '}
      {/* Fill screen (orthographic usually) */}
      <planeGeometry args={[2, 2]} />
      {/* @ts-ignore */}
      <fluidShaderMaterial ref={ref} />
    </mesh>
  );
};

export function SacredAtmosphere() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      <Suspense fallback={null}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1] }}
          dpr={[1, 1.5]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <FluidPlane />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default SacredAtmosphere;

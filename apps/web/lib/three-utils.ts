'use client';

import * as THREE from 'three';

// ============================================
// LIGHTING PRESETS
// ============================================

export interface LightingPreset {
  ambient: { color: string; intensity: number };
  directional: {
    color: string;
    intensity: number;
    position: [number, number, number];
  }[];
  point?: {
    color: string;
    intensity: number;
    position: [number, number, number];
  }[];
}

export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  // Default brutalist lighting
  brutalist: {
    ambient: { color: '#ffffff', intensity: 0.3 },
    directional: [
      { color: '#ffffff', intensity: 1.0, position: [5, 10, 5] },
      { color: '#CCFF00', intensity: 0.3, position: [-5, 5, -5] },
    ],
    point: [
      { color: '#FF0099', intensity: 0.5, position: [3, 0, 3] },
      { color: '#00F0FF', intensity: 0.5, position: [-3, 0, -3] },
    ],
  },

  // Golden hour atmosphere
  golden: {
    ambient: { color: '#FFB800', intensity: 0.4 },
    directional: [
      { color: '#FFD700', intensity: 1.2, position: [10, 5, 10] },
      { color: '#FF6B00', intensity: 0.5, position: [-5, 3, -5] },
    ],
    point: [{ color: '#FFB800', intensity: 0.8, position: [0, 2, 5] }],
  },

  // Night mode - sacred moments
  sacred: {
    ambient: { color: '#1a0033', intensity: 0.2 },
    directional: [
      { color: '#FF0099', intensity: 0.8, position: [5, 10, 5] },
      { color: '#00F0FF', intensity: 0.4, position: [-5, 5, -5] },
    ],
    point: [
      { color: '#FF0099', intensity: 1.0, position: [0, 0, 5] },
      { color: '#CCFF00', intensity: 0.3, position: [0, 5, 0] },
    ],
  },

  // Minimal clean
  minimal: {
    ambient: { color: '#ffffff', intensity: 0.5 },
    directional: [{ color: '#ffffff', intensity: 0.8, position: [0, 10, 10] }],
  },
};

// ============================================
// PERFORMANCE UTILITIES
// ============================================

export interface PerformanceLevel {
  level: 'low' | 'medium' | 'high';
  maxParticles: number;
  shaderComplexity: number;
  shadowQuality: number;
  antialias: boolean;
  pixelRatio: number;
}

/**
 * Detects device performance capabilities
 */
export const detectPerformanceLevel = (): PerformanceLevel => {
  if (typeof window === 'undefined') {
    return {
      level: 'medium',
      maxParticles: 3000,
      shaderComplexity: 0.7,
      shadowQuality: 1024,
      antialias: true,
      pixelRatio: 1.5,
    };
  }

  // Check for mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Check WebGL capabilities
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

  let gpuTier = 'medium';

  if (gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Check for high-end GPUs
      if (/NVIDIA|AMD|Apple M[12]/i.test(renderer)) {
        gpuTier = 'high';
      } else if (/Intel|Mali|Adreno [3-5]/i.test(renderer)) {
        gpuTier = 'low';
      }
    }
  }

  // Mobile devices get reduced settings
  if (isMobile) {
    return {
      level: 'low',
      maxParticles: 1000,
      shaderComplexity: 0.3,
      shadowQuality: 512,
      antialias: false,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
  }

  if (gpuTier === 'high') {
    return {
      level: 'high',
      maxParticles: 10000,
      shaderComplexity: 1.0,
      shadowQuality: 2048,
      antialias: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    };
  }

  return {
    level: 'medium',
    maxParticles: 5000,
    shaderComplexity: 0.7,
    shadowQuality: 1024,
    antialias: true,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
  };
};

// ============================================
// COLOR UTILITIES
// ============================================

/**
 * Brand color palette
 */
export const BRAND_COLORS = {
  acid: '#CCFF00',
  neonPink: '#FF0099',
  electricBlue: '#00F0FF',
  deepPurple: '#140024',
  black: '#050505',
  white: '#ffffff',
} as const;

/**
 * Creates a gradient texture for materials
 */
export const createGradientTexture = (
  colors: string[],
  size: number = 256,
): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = 1;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D canvas context');
  }

  const gradient = ctx.createLinearGradient(0, 0, size, 0);

  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
};

/**
 * Lerps between two colors based on time
 */
export const lerpColor = (
  color1: THREE.Color,
  color2: THREE.Color,
  t: number,
): THREE.Color => {
  const result = new THREE.Color();
  result.r = color1.r + (color2.r - color1.r) * t;
  result.g = color1.g + (color2.g - color1.g) * t;
  result.b = color1.b + (color2.b - color1.b) * t;
  return result;
};

// ============================================
// GEOMETRY HELPERS
// ============================================

/**
 * Creates a morphing sphere geometry for organic effects
 */
export const createMorphingSphereGeometry = (
  radius: number = 1,
  segments: number = 64,
): THREE.IcosahedronGeometry => {
  const geometry = new THREE.IcosahedronGeometry(radius, segments);

  // Store original positions for morphing
  const positionAttr = geometry.attributes.position;
  if (positionAttr) {
    const originalPositions = positionAttr.array.slice();
    geometry.userData.originalPositions = originalPositions;
  }

  return geometry;
};

/**
 * Applies noise-based distortion to geometry
 */
export const applyNoiseDistortion = (
  geometry: THREE.BufferGeometry,
  time: number,
  amplitude: number = 0.2,
  frequency: number = 2,
): void => {
  const positionAttr = geometry.attributes.position;
  if (!positionAttr) return;

  const positions = positionAttr.array as Float32Array;
  const original = geometry.userData.originalPositions as
    | Float32Array
    | undefined;

  if (!original) return;

  for (let i = 0; i < positions.length; i += 3) {
    const ox = original[i] ?? 0;
    const oy = original[i + 1] ?? 0;
    const oz = original[i + 2] ?? 0;

    // Simple noise calculation
    const noise =
      Math.sin(ox * frequency + time) *
      Math.cos(oy * frequency + time) *
      Math.sin(oz * frequency + time);

    const length = Math.sqrt(ox * ox + oy * oy + oz * oz);
    if (length === 0) continue;

    const nx = ox / length;
    const ny = oy / length;
    const nz = oz / length;

    positions[i] = ox + nx * noise * amplitude;
    positions[i + 1] = oy + ny * noise * amplitude;
    positions[i + 2] = oz + nz * noise * amplitude;
  }

  positionAttr.needsUpdate = true;
};

// ============================================
// CAMERA UTILITIES
// ============================================

export interface CameraConfig {
  fov: number;
  near: number;
  far: number;
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<string, CameraConfig> = {
  hero: {
    fov: 75,
    near: 0.1,
    far: 1000,
    position: [0, 0, 5],
    target: [0, 0, 0],
  },
  tunnel: {
    fov: 90,
    near: 0.1,
    far: 100,
    position: [0, 0, 0],
    target: [0, 0, -10],
  },
  overview: {
    fov: 60,
    near: 0.1,
    far: 1000,
    position: [10, 10, 10],
    target: [0, 0, 0],
  },
};

// ============================================
// ANIMATION HELPERS
// ============================================

/**
 * Easing functions for smooth animations
 */
export const easing = {
  // Smooth start and end
  easeInOutCubic: (t: number): number =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Smooth start
  easeOutCubic: (t: number): number => 1 - Math.pow(1 - t, 3),

  // Smooth end
  easeInCubic: (t: number): number => t * t * t,

  // Bounce effect
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },

  // Elastic effect
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0
      ? 0
      : t === 1
        ? 1
        : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Spring physics helper
 */
export const springPhysics = (
  current: number,
  target: number,
  velocity: number,
  stiffness: number = 0.1,
  damping: number = 0.8,
): { value: number; velocity: number } => {
  const force = (target - current) * stiffness;
  const newVelocity = (velocity + force) * damping;
  const newValue = current + newVelocity;

  return { value: newValue, velocity: newVelocity };
};

// ============================================
// POST-PROCESSING EFFECTS CONFIG
// ============================================

export const POST_PROCESSING_PRESETS = {
  default: {
    bloom: {
      intensity: 0.5,
      luminanceThreshold: 0.9,
      luminanceSmoothing: 0.025,
    },
    chromaticAberration: {
      offset: [0.002, 0.002],
    },
    vignette: {
      offset: 0.3,
      darkness: 0.5,
    },
  },
  intense: {
    bloom: {
      intensity: 1.5,
      luminanceThreshold: 0.6,
      luminanceSmoothing: 0.05,
    },
    chromaticAberration: {
      offset: [0.005, 0.005],
    },
    vignette: {
      offset: 0.2,
      darkness: 0.8,
    },
  },
  minimal: {
    bloom: {
      intensity: 0.2,
      luminanceThreshold: 0.95,
      luminanceSmoothing: 0.01,
    },
    vignette: {
      offset: 0.4,
      darkness: 0.3,
    },
  },
};

// ============================================
// FPS MONITOR
// ============================================

export class FPSMonitor {
  private frames: number[] = [];
  private lastTime: number = performance.now();
  private callback?: (fps: number) => void;

  constructor(callback?: (fps: number) => void) {
    this.callback = callback;
  }

  tick(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    const fps = 1000 / delta;
    this.frames.push(fps);

    // Keep last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    const avgFps = this.frames.reduce((a, b) => a + b, 0) / this.frames.length;

    if (this.callback) {
      this.callback(Math.round(avgFps));
    }

    return avgFps;
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 60;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  isPerformanceGood(): boolean {
    return this.getAverageFPS() >= 30;
  }
}

const threeUtils = {
  LIGHTING_PRESETS,
  BRAND_COLORS,
  CAMERA_PRESETS,
  POST_PROCESSING_PRESETS,
  detectPerformanceLevel,
  createGradientTexture,
  lerpColor,
  createMorphingSphereGeometry,
  applyNoiseDistortion,
  easing,
  springPhysics,
  FPSMonitor,
};

export default threeUtils;

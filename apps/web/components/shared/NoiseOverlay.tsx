'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';

interface NoiseOverlayProps {
  opacity?: number;
  blendMode?: 'overlay' | 'soft-light' | 'multiply' | 'screen';
  animate?: boolean;
  grain?: 'fine' | 'medium' | 'coarse';
}

/**
 * Analog Film Grain / Noise Overlay
 * Adds texture to break the digital coldness
 */
export const NoiseOverlay = memo(
  ({
    opacity = 0.03,
    blendMode = 'overlay',
    animate = true,
    grain = 'fine',
  }: NoiseOverlayProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState(true);

    // Grain sizes
    const grainSize = {
      fine: 1,
      medium: 2,
      coarse: 3,
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Size canvas
      const resize = () => {
        canvas.width = window.innerWidth / 2; // Lower res for performance
        canvas.height = window.innerHeight / 2;
      };

      resize();
      window.addEventListener('resize', resize);

      // Generate noise frame
      const generateNoise = () => {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        const size = grainSize[grain];

        for (let i = 0; i < data.length; i += 4 * size) {
          const value = Math.random() * 255;
          data[i] = value; // Red
          data[i + 1] = value; // Green
          data[i + 2] = value; // Blue
          data[i + 3] = 255; // Alpha
        }

        ctx.putImageData(imageData, 0, 0);
      };

      // Animation loop
      let animationId: number;
      let lastTime = 0;
      const fps = 24; // Film-like frame rate
      const interval = 1000 / fps;

      const animateNoise = (time: number) => {
        if (!animate) {
          generateNoise();
          return;
        }

        const delta = time - lastTime;

        if (delta >= interval) {
          generateNoise();
          lastTime = time - (delta % interval);
        }

        animationId = requestAnimationFrame(animateNoise);
      };

      animationId = requestAnimationFrame(animateNoise);

      // Visibility optimization
      const handleVisibilityChange = () => {
        setIsVisible(!document.hidden);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('resize', resize);
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
        cancelAnimationFrame(animationId);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps -- grainSize is stable and used in grain callback
    }, [animate, grain]);

    if (!isVisible) return null;

    return (
      <motion.div
        className="fixed inset-0 pointer-events-none z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          mixBlendMode: blendMode,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{
            opacity,
            imageRendering: 'pixelated',
          }}
        />
      </motion.div>
    );
  },
);

NoiseOverlay.displayName = 'NoiseOverlay';

/**
 * Static grain using CSS - lighter weight alternative
 */
export const CSSNoiseOverlay = ({ opacity = 0.04 }: { opacity?: number }) => (
  <div
    className="fixed inset-0 pointer-events-none z-[100]"
    style={{
      opacity,
      backgroundImage:
        'url(\'data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)"/%3E%3C/svg%3E\')',
      backgroundRepeat: 'repeat',
    }}
  />
);

/**
 * Vignette overlay for depth
 */
export const VignetteOverlay = ({
  intensity = 0.5,
  color = '#000000',
}: {
  intensity?: number;
  color?: string;
}) => (
  <div
    className="fixed inset-0 pointer-events-none z-[99]"
    style={{
      background: `radial-gradient(ellipse at 50% 50%, transparent 0%, ${color} 150%)`,
      opacity: intensity,
    }}
  />
);

/**
 * Scanlines effect for retro CRT feel
 */
export const ScanlinesOverlay = ({
  opacity = 0.03,
  speed = 10,
}: {
  opacity?: number;
  speed?: number;
}) => (
  <motion.div
    className="fixed inset-0 pointer-events-none z-[100]"
    style={{
      opacity,
      backgroundImage:
        'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 0, 0, 0.2) 1px, rgba(0, 0, 0, 0.2) 2px)',
      backgroundSize: '100% 2px',
    }}
    animate={{
      backgroundPositionY: ['0px', '4px'],
    }}
    transition={{
      duration: 1 / speed,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

/**
 * Combined cinematic overlay
 */
export const CinematicOverlay = ({
  noiseOpacity = 0.08,
  vignetteIntensity = 0.4,
  showScanlines = false,
}: {
  noiseOpacity?: number;
  vignetteIntensity?: number;
  showScanlines?: boolean;
}) => (
  <>
    <CSSNoiseOverlay opacity={noiseOpacity} />
    <VignetteOverlay intensity={vignetteIntensity} />
    {showScanlines && <ScanlinesOverlay />}
  </>
);

export default NoiseOverlay;

/**
 * useContentReactiveGlow - Content-Reactive Background System
 *
 * Dynamically adjusts corner glows and ambient lighting based on the
 * dominant color of the currently focused/visible content card.
 *
 * Features:
 * - Dominant color extraction from images
 * - Smooth color transitions (withTiming)
 * - Corner glow positioning (top-left, top-right, bottom-left, bottom-right)
 * - Ambient light matching content mood
 *
 * Usage:
 * const { glowColors, updateGlowFromImage } = useContentReactiveGlow();
 * // Call updateGlowFromImage(imageUri) when card comes into view
 */

import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useState, useCallback } from 'react';

interface GlowColors {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}

interface ContentReactiveGlowConfig {
  /** Duration for color transition in ms (default: 800) */
  transitionDuration?: number;
  /** Default glow colors when no content is active */
  defaultColors?: GlowColors;
  /** Intensity multiplier for glow effect (default: 0.3) */
  intensity?: number;
}

const DEFAULT_GLOW_COLORS: GlowColors = {
  topLeft: 'rgba(168, 85, 247, 0.2)', // Purple
  topRight: 'rgba(59, 130, 246, 0.2)', // Blue
  bottomLeft: 'rgba(236, 72, 153, 0.2)', // Pink
  bottomRight: 'rgba(34, 197, 94, 0.2)', // Green
};

/**
 * Extract dominant color from an image URL
 * Note: This is a simplified version. In production, you'd use:
 * - react-native-image-colors for actual color extraction
 * - Or backend service to pre-compute dominant colors
 */
const extractDominantColor = async (imageUri: string): Promise<string> => {
  // Placeholder logic - in reality, use react-native-image-colors
  // For now, we'll map common keywords to colors
  const uri = imageUri.toLowerCase();

  if (
    uri.includes('forest') ||
    uri.includes('nature') ||
    uri.includes('green')
  ) {
    return '#22C55E'; // Green
  } else if (
    uri.includes('ocean') ||
    uri.includes('sea') ||
    uri.includes('water') ||
    uri.includes('blue')
  ) {
    return '#3B82F6'; // Blue
  } else if (uri.includes('sunset') || uri.includes('orange')) {
    return '#F97316'; // Orange
  } else if (uri.includes('mountain') || uri.includes('purple')) {
    return '#A855F7'; // Purple
  } else if (
    uri.includes('beach') ||
    uri.includes('sand') ||
    uri.includes('yellow')
  ) {
    return '#FCD34D'; // Yellow
  } else if (uri.includes('night') || uri.includes('city')) {
    return '#6366F1'; // Indigo
  } else if (uri.includes('pink') || uri.includes('flower')) {
    return '#EC4899'; // Pink
  }

  // Default to lime (brand color)
  return '#BEFF55';
};

/**
 * Generate complementary corner colors from a dominant color
 */
const generateCornerColors = (
  dominantColor: string,
  intensity: number,
): GlowColors => {
  // Parse hex color
  const hex = dominantColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Create variations with different opacity for each corner
  const baseColor = `rgba(${r}, ${g}, ${b}, ${intensity * 0.3})`;
  const lightVariant = `rgba(${Math.min(r + 40, 255)}, ${Math.min(g + 40, 255)}, ${Math.min(b + 40, 255)}, ${intensity * 0.25})`;
  const darkVariant = `rgba(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)}, ${intensity * 0.35})`;
  const complementVariant = `rgba(${255 - r}, ${255 - g}, ${255 - b}, ${intensity * 0.2})`;

  return {
    topLeft: baseColor,
    topRight: lightVariant,
    bottomLeft: complementVariant,
    bottomRight: darkVariant,
  };
};

export const useContentReactiveGlow = ({
  transitionDuration = 800,
  defaultColors = DEFAULT_GLOW_COLORS,
  intensity = 0.3,
}: ContentReactiveGlowConfig = {}) => {
  // Current glow colors state
  const [glowColors, setGlowColors] = useState<GlowColors>(defaultColors);

  // Animated opacity for smooth transitions
  const glowOpacity = useSharedValue(1);

  /**
   * Update glow based on image URI
   */
  const updateGlowFromImage = useCallback(
    async (imageUri: string | null | undefined) => {
      if (!imageUri) {
        // Reset to default colors
        setGlowColors(defaultColors);
        return;
      }

      try {
        // Fade out current glow
        glowOpacity.value = withTiming(0, {
          duration: transitionDuration / 2,
          easing: Easing.out(Easing.ease),
        });

        // Extract dominant color
        const dominantColor = await extractDominantColor(imageUri);

        // Generate corner colors
        const newColors = generateCornerColors(dominantColor, intensity);

        // Update colors after fade out
        setTimeout(() => {
          setGlowColors(newColors);

          // Fade in new glow
          glowOpacity.value = withTiming(1, {
            duration: transitionDuration / 2,
            easing: Easing.in(Easing.ease),
          });
        }, transitionDuration / 2);
      } catch (error) {
        console.warn('Failed to extract dominant color:', error);
        setGlowColors(defaultColors);
      }
    },
    [defaultColors, intensity, transitionDuration, glowOpacity],
  );

  /**
   * Update glow with explicit color
   */
  const updateGlowFromColor = useCallback(
    (color: string) => {
      // Fade out
      glowOpacity.value = withTiming(0, {
        duration: transitionDuration / 2,
        easing: Easing.out(Easing.ease),
      });

      // Generate and apply new colors
      setTimeout(() => {
        const newColors = generateCornerColors(color, intensity);
        setGlowColors(newColors);

        // Fade in
        glowOpacity.value = withTiming(1, {
          duration: transitionDuration / 2,
          easing: Easing.in(Easing.ease),
        });
      }, transitionDuration / 2);
    },
    [intensity, transitionDuration, glowOpacity],
  );

  /**
   * Reset to default colors
   */
  const resetGlow = useCallback(() => {
    updateGlowFromColor('#BEFF55'); // Brand lime
  }, [updateGlowFromColor]);

  return {
    glowColors,
    glowOpacity,
    updateGlowFromImage,
    updateGlowFromColor,
    resetGlow,
  };
};

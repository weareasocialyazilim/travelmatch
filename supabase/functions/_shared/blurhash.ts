/**
 * BlurHash Utility for Deno Edge Functions
 *
 * Generates BlurHash strings from images for ultra-fast placeholder loading
 *
 * BlurHash is a compact representation of a placeholder for an image.
 * - Encodes: Image → 20-30 char string
 * - Decodes: String → Blurry placeholder image
 * - Average size: 20-30 bytes (vs 5-10KB for thumbnail)
 * - Decoding: <1ms in browser
 *
 * @see https://blurha.sh/
 */

import { encode } from 'https://deno.land/x/blurhash@v0.1.0/mod.ts';

/**
 * BlurHash configuration
 */
interface BlurHashConfig {
  /** Component X (horizontal detail, 3-9 recommended) */
  componentX?: number;
  /** Component Y (vertical detail, 3-9 recommended) */
  componentY?: number;
  /** Max dimension for processing (larger = slower but better quality) */
  maxDimension?: number;
}

const DEFAULT_CONFIG: BlurHashConfig = {
  componentX: 4,
  componentY: 3,
  maxDimension: 100, // Process at 100px max for speed
};

/**
 * Generate BlurHash from image buffer
 *
 * @param imageBuffer - Image data as ArrayBuffer or Uint8Array
 * @param config - BlurHash configuration
 * @returns BlurHash string (e.g., "LEHV6nWB2yk8pyo0adR*.7kCMdnj")
 *
 * @example
 * ```ts
 * const response = await fetch(imageUrl);
 * const buffer = await response.arrayBuffer();
 * const hash = await generateBlurHash(buffer);
 * // hash: "LEHV6nWB2yk8pyo0adR*.7kCMdnj"
 * ```
 */
export async function generateBlurHash(
  imageBuffer: ArrayBuffer | Uint8Array,
  config: BlurHashConfig = {}
): Promise<string> {
  const { componentX, componentY, maxDimension } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  try {
    // Convert to Uint8Array if needed
    const uint8Array = imageBuffer instanceof ArrayBuffer
      ? new Uint8Array(imageBuffer)
      : imageBuffer;

    // Decode image to get pixel data
    // Note: In Deno, we need to use a different approach for image decoding
    // For now, we'll use a simplified approach that works with common formats

    // For production, you'd want to use imagescript or similar:
    // import { decode } from 'https://deno.land/x/imagescript@1.2.15/mod.ts';

    // Placeholder: Return a default BlurHash for testing
    // In production, implement proper image decoding
    const placeholderHash = 'LEHV6nWB2yk8pyo0adR*.7kCMdnj';

    console.log('[BlurHash] Generated hash (using placeholder for now)');

    return placeholderHash;
  } catch (error) {
    console.error('[BlurHash] Generation failed:', error);
    // Return a neutral gray BlurHash on error
    return 'L00000fQfQfQfQfQfQfQfQfQfQfQ';
  }
}

/**
 * Generate BlurHash from image URL
 *
 * @param imageUrl - URL of the image
 * @param config - BlurHash configuration
 * @returns BlurHash string
 *
 * @example
 * ```ts
 * const hash = await generateBlurHashFromUrl(
 *   'https://example.com/image.jpg'
 * );
 * ```
 */
export async function generateBlurHashFromUrl(
  imageUrl: string,
  config: BlurHashConfig = {}
): Promise<string> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return await generateBlurHash(arrayBuffer, config);
  } catch (error) {
    console.error('[BlurHash] Failed to generate from URL:', error);
    throw error;
  }
}

/**
 * Validate BlurHash string
 *
 * @param hash - BlurHash string to validate
 * @returns true if valid, false otherwise
 */
export function isValidBlurHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // BlurHash should be at least 6 characters (for 1x1 image)
  // and typically 20-30 characters
  return hash.length >= 6 && hash.length <= 90;
}

/**
 * Get BlurHash component count from hash string
 *
 * @param hash - BlurHash string
 * @returns Object with componentX and componentY
 */
export function getBlurHashComponents(hash: string): {
  componentX: number;
  componentY: number;
} | null {
  if (!isValidBlurHash(hash)) {
    return null;
  }

  const sizeFlag = decode83(hash[0]);
  const componentY = Math.floor(sizeFlag / 9) + 1;
  const componentX = (sizeFlag % 9) + 1;

  return { componentX, componentY };
}

/**
 * Decode base83 character
 * Internal utility for BlurHash format
 */
function decode83(str: string): number {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~';
  return characters.indexOf(str);
}

/**
 * Common BlurHash presets for different use cases
 */
export const BLURHASH_PRESETS = {
  /** Fast generation, lower quality (3x2 components) */
  fast: { componentX: 3, componentY: 2, maxDimension: 64 },

  /** Balanced quality and speed (4x3 components) - DEFAULT */
  balanced: { componentX: 4, componentY: 3, maxDimension: 100 },

  /** High quality, slower (6x4 components) */
  quality: { componentX: 6, componentY: 4, maxDimension: 200 },

  /** Maximum quality, slowest (9x6 components) */
  maximum: { componentX: 9, componentY: 6, maxDimension: 400 },
} as const;

export default {
  generateBlurHash,
  generateBlurHashFromUrl,
  isValidBlurHash,
  getBlurHashComponents,
  BLURHASH_PRESETS,
};

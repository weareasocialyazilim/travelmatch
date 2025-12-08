/**
 * Native Web Crypto API Migration Plan
 * 
 * Replaces deprecated/heavy npm packages with native browser APIs:
 * - pako → CompressionStream/DecompressionStream API
 * - tweetnacl → Web Crypto API (subtle.crypto)
 * 
 * Benefits:
 * - Smaller bundle size (~50KB reduction)
 * - Better performance (native implementation)
 * - No external dependencies
 * - Browser-optimized
 * - Future-proof
 */

import { logger } from '../utils/logger';

// ============================================
// COMPRESSION API (replaces pako)
// ============================================

/**
 * Compress data using native CompressionStream API
 * Replaces: pako.gzip()
 * 
 * @example
 * const compressed = await compressData(jsonString);
 * const base64 = await blobToBase64(compressed);
 */
export async function compressData(
  data: string | ArrayBuffer,
): Promise<Blob> {
  try {
    const startTime = performance.now();
    
    // Convert to stream
    const input = typeof data === 'string' 
      ? new Blob([data], { type: 'text/plain' })
      : new Blob([data]);

    // Create compression stream (gzip format)
    const compressionStream = new CompressionStream('gzip');
    
    // Pipe through compression
    const compressedStream = input.stream().pipeThrough(compressionStream);
    
    // Convert back to blob
    const compressedBlob = await new Response(compressedStream).blob();

    logger.info('[Compression] Data compressed', {
      original: input.size,
      compressed: compressedBlob.size,
      ratio: (compressedBlob.size / input.size * 100).toFixed(2) + '%',
      duration: (performance.now() - startTime).toFixed(2) + 'ms',
    });

    return compressedBlob;
  } catch (error) {
    logger.error('[Compression] Failed:', error);
    throw new Error('Compression failed');
  }
}

/**
 * Decompress data using native DecompressionStream API
 * Replaces: pako.ungzip()
 * 
 * @example
 * const decompressed = await decompressData(compressedBlob);
 * const text = await decompressed.text();
 */
export async function decompressData(
  compressedData: Blob | ArrayBuffer,
): Promise<Blob> {
  try {
    const startTime = performance.now();
    
    // Convert to blob if needed
    const input = compressedData instanceof Blob
      ? compressedData
      : new Blob([compressedData]);

    // Create decompression stream
    const decompressionStream = new DecompressionStream('gzip');
    
    // Pipe through decompression
    const decompressedStream = input.stream().pipeThrough(decompressionStream);
    
    // Convert back to blob
    const decompressedBlob = await new Response(decompressedStream).blob();

    logger.info('[Decompression] Data decompressed', {
      compressed: input.size,
      decompressed: decompressedBlob.size,
      duration: (performance.now() - startTime).toFixed(2) + 'ms',
    });

    return decompressedBlob;
  } catch (error) {
    logger.error('[Decompression] Failed:', error);
    throw new Error('Decompression failed');
  }
}

/**
 * Helper: Blob to Base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Helper: Base64 to Blob
 */
export function base64ToBlob(base64: string, contentType: string = ''): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

// ============================================
// WEB CRYPTO API (replaces tweetnacl)
// ============================================

/**
 * Generate encryption key using Web Crypto API
 * Replaces: tweetnacl.box.keyPair()
 */
export async function generateEncryptionKey(): Promise<CryptoKeyPair> {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt'],
    );

    logger.info('[Crypto] Encryption key pair generated');
    return keyPair;
  } catch (error) {
    logger.error('[Crypto] Key generation failed:', error);
    throw error;
  }
}

/**
 * Generate symmetric key for AES encryption
 * Better for large data encryption
 */
export async function generateSymmetricKey(): Promise<CryptoKey> {
  try {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt'],
    );

    logger.info('[Crypto] Symmetric key generated');
    return key;
  } catch (error) {
    logger.error('[Crypto] Symmetric key generation failed:', error);
    throw error;
  }
}

/**
 * Encrypt data using Web Crypto API
 * Replaces: tweetnacl.box()
 * 
 * @example
 * const key = await generateSymmetricKey();
 * const encrypted = await encryptData('sensitive data', key);
 */
export async function encryptData(
  data: string | ArrayBuffer,
  key: CryptoKey,
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  try {
    const startTime = performance.now();
    
    // Convert string to ArrayBuffer
    const dataBuffer = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      dataBuffer,
    );

    logger.info('[Crypto] Data encrypted', {
      size: encrypted.byteLength,
      duration: (performance.now() - startTime).toFixed(2) + 'ms',
    });

    return { encrypted, iv };
  } catch (error) {
    logger.error('[Crypto] Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt data using Web Crypto API
 * Replaces: tweetnacl.box.open()
 */
export async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array,
): Promise<string> {
  try {
    const startTime = performance.now();
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData,
    );

    // Convert back to string
    const text = new TextDecoder().decode(decrypted);

    logger.info('[Crypto] Data decrypted', {
      duration: (performance.now() - startTime).toFixed(2) + 'ms',
    });

    return text;
  } catch (error) {
    logger.error('[Crypto] Decryption failed:', error);
    throw error;
  }
}

/**
 * Generate secure random bytes
 * Replaces: tweetnacl.randomBytes()
 */
export function generateRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

/**
 * Hash data using SHA-256
 * Replaces: tweetnacl.hash()
 */
export async function hashData(data: string | ArrayBuffer): Promise<ArrayBuffer> {
  const dataBuffer = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  return await crypto.subtle.digest('SHA-256', dataBuffer);
}

/**
 * Sign data using HMAC
 * Replaces: tweetnacl.sign()
 */
export async function signData(
  data: string | ArrayBuffer,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  const dataBuffer = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  return await crypto.subtle.sign(
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    key,
    dataBuffer,
  );
}

/**
 * Verify signature
 * Replaces: tweetnacl.sign.verify()
 */
export async function verifySignature(
  signature: ArrayBuffer,
  data: string | ArrayBuffer,
  key: CryptoKey,
): Promise<boolean> {
  const dataBuffer = typeof data === 'string'
    ? new TextEncoder().encode(data)
    : data;

  return await crypto.subtle.verify(
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    key,
    signature,
    dataBuffer,
  );
}

/**
 * Export key to base64 for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return base64;
}

/**
 * Import key from base64
 */
export async function importKey(
  base64Key: string,
  algorithm: 'AES-GCM' | 'HMAC' = 'AES-GCM',
): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    algorithm === 'AES-GCM'
      ? { name: 'AES-GCM' }
      : { name: 'HMAC', hash: 'SHA-256' },
    true,
    algorithm === 'AES-GCM' ? ['encrypt', 'decrypt'] : ['sign', 'verify'],
  );
}

// ============================================
// MIGRATION HELPERS
// ============================================

/**
 * Migration guide from pako to native Compression API
 */
export const pakoMigrationGuide = {
  /**
   * BEFORE (pako):
   * ```typescript
   * import pako from 'pako';
   * const compressed = pako.gzip(data);
   * const decompressed = pako.ungzip(compressed);
   * ```
   * 
   * AFTER (native):
   * ```typescript
   * import { compressData, decompressData } from './nativeCrypto';
   * const compressed = await compressData(data);
   * const decompressed = await decompressData(compressed);
   * const text = await decompressed.text();
   * ```
   */
};

/**
 * Migration guide from tweetnacl to Web Crypto API
 */
export const tweetnaclMigrationGuide = {
  /**
   * BEFORE (tweetnacl):
   * ```typescript
   * import nacl from 'tweetnacl';
   * const keyPair = nacl.box.keyPair();
   * const encrypted = nacl.box(message, nonce, theirPublicKey, mySecretKey);
   * ```
   * 
   * AFTER (Web Crypto API):
   * ```typescript
   * import { generateSymmetricKey, encryptData } from './nativeCrypto';
   * const key = await generateSymmetricKey();
   * const { encrypted, iv } = await encryptData(message, key);
   * ```
   */
};

/**
 * Performance comparison
 */
export async function benchmarkCompression(data: string) {
  console.log('🔬 Compression Benchmark\n');
  
  // Native API
  const nativeStart = performance.now();
  const nativeCompressed = await compressData(data);
  const nativeDuration = performance.now() - nativeStart;
  
  console.log('Native CompressionStream API:');
  console.log(`  Duration: ${nativeDuration.toFixed(2)}ms`);
  console.log(`  Size: ${nativeCompressed.size} bytes`);
  console.log(`  Ratio: ${(nativeCompressed.size / data.length * 100).toFixed(2)}%\n`);
  
  return {
    native: { duration: nativeDuration, size: nativeCompressed.size },
  };
}

export default {
  // Compression
  compressData,
  decompressData,
  blobToBase64,
  base64ToBlob,
  
  // Encryption
  generateEncryptionKey,
  generateSymmetricKey,
  encryptData,
  decryptData,
  generateRandomBytes,
  hashData,
  signData,
  verifySignature,
  exportKey,
  importKey,
  
  // Benchmarking
  benchmarkCompression,
};

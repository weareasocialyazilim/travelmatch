import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import {
  encodeBase64,
  decodeBase64,
  encodeUTF8,
  decodeUTF8,
} from 'tweetnacl-util';
import { logger } from '../utils/logger';

const PRIVATE_KEY_STORAGE_KEY = 'lovendo_private_key';
const PUBLIC_KEY_STORAGE_KEY = 'lovendo_public_key';

const LEGACY_PRIVATE_KEY_STORAGE_KEYS = ['lovendo_private_key'];
const LEGACY_PUBLIC_KEY_STORAGE_KEYS = ['lovendo_public_key'];

async function getSecureItemWithLegacyFallback(
  key: string,
  legacyKeys: string[],
): Promise<string | null> {
  const currentVal = await SecureStore.getItemAsync(key);
  if (currentVal) return currentVal;

  for (const legacyKey of legacyKeys) {
    if (legacyKey === key) continue;
    const legacyVal = await SecureStore.getItemAsync(legacyKey);
    if (legacyVal) {
      await SecureStore.setItemAsync(key, legacyVal);
      await SecureStore.deleteItemAsync(legacyKey);
      return legacyVal;
    }
  }

  return null;
}

async function setSecureItemAndCleanupLegacy(
  key: string,
  value: string,
  legacyKeys: string[],
): Promise<void> {
  await SecureStore.setItemAsync(key, value);
  await Promise.all(
    legacyKeys
      .filter((k) => k !== key)
      .map((k) => SecureStore.deleteItemAsync(k)),
  );
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  nonce: string;
  message: string; // Base64 encoded encrypted message
}

/**
 * Encryption Service
 * Handles End-to-End Encryption using Curve25519XSalsa20Poly1305 (Box)
 */
export const encryptionService = {
  /**
   * Initialize keys for the current user
   * Checks if keys exist, if not generates them
   */
  initializeKeys: async (): Promise<KeyPair> => {
    try {
      // Check if keys already exist (with legacy migration)
      const storedPrivateKey = await getSecureItemWithLegacyFallback(
        PRIVATE_KEY_STORAGE_KEY,
        LEGACY_PRIVATE_KEY_STORAGE_KEYS,
      );
      const storedPublicKey = await getSecureItemWithLegacyFallback(
        PUBLIC_KEY_STORAGE_KEY,
        LEGACY_PUBLIC_KEY_STORAGE_KEYS,
      );

      if (storedPrivateKey && storedPublicKey) {
        return {
          publicKey: storedPublicKey,
          privateKey: storedPrivateKey,
        };
      }

      // Generate new key pair
      const keyPair = nacl.box.keyPair();
      const publicKeyBase64 = encodeBase64(keyPair.publicKey);
      const privateKeyBase64 = encodeBase64(keyPair.secretKey);

      // Store keys securely
      await setSecureItemAndCleanupLegacy(
        PRIVATE_KEY_STORAGE_KEY,
        privateKeyBase64,
        LEGACY_PRIVATE_KEY_STORAGE_KEYS,
      );
      await setSecureItemAndCleanupLegacy(
        PUBLIC_KEY_STORAGE_KEY,
        publicKeyBase64,
        LEGACY_PUBLIC_KEY_STORAGE_KEYS,
      );

      logger.info('[Encryption] New key pair generated');

      return {
        publicKey: publicKeyBase64,
        privateKey: privateKeyBase64,
      };
    } catch (error) {
      logger.error('[Encryption] Failed to initialize keys', error);
      throw error;
    }
  },

  /**
   * Get the user's public key
   */
  getPublicKey: async (): Promise<string | null> => {
    return await getSecureItemWithLegacyFallback(
      PUBLIC_KEY_STORAGE_KEY,
      LEGACY_PUBLIC_KEY_STORAGE_KEYS,
    );
  },

  /**
   * Encrypt a message for a recipient
   * @param message - The plain text message
   * @param recipientPublicKeyBase64 - The recipient's public key
   */
  encrypt: async (
    message: string,
    recipientPublicKeyBase64: string,
  ): Promise<EncryptedMessage> => {
    try {
      const privateKeyBase64 = await getSecureItemWithLegacyFallback(
        PRIVATE_KEY_STORAGE_KEY,
        LEGACY_PRIVATE_KEY_STORAGE_KEYS,
      );
      if (!privateKeyBase64) throw new Error('Private key not found');

      const privateKey = decodeBase64(privateKeyBase64);
      const recipientPublicKey = decodeBase64(recipientPublicKeyBase64);
      const nonce = nacl.randomBytes(nacl.box.nonceLength);
      const messageUint8 = decodeUTF8(message);

      const encryptedBox = nacl.box(
        messageUint8,
        nonce,
        recipientPublicKey,
        privateKey,
      );

      return {
        nonce: encodeBase64(nonce),
        message: encodeBase64(encryptedBox),
      };
    } catch (error) {
      logger.error('[Encryption] Encryption failed', error);
      throw error;
    }
  },

  /**
   * Decrypt a message from a sender
   * @param encryptedMessageBase64 - The encrypted message (Base64)
   * @param nonceBase64 - The nonce used for encryption (Base64)
   * @param senderPublicKeyBase64 - The sender's public key
   */
  decrypt: async (
    encryptedMessageBase64: string,
    nonceBase64: string,
    senderPublicKeyBase64: string,
  ): Promise<string> => {
    try {
      const privateKeyBase64 = await getSecureItemWithLegacyFallback(
        PRIVATE_KEY_STORAGE_KEY,
        LEGACY_PRIVATE_KEY_STORAGE_KEYS,
      );
      if (!privateKeyBase64) throw new Error('Private key not found');

      const privateKey = decodeBase64(privateKeyBase64);
      const senderPublicKey = decodeBase64(senderPublicKeyBase64);
      const nonce = decodeBase64(nonceBase64);
      const encryptedMessage = decodeBase64(encryptedMessageBase64);

      const decryptedMessage = nacl.box.open(
        encryptedMessage,
        nonce,
        senderPublicKey,
        privateKey,
      );

      if (!decryptedMessage) {
        throw new Error('Decryption failed - message integrity check failed');
      }

      return encodeUTF8(decryptedMessage);
    } catch (error) {
      logger.error('[Encryption] Decryption failed', error);
      throw error;
    }
  },

  /**
   * Clear keys (e.g. on logout/account deletion)
   */
  clearKeys: async () => {
    await SecureStore.deleteItemAsync(PRIVATE_KEY_STORAGE_KEY);
    await SecureStore.deleteItemAsync(PUBLIC_KEY_STORAGE_KEY);
    await Promise.all(
      [
        ...LEGACY_PRIVATE_KEY_STORAGE_KEYS,
        ...LEGACY_PUBLIC_KEY_STORAGE_KEYS,
      ].map((k) => SecureStore.deleteItemAsync(k)),
    );
  },
};

/**
 * Encryption Service Tests
 * Tests for End-to-End Encryption using NaCl (Curve25519-XSalsa20-Poly1305)
 */

import { encryptionService } from '../encryptionService';

// Mock expo-secure-store
const mockSecureStore: Record<string, string> = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key: string) =>
    Promise.resolve(mockSecureStore[key] || null),
  ),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockSecureStore[key] = value;
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    delete mockSecureStore[key];
    return Promise.resolve();
  }),
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('encryptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock storage
    Object.keys(mockSecureStore).forEach((key) => delete mockSecureStore[key]);
  });

  describe('initializeKeys', () => {
    it('should generate new key pair when none exists', async () => {
      const keyPair = await encryptionService.initializeKeys();

      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
      // Base64 encoded keys should be substantial length
      expect(keyPair.publicKey.length).toBeGreaterThan(30);
      expect(keyPair.privateKey.length).toBeGreaterThan(30);
    });

    it('should return existing keys if already initialized', async () => {
      // First initialization
      const keyPair1 = await encryptionService.initializeKeys();

      // Second initialization should return same keys
      const keyPair2 = await encryptionService.initializeKeys();

      expect(keyPair2.publicKey).toBe(keyPair1.publicKey);
      expect(keyPair2.privateKey).toBe(keyPair1.privateKey);
    });

    it('should generate unique keys each time when cleared', async () => {
      const keyPair1 = await encryptionService.initializeKeys();
      await encryptionService.clearKeys();
      const keyPair2 = await encryptionService.initializeKeys();

      expect(keyPair2.publicKey).not.toBe(keyPair1.publicKey);
      expect(keyPair2.privateKey).not.toBe(keyPair1.privateKey);
    });
  });

  describe('getPublicKey', () => {
    it('should return null when no keys exist', async () => {
      const publicKey = await encryptionService.getPublicKey();
      expect(publicKey).toBeNull();
    });

    it('should return public key after initialization', async () => {
      const keyPair = await encryptionService.initializeKeys();
      const publicKey = await encryptionService.getPublicKey();

      expect(publicKey).toBe(keyPair.publicKey);
    });
  });

  describe('encrypt', () => {
    it('should encrypt a message for a recipient', async () => {
      // Setup sender keys
      const senderKeys = await encryptionService.initializeKeys();

      // Create recipient keys (simulate another user)
      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      // Switch back to sender
      await encryptionService.clearKeys();
      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const message = 'Hello, this is a secret message!';
      const encrypted = await encryptionService.encrypt(
        message,
        recipientKeys.publicKey,
      );

      expect(encrypted.nonce).toBeDefined();
      expect(encrypted.message).toBeDefined();
      expect(typeof encrypted.nonce).toBe('string');
      expect(typeof encrypted.message).toBe('string');
      // Encrypted message should be different from original
      expect(encrypted.message).not.toBe(message);
    });

    it('should throw error when private key not found', async () => {
      await encryptionService.clearKeys();

      await expect(
        encryptionService.encrypt('message', 'somePublicKey'),
      ).rejects.toThrow('Private key not found');
    });

    it('should generate unique nonce for each encryption', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      // Create recipient
      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      // Switch back to sender
      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const message = 'Same message';
      const encrypted1 = await encryptionService.encrypt(
        message,
        recipientKeys.publicKey,
      );
      const encrypted2 = await encryptionService.encrypt(
        message,
        recipientKeys.publicKey,
      );

      expect(encrypted1.nonce).not.toBe(encrypted2.nonce);
      expect(encrypted1.message).not.toBe(encrypted2.message);
    });
  });

  describe('decrypt', () => {
    it('should decrypt a message from sender', async () => {
      // Setup sender keys
      const senderKeys = await encryptionService.initializeKeys();
      const senderPublicKey = senderKeys.publicKey;

      // Create recipient keys
      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();
      const recipientPublicKey = recipientKeys.publicKey;

      // Sender encrypts message
      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const originalMessage = 'Hello, this is a secret!';
      const encrypted = await encryptionService.encrypt(
        originalMessage,
        recipientPublicKey,
      );

      // Recipient decrypts message
      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      const decrypted = await encryptionService.decrypt(
        encrypted.message,
        encrypted.nonce,
        senderPublicKey,
      );

      expect(decrypted).toBe(originalMessage);
    });

    it('should throw error when private key not found', async () => {
      await encryptionService.clearKeys();

      await expect(
        encryptionService.decrypt(
          'encryptedMessage',
          'nonce',
          'senderPublicKey',
        ),
      ).rejects.toThrow('Private key not found');
    });

    it('should throw error for invalid encrypted message', async () => {
      await encryptionService.initializeKeys();

      // Create a fake sender public key
      await encryptionService.clearKeys();
      const fakeKeys = await encryptionService.initializeKeys();

      await expect(
        encryptionService.decrypt(
          'invalidBase64===',
          'invalidNonce===',
          fakeKeys.publicKey,
        ),
      ).rejects.toThrow();
    });

    it('should handle unicode messages correctly', async () => {
      // Setup sender
      const senderKeys = await encryptionService.initializeKeys();

      // Create recipient
      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      // Sender encrypts
      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const unicodeMessage = 'Merhaba! Nasılsın? Geyik + Rock = Seyahat';
      const encrypted = await encryptionService.encrypt(
        unicodeMessage,
        recipientKeys.publicKey,
      );

      // Recipient decrypts
      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      const decrypted = await encryptionService.decrypt(
        encrypted.message,
        encrypted.nonce,
        senderKeys.publicKey,
      );

      expect(decrypted).toBe(unicodeMessage);
    });

    it('should handle emoji messages correctly', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const emojiMessage = 'Hello! How are you?';
      const encrypted = await encryptionService.encrypt(
        emojiMessage,
        recipientKeys.publicKey,
      );

      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      const decrypted = await encryptionService.decrypt(
        encrypted.message,
        encrypted.nonce,
        senderKeys.publicKey,
      );

      expect(decrypted).toBe(emojiMessage);
    });

    it('should handle long messages correctly', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const longMessage = 'A'.repeat(10000);
      const encrypted = await encryptionService.encrypt(
        longMessage,
        recipientKeys.publicKey,
      );

      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      const decrypted = await encryptionService.decrypt(
        encrypted.message,
        encrypted.nonce,
        senderKeys.publicKey,
      );

      expect(decrypted).toBe(longMessage);
    });
  });

  describe('clearKeys', () => {
    it('should clear all stored keys', async () => {
      await encryptionService.initializeKeys();

      // Verify keys exist
      expect(await encryptionService.getPublicKey()).not.toBeNull();

      await encryptionService.clearKeys();

      // Verify keys are cleared
      expect(await encryptionService.getPublicKey()).toBeNull();
    });
  });

  describe('security properties', () => {
    it('should not be able to decrypt with wrong sender public key', async () => {
      // Setup real sender
      const senderKeys = await encryptionService.initializeKeys();

      // Create attacker
      await encryptionService.clearKeys();
      const attackerKeys = await encryptionService.initializeKeys();

      // Create recipient
      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      // Sender encrypts
      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const encrypted = await encryptionService.encrypt(
        'Secret message',
        recipientKeys.publicKey,
      );

      // Recipient tries to decrypt with attacker's public key
      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      await expect(
        encryptionService.decrypt(
          encrypted.message,
          encrypted.nonce,
          attackerKeys.publicKey, // Wrong sender key
        ),
      ).rejects.toThrow();
    });

    it('should not be able to decrypt with tampered message', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const encrypted = await encryptionService.encrypt(
        'Original message',
        recipientKeys.publicKey,
      );

      // Tamper with the encrypted message
      const tamperedMessage = encrypted.message.slice(0, -4) + 'XXXX';

      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      await expect(
        encryptionService.decrypt(
          tamperedMessage,
          encrypted.nonce,
          senderKeys.publicKey,
        ),
      ).rejects.toThrow();
    });

    it('should not be able to decrypt with wrong nonce', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const encrypted = await encryptionService.encrypt(
        'Message',
        recipientKeys.publicKey,
      );

      // Create a different nonce
      const encrypted2 = await encryptionService.encrypt(
        'Different message',
        recipientKeys.publicKey,
      );

      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      await expect(
        encryptionService.decrypt(
          encrypted.message,
          encrypted2.nonce, // Wrong nonce
          senderKeys.publicKey,
        ),
      ).rejects.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const encrypted = await encryptionService.encrypt(
        '',
        recipientKeys.publicKey,
      );

      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      const decrypted = await encryptionService.decrypt(
        encrypted.message,
        encrypted.nonce,
        senderKeys.publicKey,
      );

      expect(decrypted).toBe('');
    });

    it('should handle special characters', async () => {
      const senderKeys = await encryptionService.initializeKeys();

      await encryptionService.clearKeys();
      const recipientKeys = await encryptionService.initializeKeys();

      mockSecureStore['lovendo_private_key'] = senderKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = senderKeys.publicKey;

      const specialMessage = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~\n\t\r';
      const encrypted = await encryptionService.encrypt(
        specialMessage,
        recipientKeys.publicKey,
      );

      mockSecureStore['lovendo_private_key'] = recipientKeys.privateKey;
      mockSecureStore['lovendo_public_key'] = recipientKeys.publicKey;

      const decrypted = await encryptionService.decrypt(
        encrypted.message,
        encrypted.nonce,
        senderKeys.publicKey,
      );

      expect(decrypted).toBe(specialMessage);
    });
  });
});

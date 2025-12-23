/**
 * Mock for expo-crypto
 */
module.exports = {
  digestStringAsync: jest.fn(async (algorithm, data) => {
    // Return a mock hash
    return 'mock-hash-' + data.substring(0, 8);
  }),
  getRandomBytesAsync: jest.fn(async (length) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }),
  randomUUID: jest.fn(
    () => 'mock-uuid-' + Math.random().toString(36).substring(7),
  ),
  CryptoDigestAlgorithm: {
    SHA1: 'SHA-1',
    SHA256: 'SHA-256',
    SHA384: 'SHA-384',
    SHA512: 'SHA-512',
    MD2: 'MD2',
    MD4: 'MD4',
    MD5: 'MD5',
  },
  CryptoEncoding: {
    HEX: 'hex',
    BASE64: 'base64',
  },
};

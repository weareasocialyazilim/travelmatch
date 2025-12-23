/**
 * Mock for expo-clipboard
 */

module.exports = {
  setStringAsync: jest.fn().mockResolvedValue(undefined),
  getStringAsync: jest.fn().mockResolvedValue(''),
  setImageAsync: jest.fn().mockResolvedValue(undefined),
  hasStringAsync: jest.fn().mockResolvedValue(false),
  hasImageAsync: jest.fn().mockResolvedValue(false),
  getUrlAsync: jest.fn().mockResolvedValue(''),
  setUrlAsync: jest.fn().mockResolvedValue(undefined),
  hasUrlAsync: jest.fn().mockResolvedValue(false),
  addClipboardListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  removeClipboardListener: jest.fn(),
};

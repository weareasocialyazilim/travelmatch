/**
 * Mock for react-native-mmkv
 */
const mockStorage = new Map();

const MMKV = jest.fn().mockImplementation(() => ({
  set: jest.fn((key, value) => mockStorage.set(key, value)),
  getString: jest.fn((key) => mockStorage.get(key)),
  getNumber: jest.fn((key) => mockStorage.get(key)),
  getBoolean: jest.fn((key) => mockStorage.get(key)),
  getBuffer: jest.fn((key) => mockStorage.get(key)),
  contains: jest.fn((key) => mockStorage.has(key)),
  delete: jest.fn((key) => mockStorage.delete(key)),
  getAllKeys: jest.fn(() => Array.from(mockStorage.keys())),
  clearAll: jest.fn(() => mockStorage.clear()),
  recrypt: jest.fn(),
  addOnValueChangedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

const createMMKV = jest.fn(() => ({
  set: jest.fn((key, value) => mockStorage.set(key, value)),
  getString: jest.fn((key) => mockStorage.get(key)),
  getNumber: jest.fn((key) => mockStorage.get(key)),
  getBoolean: jest.fn((key) => mockStorage.get(key)),
  getBuffer: jest.fn((key) => mockStorage.get(key)),
  contains: jest.fn((key) => mockStorage.has(key)),
  delete: jest.fn((key) => mockStorage.delete(key)),
  getAllKeys: jest.fn(() => Array.from(mockStorage.keys())),
  clearAll: jest.fn(() => mockStorage.clear()),
  recrypt: jest.fn(),
  addOnValueChangedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

module.exports = {
  MMKV,
  createMMKV,
};

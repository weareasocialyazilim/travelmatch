/**
 * Mock for expo-secure-store
 */
const mockStorage = new Map();

module.exports = {
  getItemAsync: jest.fn(async (key) => mockStorage.get(key) || null),
  setItemAsync: jest.fn(async (key, value) => {
    mockStorage.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockStorage.delete(key);
  }),
  isAvailableAsync: jest.fn(async () => true),
  AFTER_FIRST_UNLOCK: 1,
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 2,
  ALWAYS: 3,
  ALWAYS_THIS_DEVICE_ONLY: 4,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 5,
  WHEN_UNLOCKED: 6,
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 7,
};

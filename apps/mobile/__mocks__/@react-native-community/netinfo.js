/**
 * Mock for @react-native-community/netinfo
 */

const mockState = {
  type: 'wifi',
  isConnected: true,
  isInternetReachable: true,
  details: {
    isConnectionExpensive: false,
    cellularGeneration: null,
    ssid: 'MockWiFi',
    strength: 90,
    ipAddress: '192.168.1.1',
    subnet: '255.255.255.0',
    frequency: 2.4,
  },
};

const listeners = new Set();

const NetInfo = {
  fetch: jest.fn().mockResolvedValue(mockState),
  refresh: jest.fn().mockResolvedValue(mockState),
  configure: jest.fn(),
  addEventListener: jest.fn((callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }),
  useNetInfo: jest.fn(() => mockState),
  // Helper for tests to trigger network changes
  __mockNetworkChange: (newState) => {
    listeners.forEach((callback) => callback(newState));
  },
};

module.exports = NetInfo;
module.exports.default = NetInfo;

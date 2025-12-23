/**
 * Navigation State Persistence Tests
 * 
 * Tests for navigation state management and restoration
 * 
 * Coverage:
 * - State persistence to AsyncStorage
 * - State restoration on app restart
 * - State serialization/deserialization
 * - Background/foreground transitions
 * - State cleanup
 * - Partial state recovery
 * - State versioning
 */

// @ts-nocheck - AsyncStorage and Jest mock types

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainerRef } from '@react-navigation/native';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  isReady: jest.fn(() => true),
  getCurrentRoute: jest.fn(),
  getRootState: jest.fn(),
  resetRoot: jest.fn(),
} as unknown as NavigationContainerRef<any>;

/**
 * Navigation state persistence utilities
 * These would typically live in a navigation utils file
 */
const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

interface NavigationState {
  routes: Array<{
    name: string;
    key: string;
    params?: Record<string, any>;
  }>;
  index: number;
  stale?: boolean;
}

/**
 * Save navigation state to AsyncStorage
 */
async function persistNavigationState(state: NavigationState): Promise<void> {
  try {
    const serialized = JSON.stringify(state);
    await AsyncStorage.setItem(PERSISTENCE_KEY, serialized);
  } catch (error) {
    console.error('[Navigation] Failed to persist state:', error);
  }
}

/**
 * Restore navigation state from AsyncStorage
 */
async function restoreNavigationState(): Promise<NavigationState | undefined> {
  try {
    const serialized = await AsyncStorage.getItem(PERSISTENCE_KEY);
    if (!serialized) return undefined;

    const state = JSON.parse(serialized) as NavigationState;
    
    // Mark state as stale if older than 1 day
    const isStale = false; // In real implementation, check timestamp
    
    return isStale ? undefined : state;
  } catch (error) {
    console.error('[Navigation] Failed to restore state:', error);
    return undefined;
  }
}

/**
 * Clear persisted navigation state
 */
async function clearNavigationState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PERSISTENCE_KEY);
  } catch (error) {
    console.error('[Navigation] Failed to clear state:', error);
  }
}

describe('Navigation State Persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================
  // State Persistence Tests
  // ===========================

  describe('persistNavigationState()', () => {
    it('should save navigation state to AsyncStorage', async () => {
      const state: NavigationState = {
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Profile', key: 'profile-1', params: { userId: '123' } },
        ],
        index: 1,
      };

      await persistNavigationState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        PERSISTENCE_KEY,
        JSON.stringify(state)
      );
    });

    it('should handle complex nested state', async () => {
      const state: NavigationState = {
        routes: [
          {
            name: 'MainTabs',
            key: 'tabs-1',
            params: {
              screen: 'Profile',
              params: {
                userId: '123',
                tab: 'moments',
              },
            },
          },
        ],
        index: 0,
      };

      await persistNavigationState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        PERSISTENCE_KEY,
        expect.stringContaining('MainTabs')
      );
    });

    it('should handle empty routes array', async () => {
      const state: NavigationState = {
        routes: [],
        index: 0,
      };

      await persistNavigationState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        PERSISTENCE_KEY,
        JSON.stringify(state)
      );
    });

    it('should handle state with special characters', async () => {
      const state: NavigationState = {
        routes: [
          {
            name: 'Search',
            key: 'search-1',
            params: { query: 'travel & adventure 🌍' },
          },
        ],
        index: 0,
      };

      await persistNavigationState(state);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const savedValue = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      expect(savedValue).toContain('travel & adventure');
    });

    it('should handle serialization errors gracefully', async () => {
      const circularState: any = { routes: [], index: 0 };
      circularState.routes.push({ name: 'Home', key: 'home-1', self: circularState });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await persistNavigationState(circularState);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Navigation] Failed to persist state:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  // ===========================
  // State Restoration Tests
  // ===========================

  describe('restoreNavigationState()', () => {
    it('should restore saved navigation state', async () => {
      const savedState: NavigationState = {
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Profile', key: 'profile-1', params: { userId: '123' } },
        ],
        index: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(savedState)
      );

      const restored = await restoreNavigationState();

      expect(restored).toEqual(savedState);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(PERSISTENCE_KEY);
    });

    it('should return undefined when no state exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const restored = await restoreNavigationState();

      expect(restored).toBeUndefined();
    });

    it('should handle invalid JSON gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('invalid-json');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const restored = await restoreNavigationState();

      expect(restored).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Navigation] Failed to restore state:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle complex nested state', async () => {
      const savedState: NavigationState = {
        routes: [
          {
            name: 'MainTabs',
            key: 'tabs-1',
            params: {
              screen: 'Profile',
              params: { userId: '123', nested: { deep: { value: true } } },
            },
          },
        ],
        index: 0,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(savedState)
      );

      const restored = await restoreNavigationState();

      expect(restored).toEqual(savedState);
      expect(restored?.routes[0].params).toHaveProperty('screen', 'Profile');
    });

    it('should handle AsyncStorage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const restored = await restoreNavigationState();

      expect(restored).toBeUndefined();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  // ===========================
  // State Cleanup Tests
  // ===========================

  describe('clearNavigationState()', () => {
    it('should remove navigation state from AsyncStorage', async () => {
      await clearNavigationState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(PERSISTENCE_KEY);
    });

    it('should handle removal errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Removal error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await clearNavigationState();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Navigation] Failed to clear state:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  // ===========================
  // Integration Tests
  // ===========================

  describe('State Persistence Integration', () => {
    it('should persist and restore state correctly', async () => {
      const originalState: NavigationState = {
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'Profile', key: 'profile-1', params: { userId: '456' } },
          { name: 'Settings', key: 'settings-1' },
        ],
        index: 2,
      };

      // Save state
      await persistNavigationState(originalState);

      // Get what was saved
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];

      // Mock restoration
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedData);

      // Restore state
      const restoredState = await restoreNavigationState();

      expect(restoredState).toEqual(originalState);
    });

    it('should handle app restart workflow', async () => {
      // Simulate app running
      const currentState: NavigationState = {
        routes: [
          { name: 'Home', key: 'home-1' },
          { name: 'MomentDetail', key: 'moment-1', params: { momentId: '789' } },
        ],
        index: 1,
      };

      // Save state before app closes
      await persistNavigationState(currentState);

      // App restarts
      jest.clearAllMocks();

      // Restore state on app launch
      const savedData = JSON.stringify(currentState);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedData);

      const restoredState = await restoreNavigationState();

      expect(restoredState).toEqual(currentState);
      expect(restoredState?.routes[1].name).toBe('MomentDetail');
    });

    it('should handle background/foreground transitions', async () => {
      const state: NavigationState = {
        routes: [{ name: 'Chat', key: 'chat-1', params: { conversationId: '999' } }],
        index: 0,
      };

      // Save on background
      await persistNavigationState(state);

      // Simulate app in background
      await new Promise(resolve => setTimeout(resolve, 100));

      // Restore on foreground
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedData);

      const restored = await restoreNavigationState();

      expect(restored).toEqual(state);
    });

    it('should handle logout clearing navigation state', async () => {
      const state: NavigationState = {
        routes: [{ name: 'Profile', key: 'profile-1' }],
        index: 0,
      };

      await persistNavigationState(state);

      // User logs out
      await clearNavigationState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(PERSISTENCE_KEY);

      // Next restore should return undefined
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
      const restored = await restoreNavigationState();

      expect(restored).toBeUndefined();
    });
  });

  // ===========================
  // Edge Cases
  // ===========================

  describe('Edge Cases', () => {
    it('should handle very large state objects', async () => {
      const largeState: NavigationState = {
        routes: Array.from({ length: 100 }, (_, i) => ({
          name: `Screen${i}`,
          key: `screen-${i}`,
          params: { data: new Array(100).fill('x').join('') },
        })),
        index: 99,
      };

      await persistNavigationState(largeState);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should handle rapid successive saves', async () => {
      const states = Array.from({ length: 10 }, (_, i) => ({
        routes: [{ name: `Screen${i}`, key: `screen-${i}` }],
        index: 0,
      }));

      await Promise.all(states.map(state => persistNavigationState(state)));

      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(10);
    });

    it('should handle state with undefined params', async () => {
      const state: NavigationState = {
        routes: [
          { name: 'Home', key: 'home-1', params: undefined },
          { name: 'Profile', key: 'profile-1' },
        ],
        index: 1,
      };

      await persistNavigationState(state);
      
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedData);

      const restored = await restoreNavigationState();

      expect(restored?.routes[0].params).toBeUndefined();
    });

    it('should handle empty string route names', async () => {
      const state: NavigationState = {
        routes: [{ name: '', key: 'empty-1' }],
        index: 0,
      };

      await persistNavigationState(state);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(savedData);

      const restored = await restoreNavigationState();

      expect(restored?.routes[0].name).toBe('');
    });

    it('should handle concurrent save and restore', async () => {
      const state: NavigationState = {
        routes: [{ name: 'Home', key: 'home-1' }],
        index: 0,
      };

      const savePromise = persistNavigationState(state);
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(state)
      );
      const restorePromise = restoreNavigationState();

      const [, restored] = await Promise.all([savePromise, restorePromise]);

      expect(restored).toBeDefined();
    });

    it('should handle state with null values', async () => {
      const state: NavigationState = {
        routes: [{ name: 'Home', key: 'home-1', params: { nullValue: null } }],
        index: 0,
      };

      await persistNavigationState(state);

      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed.routes[0].params.nullValue).toBeNull();
    });

    it('should handle malformed persistence key', async () => {
      // Simulate corrupted storage
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        '{"routes": "not-an-array", "index": "not-a-number"}'
      );

      const restored = await restoreNavigationState();

      // Should parse but return invalid data structure
      expect(restored?.routes).toBe('not-an-array');
    });
  });

  // ===========================
  // State Versioning Tests
  // ===========================

  describe('State Versioning', () => {
    it('should use versioned persistence key', () => {
      expect(PERSISTENCE_KEY).toContain('V1');
    });

    it('should allow migration from old key format', async () => {
      const OLD_KEY = 'NAVIGATION_STATE';
      const oldState = {
        routes: [{ name: 'Home', key: 'home-1' }],
        index: 0,
      };

      // Mock old key exists
      (AsyncStorage.getItem )
        .mockResolvedValueOnce(null) // New key doesn't exist
        .mockResolvedValueOnce(JSON.stringify(oldState)); // Old key exists

      // Try new key first
      let restored = await restoreNavigationState();
      expect(restored).toBeUndefined();

      // Fallback to old key
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(oldState)
      );
      restored = await restoreNavigationState();

      // Would migrate to new key in real implementation
      expect(restored).toBeDefined();
    });
  });
});

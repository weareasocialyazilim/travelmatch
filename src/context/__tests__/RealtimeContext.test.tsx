/**
 * RealtimeContext Tests
 * Tests for WebSocket real-time communication context
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock AuthContext
const mockGetAccessToken = jest.fn();
const mockIsAuthenticated = { current: false };

jest.mock('../AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated.current,
    getAccessToken: mockGetAccessToken,
  }),
}));

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;

  constructor(public url: string) {}

  send = jest.fn();
  close = jest.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
  });

  simulateMessage(data: object) {
    if (this.onmessage) {
      this.onmessage({ data: JSON.stringify(data) });
    }
  }

  simulateOpen() {
    if (this.onopen) {
      this.onopen();
    }
  }
}

let mockWsInstance: MockWebSocket | null = null;

// @ts-ignore
global.WebSocket = jest.fn().mockImplementation((url: string) => {
  mockWsInstance = new MockWebSocket(url);
  return mockWsInstance;
}) as unknown as typeof WebSocket;

// @ts-ignore
global.WebSocket.OPEN = MockWebSocket.OPEN;
// @ts-ignore
global.WebSocket.CLOSED = MockWebSocket.CLOSED;

// Import after mocks are set up
import { RealtimeProvider, useRealtime } from '../RealtimeContext';

// Test component
const TestRealtimeComponent: React.FC = () => {
  const {
    connectionState,
    isConnected,
    onlineUsers,
    isUserOnline,
    connect,
    disconnect,
  } = useRealtime();

  return (
    <>
      <Text testID="connection-state">{connectionState}</Text>
      <Text testID="is-connected">{String(isConnected)}</Text>
      <Text testID="online-count">{onlineUsers.size}</Text>
      <Text testID="user-1-online">{String(isUserOnline('user-1'))}</Text>
      <TouchableOpacity testID="connect" onPress={connect}>
        <Text>Connect</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="disconnect" onPress={disconnect}>
        <Text>Disconnect</Text>
      </TouchableOpacity>
    </>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(<RealtimeProvider>{component}</RealtimeProvider>);
};

describe('RealtimeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated.current = false;
    mockGetAccessToken.mockResolvedValue('test-token');
    mockWsInstance = null;
  });

  describe('RealtimeProvider', () => {
    it('renders children correctly', () => {
      const { getByText } = renderWithProvider(<Text>Child Content</Text>);
      expect(getByText('Child Content')).toBeTruthy();
    });

    it('provides context values', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('connection-state')).toBeTruthy();
      expect(getByTestId('is-connected')).toBeTruthy();
    });
  });

  describe('useRealtime hook', () => {
    it('throws error when used outside provider', () => {
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        const TestOutsideProvider = () => {
          useRealtime();
          return null;
        };
        render(<TestOutsideProvider />);
      }).toThrow('useRealtime must be used within a RealtimeProvider');

      consoleError.mockRestore();
    });
  });

  describe('connection state', () => {
    it('starts in disconnected state when not authenticated', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('connection-state').props.children).toBe('disconnected');
    });

    it('isConnected is false when disconnected', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('is-connected').props.children).toBe('false');
    });

    it('does not auto-connect when not authenticated', async () => {
      mockIsAuthenticated.current = false;
      renderWithProvider(<TestRealtimeComponent />);

      await waitFor(() => {
        expect(mockWsInstance).toBeNull();
      });
    });
  });

  describe('online users', () => {
    it('starts with empty online users', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('online-count').props.children).toBe(0);
    });

    it('isUserOnline returns false for unknown user', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('user-1-online').props.children).toBe('false');
    });
  });

  describe('context interface', () => {
    it('provides connect function', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('connect')).toBeTruthy();
    });

    it('provides disconnect function', () => {
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);
      expect(getByTestId('disconnect')).toBeTruthy();
    });
  });

  describe('event handling', () => {
    it('allows subscribing to events', () => {
      const mockHandler = jest.fn();

      const SubscribeTestComponent = () => {
        const { subscribe, connectionState } = useRealtime();

        React.useEffect(() => {
          const unsub = subscribe<{ message: string }>(
            'message:new',
            mockHandler,
          );
          return unsub;
        }, [subscribe]);

        return <Text testID="state">{connectionState}</Text>;
      };

      const { getByTestId } = renderWithProvider(<SubscribeTestComponent />);
      expect(getByTestId('state').props.children).toBe('disconnected');
    });
  });

  describe('typing indicators', () => {
    it('provides sendTypingStart and sendTypingStop functions', () => {
      const TypingTestComponent = () => {
        const { sendTypingStart, sendTypingStop } = useRealtime();
        const hasTypingFunctions =
          typeof sendTypingStart === 'function' &&
          typeof sendTypingStop === 'function';

        return <Text testID="has-typing">{String(hasTypingFunctions)}</Text>;
      };

      const { getByTestId } = renderWithProvider(<TypingTestComponent />);
      expect(getByTestId('has-typing').props.children).toBe('true');
    });
  });

  describe('reconnect', () => {
    it('provides reconnect function', () => {
      const ReconnectTestComponent = () => {
        const { reconnect } = useRealtime();
        const hasReconnect = typeof reconnect === 'function';

        return <Text testID="has-reconnect">{String(hasReconnect)}</Text>;
      };

      const { getByTestId } = renderWithProvider(<ReconnectTestComponent />);
      expect(getByTestId('has-reconnect').props.children).toBe('true');
    });
  });

  describe('authentication dependency', () => {
    it('requires authentication for connection', async () => {
      mockIsAuthenticated.current = false;
      const { getByTestId } = renderWithProvider(<TestRealtimeComponent />);

      // Try to connect
      fireEvent.press(getByTestId('connect'));

      // Should still be disconnected without auth
      await waitFor(() => {
        expect(getByTestId('connection-state').props.children).toBe(
          'disconnected',
        );
      });
    });
  });

  describe('exports', () => {
    it('exports RealtimeProvider', () => {
      expect(RealtimeProvider).toBeDefined();
    });

    it('exports useRealtime hook', () => {
      expect(useRealtime).toBeDefined();
      expect(typeof useRealtime).toBe('function');
    });
  });
});

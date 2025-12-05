/**
 * AuthContext Tests
 * Tests for authentication context, state management, and auth operations
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, Button, View } from 'react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/api';
import { secureStorage } from '../../utils/secureStorage';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('../../utils/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../../utils/secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
    deleteItems: jest.fn(),
  },
  AUTH_STORAGE_KEYS: {
    USER: 'auth_user',
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    TOKEN_EXPIRES_AT: 'auth_token_expires_at',
  },
}));

jest.mock('../../services/analyticsService', () => ({
  analyticsService: {
    trackEvent: jest.fn(),
    setUserId: jest.fn(),
    clearUserId: jest.fn(),
    track: jest.fn(),
    reset: jest.fn(),
    identify: jest.fn(),
  },
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockApi = api as jest.Mocked<typeof api>;
const mockSecureStorage = secureStorage as jest.Mocked<typeof secureStorage>;

// Test component that uses auth context
const TestConsumer = () => {
  const { 
    user, 
    authState, 
    isAuthenticated, 
    isLoading,
    login,
    logout,
    register,
  } = useAuth();

  return (
    <View>
      <Text testID="auth-state">{authState}</Text>
      <Text testID="is-authenticated">{isAuthenticated.toString()}</Text>
      <Text testID="is-loading">{isLoading.toString()}</Text>
      <Text testID="user-name">{user?.name || 'no-user'}</Text>
      <Button
        testID="login-button"
        title="Login"
        onPress={() => login({ email: 'test@test.com', password: 'password' })}
      />
      <Button testID="logout-button" title="Logout" onPress={() => logout()} />
    </View>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockSecureStorage.getItem.mockResolvedValue(null);
  });

  describe('AuthProvider', () => {
    it('renders children correctly', async () => {
      const { getByText } = render(
        <AuthProvider>
          <Text>Child Component</Text>
        </AuthProvider>
      );
      
      expect(getByText('Child Component')).toBeTruthy();
    });

    it('starts with loading state', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      // Initial state is loading
      expect(getByTestId('auth-state').props.children).toBe('loading');
    });

    it('transitions to unauthenticated when no stored credentials', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);
      mockSecureStorage.getItem.mockResolvedValue(null);

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('auth-state').props.children).toBe('unauthenticated');
      });
    });

    it('restores user from storage on mount', async () => {
      const storedUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUser));
      mockSecureStorage.getItem
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() + 3600000).toString());

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('user-name').props.children).toBe('John Doe');
      });
    });
  });

  describe('useAuth hook', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });

    it('provides auth state values', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      expect(getByTestId('is-authenticated').props.children).toBe('false');
    });
  });

  describe('login', () => {
    it('calls API with credentials', async () => {
      const mockResponse = {
        user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
      };
      
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('login-button'));
      });
      
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password',
      });
    });

    it('updates user state on successful login', async () => {
      const mockResponse = {
        user: { id: 'user-1', name: 'Logged In User', email: 'test@test.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };
      
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('login-button'));
      });
      
      await waitFor(() => {
        expect(getByTestId('user-name').props.children).toBe('Logged In User');
      });
    });

    it('handles login errors', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('Invalid credentials'));

      let loginResult: { success: boolean; error?: string } | null = null;
      
      const LoginTestComponent = () => {
        const { login, isLoading } = useAuth();
        
        const handleLogin = async () => {
          loginResult = await login({ email: 'test@test.com', password: 'wrong' });
        };
        
        return (
          <View>
            <Text testID="is-loading">{isLoading.toString()}</Text>
            <Button testID="login" title="Login" onPress={handleLogin} />
          </View>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <LoginTestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('login'));
      });
      
      expect(loginResult?.success).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears user state', async () => {
      const storedUser = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUser));
      mockSecureStorage.getItem
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() + 3600000).toString());

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('user-name').props.children).toBe('John Doe');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('logout-button'));
      });
      
      await waitFor(() => {
        expect(getByTestId('user-name').props.children).toBe('no-user');
      });
    });

    it('clears storage on logout', async () => {
      const storedUser = { id: 'user-1', name: 'Test', email: 'test@test.com' };
      
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedUser));
      mockSecureStorage.getItem
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token')
        .mockResolvedValueOnce((Date.now() + 3600000).toString());

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-authenticated').props.children).toBe('true');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('logout-button'));
      });
      
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
      expect(mockSecureStorage.deleteItems).toHaveBeenCalled();
    });

    it('sets auth state to unauthenticated', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('logout-button'));
      });
      
      expect(getByTestId('auth-state').props.children).toBe('unauthenticated');
      expect(getByTestId('is-authenticated').props.children).toBe('false');
    });
  });

  describe('register', () => {
    it('creates new account and logs in', async () => {
      const mockResponse = {
        user: { id: 'new-user', name: 'New User', email: 'new@test.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
      };
      
      mockApi.post.mockResolvedValueOnce(mockResponse);

      let registerResult: { success: boolean; error?: string } | null = null;
      
      const RegisterTestComponent = () => {
        const { register, isLoading, user } = useAuth();
        
        const handleRegister = async () => {
          registerResult = await register({
            email: 'new@test.com',
            password: 'password123',
            name: 'New User',
          });
        };
        
        return (
          <View>
            <Text testID="is-loading">{isLoading.toString()}</Text>
            <Text testID="user-name">{user?.name || 'no-user'}</Text>
            <Button testID="register" title="Register" onPress={handleRegister} />
          </View>
        );
      };

      const { getByTestId } = render(
        <AuthProvider>
          <RegisterTestComponent />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('register'));
      });
      
      await waitFor(() => {
        expect(registerResult?.success).toBe(true);
      });
    });
  });

  describe('Token management', () => {
    it('stores tokens securely on login', async () => {
      const mockResponse = {
        user: { id: 'user-1', name: 'Test', email: 'test@test.com' },
        accessToken: 'secure-access-token',
        refreshToken: 'secure-refresh-token',
        expiresIn: 3600,
      };
      
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('login-button'));
      });
      
      await waitFor(() => {
        expect(mockSecureStorage.setItem).toHaveBeenCalled();
      });
    });
  });

  describe('Error handling', () => {
    it('handles storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      // Should not crash, should transition to unauthenticated
      await waitFor(() => {
        expect(getByTestId('auth-state').props.children).toBe('unauthenticated');
      });
    });

    it('handles API errors on login', async () => {
      mockApi.post.mockRejectedValueOnce({ message: 'Server error' });

      const { getByTestId } = render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('is-loading').props.children).toBe('false');
      });
      
      await act(async () => {
        fireEvent.press(getByTestId('login-button'));
      });
      
      // Should remain unauthenticated
      expect(getByTestId('is-authenticated').props.children).toBe('false');
    });
  });
});

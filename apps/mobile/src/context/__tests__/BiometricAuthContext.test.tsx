/**
 * BiometricAuthContext - Tests
 *
 * Tests for biometric authentication context
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';

// Create mocks with proper hoisting
jest.mock('../../services/biometricAuth', () => ({
  biometricAuth: {
    initialize: jest.fn(),
    getCapabilities: jest.fn(),
    getBiometricTypeName: jest.fn(),
    isEnabled: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    authenticate: jest.fn(),
    authenticateForAppLaunch: jest.fn(),
    authenticateForSensitiveAction: jest.fn(),
    saveCredentials: jest.fn(),
    getCredentials: jest.fn(),
    clearCredentials: jest.fn(),
    hasCredentials: jest.fn(),
  },
  BiometricType: {
    FINGERPRINT: 'fingerprint',
    FACIAL_RECOGNITION: 'facial_recognition',
    IRIS: 'iris',
    NONE: 'none',
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Import after mocks
import { BiometricAuthProvider, useBiometric } from '../BiometricAuthContext';
import { biometricAuth } from '../../services/biometricAuth';

// Type cast for easier usage
const mockBiometricAuth = biometricAuth as jest.Mocked<typeof biometricAuth>;

describe('BiometricAuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BiometricAuthProvider>{children}</BiometricAuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockBiometricAuth.initialize.mockResolvedValue(undefined);
    mockBiometricAuth.getCapabilities.mockResolvedValue({
      isAvailable: true,
      isEnrolled: true,
      supportedTypes: ['facial_recognition' as any],
      hasHardware: true,
    });
    mockBiometricAuth.getBiometricTypeName.mockReturnValue('Face ID');
    mockBiometricAuth.isEnabled.mockResolvedValue(false);
    mockBiometricAuth.hasCredentials.mockResolvedValue(false);
    mockBiometricAuth.enable.mockResolvedValue(true);
    mockBiometricAuth.disable.mockResolvedValue(undefined);
    mockBiometricAuth.authenticate.mockResolvedValue({ success: true });
    mockBiometricAuth.authenticateForAppLaunch.mockResolvedValue(true);
    mockBiometricAuth.authenticateForSensitiveAction.mockResolvedValue(true);
    mockBiometricAuth.saveCredentials.mockResolvedValue(undefined);
    mockBiometricAuth.getCredentials.mockResolvedValue({
      email: 'test@test.com',
      password: 'pass123',
    });
    mockBiometricAuth.clearCredentials.mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('should initialize with biometric available', async () => {
      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockBiometricAuth.initialize).toHaveBeenCalled();
      expect(result.current.biometricAvailable).toBe(true);
      expect(result.current.biometricTypeName).toBe('Face ID');
    });

    it('should detect when biometric is not available', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValue({
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        hasHardware: false,
      });
      mockBiometricAuth.getBiometricTypeName.mockReturnValue('None');

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricAvailable).toBe(false);
    });

    it('should detect when biometric is already enabled', async () => {
      mockBiometricAuth.isEnabled.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricEnabled).toBe(true);
    });

    it('should handle initialization failure gracefully', async () => {
      mockBiometricAuth.initialize.mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricAvailable).toBe(false);
      expect(result.current.biometricEnabled).toBe(false);
    });

    it('should detect existing credentials', async () => {
      mockBiometricAuth.hasCredentials.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasCredentials).toBe(true);
    });
  });

  describe('Enable/Disable Biometric', () => {
    it('should enable biometric authentication', async () => {
      mockBiometricAuth.enable.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let enableResult = false;
      await act(async () => {
        enableResult = await result.current.enableBiometric();
      });

      expect(mockBiometricAuth.enable).toHaveBeenCalled();
      expect(enableResult).toBe(true);
      expect(result.current.biometricEnabled).toBe(true);
    });

    it('should handle enable failure', async () => {
      mockBiometricAuth.enable.mockResolvedValue(false);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let enableResult = true;
      await act(async () => {
        enableResult = await result.current.enableBiometric();
      });

      expect(enableResult).toBe(false);
      expect(result.current.biometricEnabled).toBe(false);
    });

    it('should disable biometric authentication', async () => {
      mockBiometricAuth.isEnabled.mockResolvedValue(true);
      mockBiometricAuth.disable.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricEnabled).toBe(true);

      await act(async () => {
        await result.current.disableBiometric();
      });

      expect(mockBiometricAuth.disable).toHaveBeenCalled();
      expect(result.current.biometricEnabled).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should authenticate successfully', async () => {
      mockBiometricAuth.authenticate.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult = false;
      await act(async () => {
        authResult = await result.current.authenticate('Test prompt');
      });

      expect(mockBiometricAuth.authenticate).toHaveBeenCalled();
      expect(authResult).toBe(true);
    });

    it('should handle authentication failure', async () => {
      mockBiometricAuth.authenticate.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult = true;
      await act(async () => {
        authResult = await result.current.authenticate('Test prompt');
      });

      expect(authResult).toBe(false);
    });

    it('should authenticate for app launch', async () => {
      mockBiometricAuth.authenticateForAppLaunch.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult = false;
      await act(async () => {
        authResult = await result.current.authenticateForAppLaunch();
      });

      expect(mockBiometricAuth.authenticateForAppLaunch).toHaveBeenCalled();
      expect(authResult).toBe(true);
    });

    it('should authenticate for sensitive action', async () => {
      mockBiometricAuth.authenticateForSensitiveAction.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult = false;
      await act(async () => {
        authResult = await result.current.authenticateForAction('Withdraw');
      });

      expect(
        mockBiometricAuth.authenticateForSensitiveAction,
      ).toHaveBeenCalledWith('Withdraw');
      expect(authResult).toBe(true);
    });

    it('should handle authentication error gracefully', async () => {
      mockBiometricAuth.authenticate.mockRejectedValue(new Error('Auth error'));

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult = true;
      await act(async () => {
        authResult = await result.current.authenticate('Test');
      });

      expect(authResult).toBe(false);
    });
  });

  describe('Credentials Management', () => {
    it('should save credentials', async () => {
      mockBiometricAuth.saveCredentials.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.saveCredentials({
          email: 'test@test.com',
          password: 'password123',
        });
      });

      expect(mockBiometricAuth.saveCredentials).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
      expect(result.current.hasCredentials).toBe(true);
    });

    it('should get credentials', async () => {
      mockBiometricAuth.getCredentials.mockResolvedValue({
        email: 'test@test.com',
        password: 'password123',
      });

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let credentials: any = null;
      await act(async () => {
        credentials = await result.current.getCredentials();
      });

      expect(mockBiometricAuth.getCredentials).toHaveBeenCalled();
      expect(credentials).toEqual({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('should clear credentials', async () => {
      mockBiometricAuth.hasCredentials.mockResolvedValue(true);
      mockBiometricAuth.clearCredentials.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasCredentials).toBe(true);

      await act(async () => {
        await result.current.clearCredentials();
      });

      expect(mockBiometricAuth.clearCredentials).toHaveBeenCalled();
      expect(result.current.hasCredentials).toBe(false);
    });
  });

  describe('Refresh', () => {
    it('should refresh biometric state', async () => {
      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockBiometricAuth.initialize.mock.calls.length;

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(() => {
        expect(mockBiometricAuth.initialize.mock.calls.length).toBeGreaterThan(
          initialCallCount,
        );
      });
    });
  });

  describe('Context Hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBiometric());
      }).toThrow('useBiometric must be used within BiometricAuthProvider');

      consoleSpy.mockRestore();
    });
  });
});

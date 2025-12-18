/**
 * BiometricAuthContext - Comprehensive Tests
 * 
 * Tests for biometric authentication:
 * - Biometric availability detection
 * - Enable/disable biometric
 * - Authentication flows
 * - Failure handling and fallbacks
 * - Multiple authentication types
 * - Context provider and hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { BiometricAuthProvider, useBiometric } from '../BiometricAuthContext';
import { biometricAuth, BiometricType } from '../../services/biometricAuth';
import { logger } from '../../utils/logger';

// Mock dependencies
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
  },
}));

const mockBiometricAuth = biometricAuth ;
const mockLogger = logger ;

describe('BiometricAuthContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BiometricAuthProvider>{children}</BiometricAuthProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock responses
    mockBiometricAuth.initialize.mockResolvedValue({
      isAvailable: true,
      isEnrolled: true,
      supportedTypes: [BiometricType.FACIAL_RECOGNITION],
      hasHardware: true,
    });

    mockBiometricAuth.getCapabilities.mockResolvedValue({
      isAvailable: true,
      isEnrolled: true,
      supportedTypes: [BiometricType.FACIAL_RECOGNITION],
      hasHardware: true,
    });

    mockBiometricAuth.getBiometricTypeName.mockReturnValue('Face ID');
    mockBiometricAuth.isEnabled.mockResolvedValue(false);
  });

  describe('Initialization', () => {
    it('should initialize biometric state on mount', async () => {
      const { result } = renderHook(() => useBiometric(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockBiometricAuth.initialize).toHaveBeenCalled();
      expect(result.current.biometricAvailable).toBe(true);
      expect(result.current.biometricEnabled).toBe(false);
      expect(result.current.biometricType).toBe(BiometricType.FACIAL_RECOGNITION);
      expect(result.current.biometricTypeName).toBe('Face ID');
    });

    it('should handle initialization failure', async () => {
      mockBiometricAuth.initialize.mockRejectedValue(new Error('Init failed'));

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricAvailable).toBe(false);
      expect(result.current.biometricEnabled).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'BiometricAuthContext',
        'Failed to initialize',
        expect.any(Error)
      );
    });

    it('should detect when biometric is not available', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValue({
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [BiometricType.NONE],
        hasHardware: false,
      });

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
  });

  describe('Enable/Disable Biometric', () => {
    it('should enable biometric successfully', async () => {
      mockBiometricAuth.enable.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.enableBiometric();
      });

      expect(success).toBe(true);
      expect(result.current.biometricEnabled).toBe(true);
      expect(mockBiometricAuth.enable).toHaveBeenCalled();
    });

    it('should handle enable failure', async () => {
      mockBiometricAuth.enable.mockResolvedValue(false);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.enableBiometric();
      });

      expect(success).toBe(false);
      expect(result.current.biometricEnabled).toBe(false);
    });

    it('should handle enable error', async () => {
      mockBiometricAuth.enable.mockRejectedValue(new Error('Enable failed'));

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let success = false;
      await act(async () => {
        success = await result.current.enableBiometric();
      });

      expect(success).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'BiometricAuthContext',
        'Failed to enable',
        expect.any(Error)
      );
    });

    it('should disable biometric successfully', async () => {
      mockBiometricAuth.isEnabled.mockResolvedValue(true);
      mockBiometricAuth.disable.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.biometricEnabled).toBe(true);
      });

      await act(async () => {
        await result.current.disableBiometric();
      });

      expect(result.current.biometricEnabled).toBe(false);
      expect(mockBiometricAuth.disable).toHaveBeenCalled();
    });

    it('should handle disable error', async () => {
      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set up mock to reject after initial setup
      mockBiometricAuth.disable.mockRejectedValueOnce(new Error('Disable failed'));

      await act(async () => {
        try {
          await result.current.disableBiometric();
        } catch {
          // Expected to throw
        }
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'BiometricAuthContext',
        'Failed to disable',
        expect.any(Error)
      );
    });
  });

  describe('Authentication Flows', () => {
    it('should authenticate with custom prompt', async () => {
      mockBiometricAuth.authenticate.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticate('Verify your identity');
      });

      expect(authenticated).toBe(true);
      expect(mockBiometricAuth.authenticate).toHaveBeenCalledWith({
        promptMessage: 'Verify your identity',
      });
    });

    it('should authenticate with default prompt', async () => {
      mockBiometricAuth.authenticate.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticate();
      });

      expect(authenticated).toBe(true);
      expect(mockBiometricAuth.authenticate).toHaveBeenCalledWith({
        promptMessage: 'Authenticate with Face ID',
      });
    });

    it('should handle authentication failure', async () => {
      mockBiometricAuth.authenticate.mockResolvedValue(false);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticate();
      });

      expect(authenticated).toBe(false);
    });

    it('should handle authentication error', async () => {
      mockBiometricAuth.authenticate.mockRejectedValue(new Error('Auth failed'));

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticate();
      });

      expect(authenticated).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'BiometricAuthContext',
        'Authentication failed',
        expect.any(Error)
      );
    });

    it('should authenticate for app launch', async () => {
      mockBiometricAuth.authenticateForAppLaunch.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticateForAppLaunch();
      });

      expect(authenticated).toBe(true);
      expect(mockBiometricAuth.authenticateForAppLaunch).toHaveBeenCalled();
    });

    it('should authenticate for sensitive action', async () => {
      mockBiometricAuth.authenticateForSensitiveAction.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticateForAction('Withdraw Funds');
      });

      expect(authenticated).toBe(true);
      expect(mockBiometricAuth.authenticateForSensitiveAction).toHaveBeenCalledWith(
        'Withdraw Funds'
      );
    });

    it('should handle app launch authentication failure', async () => {
      mockBiometricAuth.authenticateForAppLaunch.mockRejectedValue(
        new Error('Launch auth failed')
      );

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticateForAppLaunch();
      });

      expect(authenticated).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'BiometricAuthContext',
        'App launch authentication failed',
        expect.any(Error)
      );
    });

    it('should handle sensitive action authentication failure', async () => {
      mockBiometricAuth.authenticateForSensitiveAction.mockRejectedValue(
        new Error('Action auth failed')
      );

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authenticated = false;
      await act(async () => {
        authenticated = await result.current.authenticateForAction('Make Payment');
      });

      expect(authenticated).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'BiometricAuthContext',
        'Action authentication failed',
        expect.any(Error)
      );
    });
  });

  describe('Multiple Authentication Types', () => {
    it('should detect fingerprint', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValue({
        isAvailable: true,
        isEnrolled: true,
        supportedTypes: [BiometricType.FINGERPRINT],
        hasHardware: true,
      });
      mockBiometricAuth.getBiometricTypeName.mockReturnValue('Touch ID');

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricType).toBe(BiometricType.FINGERPRINT);
      expect(result.current.biometricTypeName).toBe('Touch ID');
    });

    it('should detect facial recognition', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValue({
        isAvailable: true,
        isEnrolled: true,
        supportedTypes: [BiometricType.FACIAL_RECOGNITION],
        hasHardware: true,
      });
      mockBiometricAuth.getBiometricTypeName.mockReturnValue('Face ID');

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricType).toBe(BiometricType.FACIAL_RECOGNITION);
      expect(result.current.biometricTypeName).toBe('Face ID');
    });

    it('should detect iris recognition', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValue({
        isAvailable: true,
        isEnrolled: true,
        supportedTypes: [BiometricType.IRIS],
        hasHardware: true,
      });
      mockBiometricAuth.getBiometricTypeName.mockReturnValue('Iris Recognition');

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricType).toBe(BiometricType.IRIS);
      expect(result.current.biometricTypeName).toBe('Iris Recognition');
    });

    it('should handle no biometric available', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValue({
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [BiometricType.NONE],
        hasHardware: false,
      });

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.biometricType).toBe(BiometricType.NONE);
      expect(result.current.biometricAvailable).toBe(false);
    });
  });

  describe('Refresh State', () => {
    it('should refresh biometric state', async () => {
      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = mockBiometricAuth.initialize.mock.calls.length;

      await act(async () => {
        await result.current.refresh();
      });

      // After refresh, initialize should be called one more time
      expect(mockBiometricAuth.initialize).toHaveBeenCalledTimes(initialCallCount + 1);
    });

    it('should update state after refresh', async () => {
      mockBiometricAuth.getCapabilities.mockResolvedValueOnce({
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [BiometricType.NONE],
        hasHardware: false,
      });

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.biometricAvailable).toBe(false);
      });

      // Change capabilities
      mockBiometricAuth.getCapabilities.mockResolvedValueOnce({
        isAvailable: true,
        isEnrolled: true,
        supportedTypes: [BiometricType.FACIAL_RECOGNITION],
        hasHardware: true,
      });

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.biometricAvailable).toBe(true);
    });
  });

  describe('Context Hook Error Handling', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useBiometric());
      }).toThrow('useBiometric must be used within BiometricAuthProvider');

      jest.restoreAllMocks();
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent authentication requests', async () => {
      mockBiometricAuth.authenticate.mockResolvedValue(true);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const auth1 = result.current.authenticate('Request 1');
      const auth2 = result.current.authenticate('Request 2');
      const auth3 = result.current.authenticate('Request 3');

      const [result1, result2, result3] = await Promise.all([auth1, auth2, auth3]);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(mockBiometricAuth.authenticate).toHaveBeenCalledTimes(3);
    });

    it('should handle state changes during authentication', async () => {
      let resolveAuth: (value: boolean) => void;
      const authPromise = new Promise<boolean>((resolve) => {
        resolveAuth = resolve;
      });

      mockBiometricAuth.authenticate.mockReturnValue(authPromise);

      const { result } = renderHook(() => useBiometric(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const authCall = result.current.authenticate();

      // Disable biometric during authentication
      await act(async () => {
        await result.current.disableBiometric();
      });

      // Complete authentication
      resolveAuth!(true);

      const authenticated = await authCall;
      expect(authenticated).toBe(true);
    });
  });
});

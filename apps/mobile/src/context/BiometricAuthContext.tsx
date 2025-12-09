/**
 * BiometricAuthContext
 *
 * Provides biometric authentication state and operations throughout the application.
 * Manages Face ID, Touch ID, and fingerprint authentication across platforms.
 *
 * @module context/BiometricAuthContext
 *
 * @example
 * ```tsx
 * // In a component
 * const { biometricAvailable, biometricEnabled, authenticateForAction } = useBiometric();
 *
 * // Check if biometric is available
 * if (biometricAvailable) {
 *   // Show biometric login button
 * }
 *
 * // Authenticate for sensitive action
 * const verified = await authenticateForAction('Withdraw Funds');
 * if (verified) {
 *   // Proceed with action
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { biometricAuth } from '../services/biometricAuth';
import type { BiometricType } from '../services/biometricAuth';
import { logger } from '../utils/logger';

/**
 * Biometric authentication context value
 */
interface BiometricAuthContextValue {
  /** Whether biometric authentication is available on device */
  biometricAvailable: boolean;
  /** Whether biometric authentication is enabled by user */
  biometricEnabled: boolean;
  /** Type of biometric authentication (fingerprint, facial, etc.) */
  biometricType: BiometricType | null;
  /** Human-readable biometric type name (Face ID, Touch ID, Fingerprint) */
  biometricTypeName: string;
  /** Whether biometric state is being loaded */
  isLoading: boolean;
  /** Enable biometric authentication (prompts user) */
  enableBiometric: () => Promise<boolean>;
  /** Disable biometric authentication */
  disableBiometric: () => Promise<void>;
  /** Authenticate user with biometric */
  authenticate: (promptMessage?: string) => Promise<boolean>;
  /** Authenticate for app launch (quick login) */
  authenticateForAppLaunch: () => Promise<boolean>;
  /** Authenticate for sensitive action (withdraw, payment, etc.) */
  authenticateForAction: (actionName: string) => Promise<boolean>;
  /** Refresh biometric state */
  refresh: () => Promise<void>;
}

const BiometricAuthContext = createContext<BiometricAuthContextValue | undefined>(undefined);

/**
 * BiometricAuthProvider props
 */
interface BiometricAuthProviderProps {
  children: ReactNode;
}

/**
 * BiometricAuthProvider component
 * Wraps the app to provide biometric authentication state
 */
export const BiometricAuthProvider: React.FC<BiometricAuthProviderProps> = ({ children }) => {
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);
  const [biometricTypeName, setBiometricTypeName] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize biometric state
   */
  const initializeBiometric = useCallback(async () => {
    try {
      setIsLoading(true);

      // Initialize the biometric service
      await biometricAuth.initialize();

      // Get capabilities
      const capabilities = await biometricAuth.getCapabilities();
      setBiometricAvailable(capabilities.isAvailable);

      // Get biometric type
      const primaryType = capabilities.supportedTypes[0] || null;
      setBiometricType(primaryType);
      setBiometricTypeName(biometricAuth.getBiometricTypeName());

      // Check if biometric is enabled
      const enabled = await biometricAuth.isEnabled();
      setBiometricEnabled(enabled);

      logger.info('BiometricAuthContext', 'Initialized', {
        available: capabilities.isAvailable,
        enabled,
        type: biometricTypeName,
      });
    } catch (error) {
      logger.error('BiometricAuthContext', 'Failed to initialize', error);
      setBiometricAvailable(false);
      setBiometricEnabled(false);
    } finally {
      setIsLoading(false);
    }
  }, [biometricTypeName]);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initializeBiometric();
  }, [initializeBiometric]);

  /**
   * Enable biometric authentication
   */
  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const success = await biometricAuth.enable();
      if (success) {
        setBiometricEnabled(true);
      }
      return success;
    } catch (error) {
      logger.error('BiometricAuthContext', 'Failed to enable', error);
      return false;
    }
  }, []);

  /**
   * Disable biometric authentication
   */
  const disableBiometric = useCallback(async (): Promise<void> => {
    try {
      await biometricAuth.disable();
      setBiometricEnabled(false);
    } catch (error) {
      logger.error('BiometricAuthContext', 'Failed to disable', error);
      throw error;
    }
  }, []);

  /**
   * Authenticate user with biometric
   */
  const authenticate = useCallback(
    async (promptMessage?: string): Promise<boolean> => {
      try {
        return await biometricAuth.authenticate({
          promptMessage: promptMessage || `Authenticate with ${biometricTypeName}`,
        });
      } catch (error) {
        logger.error('BiometricAuthContext', 'Authentication failed', error);
        return false;
      }
    },
    [biometricTypeName]
  );

  /**
   * Authenticate for app launch (quick login)
   */
  const authenticateForAppLaunch = useCallback(async (): Promise<boolean> => {
    try {
      return await biometricAuth.authenticateForAppLaunch();
    } catch (error) {
      logger.error('BiometricAuthContext', 'App launch authentication failed', error);
      return false;
    }
  }, []);

  /**
   * Authenticate for sensitive action
   */
  const authenticateForAction = useCallback(async (actionName: string): Promise<boolean> => {
    try {
      return await biometricAuth.authenticateForSensitiveAction(actionName);
    } catch (error) {
      logger.error('BiometricAuthContext', 'Action authentication failed', error);
      return false;
    }
  }, []);

  /**
   * Refresh biometric state
   */
  const refresh = useCallback(async (): Promise<void> => {
    await initializeBiometric();
  }, [initializeBiometric]);

  const value: BiometricAuthContextValue = {
    biometricAvailable,
    biometricEnabled,
    biometricType,
    biometricTypeName,
    isLoading,
    enableBiometric,
    disableBiometric,
    authenticate,
    authenticateForAppLaunch,
    authenticateForAction,
    refresh,
  };

  return (
    <BiometricAuthContext.Provider value={value}>
      {children}
    </BiometricAuthContext.Provider>
  );
};

/**
 * Hook to use biometric authentication context
 * @throws {Error} If used outside BiometricAuthProvider
 */
export const useBiometric = (): BiometricAuthContextValue => {
  const context = useContext(BiometricAuthContext);
  if (!context) {
    throw new Error('useBiometric must be used within BiometricAuthProvider');
  }
  return context;
};

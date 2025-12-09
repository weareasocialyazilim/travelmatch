/**
 * Biometric Authentication Service
 * 
 * Provides a unified interface for biometric authentication across platforms:
 * - iOS: Face ID / Touch ID
 * - Android: Fingerprint / Face / Iris
 * 
 * Features:
 * - Check biometric availability
 * - Authenticate user
 * - Manage biometric settings
 * - Secure storage integration
 * 
 * Usage Scenarios:
 * 1. App launch - Quick biometric login
 * 2. Sensitive actions - Verify before withdraw/payment
 * 3. Settings - Enable/disable biometric auth
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { secureStorage } from '../utils/secureStorage';
import { logger } from '../utils/logger';

// Storage keys
const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const BIOMETRIC_TYPE_KEY = 'biometric_type';

export enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACIAL_RECOGNITION = 'facial_recognition',
  IRIS = 'iris',
  NONE = 'none',
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: BiometricType[];
  hasHardware: boolean;
}

export interface BiometricAuthOptions {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  fallbackLabel?: string;
}

class BiometricAuthService {
  private isInitialized = false;
  private capabilities: BiometricCapabilities | null = null;

  /**
   * Initialize biometric service and check capabilities
   */
  async initialize(): Promise<BiometricCapabilities> {
    try {
      // Check if hardware is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Get supported authentication types
      const supportedTypesRaw = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const supportedTypes = this.mapAuthenticationTypes(supportedTypesRaw);

      this.capabilities = {
        isAvailable: hasHardware && isEnrolled,
        isEnrolled,
        supportedTypes,
        hasHardware,
      };

      this.isInitialized = true;
      
      logger.info('BiometricAuth', 'Initialized', this.capabilities);
      
      return this.capabilities;
    } catch (error) {
      logger.error('BiometricAuth', 'Initialization failed', error);
      
      this.capabilities = {
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [BiometricType.NONE],
        hasHardware: false,
      };
      
      return this.capabilities;
    }
  }

  /**
   * Map LocalAuthentication types to our BiometricType enum
   */
  private mapAuthenticationTypes(
    types: LocalAuthentication.AuthenticationType[]
  ): BiometricType[] {
    const mapped: BiometricType[] = [];

    types.forEach((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          mapped.push(BiometricType.FINGERPRINT);
          break;
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          mapped.push(BiometricType.FACIAL_RECOGNITION);
          break;
        case LocalAuthentication.AuthenticationType.IRIS:
          mapped.push(BiometricType.IRIS);
          break;
      }
    });

    return mapped.length > 0 ? mapped : [BiometricType.NONE];
  }

  /**
   * Get current biometric capabilities
   */
  async getCapabilities(): Promise<BiometricCapabilities> {
    if (!this.isInitialized || !this.capabilities) {
      return await this.initialize();
    }
    return this.capabilities;
  }

  /**
   * Get user-friendly biometric type name
   */
  getBiometricTypeName(): string {
    if (!this.capabilities || this.capabilities.supportedTypes.length === 0) {
      return 'Biometric';
    }

    const primaryType = this.capabilities.supportedTypes[0];

    if (Platform.OS === 'ios') {
      return primaryType === BiometricType.FACIAL_RECOGNITION
        ? 'Face ID'
        : 'Touch ID';
    }

    switch (primaryType) {
      case BiometricType.FINGERPRINT:
        return 'Fingerprint';
      case BiometricType.FACIAL_RECOGNITION:
        return 'Face Recognition';
      case BiometricType.IRIS:
        return 'Iris Recognition';
      default:
        return 'Biometric';
    }
  }

  /**
   * Authenticate user with biometrics
   * 
   * @param options - Authentication options
   * @returns Promise<boolean> - true if authenticated, false otherwise
   */
  async authenticate(options?: BiometricAuthOptions): Promise<boolean> {
    try {
      const capabilities = await this.getCapabilities();

      if (!capabilities.isAvailable) {
        logger.warn('BiometricAuth', 'Biometric not available');
        return false;
      }

      const biometricName = this.getBiometricTypeName();
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || `Authenticate with ${biometricName}`,
        cancelLabel: options?.cancelLabel || 'Cancel',
        disableDeviceFallback: options?.disableDeviceFallback ?? false,
        fallbackLabel: options?.fallbackLabel || 'Use Passcode',
      });

      if (result.success) {
        logger.info('BiometricAuth', 'Authentication successful');
        return true;
      } else {
        logger.warn('BiometricAuth', 'Authentication failed', result.error);
        return false;
      }
    } catch (error) {
      logger.error('BiometricAuth', 'Authentication error', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled in app settings
   */
  async isEnabled(): Promise<boolean> {
    try {
      const enabled = await secureStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      logger.error('BiometricAuth', 'Failed to check if enabled', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication
   * Requires successful biometric verification
   */
  async enable(): Promise<boolean> {
    try {
      const capabilities = await this.getCapabilities();

      if (!capabilities.isAvailable) {
        throw new Error('Biometric authentication is not available on this device');
      }

      // Verify with biometric before enabling
      const authenticated = await this.authenticate({
        promptMessage: `Enable ${this.getBiometricTypeName()}`,
      });

      if (!authenticated) {
        return false;
      }

      // Save enabled state
      await secureStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
      
      // Save biometric type for reference
      const primaryType = capabilities.supportedTypes[0];
      if (primaryType) {
        await secureStorage.setItem(BIOMETRIC_TYPE_KEY, primaryType);
      }

      logger.info('BiometricAuth', 'Enabled successfully');
      return true;
    } catch (error) {
      logger.error('BiometricAuth', 'Failed to enable', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disable(): Promise<void> {
    try {
      await secureStorage.deleteItem(BIOMETRIC_ENABLED_KEY);
      await secureStorage.deleteItem(BIOMETRIC_TYPE_KEY);
      logger.info('BiometricAuth', 'Disabled successfully');
    } catch (error) {
      logger.error('BiometricAuth', 'Failed to disable', error);
      throw error;
    }
  }

  /**
   * Authenticate for app launch (quick login)
   * Only if biometric is enabled in settings
   */
  async authenticateForAppLaunch(): Promise<boolean> {
    const isEnabled = await this.isEnabled();
    
    if (!isEnabled) {
      return false;
    }

    return await this.authenticate({
      promptMessage: 'Unlock TravelMatch',
      cancelLabel: 'Use Password',
      disableDeviceFallback: false,
    });
  }

  /**
   * Authenticate for sensitive action (e.g., withdraw, payment)
   * Always prompts even if biometric is disabled in settings
   */
  async authenticateForSensitiveAction(action: string): Promise<boolean> {
    const capabilities = await this.getCapabilities();

    if (!capabilities.isAvailable) {
      // If biometric not available, return true (fall back to other security)
      return true;
    }

    return await this.authenticate({
      promptMessage: `Verify to ${action}`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use Password',
    });
  }

  /**
   * Check if device has biometric enrollment
   * Useful for showing enrollment prompts
   */
  async hasEnrolledBiometrics(): Promise<boolean> {
    const capabilities = await this.getCapabilities();
    return capabilities.isEnrolled;
  }

  /**
   * Get security level description
   */
  getSecurityLevel(): 'none' | 'weak' | 'strong' | 'very-strong' {
    if (!this.capabilities) {
      return 'none';
    }

    if (!this.capabilities.hasHardware) {
      return 'none';
    }

    if (!this.capabilities.isEnrolled) {
      return 'weak';
    }

    const { supportedTypes } = this.capabilities;

    if (supportedTypes.includes(BiometricType.IRIS)) {
      return 'very-strong';
    }

    if (supportedTypes.includes(BiometricType.FACIAL_RECOGNITION)) {
      return 'strong';
    }

    if (supportedTypes.includes(BiometricType.FINGERPRINT)) {
      return 'strong';
    }

    return 'weak';
  }
}

// Export singleton instance
export const biometricAuth = new BiometricAuthService();

// Export for testing
export default biometricAuth;

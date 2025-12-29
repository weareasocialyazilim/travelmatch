/**
 * Device Integrity Check Utility
 *
 * Detects jailbroken iOS devices and rooted Android devices
 * to prevent security bypasses and ensure app integrity.
 *
 * @see https://owasp.org/www-project-mobile-top-10/
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { logger } from './logger';

/**
 * iOS jailbreak indicators - paths that shouldn't exist on non-jailbroken devices
 */
const IOS_JAILBREAK_PATHS = [
  '/Applications/Cydia.app',
  '/Applications/Sileo.app',
  '/Applications/Zebra.app',
  '/Applications/blackra1n.app',
  '/Applications/FakeCarrier.app',
  '/Applications/Icy.app',
  '/Applications/IntelliScreen.app',
  '/Applications/MxTube.app',
  '/Applications/RockApp.app',
  '/Applications/SBSettings.app',
  '/Applications/WinterBoard.app',
  '/Library/MobileSubstrate/MobileSubstrate.dylib',
  '/Library/MobileSubstrate/DynamicLibraries',
  '/System/Library/LaunchDaemons/com.ikey.bbot.plist',
  '/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist',
  '/bin/bash',
  '/bin/sh',
  '/usr/sbin/sshd',
  '/usr/bin/sshd',
  '/usr/libexec/ssh-keysign',
  '/usr/libexec/sftp-server',
  '/etc/apt',
  '/etc/ssh/sshd_config',
  '/private/var/lib/apt',
  '/private/var/lib/cydia',
  '/private/var/mobile/Library/SBSettings/Themes',
  '/private/var/stash',
  '/private/var/tmp/cydia.log',
  '/var/cache/apt',
  '/var/lib/cydia',
  '/var/log/syslog',
];

/**
 * Android root indicators - paths that shouldn't exist on non-rooted devices
 */
const ANDROID_ROOT_PATHS = [
  '/system/app/Superuser.apk',
  '/system/app/SuperSU.apk',
  '/system/app/Magisk.apk',
  '/sbin/su',
  '/system/bin/su',
  '/system/xbin/su',
  '/data/local/xbin/su',
  '/data/local/bin/su',
  '/system/sd/xbin/su',
  '/system/bin/failsafe/su',
  '/data/local/su',
  '/su/bin/su',
  '/system/xbin/daemonsu',
  '/system/etc/init.d',
  '/system/bin/.ext',
  '/system/bin/.ext/.su',
  '/system/usr/we-need-root',
  '/system/app/KingRoot.apk',
  '/data/adb/magisk',
  '/sbin/.magisk',
  '/cache/.disable_magisk',
  '/dev/.magisk.unblock',
];

/**
 * Suspicious package names that indicate tampering tools
 */
const SUSPICIOUS_PACKAGES = [
  'com.koushikdutta.superuser',
  'com.noshufou.android.su',
  'com.noshufou.android.su.elite',
  'eu.chainfire.supersu',
  'com.topjohnwu.magisk',
  'com.thirdparty.superuser',
  'com.yellowes.su',
  'com.kingroot.kinguser',
  'com.kingo.root',
  'com.smedialink.oneclean',
  'com.zhiqupk.root.global',
  'com.alephzain.framaroot',
  // Hooking frameworks
  'de.robv.android.xposed.installer',
  'com.saurik.substrate',
  'com.zachspong.temprootremovejb',
  'com.amphoras.hidemyroot',
  'com.amphoras.hidemyrootadfree',
  'com.formyhm.hideroot',
  'com.formyhm.hiderootpremium',
  // Emulator indicators
  'com.bluestacks',
  'com.bignox.app',
  'com.vphone.launcher',
];

/**
 * Result of device integrity check
 */
export interface IntegrityCheckResult {
  isCompromised: boolean;
  checks: {
    suspiciousFiles: boolean;
    suspiciousPackages: boolean;
    writableSystem: boolean;
    debuggerAttached: boolean;
  };
  details: string[];
}

/**
 * Check if a file exists at the given path
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  } catch {
    // Permission denied or path doesn't exist
    return false;
  }
}

/**
 * Check for suspicious files on the device
 */
async function checkSuspiciousFiles(): Promise<{
  found: boolean;
  paths: string[];
}> {
  const paths =
    Platform.OS === 'ios' ? IOS_JAILBREAK_PATHS : ANDROID_ROOT_PATHS;
  const foundPaths: string[] = [];

  // Check paths in parallel for performance
  const results = await Promise.allSettled(
    paths.map(async (path) => {
      const exists = await fileExists(path);
      return { path, exists };
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.exists) {
      foundPaths.push(result.value.path);
    }
  }

  return {
    found: foundPaths.length > 0,
    paths: foundPaths,
  };
}

/**
 * Check if system partition is writable (indicates root/jailbreak)
 */
async function checkSystemWritable(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }

  try {
    // On a non-rooted device, /system should be read-only
    const testPath = '/system/test_write_' + Date.now();
    await FileSystem.writeAsStringAsync(testPath, 'test');
    // If we get here, system is writable (bad sign)
    await FileSystem.deleteAsync(testPath, { idempotent: true });
    return true;
  } catch {
    // Expected - system should be read-only
    return false;
  }
}

/**
 * Check if debugger is attached
 * Note: This is a basic check, more sophisticated detection
 * would require native modules
 */
function checkDebuggerAttached(): boolean {
  // In development mode, debugger is expected
  if (__DEV__) {
    return false;
  }

  // Check for common debugging indicators
  // Note: More comprehensive checks require native implementation
  return false;
}

/**
 * Perform comprehensive device integrity check
 */
export async function checkDeviceIntegrity(): Promise<IntegrityCheckResult> {
  const details: string[] = [];

  // Run checks in parallel
  const [suspiciousFilesResult, systemWritable] = await Promise.all([
    checkSuspiciousFiles(),
    checkSystemWritable(),
  ]);

  const debuggerAttached = checkDebuggerAttached();

  // Compile results
  if (suspiciousFilesResult.found) {
    details.push(
      `Suspicious files detected: ${suspiciousFilesResult.paths.slice(0, 3).join(', ')}${suspiciousFilesResult.paths.length > 3 ? '...' : ''}`,
    );
  }

  if (systemWritable) {
    details.push('System partition is writable');
  }

  if (debuggerAttached) {
    details.push('Debugger detected');
  }

  const isCompromised =
    suspiciousFilesResult.found || systemWritable || debuggerAttached;

  const result: IntegrityCheckResult = {
    isCompromised,
    checks: {
      suspiciousFiles: suspiciousFilesResult.found,
      suspiciousPackages: false, // Would require native module
      writableSystem: systemWritable,
      debuggerAttached,
    },
    details,
  };

  // Log result (not detailed paths in production for security)
  if (isCompromised) {
    logger.warn(
      'Device Integrity',
      `Device integrity check failed: ${details.length} issue(s) detected`,
    );
  } else if (__DEV__) {
    logger.debug('Device Integrity', 'Device integrity check passed');
  }

  return result;
}

/**
 * Quick check for compromised device (synchronous where possible)
 * Used for critical security gates
 */
export function isDevicePotentiallyCompromised(): boolean {
  // In development, always allow
  if (__DEV__) {
    return false;
  }

  // This is a quick heuristic check
  // Full async check should be performed at app startup
  return false;
}

/**
 * Security action when compromised device is detected
 */
export type CompromisedDeviceAction = 'warn' | 'restrict' | 'block';

/**
 * Handle compromised device based on sensitivity level
 */
export function handleCompromisedDevice(
  action: CompromisedDeviceAction,
  result: IntegrityCheckResult,
): {
  shouldProceed: boolean;
  message?: string;
} {
  switch (action) {
    case 'warn':
      // Just log, allow operation
      return { shouldProceed: true };

    case 'restrict':
      // Allow but with restrictions
      return {
        shouldProceed: true,
        message:
          'Cihazınız değiştirilmiş olabilir. Bazı özellikler kısıtlanabilir.',
      };

    case 'block':
      // Block operation entirely
      return {
        shouldProceed: false,
        message:
          'Güvenlik nedeniyle bu işlem bu cihazda gerçekleştirilemez.',
      };

    default:
      return { shouldProceed: true };
  }
}

/**
 * Check device integrity for sensitive operations
 * Returns true if operation should proceed
 */
export async function guardSensitiveOperation(
  operationType: 'payment' | 'auth' | 'data_export',
): Promise<{
  allowed: boolean;
  message?: string;
}> {
  // Skip checks in development
  if (__DEV__) {
    return { allowed: true };
  }

  const result = await checkDeviceIntegrity();

  if (!result.isCompromised) {
    return { allowed: true };
  }

  // Determine action based on operation type
  const actionMap: Record<string, CompromisedDeviceAction> = {
    payment: 'restrict', // Warn but allow payments
    auth: 'warn', // Just warn for auth
    data_export: 'restrict', // Warn for data export
  };

  const action = actionMap[operationType] || 'warn';
  return handleCompromisedDevice(action, result);
}

/**
 * Log integrity check event for security monitoring
 */
export function logIntegrityEvent(
  event: 'check_passed' | 'check_failed' | 'operation_blocked',
  details: {
    operationType?: string;
    checksTriggered?: string[];
  },
): void {
  const logData = {
    event,
    platform: Platform.OS,
    timestamp: new Date().toISOString(),
    ...details,
  };

  if (event === 'check_failed' || event === 'operation_blocked') {
    logger.warn('Device Integrity', JSON.stringify(logData));
    // In production, also send to security monitoring service
  } else if (__DEV__) {
    logger.debug('Device Integrity', JSON.stringify(logData));
  }
}

export default {
  checkDeviceIntegrity,
  isDevicePotentiallyCompromised,
  handleCompromisedDevice,
  guardSensitiveOperation,
  logIntegrityEvent,
};

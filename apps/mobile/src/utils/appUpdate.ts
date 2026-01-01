/**
 * App Update Utility
 * Check for updates and prompt users to update
 */

import { Alert, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';
import { STORE_METADATA } from '../config/storeMetadata';

const UPDATE_CHECK_KEY = '@app_update_last_check';
const UPDATE_SKIP_KEY = '@app_update_skipped_version';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

/** Version check result type */
export type VersionCheckResult = 'FORCE' | 'OPTIONAL' | 'NONE';

/** Remote version configuration (typically from API or Firebase Remote Config) */
interface VersionConfig {
  minSupportedVersion: string; // If user version is below this, FORCE update
  currentVersion: string;      // Latest available version for OPTIONAL update prompt
  storeUrl: {
    ios: string;
    android: string;
  };
  forceUpdate: boolean; // Emergency flag to force update from backend
}

/** Mock remote config - replace with actual API call in production */
const MOCK_REMOTE_CONFIG: VersionConfig = {
  minSupportedVersion: '1.0.0',
  currentVersion: '1.1.0',
  storeUrl: {
    ios: 'https://apps.apple.com/app/id...',
    android: 'https://play.google.com/store/apps/details?id=...',
  },
  forceUpdate: false,
};

interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateRequired: boolean;
  updateAvailable: boolean;
  releaseNotes?: string;
  storeUrl: string;
}

interface UpdateCheckResult {
  shouldUpdate: boolean;
  isForced: boolean;
  version?: string;
  releaseNotes?: string;
}

/**
 * Get current app version
 */
export function getCurrentVersion(): string {
  return Application.nativeApplicationVersion || '1.0.0';
}

/**
 * Get current build number
 */
export function getBuildNumber(): string {
  return Application.nativeBuildVersion || '1';
}

/**
 * Compare version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Simple version check that returns update requirement status
 * Uses expo-constants for installed version and mock config for remote version
 *
 * @returns 'FORCE' if update is mandatory, 'OPTIONAL' if update available, 'NONE' if up-to-date
 *
 * @example
 * const status = await checkAppVersion();
 * if (status === 'FORCE') {
 *   // Show blocking update modal
 * } else if (status === 'OPTIONAL') {
 *   // Show optional update prompt
 * }
 */
export async function checkAppVersion(): Promise<VersionCheckResult> {
  try {
    const installedVersion = Constants.expoConfig?.version || '1.0.0';

    // In production, replace with actual API call:
    // const config = await api.get('/system/version-check');
    const config = MOCK_REMOTE_CONFIG;

    // Backend emergency force update flag
    if (config.forceUpdate) return 'FORCE';

    // Check if installed version is below minimum supported
    const isOutdated = compareVersions(installedVersion, config.minSupportedVersion) < 0;
    if (isOutdated) return 'FORCE';

    // Check if there's a newer version available
    const hasUpdate = compareVersions(installedVersion, config.currentVersion) < 0;
    if (hasUpdate) return 'OPTIONAL';

    return 'NONE';
  } catch (error) {
    logger.warn('Version check failed', error);
    return 'NONE';
  }
}

/**
 * Check if update check should be performed
 */
async function shouldCheckUpdate(): Promise<boolean> {
  try {
    const lastCheck = await AsyncStorage.getItem(UPDATE_CHECK_KEY);
    if (!lastCheck) return true;

    const lastCheckTime = parseInt(lastCheck, 10);
    return Date.now() - lastCheckTime > CHECK_INTERVAL;
  } catch {
    return true;
  }
}

/**
 * Mark update check as completed
 */
async function markUpdateChecked(): Promise<void> {
  try {
    await AsyncStorage.setItem(UPDATE_CHECK_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if version was skipped by user
 */
async function isVersionSkipped(version: string): Promise<boolean> {
  try {
    const skippedVersion = await AsyncStorage.getItem(UPDATE_SKIP_KEY);
    return skippedVersion === version;
  } catch {
    return false;
  }
}

/**
 * Skip a version
 */
async function skipVersion(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(UPDATE_SKIP_KEY, version);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get store URL based on platform
 */
export function getStoreUrl(): string {
  const { storeIds } = STORE_METADATA;

  if (Platform.OS === 'ios') {
    return `https://apps.apple.com/app/id${storeIds.ios.appStoreId}`;
  }
  return `https://play.google.com/store/apps/details?id=${storeIds.android.packageName}`;
}

/**
 * Open store page
 */
export async function openStore(): Promise<void> {
  const url = getStoreUrl();
  const canOpen = await Linking.canOpenURL(url);

  if (canOpen) {
    await Linking.openURL(url);
  } else {
    logger.warn('Cannot open store URL:', url);
  }
}

/**
 * Fetch latest version info from server using Supabase Edge Function
 * Gracefully handles missing endpoint (returns null, app continues normally)
 */
async function fetchVersionInfo(): Promise<VersionInfo | null> {
  try {
    // Import supabase config dynamically to avoid circular dependency
    const { SUPABASE_EDGE_URL, isSupabaseConfigured } = await import(
      '../config/supabase'
    );

    // Skip version check if Supabase is not configured
    if (!isSupabaseConfigured()) {
      logger.debug('Version check skipped: Supabase not configured');
      return null;
    }

    const currentVersion = getCurrentVersion();
    const storeUrl = getStoreUrl();

    // Call Supabase Edge Function for version check
    const response = await fetch(
      `${SUPABASE_EDGE_URL}/functions/v1/version-check`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform': Platform.OS,
          'X-App-Version': currentVersion,
        },
        body: JSON.stringify({
          platform: Platform.OS,
          currentVersion,
          bundleId:
            Platform.OS === 'ios'
              ? STORE_METADATA.storeIds.ios.bundleId
              : STORE_METADATA.storeIds.android.packageName,
        }),
      },
    );

    // If endpoint doesn't exist (404) or other server error, silently continue
    // This allows the app to work before the version check endpoint is deployed
    if (!response.ok) {
      if (response.status === 404) {
        logger.debug('Version check endpoint not available yet');
      } else {
        logger.warn(`Version check returned status ${response.status}`);
      }
      return null;
    }

    const data = await response.json();

    // Map the response to our VersionInfo format
    return {
      currentVersion,
      latestVersion: data.latestVersion || currentVersion,
      updateRequired: data.updateRequired || false,
      updateAvailable: data.updateAvailable || false,
      releaseNotes: data.releaseNotes,
      storeUrl,
    };
  } catch (error) {
    // Network errors, parse errors, etc - silently continue
    // The app should work even if version check fails
    logger.debug('Version check unavailable:', error);
    return null;
  }
}

/**
 * Check for app updates
 */
export async function checkForUpdates(force = false): Promise<UpdateCheckResult> {
  // Check if we should perform the check
  if (!force && !(await shouldCheckUpdate())) {
    return { shouldUpdate: false, isForced: false };
  }

  try {
    const versionInfo = await fetchVersionInfo();
    await markUpdateChecked();

    if (!versionInfo) {
      return { shouldUpdate: false, isForced: false };
    }

    const { latestVersion, updateRequired, updateAvailable, releaseNotes } = versionInfo;

    // Check if user skipped this version (only for optional updates)
    if (!updateRequired && await isVersionSkipped(latestVersion)) {
      return { shouldUpdate: false, isForced: false };
    }

    if (updateRequired || updateAvailable) {
      return {
        shouldUpdate: true,
        isForced: updateRequired,
        version: latestVersion,
        releaseNotes,
      };
    }

    return { shouldUpdate: false, isForced: false };
  } catch (error) {
    logger.error('Update check failed:', error);
    return { shouldUpdate: false, isForced: false };
  }
}

/**
 * Show update prompt to user
 */
export function showUpdatePrompt(
  version: string,
  isForced: boolean,
  releaseNotes?: string,
  onDismiss?: () => void
): void {
  const title = isForced ? 'Update Required' : 'Update Available';
  const message = releaseNotes
    ? `Version ${version} is available.\n\n${releaseNotes}`
    : `Version ${version} is available with new features and improvements.`;

  const buttons = isForced
    ? [
        {
          text: 'Update Now',
          onPress: openStore,
        },
      ]
    : [
        {
          text: 'Later',
          style: 'cancel' as const,
          onPress: onDismiss,
        },
        {
          text: 'Skip This Version',
          onPress: () => {
            skipVersion(version);
            onDismiss?.();
          },
        },
        {
          text: 'Update',
          onPress: openStore,
        },
      ];

  Alert.alert(title, message, buttons, {
    cancelable: !isForced,
  });
}

/**
 * Check and show update prompt if needed
 */
export async function checkAndPromptUpdate(force = false): Promise<void> {
  const result = await checkForUpdates(force);

  if (result.shouldUpdate && result.version) {
    showUpdatePrompt(result.version, result.isForced, result.releaseNotes);
  }
}

export default {
  getCurrentVersion,
  getBuildNumber,
  compareVersions,
  getStoreUrl,
  openStore,
  checkForUpdates,
  checkAppVersion,
  showUpdatePrompt,
  checkAndPromptUpdate,
};

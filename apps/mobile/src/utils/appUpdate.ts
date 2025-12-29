/**
 * App Update Utility
 * Check for updates and prompt users to update
 */

import { Alert, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

const UPDATE_CHECK_KEY = '@app_update_last_check';
const UPDATE_SKIP_KEY = '@app_update_skipped_version';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

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
  const appStoreId = '123456789'; // Replace with actual App Store ID
  const playStoreId = 'com.travelmatch.app'; // Replace with actual package name

  if (Platform.OS === 'ios') {
    return `https://apps.apple.com/app/id${appStoreId}`;
  }
  return `https://play.google.com/store/apps/details?id=${playStoreId}`;
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
 * Fetch latest version info from server
 * Replace with your actual API endpoint
 */
async function fetchVersionInfo(): Promise<VersionInfo | null> {
  try {
    // TODO: Replace with actual version check endpoint
    const response = await fetch('https://api.travelmatch.app/v1/version', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Platform': Platform.OS,
        'X-Current-Version': getCurrentVersion(),
      },
    });

    if (!response.ok) {
      throw new Error(`Version check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    logger.error('Failed to fetch version info:', error);
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
  showUpdatePrompt,
  checkAndPromptUpdate,
};

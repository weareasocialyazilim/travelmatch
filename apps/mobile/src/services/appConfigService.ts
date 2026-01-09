/**
 * App Version and Maintenance Check Service
 * Checks backend for maintenance mode and minimum required version
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface AppConfig {
  isMaintenanceMode: boolean;
  maintenanceMessage?: string;
  minRequiredVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  updateMessage?: string;
}

/**
 * Get current app version from package.json
 */
export const getCurrentVersion = (): string => {
  return Constants.expoConfig?.version || '1.0.0';
};

/**
 * Compare two version strings (semantic versioning)
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export const compareVersions = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart < bPart) return -1;
    if (aPart > bPart) return 1;
  }

  return 0;
};

/**
 * Check if current version is below minimum required
 */
export const isVersionOutdated = (
  currentVersion: string,
  minVersion: string,
): boolean => {
  return compareVersions(currentVersion, minVersion) < 0;
};

/**
 * Fetch app configuration from backend
 */
export const fetchAppConfig = async (): Promise<AppConfig> => {
  try {
    const currentVersion = getCurrentVersion();
    const platform = Platform.OS;

    // Fetch from app_config table (should be created in Supabase)
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('platform', platform)
      .single();

    if (error) {
      logger.warn('[AppConfig] Failed to fetch config:', error);
      // Return safe defaults on error
      return {
        isMaintenanceMode: false,
        minRequiredVersion: '1.0.0',
        currentVersion,
        forceUpdate: false,
      };
    }

    // Type assertion for data structure
    const configData = data as {
      is_maintenance?: boolean;
      maintenance_message?: string;
      min_version?: string;
      update_message?: string;
    };

    const config: AppConfig = {
      isMaintenanceMode: configData.is_maintenance || false,
      maintenanceMessage: configData.maintenance_message,
      minRequiredVersion: configData.min_version || '1.0.0',
      currentVersion,
      forceUpdate: isVersionOutdated(
        currentVersion,
        configData.min_version || '1.0.0',
      ),
      updateMessage: configData.update_message,
    };

    logger.info('[AppConfig] Fetched config:', {
      maintenance: config.isMaintenanceMode,
      forceUpdate: config.forceUpdate,
      currentVersion: config.currentVersion,
      minVersion: config.minRequiredVersion,
    });

    return config;
  } catch (error) {
    logger.error('[AppConfig] Error fetching config:', error);
    // Return safe defaults on error
    const currentVersion = getCurrentVersion();
    return {
      isMaintenanceMode: false,
      minRequiredVersion: '1.0.0',
      currentVersion,
      forceUpdate: false,
    };
  }
};

/**
 * Create app_config table migration
 *
 * SQL to run in Supabase:
 *
 * CREATE TABLE IF NOT EXISTS app_config (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
 *   is_maintenance BOOLEAN DEFAULT FALSE,
 *   maintenance_message TEXT,
 *   min_version TEXT NOT NULL DEFAULT '1.0.0',
 *   update_message TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   UNIQUE(platform)
 * );
 *
 * -- Insert default configs
 * INSERT INTO app_config (platform, min_version)
 * VALUES
 *   ('ios', '1.0.0'),
 *   ('android', '1.0.0'),
 *   ('web', '1.0.0')
 * ON CONFLICT (platform) DO NOTHING;
 *
 * -- Enable RLS
 * ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;
 *
 * -- Allow anyone to read config
 * CREATE POLICY "Allow public read on app_config"
 *   ON app_config FOR SELECT
 *   USING (true);
 */

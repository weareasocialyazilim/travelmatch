import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/**
 * Reads from `key` first. If missing, tries legacy keys and migrates the first
 * found value to `key` (best-effort), then deletes the legacy key.
 */
export async function getItemWithLegacyFallback(
  key: string,
  legacyKeys: string[],
): Promise<string | null> {
  const direct = await AsyncStorage.getItem(key);
  if (direct !== null) return direct;

  for (const legacyKey of legacyKeys) {
    const legacyValue = await AsyncStorage.getItem(legacyKey);
    if (legacyValue !== null) {
      await AsyncStorage.setItem(key, legacyValue).catch(() => undefined);
      await AsyncStorage.removeItem(legacyKey).catch(() => undefined);
      logger.info('[StorageMigration] Migrated AsyncStorage key', {
        from: legacyKey,
        to: key,
      });
      return legacyValue;
    }
  }

  return null;
}

/**
 * Writes to `key` and removes any legacy keys (best-effort).
 */
export async function setItemAndCleanupLegacy(
  key: string,
  value: string,
  legacyKeys: string[],
): Promise<void> {
  await AsyncStorage.setItem(key, value);
  await Promise.all(
    legacyKeys.map((legacyKey) =>
      AsyncStorage.removeItem(legacyKey).catch(() => undefined),
    ),
  );
}

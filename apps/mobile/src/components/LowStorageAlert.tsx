/**
 * Low Storage Alert
 * 
 * Shows warning when device storage is low.
 * Prevents upload failures by alerting user early.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { StorageLevel } from '../services/storageMonitor';

interface LowStorageAlertProps {
  visible: boolean;
  level: StorageLevel;
  freeSpace: string;
  estimatedUploads?: number;
  onDismiss: () => void;
  onOpenSettings?: () => void;
}

export const LowStorageAlert: React.FC<LowStorageAlertProps> = ({
  visible,
  level,
  freeSpace,
  estimatedUploads = 0,
  onDismiss,
  onOpenSettings,
}) => {
  const isCritical = level === StorageLevel.CRITICAL;

  const handleOpenSettings = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else {
      // Open device storage settings
      if (Platform.OS === 'ios') {
        Linking.openURL('App-Prefs:root=General&path=iPhone Storage');
      } else {
        Linking.sendIntent('android.settings.INTERNAL_STORAGE_SETTINGS');
      }
    }
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            isCritical ? styles.iconContainerCritical : styles.iconContainerWarning,
          ]}>
            <MaterialCommunityIcons
              name={isCritical ? 'alert-octagon' : 'alert'}
              size={48}
              color={isCritical ? COLORS.feedback.error : COLORS.softOrange}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {isCritical ? 'Storage Critical' : 'Low Storage'}
          </Text>

          {/* Message */}
          <Text style={styles.message}>
            {isCritical ? (
              <>
                Your device storage is critically low ({freeSpace} remaining).
                {'\n\n'}
                <Text style={styles.bold}>
                  Uploads are disabled until you free up space.
                </Text>
              </>
            ) : (
              <>
                Your device storage is running low ({freeSpace} remaining).
                {estimatedUploads > 0 && (
                  <>
                    {'\n\n'}
                    You can upload approximately <Text style={styles.bold}>{estimatedUploads} more photos</Text> before running out of space.
                  </>
                )}
              </>
            )}
          </Text>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Quick tips to free up space:</Text>
            <View style={styles.tip}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.mint} />
              <Text style={styles.tipText}>Delete unused apps</Text>
            </View>
            <View style={styles.tip}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.mint} />
              <Text style={styles.tipText}>Clear cache in Settings</Text>
            </View>
            <View style={styles.tip}>
              <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.mint} />
              <Text style={styles.tipText}>Remove old photos & videos</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {!isCritical && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onDismiss}
              >
                <Text style={styles.secondaryButtonText}>Continue Anyway</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleOpenSettings}
            >
              <MaterialCommunityIcons name="cog" size={18} color={COLORS.utility.white} />
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>

          {isCritical && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
              <Text style={styles.dismissText}>I'll handle this later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerWarning: {
    backgroundColor: COLORS.softOrange + '20',
  },
  iconContainerCritical: {
    backgroundColor: COLORS.feedback.error + '20',
  },
  title: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.mint,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.utility.white,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  dismissButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  dismissText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
  },
});

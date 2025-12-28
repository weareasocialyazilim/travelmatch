/**
 * Confirmation Dialog Context
 * Global confirmation dialog system for the app
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { SHADOWS } from '../constants/shadows';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { logger } from '../utils/logger';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationConfig {
  title: string;
  message: string;
  type?: ConfirmationType;
  icon?: IconName;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationContextValue {
  showConfirmation: (config: ConfirmationConfig) => void;
  hideConfirmation: () => void;
}

const ConfirmationContext = createContext<ConfirmationContextValue | undefined>(
  undefined,
);

export const useConfirmation = (): ConfirmationContextValue => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
};

interface ConfirmationProviderProps {
  children: ReactNode;
}

export const ConfirmationProvider: React.FC<ConfirmationProviderProps> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ConfirmationConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.9);

  const showConfirmation = useCallback(
    (newConfig: ConfirmationConfig) => {
      setConfig(newConfig);
      setVisible(true);
      fadeAnim.value = withTiming(1, { duration: 200 });
      scaleAnim.value = withSpring(1, {
        damping: 15,
        stiffness: 120,
      });
    },
    [fadeAnim, scaleAnim],
  );

  const hideConfirmation = useCallback(() => {
    fadeAnim.value = withTiming(0, { duration: 150 });
    scaleAnim.value = withTiming(0.9, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(setVisible)(false);
        runOnJS(setConfig)(null);
        runOnJS(setLoading)(false);
      }
    });
  }, [fadeAnim, scaleAnim]);

  const handleConfirm = useCallback(async () => {
    if (!config) return;

    setLoading(true);
    try {
      await config.onConfirm();
      hideConfirmation();
    } catch (error) {
      setLoading(false);
      // Could show error toast here
      logger.error('Confirmation action failed:', error);
    }
  }, [config, hideConfirmation]);

  const handleCancel = useCallback(() => {
    if (config?.onCancel) {
      config.onCancel();
    }
    hideConfirmation();
  }, [config, hideConfirmation]);

  const getTypeConfig = (type: ConfirmationType = 'info') => {
    switch (type) {
      case 'danger':
        return {
          icon: 'alert-circle' as IconName,
          color: COLORS.feedback.error,
          backgroundColor: COLORS.errorLight,
        };
      case 'warning':
        return {
          icon: 'alert' as IconName,
          color: COLORS.feedback.warning,
          backgroundColor: COLORS.warningLight,
        };
      case 'success':
        return {
          icon: 'check-circle' as IconName,
          color: COLORS.feedback.success,
          backgroundColor: COLORS.successLight,
        };
      case 'info':
      default:
        return {
          icon: 'information' as IconName,
          color: COLORS.brand.primary,
          backgroundColor: COLORS.brand.primaryLight,
        };
    }
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: fadeAnim.value,
  }));

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({ showConfirmation, hideConfirmation }),
    [showConfirmation, hideConfirmation],
  );

  return (
    <ConfirmationContext.Provider value={contextValue}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleCancel}
        statusBarTranslucent
      >
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleCancel}
          />
          {config && (
            <Animated.View style={[styles.container, containerStyle]}>
              {/* Icon */}
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: getTypeConfig(config.type).backgroundColor,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={config.icon || getTypeConfig(config.type).icon}
                  size={32}
                  color={
                    config.confirmButtonColor ||
                    getTypeConfig(config.type).color
                  }
                />
              </View>

              {/* Title */}
              <Text style={styles.title}>{config.title}</Text>

              {/* Message */}
              <Text style={styles.message}>{config.message}</Text>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.8}
                  disabled={loading}
                  accessibilityLabel={config.cancelText || 'Cancel'}
                  accessibilityRole="button"
                >
                  <Text style={styles.cancelButtonText}>
                    {config.cancelText || 'Cancel'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    {
                      backgroundColor:
                        config.confirmButtonColor ||
                        getTypeConfig(config.type).color,
                    },
                    loading && styles.buttonDisabled,
                  ]}
                  onPress={handleConfirm}
                  activeOpacity={0.8}
                  disabled={loading}
                  accessibilityLabel={config.confirmText || 'Confirm'}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <Text style={styles.confirmButtonText}>Loading...</Text>
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {config.confirmText || 'Confirm'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </Modal>
    </ConfirmationContext.Provider>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay.heavy,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: Math.min(SCREEN_WIDTH - SPACING.lg * 2, 340),
    backgroundColor: COLORS.surface.base,
    borderRadius: radii.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.bg.primaryLight,
    borderRadius: radii.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  confirmButton: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  confirmButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.utility.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ConfirmationProvider;

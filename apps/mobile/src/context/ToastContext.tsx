/**
 * Toast Context
 * Global toast notification system
 * Uses react-native-reanimated for native-thread animations.
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  memo,
  useEffect,
} from 'react';
import { Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../theme/typography';
import { radii } from '../constants/radii';
import { SHADOWS } from '../constants/shadows';
import { SPACING } from '../constants/spacing';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = Date.now().toString();
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    },
    [],
  );

  const success = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'success', duration),
    [showToast],
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'error', duration),
    [showToast],
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'warning', duration),
    [showToast],
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      showToast(message, 'info', duration),
    [showToast],
  );

  // Memoize dismiss handler to prevent unnecessary re-renders
  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo<ToastContextValue>(
    () => ({ showToast, success, error, warning, info }),
    [showToast, success, error, warning, info],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={handleDismiss} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </SafeAreaView>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

// Memoized ToastItem to prevent re-renders when other toasts change
const ToastItem: React.FC<ToastItemProps> = memo(({ toast, onDismiss }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-100);

  useEffect(() => {
    // Animate in
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
  }, [opacity, translateY]);

  const handleDismiss = useCallback(() => {
    // Animate out then call onDismiss
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-100, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)(toast.id);
      }
    });
  }, [opacity, translateY, onDismiss, toast.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return { backgroundColor: COLORS.success };
      case 'error':
        return { backgroundColor: COLORS.error };
      case 'warning':
        return { backgroundColor: COLORS.warning };
      case 'info':
      default:
        return { backgroundColor: COLORS.primary };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Animated.View style={[styles.toast, getToastStyle(), animatedStyle]}>
      <TouchableOpacity
        style={styles.toastContent}
        onPress={handleDismiss}
        activeOpacity={0.9}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message} numberOfLines={3}>
          {toast.message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

ToastItem.displayName = 'ToastItem';

const styles = StyleSheet.create({
  container: {
    left: 0,
    padding: SPACING.md,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 9999,
  },
  icon: {
    color: COLORS.white,
    ...TYPOGRAPHY.h3,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    flex: 1,
    fontWeight: '500',
  },
  toast: {
    ...SHADOWS.md,
    borderRadius: radii.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  toastContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

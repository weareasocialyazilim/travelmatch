/**
 * ToastContext
 * Provides toast notification functionality
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [opacity] = useState(new Animated.Value(0));

  const showToast = useCallback((options: ToastOptions) => {
    setToast(options);
  }, []);

  useEffect(() => {
    if (toast) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(toast.duration || 3000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    }
  }, [toast, opacity]);

  const getToastConfig = (type: ToastType = 'info') => {
    const configs = {
      success: {
        icon: 'check-circle' as const,
        color: COLORS.success,
        bgColor: COLORS.success + '15',
      },
      error: {
        icon: 'alert-circle' as const,
        color: COLORS.error,
        bgColor: COLORS.error + '15',
      },
      warning: {
        icon: 'alert' as const,
        color: COLORS.warning,
        bgColor: COLORS.warning + '15',
      },
      info: {
        icon: 'information' as const,
        color: COLORS.info,
        bgColor: COLORS.info + '15',
      },
    };
    return configs[type];
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toast,
            { opacity, backgroundColor: getToastConfig(toast.type).bgColor },
          ]}
        >
          <MaterialCommunityIcons
            name={getToastConfig(toast.type).icon}
            size={20}
            color={getToastConfig(toast.type).color}
          />
          <Text
            style={[
              styles.message,
              { color: getToastConfig(toast.type).color },
            ]}
          >
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ToastContext;

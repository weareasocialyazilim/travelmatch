import type { ReactNode } from 'react';
import React, { Component } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import * as Sentry from '../config/sentry';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { logger } from '../utils/logger';

// Safe __DEV__ check for Jest environment
const isDev =
  typeof __DEV__ !== 'undefined'
    ? __DEV__
    : process.env.NODE_ENV !== 'production';

export type ErrorFallbackType =
  | 'generic'
  | 'network'
  | 'server'
  | 'notfound'
  | 'unauthorized'
  | 'critical';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackType?: ErrorFallbackType;
  fallback?: (
    error: Error,
    resetError: () => void,
    goHome: () => void,
  ) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'app' | 'navigation' | 'screen' | 'component';
  navigation?: any; // Optional navigation prop for routing
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, level = 'component' } = this.props;

    // Update state with error info
    this.setState({ errorInfo });

    // Log error
    logger.error(`[${level.toUpperCase()} Error Boundary]`, error);

    if (isDev) {
      logger.debug('Error Stack', { stack: error.stack });
      logger.debug('Component Stack', {
        componentStack: errorInfo.componentStack,
      });
    }

    // Send to Sentry with detailed context
    try {
      Sentry.addBreadcrumb('Error Boundary', 'error', 'error', {
        level,
        componentStack: errorInfo.componentStack,
        errorMessage: error.message,
        errorName: error.name,
      });

      Sentry.captureException(error, {
        level: level === 'app' || level === 'navigation' ? 'fatal' : 'error',
        tags: {
          errorBoundaryLevel: level,
          platform: Platform.OS,
        },
        contexts: {
          errorBoundary: {
            level,
            componentStack: errorInfo.componentStack,
          },
        },
      });
    } catch (sentryError) {
      logger.error('Failed to report to Sentry', sentryError as Error);
    }

    // Custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = (): void => {
    const { navigation } = this.props;

    this.setState({ hasError: false, error: null, errorInfo: null }, () => {
      if (navigation) {
        // Reset navigation to home screen
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Discover' }],
          }),
        );
      }
    });
  };

  getErrorContent = (): {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    title: string;
    message: string;
    showRetry: boolean;
    showHome: boolean;
  } => {
    const { fallbackType = 'generic', level = 'component' } = this.props;
    const { error } = this.state;

    // Determine error type from error message if fallbackType is generic
    let effectiveType = fallbackType;
    if (fallbackType === 'generic' && error) {
      const errorMessage = (error.message || '').toLowerCase();
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        effectiveType = 'network';
      } else if (
        errorMessage.includes('404') ||
        errorMessage.includes('not found')
      ) {
        effectiveType = 'notfound';
      } else if (
        errorMessage.includes('401') ||
        errorMessage.includes('unauthorized')
      ) {
        effectiveType = 'unauthorized';
      } else if (
        errorMessage.includes('500') ||
        errorMessage.includes('server')
      ) {
        effectiveType = 'server';
      }
    }

    switch (effectiveType) {
      case 'network':
        return {
          icon: 'wifi-off',
          title: 'Bağlantı Hatası',
          message: 'İnternet bağlantınızı kontrol edip tekrar deneyin.',
          showRetry: true,
          showHome: level !== 'component',
        };

      case 'server':
        return {
          icon: 'server-network-off',
          title: 'Sunucu Hatası',
          message:
            'Sunucularımızda bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
          showRetry: true,
          showHome: true,
        };

      case 'notfound':
        return {
          icon: 'map-marker-question-outline',
          title: 'Sayfa Bulunamadı',
          message: 'Aradığınız sayfa mevcut değil.',
          showRetry: false,
          showHome: true,
        };

      case 'unauthorized':
        return {
          icon: 'lock-alert-outline',
          title: 'Yetkilendirme Hatası',
          message: 'Bu içeriğe erişim yetkiniz yok. Lütfen tekrar giriş yapın.',
          showRetry: false,
          showHome: true,
        };

      case 'critical':
        return {
          icon: 'alert-octagon-outline',
          title: 'Kritik Hata',
          message:
            'Beklenmeyen bir hata oluştu. Uygulamayı yeniden başlatmanız gerekebilir.',
          showRetry: true,
          showHome: true,
        };

      default: // generic
        return {
          icon: 'alert-circle-outline',
          title: level === 'app' ? 'Bir Şeyler Yanlış Gitti' : 'Hata Oluştu',
          message:
            level === 'app'
              ? 'Özür dileriz. Lütfen uygulamayı yeniden başlatın veya ana sayfaya dönün.'
              : 'Lütfen tekrar deneyin veya geri dönün.',
          showRetry: true,
          showHome: level !== 'component',
        };
    }
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset, this.handleGoHome);
      }

      // Get error content based on type
      const content = this.getErrorContent();

      // Default fallback UI
      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={content.icon}
                  size={80}
                  color={COLORS.error}
                />
              </View>

              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.message}>{content.message}</Text>

              {isDev && error && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Debug Info:</Text>
                  <Text style={styles.errorDetails}>{error.toString()}</Text>
                  {error.stack && (
                    <Text style={styles.errorStack} numberOfLines={5}>
                      {error.stack}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                {content.showRetry && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonPrimary]}
                    onPress={this.handleReset}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="refresh"
                      size={20}
                      color={COLORS.background}
                    />
                    <Text style={styles.buttonTextPrimary}>Tekrar Dene</Text>
                  </TouchableOpacity>
                )}

                {content.showHome && (
                  <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={this.handleGoHome}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="home-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={styles.buttonTextSecondary}>
                      Ana Sayfaya Dön
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: LAYOUT.size.errorMessageMax,
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...TYPOGRAPHY.h1,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
    color: COLORS.text,
  },
  message: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  debugContainer: {
    backgroundColor: COLORS.errorBackground,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    width: '100%',
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: spacing.xs,
  },
  errorDetails: {
    fontSize: 11,
    color: COLORS.softRed,
    marginBottom: spacing.xs,
  },
  errorStack: {
    fontSize: 10,
    color: COLORS.softRed,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    minHeight: 48,
    gap: spacing.xs,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  buttonTextPrimary: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonTextSecondary: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

/**
 * Convenience wrappers for different error boundary levels
 */
export const AppErrorBoundary: React.FC<{
  children: ReactNode;
  navigation?: any;
}> = ({ children, navigation }) => (
  <ErrorBoundary level="app" fallbackType="critical" navigation={navigation}>
    {children}
  </ErrorBoundary>
);

export const NavigationErrorBoundary: React.FC<{
  children: ReactNode;
  navigation?: any;
}> = ({ children, navigation }) => (
  <ErrorBoundary level="navigation" navigation={navigation}>
    {children}
  </ErrorBoundary>
);

export const ScreenErrorBoundary: React.FC<{
  children: ReactNode;
  fallbackType?: ErrorFallbackType;
  navigation?: any;
}> = ({ children, fallbackType, navigation }) => (
  <ErrorBoundary
    level="screen"
    fallbackType={fallbackType}
    navigation={navigation}
  >
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{
  children: ReactNode;
  fallbackType?: ErrorFallbackType;
}> = ({ children, fallbackType }) => (
  <ErrorBoundary level="component" fallbackType={fallbackType}>
    {children}
  </ErrorBoundary>
);

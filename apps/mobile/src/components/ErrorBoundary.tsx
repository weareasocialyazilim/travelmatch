import type { ReactNode } from 'react';
import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sentry from '../config/sentry';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { logger } from '../utils/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'app' | 'navigation' | 'screen' | 'component';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, level = 'component' } = this.props;

    // Log error
    logger.error(`[${level.toUpperCase()} Error Boundary]`, error);

    if (__DEV__) {
      logger.debug('Error Stack', { stack: error.stack });
      logger.debug('Component Stack', {
        componentStack: errorInfo.componentStack,
      });
    }

    // Send to Sentry
    try {
      Sentry.addBreadcrumb('Error Boundary', 'error', 'error', {
        level,
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error, {
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
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children: _children, fallback, level = 'component' } = this.props;

    if (hasError && error) {
      logger.debug('ErrorBoundary rendering error view. styles:', styles);
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default fallback UI with icon
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={64}
              color={COLORS.error}
            />
            <Text style={styles.title}>
              {level === 'app'
                ? 'Oops! Something went wrong'
                : 'Error occurred'}
            </Text>
            <Text style={styles.message}>
              {level === 'app'
                ? "We're sorry for the inconvenience. Please restart the app."
                : 'Please try again or go back.'}
            </Text>
            {__DEV__ && error && (
              <Text style={styles.errorDetails}>{error.toString()}</Text>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.lg,
    minWidth: LAYOUT.size.errorButtonMin,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: LAYOUT.size.errorMessageMax,
  },
  errorDetails: {
    backgroundColor: COLORS.errorBackground,
    borderRadius: radii.md,
    color: COLORS.softRed,
    fontSize: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});

/**
 * Convenience wrappers for different error boundary levels
 */
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="app">{children}</ErrorBoundary>;

export const NavigationErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="navigation">{children}</ErrorBoundary>;

export const ScreenErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="screen">{children}</ErrorBoundary>;

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children,
}) => <ErrorBoundary level="component">{children}</ErrorBoundary>;

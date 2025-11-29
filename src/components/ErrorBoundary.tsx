import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';

interface ErrorBoundaryProps {
  children: ReactNode;
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
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We&apos;re sorry for the inconvenience. Please try again.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>
                {this.state.error.toString()}
              </Text>
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
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
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

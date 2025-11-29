import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

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
    borderRadius: 12,
    minWidth: LAYOUT.size.errorButtonMin,
    paddingHorizontal: 32,
    paddingVertical: 16,
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
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: LAYOUT.size.errorMessageMax,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorDetails: {
    backgroundColor: COLORS.errorBackground,
    borderRadius: 8,
    color: COLORS.softRed,
    fontSize: 12,
    marginBottom: 24,
    padding: 12,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});

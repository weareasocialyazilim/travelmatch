/**
 * Error Recovery Components
 * UI components for error handling and network status
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import Button from './Button';

/**
 * Error View Props
 */
type ErrorViewProps = {
  error?: Error | string;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onUseCachedData?: () => void;
  showCachedOption?: boolean;
};

/**
 * Error View Component
 * Displays error state with retry and fallback options
 *
 * @example
 * <ErrorView
 *   error={error}
 *   onRetry={handleRetry}
 *   onUseCachedData={useCachedData}
 *   showCachedOption={true}
 * />
 */
export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  title,
  message,
  onRetry,
  onUseCachedData,
  showCachedOption = false,
}) => {
  const errorMessage =
    message ||
    (typeof error === 'string' ? error : error?.message) ||
    'Something went wrong';

  const errorTitle = title || 'Oops!';

  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={64}
          color={COLORS.error}
        />
      </View>

      <Text style={styles.errorTitle}>{errorTitle}</Text>
      <Text style={styles.errorMessage}>{errorMessage}</Text>

      <View style={styles.errorActions}>
        {onRetry && (
          <Button
            title="Try Again"
            onPress={onRetry}
            variant="primary"
            style={styles.errorButton}
          />
        )}

        {showCachedOption && onUseCachedData && (
          <Button
            title="Use Cached Data"
            onPress={onUseCachedData}
            variant="outline"
            style={styles.errorButton}
          />
        )}
      </View>
    </View>
  );
};

/**
 * Network Error View
 * Specialized error view for network-related errors
 */
type NetworkErrorViewProps = {
  onRetry?: () => void;
  onGoOffline?: () => void;
};

export const NetworkErrorView: React.FC<NetworkErrorViewProps> = ({
  onRetry,
  onGoOffline,
}) => {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={64}
          color={COLORS.error}
        />
      </View>

      <Text style={styles.errorTitle}>No Internet Connection</Text>
      <Text style={styles.errorMessage}>
        Please check your connection and try again
      </Text>

      <View style={styles.errorActions}>
        {onRetry && (
          <Button
            title="Retry"
            onPress={onRetry}
            variant="primary"
            style={styles.errorButton}
          />
        )}

        {onGoOffline && (
          <Button
            title="Continue Offline"
            onPress={onGoOffline}
            variant="outline"
            style={styles.errorButton}
          />
        )}
      </View>
    </View>
  );
};

/**
 * Offline Banner Props
 */
type OfflineBannerProps = {
  visible: boolean;
  onRetry?: () => void;
};

/**
 * Offline Banner Component
 * Shows banner at top when offline
 *
 * @example
 * const isOnline = useNetworkStatus();
 * <OfflineBanner visible={!isOnline} onRetry={checkConnection} />
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible,
  onRetry,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.offlineBanner, { opacity: fadeAnim }]}>
      <MaterialCommunityIcons name="wifi-off" size={20} color={COLORS.white} />
      <Text style={styles.offlineBannerText}>No Internet Connection</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={styles.offlineBannerButton}>
          <Text style={styles.offlineBannerButtonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

/**
 * Network Status Indicator
 * Shows subtle indicator of network status
 */
type NetworkStatusProps = {
  isOnline: boolean;
};

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline }) => {
  if (isOnline) return null;

  return (
    <View style={styles.networkStatus}>
      <View style={styles.offlineDot} />
      <Text style={styles.networkStatusText}>Offline</Text>
    </View>
  );
};

/**
 * Loading with Retry
 * Shows loading state with option to cancel/retry
 */
type LoadingWithRetryProps = {
  message?: string;
  onCancel?: () => void;
  retryCount?: number;
  maxRetries?: number;
};

export const LoadingWithRetry: React.FC<LoadingWithRetryProps> = ({
  message = 'Loading...',
  onCancel,
  retryCount = 0,
  maxRetries = 3,
}) => {
  return (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingMessage}>{message}</Text>

      {retryCount > 0 && (
        <Text style={styles.retryText}>
          Retry attempt {retryCount} of {maxRetries}
        </Text>
      )}

      {onCancel && (
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  errorIcon: {
    marginBottom: SPACING.lg,
  },
  errorTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: 300,
  },
  errorActions: {
    width: '100%',
    maxWidth: 300,
    gap: SPACING.md,
  },
  errorButton: {
    width: '100%',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  offlineBannerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    flex: 1,
  },
  offlineBannerButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    opacity: 0.2,
    borderRadius: 4,
  },
  offlineBannerButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    gap: SPACING.xs,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  networkStatusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingMessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  retryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  cancelButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

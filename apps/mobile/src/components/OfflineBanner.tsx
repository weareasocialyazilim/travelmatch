import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useNetwork } from '../hooks/useNetwork';

interface OfflineBannerProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Offline Banner Component
 * Shows when device is offline
 */
const OfflineBanner: React.FC<OfflineBannerProps> = ({
  message = "You're offline",
  showRetry = true,
  onRetry,
}) => {
  const { isOffline, checkConnection } = useNetwork();

  if (!isOffline) {
    return null;
  }

  const handleRetry = async () => {
    const isConnected = await checkConnection();
    if (isConnected) {
      onRetry?.();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={18}
          color={COLORS.white}
        />
        <Text style={styles.message}>{message}</Text>
      </View>

      {showRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  message: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: COLORS.whiteOverlay20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;

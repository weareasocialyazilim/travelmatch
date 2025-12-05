/**
 * Network State Provider
 * Monitors network connectivity and provides offline status
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import type { NetInfoState } from '@react-native-community/netinfo';
import NetInfo from '@react-native-community/netinfo';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { radii as _radii } from '../constants/radii';
import { TYPOGRAPHY } from '../constants/typography';

interface NetworkContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  networkType: string | null;
  refresh: () => Promise<void>;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(
  undefined,
);

export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

interface NetworkProviderProps {
  children: ReactNode;
}

export const NetworkProvider: React.FC<NetworkProviderProps> = ({
  children,
}) => {
  const [networkState, setNetworkState] = useState<NetInfoState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerAnim] = useState(new Animated.Value(-60));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState(state);

      // Show/hide offline banner
      if (state.isConnected === false) {
        setShowBanner(true);
        Animated.spring(bannerAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
      } else if (showBanner) {
        Animated.timing(bannerAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowBanner(false));
      }
    });

    return () => unsubscribe();
  }, [showBanner, bannerAnim]);

  const refresh = useCallback(async () => {
    const state = await NetInfo.refresh();
    setNetworkState(state);
  }, []);

  const value: NetworkContextValue = {
    isConnected: networkState?.isConnected ?? true,
    isInternetReachable: networkState?.isInternetReachable ?? null,
    networkType: networkState?.type ?? null,
    refresh,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
      {showBanner && (
        <Animated.View
          style={[
            styles.offlineBanner,
            { transform: [{ translateY: bannerAnim }] },
          ]}
        >
          <View style={styles.offlineBannerContent}>
            <MaterialCommunityIcons
              name="wifi-off"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.offlineBannerText}>
              You&apos;re offline. Some features may be unavailable.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refresh}
            accessibilityLabel="Retry connection"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </NetworkContext.Provider>
  );
};

const styles = StyleSheet.create({
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + spacing.md, // Account for status bar
    paddingBottom: spacing.sm,
    zIndex: 9999,
  },
  offlineBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  offlineBannerText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.white,
    flex: 1,
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteOverlay20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NetworkProvider;

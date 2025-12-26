/**
 * InitializationScreen
 *
 * A proper loading screen shown during app bootstrap.
 * Shows:
 * - App logo with animation
 * - Loading progress with service names
 * - Error states with retry option
 * - Graceful transition to main app
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { BootstrapProgress, ServiceName } from '@/services/appBootstrap';

// Asset imports - using require is necessary for local image assets

const appIcon = require('../../assets/icon.png') as number;

interface InitializationScreenProps {
  progress: BootstrapProgress;
  onRetry?: (serviceName: ServiceName) => void;
}

export const InitializationScreen: React.FC<InitializationScreenProps> = ({
  progress,
  onRetry,
}) => {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const [showDetails, setShowDetails] = useState(false);

  // Animate logo on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Show progress after logo animation
    setTimeout(() => {
      Animated.timing(progressOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 400);
  }, [logoOpacity, logoScale, progressOpacity]);

  const failedServices = Array.from(progress.services.values()).filter(
    (s) => s.status === 'failed',
  );

  const currentService = progress.currentService
    ? progress.services.get(progress.currentService)
    : null;

  const progressPercent = (progress.currentStep / progress.totalSteps) * 100;

  return (
    <LinearGradient
      colors={[COLORS.background, COLORS.surface]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <StatusBar style="dark" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Image source={appIcon} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* App Name */}
        <Animated.View style={{ opacity: logoOpacity }}>
          <Text style={styles.appName}>TravelMatch</Text>
          <Text style={styles.tagline}>
            Connect with locals. Share experiences.
          </Text>
        </Animated.View>
      </View>

      {/* Progress Section */}
      <Animated.View
        style={[styles.progressSection, { opacity: progressOpacity }]}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Status Text */}
        {currentService && (
          <View style={styles.statusContainer}>
            <LoadingDots />
            <Text style={styles.statusText}>
              {currentService.displayName}...
            </Text>
          </View>
        )}

        {/* Error State */}
        {failedServices.length > 0 && !progress.canContinue && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️ Kritik hata oluştu</Text>
            {failedServices.map((service) => (
              <View key={service.name} style={styles.errorItem}>
                <Text style={styles.errorText}>
                  {service.displayName}: {service.error}
                </Text>
                {onRetry && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => onRetry(service.name)}
                  >
                    <Text style={styles.retryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Non-critical failures (tap to see details) */}
        {failedServices.length > 0 && progress.canContinue && (
          <TouchableOpacity
            style={styles.warningContainer}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.warningText}>
              ⚠️ {failedServices.length} servis yüklenemedi (detay için dokun)
            </Text>
            {showDetails && (
              <View style={styles.detailsContainer}>
                {failedServices.map((service) => (
                  <Text key={service.name} style={styles.detailText}>
                    • {service.displayName}: {service.error}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.version}>v1.0.0</Text>
      </View>
    </LinearGradient>
  );
};

// Animated loading dots
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const animation1 = animate(dot1, 0);
    const animation2 = animate(dot2, 150);
    const animation3 = animate(dot3, 300);

    animation1.start();
    animation2.start();
    animation3.start();

    return () => {
      animation1.stop();
      animation2.stop();
      animation3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  appName: {
    ...TYPOGRAPHY.h1,
    textAlign: 'center',
    marginBottom: 8,
  },
  tagline: {
    ...TYPOGRAPHY.bodySmall,
    textAlign: 'center',
    color: COLORS.textSecondary,
  },
  progressSection: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 2,
  },
  errorContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.errorLight || '#FEE2E2',
    borderRadius: 12,
  },
  errorTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  warningContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.warningLight || '#FEF3C7',
    borderRadius: 12,
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning || '#D97706',
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning || '#D97706',
  },
  detailText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.warning || '#D97706',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  version: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
  },
});

export default InitializationScreen;

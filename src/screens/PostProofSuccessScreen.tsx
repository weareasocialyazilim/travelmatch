import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type PostProofSuccessScreenProps = StackScreenProps<
  RootStackParamList,
  'PostProofSuccess'
>;

export const PostProofSuccessScreen: React.FC<PostProofSuccessScreenProps> = ({
  navigation,
  route,
}) => {
  const { proofId } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleViewProof = () => {
    navigation.navigate('ProofDetail', { proofId });
  };

  const handleShareProof = () => {
    navigation.navigate('ProofStory', { proofId });
  };

  const handleDone = () => {
    navigation.navigate('ProofWallet');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <LinearGradient
        colors={[COLORS.success, COLORS.successDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Success Animation */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Icon name="check" size={80} color={COLORS.white} />
            </View>
            <View style={styles.iconRing1} />
            <View style={styles.iconRing2} />
          </Animated.View>

          {/* Success Message */}
          <Animated.View
            style={[styles.messageContainer, { opacity: fadeAnim }]}
          >
            <Text style={styles.title}>Proof Uploaded!</Text>
            <Text style={styles.subtitle}>
              Your proof has been successfully submitted and is now being
              verified by our AI system.
            </Text>
          </Animated.View>

          {/* Status Cards */}
          <Animated.View
            style={[styles.statusContainer, { opacity: fadeAnim }]}
          >
            <View style={styles.statusCard}>
              <Icon name="robot" size={32} color={COLORS.mint} />
              <Text style={styles.statusLabel}>AI Verification</Text>
              <Text style={styles.statusValue}>In Progress</Text>
            </View>

            <View style={styles.statusCard}>
              <Icon name="clock-outline" size={32} color={COLORS.coral} />
              <Text style={styles.statusLabel}>Estimated Time</Text>
              <Text style={styles.statusValue}>2-5 minutes</Text>
            </View>

            <View style={styles.statusCard}>
              <Icon name="shield-check" size={32} color={COLORS.purple} />
              <Text style={styles.statusLabel}>Trust Score</Text>
              <Text style={styles.statusValue}>+10 points</Text>
            </View>
          </Animated.View>

          {/* Info Banner */}
          <Animated.View style={[styles.infoBanner, { opacity: fadeAnim }]}>
            <Icon name="information" size={20} color={COLORS.successDark} />
            <Text style={styles.infoText}>
              You&apos;ll be notified once verification is complete. Typically
              takes 2-5 minutes.
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewProof}
          >
            <Icon name="eye" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>View Proof</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleShareProof}
            >
              <Icon name="share-variant" size={20} color={COLORS.successDark} />
              <Text style={styles.secondaryButtonText}>Share as Story</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleDone}
            >
              <Icon name="wallet" size={20} color={COLORS.successDark} />
              <Text style={styles.secondaryButtonText}>Go to Wallet</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  gradient: {
    flex: 1,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentDark,
    borderRadius: 80,
    height: 160,
    justifyContent: 'center',
    width: 160,
    zIndex: 3,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  iconRing1: {
    backgroundColor: COLORS.whiteTransparentDarker,
    borderRadius: 100,
    height: 200,
    position: 'absolute',
    width: 200,
    zIndex: 2,
  },
  iconRing2: {
    backgroundColor: COLORS.whiteTransparentDarkest,
    borderRadius: 120,
    height: 240,
    position: 'absolute',
    width: 240,
    zIndex: 1,
  },
  infoBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.glassBackground,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  infoText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: COLORS.successDark,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentDark,
    borderColor: COLORS.whiteTransparentLight,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statusLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  statusValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.subtitle,
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});

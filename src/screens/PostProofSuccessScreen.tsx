import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

export const PostProofSuccessScreen: React.FC<{ navigation: any; route: any }> = ({
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
  }, []);

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
        colors={['#00D084', '#00B372']}
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
          <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Proof Uploaded!</Text>
            <Text style={styles.subtitle}>
              Your proof has been successfully submitted and is now being verified by our AI
              system.
            </Text>
          </Animated.View>

          {/* Status Cards */}
          <Animated.View style={[styles.statusContainer, { opacity: fadeAnim }]}>
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
            <Icon name="information" size={20} color="#00B372" />
            <Text style={styles.infoText}>
              You'll be notified once verification is complete. Typically takes 2-5 minutes.
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <Animated.View style={[styles.actionsContainer, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleViewProof}>
            <Icon name="eye" size={20} color={COLORS.white} />
            <Text style={styles.primaryButtonText}>View Proof</Text>
          </TouchableOpacity>

          <View style={styles.secondaryButtons}>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleShareProof}>
              <Icon name="share-variant" size={20} color="#00B372" />
              <Text style={styles.secondaryButtonText}>Share as Story</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleDone}>
              <Icon name="wallet" size={20} color="#00B372" />
              <Text style={styles.secondaryButtonText}>Go to Wallet</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  iconRing1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 2,
  },
  iconRing2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
    textAlign: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#00B372',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Platform,
  Vibration,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

interface Props {
  visible: boolean;
  amount: number;
  onClose: () => void;
  momentTitle?: string;
  onViewApprovals?: () => void;
}

export const GiftSuccessModal: React.FC<Props> = ({ 
  visible, 
  amount, 
  onClose,
  momentTitle,
  onViewApprovals 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate(100);
      }

      // Success icon animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Confetti animations
      confettiAnims.forEach((anim, index) => {
        const angle = (index * 360) / confettiAnims.length;
        const distance = 100 + Math.random() * 50;
        
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: -distance * Math.sin((angle * Math.PI) / 180),
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: distance * Math.cos((angle * Math.PI) / 180),
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 360,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.opacity.setValue(1);
        anim.rotate.setValue(0);
      });
    }
  }, [visible]);

  const confettiColors = [COLORS.coral, COLORS.mint, COLORS.success, '#FFD166', COLORS.white];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Confetti particles */}
          <View style={styles.confettiContainer}>
            {confettiAnims.map((anim, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.confetti,
                  {
                    backgroundColor: confettiColors[index % confettiColors.length],
                    transform: [
                      { translateX: anim.translateX },
                      { translateY: anim.translateY },
                      {
                        rotate: anim.rotate.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
              />
            ))}
          </View>

          {/* Success icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <MaterialCommunityIcons name="check-circle" size={80} color="#5BC08A" />
          </Animated.View>

          {/* Success message */}
          <Text style={styles.title}>Gesture Sent!</Text>
          <Text style={styles.subtitle}>
            Your ${amount.toFixed(2)} gift is on its way
          </Text>

          {amount >= VALUES.ESCROW_DIRECT_MAX && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#5BC08A" />
              <Text style={styles.infoText}>
                You'll be notified when proof is uploaded.
              </Text>
            </View>
          )}

          {amount < VALUES.ESCROW_DIRECT_MAX && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="flash" size={20} color="#5BC08A" />
              <Text style={styles.infoText}>
                Payment sent instantly to recipient.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          {onViewApprovals && momentTitle && (
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={onViewApprovals} 
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-multiple" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>View Approvals</Text>
            </TouchableOpacity>
          )}

          {/* Return button */}
          <TouchableOpacity 
            style={onViewApprovals ? styles.secondaryButton : styles.button} 
            onPress={onClose} 
            activeOpacity={0.8}
          >
            <Text style={onViewApprovals ? styles.secondaryButtonText : styles.buttonText}>
              Return Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: LAYOUT.size.modalMax,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: LAYOUT.shadowOffset.xxl,
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  confettiContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.successLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.mint,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    marginBottom: 12,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    backgroundColor: COLORS.gray,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.buttonDark,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

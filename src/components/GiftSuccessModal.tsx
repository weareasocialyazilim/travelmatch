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
  momentTitle: _momentTitle,
  onViewApprovals: _onViewApprovals,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 12 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotate: new Animated.Value(0),
    })),
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
  }, [visible, confettiAnims, fadeAnim, scaleAnim]);

  const confettiColors = [
    COLORS.coral,
    COLORS.mint,
    COLORS.success,
    COLORS.softOrange,
    COLORS.white,
  ];

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
                    backgroundColor:
                      confettiColors[index % confettiColors.length],
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
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color={COLORS.success}
            />
          </Animated.View>

          {/* Success message */}
          <Text style={styles.title}>Gesture Sent!</Text>
          <Text style={styles.subtitle}>
            Your ${amount.toFixed(2)} gift is on its way
          </Text>

          {amount >= VALUES.ESCROW_DIRECT_MAX && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.infoText}>
                You&apos;ll be notified when proof is uploaded.
              </Text>
            </View>
          )}

          {amount < VALUES.ESCROW_DIRECT_MAX && (
            <View style={styles.infoBox}>
              <MaterialCommunityIcons
                name="flash"
                size={20}
                color={COLORS.success}
              />
              <Text style={styles.infoText}>
                Payment sent instantly to recipient.
              </Text>
            </View>
          )}

          {/* Return button - No approval needed for givers */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Return Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonDark,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 16,
    width: '100%',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  confetti: {
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    width: 8,
  },
  confettiContainer: {
    height: 1,
    left: '50%',
    position: 'absolute',
    top: '50%',
    width: 1,
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.blackTransparent,
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    maxWidth: LAYOUT.size.modalMax,
    padding: 40,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: LAYOUT.shadowOffset.xxl,
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    marginBottom: 24,
  },
  infoBox: {
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
    padding: 16,
  },
  infoText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 17,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});

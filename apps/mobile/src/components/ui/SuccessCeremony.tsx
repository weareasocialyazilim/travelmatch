import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/typography';
import { TMButton } from './TMButton';

export interface SuccessCeremonyProps {
  title: string;
  message: string;
  buttonText: string;
  onPress: () => void;
}

/**
 * Awwwards standardında Genel Başarı Seremonisi.
 * Hareketli partikül hissi ve neon checkmark animasyonu.
 */
export const SuccessCeremony: React.FC<SuccessCeremonyProps> = ({
  title,
  message,
  buttonText,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconBox, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.glow} />
          <Ionicons name="checkmark-circle" size={100} color={COLORS.primary} />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: opacityAnim }]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TMButton
          title={buttonText}
          variant="primary"
          onPress={onPress}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.3,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.textOnDark,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingBottom: 20,
  },
  button: {
    height: 60,
    borderRadius: 30,
  },
});

export default SuccessCeremony;

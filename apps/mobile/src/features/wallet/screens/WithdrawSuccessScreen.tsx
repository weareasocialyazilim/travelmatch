import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/typography';
import { LovendoButton } from '@/components/ui/LovendoButton';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type WithdrawSuccessScreenProps = StackScreenProps<
  RootStackParamList,
  'WithdrawSuccess'
>;

/**
 * Çekim Başarılı Seremoni Ekranı.
 * Liquid animasyonlar ve "Para Yolda" görselleştirmesi.
 */
export const WithdrawSuccessScreen = ({
  navigation,
}: WithdrawSuccessScreenProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}
        >
          <View style={styles.glow} />
          <Ionicons name="checkmark-circle" size={100} color={COLORS.primary} />
        </Animated.View>

        <Text style={styles.title}>Talep Alındı!</Text>
        <Text style={styles.subtitle}>
          Ödemen banka hesabına doğru yola çıktı. Genellikle 1-3 iş günü içinde
          hesabında olur.
        </Text>

        <View style={styles.receiptContainer}>
          <Text style={styles.receiptLabel}>İŞLEM KODU</Text>
          <Text style={styles.receiptValue}>#LV-98234-AX</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <LovendoButton
          title="Cüzdana Dön"
          variant="secondary"
          onPress={() => navigation.navigate('Wallet')}
          style={styles.doneButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.3,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.textOnDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  receiptContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    color: COLORS.textOnDarkMuted,
    letterSpacing: 2,
  },
  receiptValue: {
    fontSize: 14,
    color: COLORS.textOnDark,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    marginBottom: 20,
  },
  doneButton: {
    height: 60,
    borderRadius: 30,
  },
});

export default WithdrawSuccessScreen;

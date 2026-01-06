/**
 * GiftSuccessScreen - PayTR Güvenceli Hediye Başarı Ekranı
 *
 * MASTER Revizyonu: PaymentSuccessScreen'den dönüştürüldü.
 * Kullanıcı PayTR üzerinden ödemeyi tamamladığında bu ekrana düşer.
 *
 * İpeksi Detaylar:
 * - Blurhash destekli anı önizlemesi
 * - "Hediye PayTR Güvencesinde!" mührü
 * - Sohbete Dön butonu
 *
 * @module screens/GiftSuccessScreen
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Vibration,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  interpolate,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

type GiftSuccessParams = {
  GiftSuccess: {
    momentId: string;
    momentTitle: string;
    momentImage?: string;
    amount: number;
    recipientName: string;
    recipientAvatar?: string;
    conversationId?: string;
    escrowId?: string;
    isEscrow: boolean;
  };
};

// Confetti particle component
const ConfettiParticle: React.FC<{ index: number; color: string }> = ({
  index,
  color,
}) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const angle = (index * 30) % 360;
    const distance = 100 + Math.random() * 100;

    translateX.value = withDelay(
      index * 50,
      withTiming(Math.cos((angle * Math.PI) / 180) * distance, {
        duration: 1200,
        easing: Easing.out(Easing.quad),
      }),
    );
    translateY.value = withDelay(
      index * 50,
      withTiming(Math.sin((angle * Math.PI) / 180) * distance + 200, {
        duration: 1200,
        easing: Easing.out(Easing.quad),
      }),
    );
    rotate.value = withDelay(
      index * 50,
      withTiming(Math.random() * 720, { duration: 1200 }),
    );
    opacity.value = withDelay(800, withTiming(0, { duration: 400 }));
  }, [index, translateX, translateY, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.confetti, { backgroundColor: color }, animatedStyle]}
    />
  );
};

// PayTR Shield Badge
const PayTRShieldBadge: React.FC = () => {
  const scale = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      400,
      withSpring(1, { damping: 12, stiffness: 100 }),
    );
    glow.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.5, { duration: 1500 }),
        ),
        -1,
        true,
      ),
    );
  }, [scale, glow]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0.5, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(glow.value, [0.5, 1], [1, 1.1]) }],
  }));

  return (
    <Animated.View style={[styles.shieldContainer, badgeStyle]}>
      <Animated.View style={[styles.shieldGlow, glowStyle]} />
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.shieldBadge}
      >
        <MaterialCommunityIcons name="shield-check" size={24} color="#FFFFFF" />
        <Text style={styles.shieldText}>PayTR Güvencesinde</Text>
      </LinearGradient>
    </Animated.View>
  );
};

export const GiftSuccessScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<GiftSuccessParams, 'GiftSuccess'>>();
  const {
    momentTitle,
    momentImage: _momentImage,
    amount,
    recipientName,
    conversationId,
    isEscrow,
  } = route.params;

  const checkScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  const confettiColors = useMemo(
    () => ['#10B981', '#DFFF00', '#A855F7', '#06B6D4', '#F59E0B'],
    [],
  );

  useEffect(() => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
    }

    // Animations
    checkScale.value = withDelay(
      200,
      withSpring(1, { damping: 10, stiffness: 80 }),
    );
    contentOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, [checkScale, contentOpacity]);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const handleReturnToChat = () => {
    if (conversationId) {
      // Navigate directly to the conversation
      navigation.reset({
        index: 1,
        routes: [
          { name: 'MainTabs' },
          {
            name: 'ChatDetail',
            params: {
              conversationId,
              otherUser: { id: '', name: recipientName },
            },
          },
        ],
      });
    } else {
      // Fallback to inbox
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  const handleViewGifts = () => {
    navigation.navigate('MyGifts');
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Confetti explosion */}
      <View style={styles.confettiContainer}>
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle
            key={i}
            index={i}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Success Icon */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={styles.headerSection}
        >
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.checkGradient}
            >
              <MaterialCommunityIcons name="check" size={48} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={styles.title}
          >
            Hediye Gönderildi! 🎁
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(400).springify()}
            style={styles.subtitle}
          >
            {recipientName} için harika bir jest!
          </Animated.Text>
        </Animated.View>

        {/* Moment Preview Card with Blurhash effect */}
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          style={styles.momentPreviewSection}
        >
          <GlassCard intensity={20} style={styles.momentCard}>
            {/* İpeksi blur overlay simulating blurhash */}
            <View style={styles.momentImageContainer}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={30} tint="dark" style={styles.blurOverlay}>
                  <LinearGradient
                    colors={[
                      'rgba(16, 185, 129, 0.3)',
                      'rgba(6, 182, 212, 0.3)',
                    ]}
                    style={styles.imagePlaceholder}
                  >
                    <Ionicons
                      name="gift"
                      size={40}
                      color="rgba(255,255,255,0.7)"
                    />
                  </LinearGradient>
                </BlurView>
              ) : (
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.4)', 'rgba(6, 182, 212, 0.4)']}
                  style={styles.imagePlaceholder}
                >
                  <Ionicons
                    name="gift"
                    size={40}
                    color="rgba(255,255,255,0.7)"
                  />
                </LinearGradient>
              )}

              {/* PayTR Shield Badge */}
              <PayTRShieldBadge />
            </View>

            <View style={styles.momentInfo}>
              <Text style={styles.momentTitle} numberOfLines={2}>
                {momentTitle}
              </Text>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Hediye Tutarı</Text>
                <Text style={styles.amountValue}>₺{amount.toFixed(2)}</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Escrow Info Box */}
        {isEscrow && (
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.escrowInfoSection}
          >
            <GlassCard intensity={15} style={styles.escrowCard}>
              <View style={styles.escrowContent}>
                <MaterialCommunityIcons
                  name="lock-clock"
                  size={24}
                  color="#F59E0B"
                />
                <View style={styles.escrowText}>
                  <Text style={styles.escrowTitle}>Güvenceli Ödeme</Text>
                  <Text style={styles.escrowDesc}>
                    Tutarınız, kanıt yüklenene kadar PayTR'de güvende tutulacak.
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(700).springify()}
          style={styles.actionsSection}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleReturnToChat}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#DFFF00', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <MaterialCommunityIcons
                name="message-text"
                size={22}
                color="#0F0F23"
              />
              <Text style={styles.primaryButtonText}>Sohbete Dön</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewGifts}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="gift-outline"
              size={20}
              color={COLORS.text.secondary}
            />
            <Text style={styles.secondaryButtonText}>Hediyelerimi Gör</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer Note */}
        <Animated.View
          entering={FadeIn.delay(800).duration(400)}
          style={styles.footerNote}
        >
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={16}
            color={COLORS.text.tertiary}
          />
          <Text style={styles.footerText}>
            Kanıt yüklendiğinde bildirim alacaksınız
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  confettiContainer: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 1,
    height: 1,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  checkContainer: {
    marginBottom: 24,
  },
  checkGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  momentPreviewSection: {
    marginBottom: 20,
  },
  momentCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  momentImageContainer: {
    height: 140,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldContainer: {
    position: 'absolute',
    bottom: -16,
    alignSelf: 'center',
  },
  shieldGlow: {
    position: 'absolute',
    width: '120%',
    height: '150%',
    backgroundColor: '#10B981',
    borderRadius: 20,
    left: '-10%',
    top: '-25%',
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  shieldText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  momentInfo: {
    padding: 20,
    paddingTop: 28,
  },
  momentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 24,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: -0.5,
  },
  escrowInfoSection: {
    marginBottom: 24,
  },
  escrowCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  escrowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  escrowText: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 4,
  },
  escrowDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#DFFF00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F0F23',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
  },
});

export default GiftSuccessScreen;

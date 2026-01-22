/**
 * WalletScreen - LVND Coin ve Titan Protocol Görünümü
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { usePayments } from '@/hooks/usePayments';
import { BlurView } from 'expo-blur';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { securePaymentService, type KYCStatus } from '@/services';

const TitanFlowBadge = ({ amount }: { amount: number }) => {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
    glow.value = withRepeat(withTiming(1, { duration: 2000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowOpacity: glow.value * 0.5,
    backgroundColor: interpolateColor(
      glow.value,
      [0, 1],
      ['rgba(255, 165, 0, 0.1)', 'rgba(255, 165, 0, 0.25)'],
    ),
  }));

  return (
    <Animated.View style={[styles.pendingBadge, animatedStyle]}>
      <MaterialCommunityIcons
        name="shield-lock-outline"
        size={16}
        color={COLORS.warning}
      />
      <View>
        <Text style={styles.pendingText}>{amount} LVND (Titan Flow)</Text>
        <Text style={styles.pendingSubtext}>
          Gelecek ödemeleriniz protokol ile korunuyor.
        </Text>
      </View>
    </Animated.View>
  );
};

const KYC_STATUS_CONFIG: Record<
  KYCStatus['status'],
  {
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
  }
> = {
  not_started: {
    label: 'Kimlik Doğrulama Gerekli',
    icon: 'alert-circle-outline',
    color: COLORS.warning,
  },
  pending: {
    label: 'Doğrulama İnceleniyor',
    icon: 'progress-clock',
    color: COLORS.primary,
  },
  in_review: {
    label: 'Doğrulama İnceleniyor',
    icon: 'progress-clock',
    color: COLORS.primary,
  },
  verified: {
    label: 'Kimlik Doğrulandı',
    icon: 'check-decagram',
    color: COLORS.success,
  },
  rejected: {
    label: 'Doğrulama Başarısız',
    icon: 'close-circle-outline',
    color: COLORS.error,
  },
};

const WalletScreen = () => {
  const { balance, refreshBalance, balanceLoading } = usePayments();
  const navigation = useNavigation<any>();
  const isLoading = balanceLoading;
  const [kycStatus, setKycStatus] =
    useState<KYCStatus['status']>('not_started');
  const [kycLoading, setKycLoading] = useState(false);

  // Realtime subscription for live coin balance updates
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('wallet-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.info('[Realtime] Wallet updated:', payload.new);
            refreshBalance();
          },
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshBalance]);

  const onRefresh = useCallback(() => {
    refreshBalance();
  }, [refreshBalance]);

  const refreshKycStatus = useCallback(async () => {
    try {
      setKycLoading(true);
      const result = await securePaymentService.getKYCStatus();
      setKycStatus(result.status);
    } catch (error) {
      logger.warn('Failed to refresh KYC status', { error });
    } finally {
      setKycLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshKycStatus();
    }, [refreshKycStatus]),
  );

  const handleKycPress = () => {
    if (kycStatus === 'verified') {
      return;
    }

    if (kycStatus === 'pending' || kycStatus === 'in_review') {
      navigation.navigate('KYCPending', {
        status: kycStatus,
        returnTo: 'Withdraw',
      });
      return;
    }

    navigation.navigate('IdentityVerification', { returnTo: 'Withdraw' });
  };

  const handleWithdraw = () => {
    if (kycStatus !== 'verified') {
      handleKycPress();
      return;
    }
    navigation.navigate('Withdraw');
  };

  const handleBack = () => {
    if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <LinearGradient
          colors={['#000000', '#1a1a1a']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel="Back"
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cüzdan</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              tintColor={COLORS.brand.primary}
            />
          }
        >
          {/* LVND Bakiye Kartı */}
          <BlurView intensity={50} tint="dark" style={styles.balanceContainer}>
            <Text style={styles.label}>MEVCUT LVND</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.amount}>{balance?.available || 0} LVND</Text>
            </View>

            {/* Titan Protocol (Escrow) Bakiyesi */}
            {(balance?.pending ?? 0) > 0 && (
              <TitanFlowBadge amount={balance?.pending ?? 0} />
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('CoinStore')}
              style={styles.topupButton}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.gradientButton}
              >
                <Text style={styles.buttonText}>LVND Yükle</Text>
              </LinearGradient>
            </TouchableOpacity>
          </BlurView>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              onPress={handleKycPress}
              style={styles.kycStatusRow}
              disabled={kycLoading}
            >
              <MaterialCommunityIcons
                name={KYC_STATUS_CONFIG[kycStatus].icon}
                size={18}
                color={KYC_STATUS_CONFIG[kycStatus].color}
              />
              <Text style={styles.kycStatusText}>
                {KYC_STATUS_CONFIG[kycStatus].label}
              </Text>
              {kycStatus !== 'verified' && (
                <Text style={styles.kycActionText}>Kimliğini Doğrula</Text>
              )}
            </TouchableOpacity>
            {/* Para Çekme (Sadece Admin onaylı ve Teşekkür Videolu kullanıcılara) */}
            <TouchableOpacity
              onPress={handleWithdraw}
              style={styles.withdrawLink}
            >
              <Text style={styles.withdrawText}>
                Banka Hesabına Aktar (Withdraw)
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.text.muted}
              />
            </TouchableOpacity>
          </View>

          {/* Transaction History Placeholder - could be a separate component */}
          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Son İşlemler</Text>
            <Text
              style={{ color: COLORS.text.muted, marginTop: 10, fontSize: 13 }}
            >
              Henüz işlem yok.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: { padding: 20 },
  balanceContainer: {
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    gap: 12,
  },
  label: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  amount: {
    color: COLORS.brand.primary,
    fontSize: 42,
    fontWeight: 'bold',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  pendingText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '500',
  },
  topupButton: {
    marginTop: 20,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  gradientButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  pendingSubtext: {
    color: 'rgba(255, 165, 0, 0.6)',
    fontSize: 10,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  kycStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  kycStatusText: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  kycActionText: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  withdrawLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  withdrawText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default WalletScreen;

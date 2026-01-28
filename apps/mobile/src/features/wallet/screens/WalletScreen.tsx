/**
 * WalletScreen - LVND Sanal Para ve Titan Protocol Görünümü
 */
import React, { useCallback, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const WalletScreen = () => {
  const { balance, refreshBalance } = usePayments();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const isLoading = false; // Inline loading state - hook doesn't expose this

  // Realtime subscription for live LVND balance updates
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

  const handleBankTransfer = () => {
    navigation.navigate('BankTransfer');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={StyleSheet.absoluteFill}
      />

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
        <Text style={styles.headerTitle}>Cüzdan</Text>

        {/* Sanal Bakiye Kartı */}
        <BlurView intensity={50} tint="dark" style={styles.balanceContainer}>
          <Text style={styles.label}>MEVCUT LVND</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.amount}>{balance?.available || 0} LVND</Text>
            <View style={styles.localCurrencyBadge}>
              <Text style={styles.localCurrencyText}>
                ≈ {(balance?.available || 0).toLocaleString('tr-TR')} TL
              </Text>
            </View>
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
          {/* Bank Transfer - User earnings to bank account */}
          <TouchableOpacity
            onPress={handleBankTransfer}
            style={styles.withdrawLink}
          >
            <Text style={styles.withdrawText}>Banka Hesabına Aktar</Text>
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  scrollContent: { padding: 20 },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
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
  localCurrencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  localCurrencyText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  pendingSubtext: {
    color: 'rgba(255, 165, 0, 0.6)',
    fontSize: 10,
    marginTop: 2,
  },
  actionsContainer: {
    marginTop: 24,
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

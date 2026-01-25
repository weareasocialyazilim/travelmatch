import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { GlassCard } from '@/components/ui/GlassCard';
import { PROFILE_COLORS } from '../constants/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CreatorDashboardProps {
  balance: number;
  pendingBalance: number;
  onWithdraw: () => void;
}

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  balance,
  pendingBalance,
  onWithdraw,
}) => {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()}>
      <GlassCard style={styles.container} hasBorder>
        <View style={styles.header}>
          <MaterialCommunityIcons name="star-circle" size={24} color={PROFILE_COLORS.neon.lime} />
          <Text style={styles.title}>{t('profile.creatorHub', 'VIP Creator Hub')}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('profile.availableEarnings', 'Available Balance')}</Text>
            <Text style={styles.statValue}>{balance.toLocaleString('tr-TR')} TL</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>{t('profile.pendingGifts', 'Escrowed Payouts')}</Text>
            <Text style={styles.pendingValue}>+{pendingBalance.toLocaleString('tr-TR')} TL</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={onWithdraw} 
          style={styles.withdrawButton}
          activeOpacity={0.8}
        >
          <Ionicons name="cash-outline" size={20} color="black" />
          <Text style={styles.withdrawButtonText}>{t('profile.withdrawNow', 'Nakit Çek')}</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {t('profile.creatorInfo', 'Bakiyeniz 1:1 yerel kur üzerinden hesaplanmıştır.')}
        </Text>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: PROFILE_COLORS.text.primary,
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 11,
    color: PROFILE_COLORS.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PROFILE_COLORS.neon.lime,
  },
  pendingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PROFILE_COLORS.text.secondary,
  },
  withdrawButton: {
    backgroundColor: PROFILE_COLORS.neon.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  withdrawButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoText: {
    fontSize: 10,
    color: PROFILE_COLORS.text.tertiary,
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

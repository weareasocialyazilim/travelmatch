import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/colors';
import { FONT_SIZES_V2, FONTS } from '../../../constants/typography';
import { GlassCard } from '../../../components/ui/GlassCard';

interface TransactionListItemProps {
  transaction: {
    title: string;
    desc: string;
    amount: string;
    status: string;
    time: string;
  };
  onPress?: () => void;
}

/**
 * Modern İşlem Listesi Öğesi.
 * Liquid Glass efekti ve net finansal hiyerarşi.
 */
export const TransactionListItem: React.FC<TransactionListItemProps> = ({
  transaction,
  onPress,
}) => {
  const isPositive = transaction.amount.startsWith('+');

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <GlassCard intensity={10} style={styles.container}>
        <View style={styles.leftSection}>
          <View style={[styles.iconBox, isPositive ? styles.gainBg : styles.lossBg]}>
            <Ionicons
              name={isPositive ? "arrow-down-outline" : "arrow-up-outline"}
              size={20}
              color={isPositive ? COLORS.primary : COLORS.text.secondary}
            />
          </View>
          <View>
            <Text style={styles.title}>{transaction.title}</Text>
            <Text style={styles.desc}>{transaction.desc}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.amount, isPositive ? styles.gainText : styles.lossText]}>
            {transaction.amount}
          </Text>
          <Text style={styles.time}>{transaction.time}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gainBg: { backgroundColor: 'rgba(223, 255, 0, 0.1)' },
  lossBg: { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  title: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES_V2.bodySmall,
    fontWeight: '700',
  },
  desc: {
    color: COLORS.text.secondary,
    fontSize: 10,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontFamily: FONTS.mono.medium,
    fontWeight: '800',
  },
  gainText: { color: COLORS.primary },
  lossText: { color: COLORS.text.primary },
  time: {
    color: COLORS.text.muted,
    fontSize: 10,
    marginTop: 4,
  },
});

export default TransactionListItem;

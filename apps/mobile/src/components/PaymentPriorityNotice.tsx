/**
 * PaymentPriorityNotice Component
 * Shows payment priority information
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface PaymentPriorityNoticeProps {
  message?: string;
  type?: 'info' | 'warning' | 'success';
}

export const PaymentPriorityNotice: React.FC<PaymentPriorityNoticeProps> = ({
  message = 'Your default payment method will be used first for all transactions.',
  type = 'info',
}) => {
  const typeConfig = {
    info: {
      icon: 'information' as const,
      color: COLORS.feedback.info,
      bgColor: COLORS.feedback.info + '15',
    },
    warning: {
      icon: 'alert' as const,
      color: COLORS.feedback.warning,
      bgColor: COLORS.feedback.warning + '15',
    },
    success: {
      icon: 'check-circle' as const,
      color: COLORS.feedback.success,
      bgColor: COLORS.feedback.success + '15',
    },
  };

  const config = typeConfig[type];

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <MaterialCommunityIcons name={config.icon} size={20} color={config.color} />
      <Text style={[styles.message, { color: config.color }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
  },
});

export default PaymentPriorityNotice;

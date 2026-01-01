import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface MomentContext {
  id: string;
  title: string;
  price: number;
  currency?: string;
  image?: string;
  status?: 'negotiating' | 'accepted' | 'paid' | 'completed';
}

interface MomentContextStripProps {
  moment: MomentContext;
  onPress?: () => void;
}

export const MomentContextStrip: React.FC<MomentContextStripProps> = ({
  moment,
  onPress,
}) => {
  const currencySymbol = moment.currency === 'TRY' ? '₺' : moment.currency === 'EUR' ? '€' : '$';

  const getStatusText = () => {
    switch (moment.status) {
      case 'accepted':
        return 'Offer Accepted';
      case 'paid':
        return 'Payment Complete';
      case 'completed':
        return 'Moment Completed';
      default:
        return `Looking for ${currencySymbol}${moment.price}`;
    }
  };

  const getStatusColor = () => {
    switch (moment.status) {
      case 'accepted':
      case 'completed':
        return COLORS.feedback.success;
      case 'paid':
        return COLORS.brand.secondary;
      default:
        return COLORS.brand.primary;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.contextStrip}
      onPress={onPress}
    >
      {moment.image && (
        <Image source={{ uri: moment.image }} style={styles.contextImage} />
      )}
      <View style={styles.contextInfo}>
        <Text style={styles.contextTitle} numberOfLines={1}>
          {moment.title}
        </Text>
        <Text style={[styles.contextStatus, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      <View style={styles.contextAction}>
        <Text style={[styles.viewButton, { color: COLORS.brand.primary }]}>
          View
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.brand.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.background.tertiary,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  contextImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: COLORS.border.light,
  },
  contextInfo: {
    flex: 1,
  },
  contextTitle: {
    color: COLORS.text.primary,
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  contextStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  contextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 4,
  },
  viewButton: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MomentContextStrip;

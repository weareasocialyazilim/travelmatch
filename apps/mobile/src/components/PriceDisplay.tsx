/**
 * Price Display Component
 * Shows price with automatic currency conversion
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency } from '@/utils/currencyFormatter';
import { CurrencyCode } from '@/constants/currencies';
import { COLORS } from '@/constants/colors';

interface PriceDisplayProps {
  /** Price amount */
  amount: number;
  /** Currency code of the price */
  currency: CurrencyCode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show conversion to user's currency */
  showConversion?: boolean;
  /** Container style */
  style?: ViewStyle;
  /** Primary text style override */
  priceStyle?: TextStyle;
  /** Align text */
  align?: 'left' | 'center' | 'right';
  /** Show buffer note (for TRY payments) */
  showBufferNote?: boolean;
  /** Buffer percentage */
  bufferPercent?: number;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  currency,
  size = 'md',
  showConversion = true,
  style,
  priceStyle,
  align = 'left',
  showBufferNote = false,
  bufferPercent,
}) => {
  const { userCurrency, convert, needsConversion } = useCurrency();

  const shouldConvert = needsConversion(currency) && showConversion;
  const convertedAmount = shouldConvert ? convert(amount, currency, userCurrency) : amount;
  const displayCurrency = shouldConvert ? userCurrency : currency;

  const fontSize = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
  }[size];

  const originalFontSize = {
    sm: 11,
    md: 13,
    lg: 14,
    xl: 16,
  }[size];

  const textAlign = align;

  return (
    <View style={[styles.container, { alignItems: getAlign(align) }, style]}>
      <Text
        style={[
          styles.price,
          { fontSize, textAlign },
          priceStyle,
        ]}
      >
        {formatCurrency(convertedAmount, displayCurrency)}
      </Text>

      {shouldConvert && (
        <Text style={[styles.original, { fontSize: originalFontSize, textAlign }]}>
          (~{formatCurrency(amount, currency)})
        </Text>
      )}

      {showBufferNote && bufferPercent && bufferPercent > 0 && (
        <Text style={[styles.bufferNote, { textAlign }]}>
          Kur koruması dahil (%{bufferPercent})
        </Text>
      )}
    </View>
  );
};

const getAlign = (align: 'left' | 'center' | 'right') => {
  switch (align) {
    case 'left':
      return 'flex-start';
    case 'center':
      return 'center';
    case 'right':
      return 'flex-end';
  }
};

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  price: {
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  original: {
    color: COLORS.text.secondary,
  },
  bufferNote: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    marginTop: 2,
  },
});

/**
 * Compact price display for cards
 */
export const CompactPriceDisplay: React.FC<{
  amount: number;
  currency: CurrencyCode;
  style?: ViewStyle;
}> = ({ amount, currency, style }) => {
  const { userCurrency, convert, needsConversion } = useCurrency();

  const shouldConvert = needsConversion(currency);
  const displayAmount = shouldConvert ? convert(amount, currency) : amount;
  const displayCurrency = shouldConvert ? userCurrency : currency;

  return (
    <View style={[styles.compactContainer, style]}>
      <Text style={styles.compactPrice}>
        {formatCurrency(displayAmount, displayCurrency, { compact: true })}
      </Text>
      {shouldConvert && (
        <Text style={styles.compactOriginal}>
          ~{formatCurrency(amount, currency, { compact: true })}
        </Text>
      )}
    </View>
  );
};

const compactStyles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  compactPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  compactOriginal: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});

Object.assign(styles, compactStyles);

export default PriceDisplay;

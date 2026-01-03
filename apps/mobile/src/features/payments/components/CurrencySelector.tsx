/**
 * Currency Selector Component
 *
 * Allows users to select their preferred currency for payments.
 * Shows live exchange rates and updates user preferences.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/services/supabase';
import { logger } from '@/utils/logger';
import type { CurrencyCode } from '@/constants/currencies';

// Supported currencies
const CURRENCIES: Array<{
  code: CurrencyCode;
  name: string;
  symbol: string;
  flag: string;
}> = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺', flag: '🇹🇷' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
];

interface CurrencySelectorProps {
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  showRates?: boolean;
  compact?: boolean;
  disabled?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  showRates = true,
  compact = false,
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch exchange rates
  useEffect(() => {
    if (showRates) {
      fetchExchangeRates();
    }
  }, [showRates]);

  const fetchExchangeRates = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('from_currency, to_currency, rate')
        .eq('from_currency', 'TRY');

      if (error) throw error;

      const rates: Record<string, number> = { TRY: 1 };
      (data as { to_currency: string; rate: number }[] | null)?.forEach(
        (item) => {
          rates[item.to_currency] = item.rate;
        },
      );

      setExchangeRates(rates);
    } catch (err) {
      logger.error(
        'Error fetching exchange rates',
        err instanceof Error ? err : new Error(String(err)),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = useCallback(
    (currency: CurrencyCode) => {
      onCurrencyChange(currency);
      setIsModalVisible(false);

      // Update user preference in database
      updateUserCurrencyPreference(currency);
    },
    [onCurrencyChange],
  );

  const updateUserCurrencyPreference = async (currency: CurrencyCode) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_currency_preferences').upsert({
        user_id: user.id,
        preferred_currency: currency,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(
        'Error updating currency preference',
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  };

  const selectedCurrencyData = CURRENCIES.find(
    (c) => c.code === selectedCurrency,
  );

  // Compact button version
  if (compact) {
    return (
      <>
        <TouchableOpacity
          style={[styles.compactButton, disabled && styles.disabledButton]}
          onPress={() => !disabled && setIsModalVisible(true)}
          disabled={disabled}
        >
          <Text style={styles.compactFlag}>{selectedCurrencyData?.flag}</Text>
          <Text style={styles.compactCode}>{selectedCurrency}</Text>
          <Icon name="chevron-down" size={16} color={COLORS.text.secondary} />
        </TouchableOpacity>

        <CurrencyModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          currencies={CURRENCIES}
          selectedCurrency={selectedCurrency}
          onSelect={handleSelect}
          exchangeRates={exchangeRates}
          showRates={showRates}
          isLoading={isLoading}
        />
      </>
    );
  }

  // Full selector version
  return (
    <>
      <TouchableOpacity
        style={[styles.selector, disabled && styles.disabledButton]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectedCurrency}>
          <Text style={styles.flag}>{selectedCurrencyData?.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyCode}>{selectedCurrency}</Text>
            <Text style={styles.currencyName}>
              {selectedCurrencyData?.name}
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={24} color={COLORS.text.tertiary} />
      </TouchableOpacity>

      <CurrencyModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        currencies={CURRENCIES}
        selectedCurrency={selectedCurrency}
        onSelect={handleSelect}
        exchangeRates={exchangeRates}
        showRates={showRates}
        isLoading={isLoading}
      />
    </>
  );
};

// Currency selection modal
interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  currencies: typeof CURRENCIES;
  selectedCurrency: CurrencyCode;
  onSelect: (currency: CurrencyCode) => void;
  exchangeRates: Record<string, number>;
  showRates: boolean;
  isLoading: boolean;
}

const CurrencyModal: React.FC<CurrencyModalProps> = ({
  visible,
  onClose,
  currencies,
  selectedCurrency,
  onSelect,
  exchangeRates,
  showRates,
  isLoading,
}) => {
  const renderCurrency = ({ item }: { item: (typeof CURRENCIES)[0] }) => {
    const isSelected = item.code === selectedCurrency;
    const rate = exchangeRates[item.code];

    return (
      <TouchableOpacity
        style={[styles.currencyRow, isSelected && styles.selectedRow]}
        onPress={() => onSelect(item.code)}
      >
        <View style={styles.currencyRowLeft}>
          <Text style={styles.rowFlag}>{item.flag}</Text>
          <View>
            <Text style={styles.rowCode}>{item.code}</Text>
            <Text style={styles.rowName}>{item.name}</Text>
          </View>
        </View>

        <View style={styles.currencyRowRight}>
          {showRates && rate && item.code !== 'TRY' && (
            <Text style={styles.rateText}>
              1 TRY = {rate.toFixed(4)} {item.code}
            </Text>
          )}
          {isSelected && (
            <Icon name="check-circle" size={24} color={COLORS.brand.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Para Birimi Seçin</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.brand.primary} />
            <Text style={styles.loadingText}>Kurlar güncelleniyor...</Text>
          </View>
        )}

        {/* Currency list */}
        <FlatList
          data={currencies}
          renderItem={renderCurrency}
          keyExtractor={(item) => item.code}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {/* Info note */}
        <View style={styles.infoNote}>
          <Icon name="information" size={16} color={COLORS.text.tertiary} />
          <Text style={styles.infoText}>
            Seçtiğiniz para birimi, ödeme ve bakiye görüntüleme için
            kullanılacaktır. Kurlar günlük olarak güncellenir.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  selectedCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flag: {
    fontSize: 32,
  },
  currencyInfo: {
    gap: 2,
  },
  currencyCode: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  currencyName: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 6,
  },
  compactFlag: {
    fontSize: 16,
  },
  compactCode: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.bg.secondary,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  listContent: {
    padding: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedRow: {
    backgroundColor: COLORS.brand.primary + '10',
  },
  currencyRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowFlag: {
    fontSize: 28,
  },
  rowCode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  rowName: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  currencyRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rateText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: 4,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.tertiary,
    lineHeight: 18,
  },
});

export default CurrencySelector;

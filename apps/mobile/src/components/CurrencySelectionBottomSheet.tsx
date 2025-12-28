import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { GenericBottomSheet } from './ui/GenericBottomSheet';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Currency {
  code: string;
  name: string;
}

interface CurrencySelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedCurrency?: string;
  onCurrencyChange: (currencyCode: string) => void;
}

export const CurrencySelectionBottomSheet: React.FC<
  CurrencySelectionBottomSheetProps
> = ({ visible, onClose, selectedCurrency = 'USD', onCurrencyChange }) => {
  const [tempSelection, setTempSelection] = useState<string>(selectedCurrency);
  const [searchQuery, setSearchQuery] = useState('');

  const currencies: Currency[] = [
    { code: 'USD', name: 'United States Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'TRY', name: 'Turkish Lira' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'CAD', name: 'Canadian Dollar' },
  ];

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConfirm = () => {
    onCurrencyChange(tempSelection);
    onClose();
  };

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      title="Currency"
      height="medium"
      showHandle
      keyboardAware
      testID="currency-selection-sheet"
      accessibilityLabel="Select currency"
      renderFooter={() => (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm selection"
          >
            <Text style={styles.confirmButtonText}>Confirm Selection</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons
            name={'magnify' as IconName}
            size={24}
            color={COLORS.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a currency"
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search currencies"
          />
        </View>
      </View>

      {/* Currency List */}
      <ScrollView style={styles.currencyList}>
        {filteredCurrencies.map((currency) => (
          <TouchableOpacity
            key={currency.code}
            style={[
              styles.currencyItem,
              tempSelection === currency.code && styles.currencyItemSelected,
            ]}
            onPress={() => setTempSelection(currency.code)}
            accessibilityRole="radio"
            accessibilityState={{ checked: tempSelection === currency.code }}
            accessibilityLabel={`${currency.code} - ${currency.name}`}
          >
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyCode}>{currency.code}</Text>
              <Text style={styles.currencyName}>{currency.name}</Text>
            </View>
            <View
              style={[
                styles.radio,
                tempSelection === currency.code && styles.radioSelected,
              ]}
            >
              {tempSelection === currency.code && (
                <View style={styles.radioDot} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  currencyList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginBottom: 12,
  },
  currencyItemSelected: {
    borderColor: COLORS.brand.primary,
    backgroundColor: `${COLORS.brand.primary}1A`, // 10% opacity
  },
  currencyInfo: {
    flex: 1,
    gap: 2,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  currencyName: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.secondary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.brand.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.brand.primary,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  confirmButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.white,
    letterSpacing: 0.24,
  },
});

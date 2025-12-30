/**
 * Currency Selector Component
 * Bottom sheet for selecting user's preferred currency
 */

import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { CURRENCIES, CurrencyCode } from '@/constants/currencies';
import { useCurrency } from '@/context/CurrencyContext';

interface CurrencySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (code: CurrencyCode) => void;
}

// Memoized currency item component for list performance
interface CurrencyItemProps {
  item: (typeof CURRENCIES)[keyof typeof CURRENCIES];
  isSelected: boolean;
  onSelect: (code: CurrencyCode) => void;
}

const CurrencyItem = memo<CurrencyItemProps>(({ item, isSelected, onSelect }) => (
  <TouchableOpacity
    style={[styles.item, isSelected && styles.itemSelected]}
    onPress={() => onSelect(item.code as CurrencyCode)}
    activeOpacity={0.7}
  >
    <View style={styles.currencyInfo}>
      <Text style={styles.symbol}>{item.symbol}</Text>
      <View style={styles.textContainer}>
        <Text style={styles.code}>{item.code}</Text>
        <Text style={styles.name}>{item.nameTr}</Text>
      </View>
    </View>

    {isSelected && (
      <MaterialCommunityIcons
        name="check-circle"
        size={24}
        color={COLORS.brand.primary}
      />
    )}
  </TouchableOpacity>
));

CurrencyItem.displayName = 'CurrencyItem';

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { userCurrency, setUserCurrency } = useCurrency();

  const currencies = Object.values(CURRENCIES);

  const handleSelect = useCallback(async (code: CurrencyCode) => {
    await setUserCurrency(code);
    onSelect?.(code);
    onClose();
  }, [setUserCurrency, onSelect, onClose]);

  const renderItem = useCallback(
    ({ item }: { item: (typeof currencies)[0] }) => (
      <CurrencyItem
        item={item}
        isSelected={userCurrency === item.code}
        onSelect={handleSelect}
      />
    ),
    [userCurrency, handleSelect]
  );

  const keyExtractor = useCallback(
    (item: (typeof currencies)[0]) => item.code,
    []
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Para Birimi Seçin</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={currencies}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            getItemLayout={(_, index) => ({
              length: 72, // item height (padding + content)
              offset: 72 * index,
              index,
            })}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.medium,
  },
  sheet: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingBottom: 34, // Safe area
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: COLORS.bg.secondary,
  },
  itemSelected: {
    backgroundColor: COLORS.mintTransparent,
    borderWidth: 1,
    borderColor: COLORS.mint,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  symbol: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    width: 40,
    textAlign: 'center',
  },
  textContainer: {
    gap: 2,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  name: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
});

export default CurrencySelector;

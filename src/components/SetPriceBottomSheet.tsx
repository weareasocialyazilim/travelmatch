import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface SetPriceBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSetPrice: (price: number) => void;
  currentPrice?: number;
}

const PRESET_PRICES = [5, 10, 20, 50, 0]; // 0 represents "Free"

export const SetPriceBottomSheet: React.FC<SetPriceBottomSheetProps> = ({
  visible,
  onClose,
  onSetPrice,
  currentPrice = 0,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(
    PRESET_PRICES.includes(currentPrice) ? currentPrice : null,
  );
  const [customAmount, setCustomAmount] = useState<string>(
    !PRESET_PRICES.includes(currentPrice) && currentPrice > 0
      ? currentPrice.toString()
      : '',
  );

  const handlePresetSelect = (price: number) => {
    setSelectedPreset(price);
    setCustomAmount('');
  };

  const handleSetAmount = () => {
    const finalPrice =
      customAmount.trim() !== ''
        ? parseFloat(customAmount)
        : selectedPreset !== null
        ? selectedPreset
        : 0;

    if (!isNaN(finalPrice) && finalPrice >= 0) {
      onSetPrice(finalPrice);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Set price</Text>

        {/* Preset Price Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={styles.chipsScrollView}
        >
          {PRESET_PRICES.map((price) => (
            <TouchableOpacity
              key={price}
              style={[
                styles.chip,
                selectedPreset === price && styles.chipSelected,
              ]}
              onPress={() => handlePresetSelect(price)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedPreset === price && styles.chipTextSelected,
                ]}
              >
                {price === 0 ? 'Free' : `$${price}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Custom Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Custom amount</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name={'currency-usd' as IconName}
              size={20}
              color={COLORS.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text);
                setSelectedPreset(null);
              }}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Set Amount Button */}
        <TouchableOpacity
          style={styles.setButton}
          onPress={handleSetAmount}
          activeOpacity={0.8}
        >
          <Text style={styles.setButtonText}>Set Amount</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chipsScrollView: {
    flexGrow: 0,
  },
  chipsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: `${COLORS.primary}33`,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  chipTextSelected: {
    color: COLORS.primary,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  setButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 16,
  },
  setButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

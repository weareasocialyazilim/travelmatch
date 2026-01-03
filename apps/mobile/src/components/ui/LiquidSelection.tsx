import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPE_SCALE } from '../../constants/typography';

interface SelectionProps {
  /** Selection label */
  label: string;
  /** Current value */
  value: boolean;
  /** Value change callback */
  onValueChange: (value: boolean) => void;
  /** Optional description text */
  description?: string;
  /** Disable interaction */
  disabled?: boolean;
}

/**
 * Modern Liquid Switch Bileşeni - "Akışkan Toggle"
 * Neon dolgu ve yumuşak geçişler kullanır.
 *
 * Features:
 * - Haptic feedback on toggle
 * - Neon primary color when active
 * - Smooth thumb translation
 * - Optional description text
 */
export const LiquidSwitch: React.FC<SelectionProps> = memo(
  ({ label, value, onValueChange, description, disabled = false }) => {
    const toggle = useCallback(() => {
      if (disabled) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(!value);
    }, [disabled, value, onValueChange]);

    return (
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled]}
        activeOpacity={0.7}
        onPress={toggle}
        disabled={disabled}
        accessible={true}
        accessibilityRole="switch"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={label}
        accessibilityHint={description}
      >
        <View style={styles.textColumn}>
          <Text style={styles.label}>{label}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
        <View style={[styles.switchTrack, value && styles.trackActive]}>
          <View style={[styles.switchThumb, value && styles.thumbActive]} />
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.label === nextProps.label &&
    prevProps.description === nextProps.description &&
    prevProps.disabled === nextProps.disabled,
);

LiquidSwitch.displayName = 'LiquidSwitch';

/**
 * Modern Liquid Checkbox Bileşeni - "Neon Onay Kutusu"
 * Seçildiğinde neon parıltısı ile dolum animasyonu.
 *
 * Features:
 * - Haptic selection feedback
 * - Rounded checkbox with neon fill
 * - Checkmark icon when selected
 */
export const LiquidCheckbox: React.FC<Omit<SelectionProps, 'description'>> = memo(
  ({ label, value, onValueChange, disabled = false }) => {
    const toggle = useCallback(() => {
      if (disabled) return;
      Haptics.selectionAsync();
      onValueChange(!value);
    }, [disabled, value, onValueChange]);

    return (
      <TouchableOpacity
        style={[styles.checkContainer, disabled && styles.disabled]}
        activeOpacity={0.7}
        onPress={toggle}
        disabled={disabled}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: value, disabled }}
        accessibilityLabel={label}
      >
        <View style={[styles.checkbox, value && styles.checkboxActive]}>
          {value && (
            <Ionicons
              name="checkmark"
              size={16}
              color={COLORS.utility.white}
              accessible={false}
            />
          )}
        </View>
        <Text style={[styles.checkLabel, disabled && styles.disabledText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.label === nextProps.label &&
    prevProps.disabled === nextProps.disabled,
);

LiquidCheckbox.displayName = 'LiquidCheckbox';

/**
 * Liquid Radio Button - "Neon Radyo Butonu"
 * Tek seçim grupları için kullanılır.
 */
interface RadioProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

export const LiquidRadio: React.FC<RadioProps> = memo(
  ({ label, selected, onSelect, disabled = false }) => {
    const handlePress = useCallback(() => {
      if (disabled || selected) return;
      Haptics.selectionAsync();
      onSelect();
    }, [disabled, selected, onSelect]);

    return (
      <TouchableOpacity
        style={[styles.checkContainer, disabled && styles.disabled]}
        activeOpacity={0.7}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected, disabled }}
        accessibilityLabel={label}
      >
        <View style={[styles.radio, selected && styles.radioActive]}>
          {selected && <View style={styles.radioDot} />}
        </View>
        <Text style={[styles.checkLabel, disabled && styles.disabledText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.selected === nextProps.selected &&
    prevProps.label === nextProps.label &&
    prevProps.disabled === nextProps.disabled,
);

LiquidRadio.displayName = 'LiquidRadio';

const styles = StyleSheet.create({
  // Switch styles
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    width: '100%',
  },
  textColumn: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  description: {
    ...TYPE_SCALE.body.caption,
    color: COLORS.text.muted,
    marginTop: 2,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surface.glass,
    padding: 2,
  },
  trackActive: {
    backgroundColor: COLORS.brand.primary,
  },
  switchThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.text.primary,
  },
  thumbActive: {
    transform: [{ translateX: 22 }],
    backgroundColor: COLORS.utility.black,
  },

  // Checkbox styles
  checkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  checkLabel: {
    ...TYPE_SCALE.body.base,
    color: COLORS.text.primary,
  },

  // Radio styles
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioActive: {
    borderColor: COLORS.brand.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.brand.primary,
  },

  // Disabled states
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.text.muted,
  },
});

export default LiquidSwitch;

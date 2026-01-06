import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  ViewStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILIES } from '../../theme/typography';
import { GlassCard } from './GlassCard';
import { HapticManager } from '../../services/HapticManager';

interface LiquidInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
  /** Card container style override */
  style?: StyleProp<ViewStyle>;
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

/**
 * Awwwards standardında interaktif Liquid Input bileşeni.
 * Odaklandığında neon lime parlaması verir ve ipeksi glass dokusu kullanır.
 */
export const LiquidInput: React.FC<LiquidInputProps> = ({
  label,
  icon,
  error,
  containerStyle,
  style,
  onFocus,
  onBlur,
  onChangeText,
  accessibilityHint,
  placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasTypedRef = useRef(false);

  // Haptic feedback on focus - subtle selection change
  const handleFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      HapticManager.selectionChange();
      hasTypedRef.current = false;
      onFocus?.(e);
    },
    [onFocus],
  );

  // Reset typing state on blur
  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      hasTypedRef.current = false;
      onBlur?.(e);
    },
    [onBlur],
  );

  // Haptic feedback on first character typed
  const handleChangeText = useCallback(
    (text: string) => {
      if (!hasTypedRef.current && text.length > 0) {
        HapticManager.selectionChange();
        hasTypedRef.current = true;
      }
      onChangeText?.(text);
    },
    [onChangeText],
  );

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {/* Üst Etiket (Mono font ile prestijli görünüm) */}
      {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}

      <GlassCard
        intensity={isFocused ? 30 : 10}
        style={
          StyleSheet.flatten([
            styles.inputContainer,
            isFocused && styles.focusedBorder,
            error ? styles.errorBorder : null,
            style,
          ]) as ViewStyle
        }
      >
        <View style={styles.innerRow}>
          {/* İkon Bölümü */}
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? COLORS.brand.primary : COLORS.textMuted}
              style={styles.icon}
            />
          )}

          <TextInput
            style={styles.input}
            placeholderTextColor={COLORS.textMuted}
            onFocus={handleFocus as TextInputProps['onFocus']}
            onBlur={handleBlur as TextInputProps['onBlur']}
            onChangeText={handleChangeText}
            selectionColor={COLORS.brand.primary}
            placeholder={placeholder}
            // Accessibility for screen readers
            accessible={true}
            accessibilityLabel={label || placeholder}
            accessibilityHint={accessibilityHint || placeholder}
            accessibilityRole="text"
            accessibilityState={{
              disabled: props.editable === false,
            }}
            {...props}
          />
        </View>
      </GlassCard>

      {/* Hata Mesajı (Soft Neon Kırmızı) */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontFamily: FONT_FAMILIES.mono,
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: '800',
  },
  inputContainer: {
    padding: 0,
    height: 58,
    borderRadius: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: COLORS.glass,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  icon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONT_FAMILIES.regular,
    height: '100%',
    fontWeight: '500',
  },
  focusedBorder: {
    borderColor: COLORS.brand.primary,
    backgroundColor: COLORS.primaryMuted,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  errorBorder: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 4,
    gap: 6,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    fontFamily: FONT_FAMILIES.regular,
    fontWeight: '500',
  },
});

export default LiquidInput;

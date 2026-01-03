import React, { useState, memo, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  ViewStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { FONTS, TYPE_SCALE } from '../../constants/typography';
import { GlassCard } from './GlassCard';

interface LiquidInputProps extends Omit<TextInputProps, 'style'> {
  /** Uppercase label above input */
  label?: string;
  /** Left icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Error message - shows in red below input */
  error?: string;
  /** Container wrapper styles */
  style?: ViewStyle;
}

/**
 * Awwwards kalitesinde interaktif giriş alanı - "Liquid Input"
 * Odaklandığında neon glow yayar ve lüks tipografi kullanır.
 *
 * Features:
 * - GlassCard background with blur effect
 * - Neon border glow on focus
 * - Mono uppercase labels (10px, 1.5 letter spacing)
 * - Icon color transitions on focus
 * - Error state with rose accent
 */
export const LiquidInput: React.FC<LiquidInputProps> = memo(
  ({
    label,
    placeholder,
    value,
    onChangeText,
    icon,
    secureTextEntry,
    error,
    style,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...rest
  }) => {
    const [isFocused, setIsFocused] = useState(false);

    // Memoize focus handlers
    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        onFocusProp?.(e);
      },
      [onFocusProp],
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        onBlurProp?.(e);
      },
      [onBlurProp],
    );

    // Memoize icon color based on focus state
    const iconColor = useMemo(
      () => (isFocused ? COLORS.brand.primary : COLORS.text.muted),
      [isFocused],
    );

    // Memoize container styles based on state
    const containerStyles = useMemo(
      () => [
        styles.inputContainer,
        isFocused && styles.focusedBorder,
        error && styles.errorBorder,
      ],
      [isFocused, error],
    );

    return (
      <View style={[styles.wrapper, style]}>
        {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}

        <GlassCard
          intensity={10}
          showBorder={false}
          padding={0}
          style={containerStyles}
        >
          <View style={styles.innerRow}>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={iconColor}
                style={styles.icon}
                accessible={false}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={COLORS.text.muted}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry}
              onFocus={handleFocus}
              onBlur={handleBlur}
              selectionColor={COLORS.brand.primary}
              accessible={true}
              accessibilityLabel={label}
              {...rest}
            />
          </View>
        </GlassCard>

        {error && (
          <Text style={styles.errorText} accessibilityRole="alert">
            {error}
          </Text>
        )}
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.value === nextProps.value &&
    prevProps.error === nextProps.error &&
    prevProps.label === nextProps.label &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.icon === nextProps.icon &&
    prevProps.secureTextEntry === nextProps.secureTextEntry,
);

LiquidInput.displayName = 'LiquidInput';

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: '100%',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: 16,
    fontFamily: FONTS.body.regular,
    height: '100%',
  },
  focusedBorder: {
    borderColor: COLORS.brand.primary,
    backgroundColor: 'rgba(204, 255, 0, 0.02)',
  },
  errorBorder: {
    borderColor: COLORS.feedback.error,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontFamily: FONTS.body.regular,
  },
});

export default LiquidInput;

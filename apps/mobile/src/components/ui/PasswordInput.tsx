/**
 * Password Input Component
 * LiquidInput wrapper with password visibility toggle
 */

import React, { useState, memo, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextInputProps, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LiquidInput } from './LiquidInput';
import { COLORS } from '../../constants/colors';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const PasswordInput: React.FC<PasswordInputProps> = memo(({
  label,
  error,
  containerStyle,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  return (
    <View style={[styles.container, containerStyle]}>
      <LiquidInput
        label={label}
        icon="lock-closed-outline"
        error={error}
        secureTextEntry={!isPasswordVisible}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={togglePasswordVisibility}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
});

PasswordInput.displayName = 'PasswordInput';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  toggleButton: {
    position: 'absolute',
    right: 16,
    top: 38, // Adjusted for label height
    padding: 4,
  },
});

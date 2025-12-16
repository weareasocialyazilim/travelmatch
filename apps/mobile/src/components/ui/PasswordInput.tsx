/**
 * Password Input Component
 * Show/hide özelliği ile şifre input component
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import type { TextInputProps } from 'react-native';
import { Input } from './Input';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showSuccess?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = memo((props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Memoize toggle handler
  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible((prev) => !prev);
  }, []);

  // Memoize right icon name
  const rightIcon = useMemo(
    () => (isPasswordVisible ? 'eye-off-outline' : 'eye-outline'),
    [isPasswordVisible],
  );

  return (
    <Input
      {...props}
      leftIcon="lock-outline"
      rightIcon={rightIcon}
      onRightIconPress={togglePasswordVisibility}
      secureTextEntry={!isPasswordVisible}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

/**
 * Password Input Component
 * Show/hide özelliği ile şifre input component
 */

import React, { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Input } from './Input';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showSuccess?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <Input
      {...props}
      leftIcon="lock-outline"
      rightIcon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
      onRightIconPress={togglePasswordVisibility}
      secureTextEntry={!isPasswordVisible}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
};

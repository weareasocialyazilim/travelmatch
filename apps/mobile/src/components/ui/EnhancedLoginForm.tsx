/**
 * Enhanced Login Form with React Hook Form
 * Form validation ve state management ile
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { spacing, SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../utils/validation';
import { ControlledInput } from './ControlledInput';
import type { LoginInput } from '../../utils/validation';

interface EnhancedLoginFormProps {
  onSuccess?: () => void;
}

export const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({
  onSuccess,
}) => {
  const toast = useToast();
  const { login, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors: _errors, isValid, isDirty },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Real-time validation
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await login({ email: data.email, password: data.password });
      if (result.success) {
        toast.success('Login successful!');
        onSuccess?.();
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <ControlledInput
        name="email"
        control={control}
        label="Email"
        placeholder="Enter your email"
        leftIcon="email-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
        required
        showSuccess
      />

      <ControlledInput
        name="password"
        control={control}
        label="Password"
        placeholder="Enter your password"
        editable={!isLoading}
        required
        showSuccess
        isPassword
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          (!isValid || !isDirty || isLoading) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || !isDirty || isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* Debug info - remove in production */}
      {__DEV__ && (
        <View style={styles.debug}>
          <Text style={styles.debugText}>
            Valid: {isValid ? 'Yes' : 'No'} | Dirty: {isDirty ? 'Yes' : 'No'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  debug: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  debugText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    textAlign: 'center',
  },
});

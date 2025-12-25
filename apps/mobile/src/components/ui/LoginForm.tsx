/**
 * Form Component Example
 * Validation ile örnek login formu
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useToast } from '../../context/ToastContext';
import { useFormValidation } from '../../hooks/useFormValidation';
import { loginSchema } from '../../utils/validation';
import { Input } from './Input';
import { PasswordInput } from './PasswordInput';
import type { LoginInput } from '../../utils/validation';

/**
 * Example Login Form with Real-time Validation
 */
export const LoginForm: React.FC<{
  onSubmit: (data: LoginInput) => Promise<void>;
}> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errors, validate, validateField } = useFormValidation(loginSchema);
  const toast = useToast();

  const handleFieldChange = (field: keyof LoginInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Real-time validation
    validateField(field, value);
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!validate(formData)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      toast.success('Login successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChangeText={(value) => handleFieldChange('email', value)}
        error={errors.email}
        leftIcon="email-outline"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isSubmitting}
        required
        showSuccess
      />

      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChangeText={(value) => handleFieldChange('password', value)}
        error={errors.password}
        editable={!isSubmitting}
        required
        showSuccess
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: radii.lg,
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    textAlign: 'center',
  },
});

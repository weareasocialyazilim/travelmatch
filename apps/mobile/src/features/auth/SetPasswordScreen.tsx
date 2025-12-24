import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { resetPasswordSchema, type ResetPasswordInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type SetPasswordScreenProps = StackScreenProps<
  RootStackParamList,
  'SetPassword'
>;

export const SetPasswordScreen: React.FC<SetPasswordScreenProps> = ({
  navigation,
}) => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { control, handleSubmit, formState, watch } =
    useForm<ResetPasswordInput>({
      resolver: zodResolver(resetPasswordSchema),
      mode: 'onChange',
      defaultValues: {
        password: '',
        confirmPassword: '',
      },
    });

  const newPassword = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const passwordsMatch =
    newPassword === confirmPassword && newPassword.length > 0;
  const _allValid = hasMinLength && hasNumber && hasSymbol && passwordsMatch;

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let strengthWidth: `${number}%` = '33%';
  let strengthColor: string = COLORS.error;

  if (hasMinLength && hasNumber) {
    strength = 'medium';
    strengthWidth = '66%';
    strengthColor = COLORS.warning;
  }
  if (hasMinLength && hasNumber && hasSymbol) {
    strength = 'strong';
    strengthWidth = '100%';
    strengthColor = COLORS.success;
  }

  const handleSetPassword = (_data: ResetPasswordInput) => {
    // Navigate to success or home
    navigation.navigate('CompleteProfile', {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Headline */}
          <Text style={styles.headline}>Create a new password</Text>

          {/* Body Text */}
          <Text style={styles.bodyText}>
            Your new password must be different from previous used passwords.
          </Text>

          {/* New Password Input */}
          <Controller
            control={control}
            name="password"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, error && styles.textInputError]}
                    placeholder="Enter your new password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Icon
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />

          {/* Confirm Password Input */}
          <Controller
            control={control}
            name="confirmPassword"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm new password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.textInput, error && styles.textInputError]}
                    placeholder="Re-enter your password"
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />

          {/* Password Strength Indicator */}
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBarContainer}>
              <View
                style={[
                  styles.strengthBar,
                  { width: strengthWidth, backgroundColor: strengthColor },
                ]}
              />
            </View>
            <Text style={[styles.strengthText, { color: strengthColor }]}>
              {strength.charAt(0).toUpperCase() + strength.slice(1)}
            </Text>
          </View>

          {/* Validation Checklist */}
          <View style={styles.validationContainer}>
            <View style={styles.validationItem}>
              <Icon
                name={hasMinLength ? 'check-circle' : 'cancel'}
                size={16}
                color={hasMinLength ? COLORS.success : COLORS.error}
              />
              <Text style={styles.validationText}>Minimum 8 characters</Text>
            </View>
            <View style={styles.validationItem}>
              <Icon
                name={hasNumber ? 'check-circle' : 'cancel'}
                size={16}
                color={hasNumber ? COLORS.success : COLORS.error}
              />
              <Text style={styles.validationText}>Include a number</Text>
            </View>
            <View style={styles.validationItem}>
              <Icon
                name={hasSymbol ? 'check-circle' : 'cancel'}
                size={16}
                color={hasSymbol ? COLORS.success : COLORS.error}
              />
              <Text style={styles.validationText}>
                Include a symbol (e.g. !@#)
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.setPasswordButton,
              !canSubmitForm({ formState }) && styles.setPasswordButtonDisabled,
            ]}
            onPress={handleSubmit(handleSetPassword)}
            disabled={!canSubmitForm({ formState })}
            activeOpacity={0.8}
          >
            <Text style={styles.setPasswordButtonText}>Set Password</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.border}20`,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    borderRightWidth: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  textInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeButton: {
    height: 56,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: COLORS.white,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  strengthBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 14,
    fontWeight: '600',
  },
  validationContainer: {
    marginTop: 8,
    gap: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.border}20`,
    backgroundColor: COLORS.background,
  },
  setPasswordButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setPasswordButtonDisabled: {
    backgroundColor: `${COLORS.primary}50`,
  },
  setPasswordButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

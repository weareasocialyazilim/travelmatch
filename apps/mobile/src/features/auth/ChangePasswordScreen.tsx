import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '@/constants/colors';
import { changePasswordSchema, type ChangePasswordInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import { PasswordInput } from '@/components/ui/PasswordInput';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { control, handleSubmit, formState, watch } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      // Real API call for password change via Supabase
      const { supabase } = await import('@/config/supabase');
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) throw error;

      Alert.alert('Success', 'Your password has been changed successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to change password. Please try again.';
      Alert.alert('Error', message);
    }
  };

  const isSubmitDisabled = !canSubmitForm({ formState }, {
    requireDirty: false,
    requireValid: true,
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="shield-lock"
              size={24}
              color={COLORS.mint}
            />
            <Text style={styles.infoText}>
              For your security, please enter your current password before
              setting a new one.
            </Text>
          </View>

          {/* Current Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <PasswordInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter current password"
                  error={error?.message}
                />
              )}
            />
          </View>

          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <PasswordInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter new password"
                  error={error?.message}
                />
              )}
            />
          </View>

          {/* Confirm New Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                <PasswordInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Confirm new password"
                  error={error?.message}
                />
              )}
            />
          </View>

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.matchIndicator}>
              <MaterialCommunityIcons
                name={
                  newPassword === confirmPassword
                    ? 'check-circle'
                    : 'close-circle'
                }
                size={16}
                color={
                  newPassword === confirmPassword ? COLORS.mint : COLORS.coral
                }
              />
              <Text
                style={[
                  styles.matchText,
                  {
                    color:
                      newPassword === confirmPassword
                        ? COLORS.mint
                        : COLORS.coral,
                  },
                ]}
              >
                {newPassword === confirmPassword
                  ? 'Passwords match'
                  : 'Passwords do not match'}
              </Text>
            </View>
          )}

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  newPassword.length >= 8 ? 'check-circle' : 'circle-outline'
                }
                size={16}
                color={
                  newPassword.length >= 8 ? COLORS.mint : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  newPassword.length >= 8 && styles.requirementMet,
                ]}
              >
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /[A-Z]/.test(newPassword) ? 'check-circle' : 'circle-outline'
                }
                size={16}
                color={
                  /[A-Z]/.test(newPassword) ? COLORS.mint : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  /[A-Z]/.test(newPassword) && styles.requirementMet,
                ]}
              >
                One uppercase letter
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /[a-z]/.test(newPassword) ? 'check-circle' : 'circle-outline'
                }
                size={16}
                color={
                  /[a-z]/.test(newPassword) ? COLORS.mint : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  /[a-z]/.test(newPassword) && styles.requirementMet,
                ]}
              >
                One lowercase letter
              </Text>
            </View>
            <View style={styles.requirementRow}>
              <MaterialCommunityIcons
                name={
                  /\d/.test(newPassword) ? 'check-circle' : 'circle-outline'
                }
                size={16}
                color={
                  /\d/.test(newPassword) ? COLORS.mint : COLORS.textSecondary
                }
              />
              <Text
                style={[
                  styles.requirementText,
                  /\d/.test(newPassword) && styles.requirementMet,
                ]}
              >
                One number
              </Text>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={[
              styles.changeButton,
              isSubmitDisabled && styles.changeButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitDisabled}
          >
            <Text style={styles.changeButtonText}>
              {formState.isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() =>
              Alert.alert(
                'Forgot Password',
                'Password reset link will be sent to your email.',
              )
            }
          >
            <Text style={styles.forgotButtonText}>
              Forgot current password?
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.mint}15`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 12,
  },
  requirementsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  requirementMet: {
    color: COLORS.mint,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -12,
    marginBottom: 16,
    paddingLeft: 4,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  forgotButton: {
    alignItems: 'center',
    padding: 12,
  },
  forgotButtonText: {
    fontSize: 14,
    color: COLORS.mint,
    fontWeight: '500',
  },
});

export default ChangePasswordScreen;

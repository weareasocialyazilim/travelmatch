import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { updatePassword } from '@/services/supabaseAuthService';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';

export const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidPassword = (password: string) => {
    // At least 8 characters, one uppercase, one lowercase, one number
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password)
    );
  };

  const canSubmit =
    currentPassword.length > 0 &&
    isValidPassword(newPassword) &&
    newPassword === confirmPassword;

  const handleChangePassword = async () => {
    if (!canSubmit) {
      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
      } else if (!isValidPassword(newPassword)) {
        showToast(
          'Password must be at least 8 characters with uppercase, lowercase, and number',
          'error',
        );
      }
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        showToast(error.message || 'Failed to update password', 'error');
      } else {
        showToast('Password updated successfully!', 'success');
        navigation.goBack();
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    placeholder: string,
    accessibilityLabel: string,
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={20}
          color={COLORS.textSecondary}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          editable={!isLoading}
          {...a11y(accessibilityLabel)}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeButton}
          {...a11y(showPassword ? 'Hide password' : 'Show password')}
        >
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          {...a11y('Back button')}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.header}>
          <MaterialCommunityIcons
            name="shield-lock-outline"
            size={64}
            color={COLORS.primary}
          />
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Create a strong password with at least 8 characters, including
            uppercase, lowercase, and numbers
          </Text>
        </View>

        <View style={styles.form}>
          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            showCurrentPassword,
            setShowCurrentPassword,
            'Enter current password',
            'Current password input',
          )}

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            showNewPassword,
            setShowNewPassword,
            'Enter new password',
            'New password input',
          )}

          {newPassword.length > 0 && (
            <View style={styles.requirements}>
              <RequirementItem
                met={newPassword.length >= 8}
                text="At least 8 characters"
              />
              <RequirementItem
                met={/[A-Z]/.test(newPassword)}
                text="One uppercase letter"
              />
              <RequirementItem
                met={/[a-z]/.test(newPassword)}
                text="One lowercase letter"
              />
              <RequirementItem met={/\d/.test(newPassword)} text="One number" />
            </View>
          )}

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            setShowConfirmPassword,
            'Confirm new password',
            'Confirm password input',
          )}

          {confirmPassword.length > 0 && newPassword !== confirmPassword && (
            <Text style={styles.mismatchError}>Passwords do not match</Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              (!canSubmit || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={!canSubmit || isLoading}
            {...a11y('Update password')}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const RequirementItem: React.FC<{ met: boolean; text: string }> = ({
  met,
  text,
}) => (
  <View style={styles.requirementItem}>
    <MaterialCommunityIcons
      name={met ? 'check-circle' : 'circle-outline'}
      size={16}
      color={met ? COLORS.success : COLORS.textSecondary}
    />
    <Text style={[styles.requirementText, met && styles.requirementMet]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    padding: 16,
    paddingLeft: 12,
  },
  eyeButton: {
    padding: 16,
  },
  requirements: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  requirementMet: {
    color: COLORS.success,
  },
  mismatchError: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;

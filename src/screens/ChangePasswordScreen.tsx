import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, one uppercase, one lowercase, one number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.',
      );
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert(
        'Error',
        'New password must be different from current password',
      );
      return;
    }

    setIsLoading(true);

    try {
      // Real API call for password change
      const { apiClient } = await import('../utils/api');
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      Alert.alert('Success', 'Your password has been changed successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to change password. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    showPassword: boolean,
    toggleShow: () => void,
    placeholder: string,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={toggleShow}>
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

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

          {/* Password Fields */}
          {renderPasswordInput(
            'Current Password',
            currentPassword,
            setCurrentPassword,
            showCurrentPassword,
            () => setShowCurrentPassword(!showCurrentPassword),
            'Enter current password',
          )}

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            showNewPassword,
            () => setShowNewPassword(!showNewPassword),
            'Enter new password',
          )}

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword),
            'Confirm new password',
          )}

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
              isLoading && styles.changeButtonDisabled,
            ]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <Text style={styles.changeButtonText}>
              {isLoading ? 'Changing Password...' : 'Change Password'}
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

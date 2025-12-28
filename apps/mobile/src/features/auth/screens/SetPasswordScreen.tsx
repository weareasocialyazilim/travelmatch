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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';
import { updatePassword } from '@/services/supabaseAuthService';

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export const SetPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passesAllRequirements = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const isFormValid = passesAllRequirements && passwordsMatch;

  const handleSetPassword = async () => {
    if (!isFormValid) {
      showToast('Please meet all password requirements', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        showToast(error.message || 'Failed to set password', 'error');
      } else {
        showToast('Password set successfully!', 'success');
        navigation.navigate('SuccessConfirmation' as never);
      }
    } catch {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            {...a11y.button('Back button')}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="lock-plus-outline" size={48} color={COLORS.brand.primary} />
            </View>
            <Text style={styles.title}>Create Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password to secure your account
            </Text>
          </View>

          <View style={styles.form}>
            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-outline"
                  size={20}
                  color={COLORS.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.text.secondary}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  {...a11y.textInput('Password input')}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  {...a11y.button(showPassword ? 'Hide password' : 'Show password')}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirements}>
              {PASSWORD_REQUIREMENTS.map((req, index) => {
                const passed = req.test(password);
                return (
                  <View key={index} style={styles.requirementRow}>
                    <MaterialCommunityIcons
                      name={passed ? 'check-circle' : 'circle-outline'}
                      size={16}
                      color={passed ? COLORS.feedback.success : COLORS.text.secondary}
                    />
                    <Text style={[styles.requirementText, passed && styles.requirementPassed]}>
                      {req.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={20}
                  color={COLORS.text.secondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  placeholderTextColor={COLORS.text.secondary}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  {...a11y.textInput('Confirm password input')}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  {...a11y.button(showConfirmPassword ? 'Hide password' : 'Show password')}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
              {passwordsMatch && (
                <View style={styles.matchIndicator}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={COLORS.feedback.success} />
                  <Text style={styles.matchText}>Passwords match</Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, (!isFormValid || isLoading) && styles.buttonDisabled]}
              onPress={handleSetPassword}
              disabled={!isFormValid || isLoading}
              {...a11y.button('Set password', undefined, !isFormValid || isLoading)}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.utility.white} />
              ) : (
                <Text style={styles.buttonText}>Set Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  keyboardView: {
    flex: 1,
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
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  inputIcon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    padding: 16,
    paddingLeft: 12,
  },
  eyeButton: {
    padding: 16,
  },
  requirements: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  requirementPassed: {
    color: COLORS.feedback.success,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.feedback.error,
    marginTop: 8,
    paddingLeft: 4,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingLeft: 4,
  },
  matchText: {
    fontSize: 12,
    color: COLORS.feedback.success,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SetPasswordScreen;

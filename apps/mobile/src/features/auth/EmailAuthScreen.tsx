import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { spacing as _spacing } from '@/constants/spacing';
import { TYPOGRAPHY as _TYPOGRAPHY } from '@/constants/typography';
import { logger } from '@/utils/logger';
import { LoadingState } from '@/components/LoadingState';
import SocialButton from '@/components/SocialButton';
import { emailAuthSchema, type EmailAuthInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type EmailAuthScreenProps = StackScreenProps<RootStackParamList, 'EmailAuth'>;

export const EmailAuthScreen: React.FC<EmailAuthScreenProps> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState, watch } = useForm<EmailAuthInput>({
    resolver: zodResolver(emailAuthSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const _email = watch('email');

  const handleContinue = async (_data: EmailAuthInput) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Navigate to verification code screen
      navigation.navigate('CompleteProfile', {});
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    logger.debug('Social login:', provider);
    navigation.navigate('CompleteProfile', {});
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {loading && <LoadingState type="overlay" message="Sending code..." />}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 2</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* OAuth Buttons */}
          <View style={styles.socialButtonsContainer}>
            <SocialButton
              provider="apple"
              label="Continue with Apple"
              onPress={() => handleSocialLogin('apple')}
            />
            <SocialButton
              provider="google"
              label="Continue with Google"
              onPress={() => handleSocialLogin('google')}
            />
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or use email</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Input */}
          <Controller
            control={control}
            name="email"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email address</Text>
                <TextInput
                  style={[styles.textInput, error && styles.textInputError]}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {error && <Text style={styles.errorText}>{error.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!canSubmitForm({ formState }) || loading) &&
                styles.continueButtonDisabled,
            ]}
            onPress={handleSubmit(handleContinue)}
            disabled={!canSubmitForm({ formState }) || loading}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Sending...' : 'Continue'}
            </Text>
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.mint,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
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
  socialButtonsContainer: {
    gap: 16,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
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
  textInput: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.white,
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
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.border}20`,
    backgroundColor: COLORS.background,
  },
  continueButton: {
    height: 56,
    backgroundColor: COLORS.mint,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: `${COLORS.mint}50`,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ControlledInput } from '@/components/ui/ControlledInput';
import { LoadingState } from '@/components/LoadingState';
import { signInWithPhone } from '@/services/supabaseAuthService';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/AppNavigator';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      'Please enter a valid phone number with country code (e.g., +1234567890)',
    ),
});

type PhoneInput = z.infer<typeof phoneSchema>;

type PhoneAuthNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PhoneAuth'
>;

export const PhoneAuthScreen: React.FC = () => {
  const navigation = useNavigation<PhoneAuthNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    mode: 'onChange',
    defaultValues: {
      phone: '',
    },
  });

  const onSubmit = async (data: PhoneInput) => {
    setIsLoading(true);
    try {
      const { error } = await signInWithPhone(data.phone);

      if (error) {
        Alert.alert(
          'Error',
          error.message || 'Failed to send verification code',
        );
        return;
      }

      // Navigate to verification screen with phone number
      navigation.navigate('VerifyCode', {
        verificationType: 'phone',
        contact: data.phone,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Sending verification code..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phone Authentication</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="cellphone-message"
              size={64}
              color={COLORS.primary}
            />
          </View>

          <Text style={styles.title}>Enter Your Phone Number</Text>
          <Text style={styles.description}>
            We'll send you a verification code to confirm your phone number.
            Please include your country code.
          </Text>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <ControlledInput
              control={control}
              name="phone"
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoComplete="tel"
              error={errors.phone?.message}
            />
            <Text style={styles.hint}>
              Enter your phone number with country code (e.g., +1 for US)
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
          >
            <Text style={styles.submitButtonText}>Send Verification Code</Text>
          </TouchableOpacity>

          {/* Alternative Auth */}
          <View style={styles.alternativeContainer}>
            <Text style={styles.alternativeText}>Or sign in with</Text>
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={() => navigation.navigate('EmailAuth' as never)}
            >
              <MaterialCommunityIcons
                name="email"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.alternativeButtonText}>Email</Text>
            </TouchableOpacity>
          </View>

          {/* Back to Login */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{' '}
              <Text style={styles.loginLinkBold}>Sign In</Text>
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
  keyboardView: {
    flex: 1,
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
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  hint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  alternativeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  alternativeText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  alternativeButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    marginLeft: 8,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  loginLinkBold: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

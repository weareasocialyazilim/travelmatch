import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { useBiometric } from '@/context/BiometricAuthContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { loginSchema, type LoginInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';

export const LoginScreen: React.FC = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const { login } = useAuth();
  const { biometricAvailable, biometricEnabled, biometricTypeName, authenticateForAppLaunch } = useBiometric();
  const { props: a11y } = useAccessibility();
  
  const { control, handleSubmit, formState } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      await login({ email: data.email, password: data.password });
      // Navigation handled by auth state change
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Please try again', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setIsBiometricLoading(true);
      const success = await authenticateForAppLaunch();

      if (success) {
        // User authenticated with biometric, proceed with login
        // In a real app, you would retrieve stored credentials and call login
        // For now, we'll just show a success message
        showToast('You have been authenticated with ' + biometricTypeName, 'success');
      } else {
        showToast('Could not verify your ' + biometricTypeName.toLowerCase() + '. Please try again or use your password.', 'error');
      }
    } catch (error) {
      showToast('Biometric authentication is not available. Please use your password.', 'error');
    } finally {
      setIsBiometricLoading(false);
    }
  };

  return (
    <ScreenErrorBoundary>
      <View style={styles.container}>
        <Text 
          style={styles.title}
          {...a11y.header('Welcome Back')}
        >
          Welcome Back
        </Text>
        <Text 
          style={styles.subtitle}
          accessible={true}
          accessibilityLabel="Sign in to continue"
        >
          Sign in to continue
        </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Email"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
              accessible={true}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email address to sign in"
              accessibilityValue={{ text: value }}
            />
            {error && (
              <Text 
                style={styles.errorText}
                {...a11y.alert(error.message || 'Validation error')}
              >
                {error.message}
              </Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              editable={!isLoading}
              accessible={true}
              accessibilityLabel="Password"
              accessibilityHint="Enter your password to sign in"
            />
            {error && (
              <Text 
                style={styles.errorText}
                {...a11y.alert(error.message || 'Validation error')}
              >
                {error.message}
              </Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        testID="login-button"
        style={[styles.button, (isLoading || !canSubmitForm({ formState } as any)) && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading || !canSubmitForm({ formState } as any)}
        {...a11y.button(
          isLoading ? 'Signing in' : 'Sign In',
          'Sign in with your email and password',
          isLoading || !canSubmitForm({ formState } as any)
        )}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      {biometricAvailable && biometricEnabled && (
        <>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            testID="biometric-login-button"
            style={styles.biometricButton}
            onPress={handleBiometricLogin}
            disabled={isBiometricLoading || isLoading}
            {...a11y.button(
              `Sign in with ${biometricTypeName}`,
              `Use ${biometricTypeName} to sign in quickly`,
              isBiometricLoading || isLoading
            )}
          >
            {isBiometricLoading ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="fingerprint"
                  size={32}
                  color="#2563eb"
                  accessible={false}
                />
                <Text style={styles.biometricButtonText}>
                  Sign in with {biometricTypeName}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}
      </View>
    </ScreenErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
  biometricButton: {
    width: '100%',
    height: 60,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  biometricButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
});

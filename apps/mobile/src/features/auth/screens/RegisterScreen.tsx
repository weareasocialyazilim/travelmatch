import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';

export const RegisterScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  
  const { control, handleSubmit, formState } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      await register({ email: data.email, password: data.password, name: data.fullName ?? data.email.split('@')[0] });
      // Navigation handled by auth state change
    } catch (error) {
      Alert.alert('Registration Failed', error instanceof Error ? error.message : 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Full Name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              editable={!isLoading}
            />
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>
        )}
      />

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
            />
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
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
            />
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Confirm Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              editable={!isLoading}
            />
            {error && (
              <Text style={styles.errorText}>{error.message}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        style={[styles.button, (isLoading || !canSubmitForm({ formState })) && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading || !canSubmitForm({ formState })}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
});

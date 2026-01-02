import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = EMAIL_REGEX.test(email.trim());

  const handleReset = async () => {
    Keyboard.dismiss();

    if (!isValidEmail) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email.trim());
      if (result.success) {
        Alert.alert('Link Sent', `Reset instructions sent to ${email}`, [
          { text: 'Back to Login', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to send reset link. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.desc}>Don't worry! It happens. Please enter the email associated with your account.</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.btn, (!isValidEmail || isLoading) && styles.disabledBtn]}
          onPress={handleReset}
          disabled={!isValidEmail || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="black" />
          ) : (
            <Text style={styles.btnText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: { padding: 20 },
  content: { padding: 24 },
  title: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 12 },
  desc: { color: COLORS.text.secondary, fontSize: 16, lineHeight: 24, marginBottom: 40 },
  label: { color: 'white', fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 18, color: 'white', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 30 },
  btn: { backgroundColor: COLORS.brand.primary, padding: 18, borderRadius: 16, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#333' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

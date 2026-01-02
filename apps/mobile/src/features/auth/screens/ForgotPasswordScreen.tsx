import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const handleReset = () => {
    Alert.alert('Link Sent', `Reset instructions sent to ${email}`, [
      { text: 'Back to Login', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="white" /></TouchableOpacity>
      </View>

      <View style={styles.content}>
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
        />

        <TouchableOpacity
          style={[styles.btn, !email && styles.disabledBtn]}
          onPress={handleReset}
          disabled={!email}
        >
          <Text style={styles.btnText}>Send Reset Link</Text>
        </TouchableOpacity>
      </View>
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

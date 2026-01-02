import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

export const EmailVerificationScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleInput = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every(c => c !== '')) {
      Keyboard.dismiss();
      // Auto submit logic here
      setTimeout(() => navigation.replace('BiometricSetup'), 500);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.backBtn, { top: insets.top + 10 }]} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
           <MaterialCommunityIcons name="email-check-outline" size={60} color={COLORS.brand.primary} />
        </View>

        <Text style={styles.title}>Check your Inbox</Text>
        <Text style={styles.desc}>
          We sent a verification code to <Text style={styles.email}>selin@travelmatch.app</Text>.
          Please enter it below to verify your vibe.
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={el => inputs.current[index] = el}
              style={[styles.codeInput, digit && styles.codeInputActive]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleInput(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                  inputs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.resendBtn}>
          <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendLink}>Resend</Text></Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.verifyBtn}
        onPress={() => navigation.replace('BiometricSetup')}
      >
        <LinearGradient
          colors={[COLORS.brand.primary, '#A2FF00']}
          style={styles.gradientBtn}
        >
          <Text style={styles.verifyText}>Verify Email</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  backBtn: { position: 'absolute', left: 20, zIndex: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(204, 255, 0, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 16 },
  desc: { color: COLORS.text.secondary, textAlign: 'center', fontSize: 16, lineHeight: 24, marginBottom: 40 },
  email: { color: 'white', fontWeight: 'bold' },
  codeContainer: { flexDirection: 'row', gap: 16, marginBottom: 40 },
  codeInput: { width: 60, height: 70, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  codeInputActive: { borderColor: COLORS.brand.primary, backgroundColor: 'rgba(204, 255, 0, 0.05)' },
  resendBtn: { padding: 10 },
  resendText: { color: '#888' },
  resendLink: { color: COLORS.brand.primary, fontWeight: 'bold' },
  verifyBtn: { margin: 20, borderRadius: 20, overflow: 'hidden', marginBottom: 40 },
  gradientBtn: { paddingVertical: 18, alignItems: 'center' },
  verifyText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});

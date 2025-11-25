import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SocialButton from '../components/SocialButton';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';

export const SocialLoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign up quickly using one of the options below</Text>

        <View style={styles.card}>
          <SocialButton provider="google" label="Continue with Google" onPress={() => navigation.navigate('CompleteProfile')} />
          <SocialButton provider="apple" label="Continue with Apple" onPress={() => navigation.navigate('CompleteProfile')} />
          <SocialButton provider="facebook" label="Continue with Facebook" onPress={() => navigation.navigate('CompleteProfile')} />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <SocialButton provider="phone" label="Continue with Phone" onPress={() => navigation.navigate('PhoneAuth')} />
          <SocialButton provider="email" label="Continue with Email" onPress={() => navigation.navigate('EmailAuth')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: LAYOUT.padding * 3, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, marginBottom: LAYOUT.padding * 2, textAlign: 'center' },
  card: { width: '100%', maxWidth: 480, marginTop: LAYOUT.padding, padding: LAYOUT.padding * 2, borderRadius: VALUES.borderRadius * 1.5, backgroundColor: COLORS.cardBackground },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: LAYOUT.padding * 1.2 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  orText: { marginHorizontal: 12, color: COLORS.textSecondary, fontWeight: '700' },
});

export default SocialLoginScreen;

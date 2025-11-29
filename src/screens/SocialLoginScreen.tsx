import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SocialButton from '../components/SocialButton';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SocialLoginScreenProps = StackScreenProps<
  RootStackParamList,
  'SocialLogin'
>;

export const SocialLoginScreen: React.FC<SocialLoginScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>
          Sign up quickly using one of the options below
        </Text>

        <View style={styles.card}>
          <SocialButton
            provider="google"
            label="Continue with Google"
            onPress={() => navigation.navigate('CompleteProfile')}
          />
          <SocialButton
            provider="apple"
            label="Continue with Apple"
            onPress={() => navigation.navigate('CompleteProfile')}
          />
          <SocialButton
            provider="facebook"
            label="Continue with Facebook"
            onPress={() => navigation.navigate('CompleteProfile')}
          />

          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.line} />
          </View>

          <SocialButton
            provider="phone"
            label="Continue with Phone"
            onPress={() => navigation.navigate('PhoneAuth')}
          />
          <SocialButton
            provider="email"
            label="Continue with Email"
            onPress={() => navigation.navigate('EmailAuth')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: VALUES.borderRadius * 1.5,
    marginTop: LAYOUT.padding,
    maxWidth: 480,
    padding: LAYOUT.padding * 2,
    width: '100%',
  },
  container: { backgroundColor: COLORS.background, flex: 1 },
  content: { alignItems: 'center', padding: LAYOUT.padding * 3 },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: LAYOUT.padding * 1.2,
  },
  line: { backgroundColor: COLORS.border, flex: 1, height: 1 },
  orText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
    marginHorizontal: 12,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: LAYOUT.padding * 2,
    textAlign: 'center',
  },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '800', marginTop: 8 },
});

export default SocialLoginScreen;

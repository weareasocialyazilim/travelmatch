import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type TwoFactorSetupScreenProps = StackScreenProps<RootStackParamList, 'TwoFactorSetup'>;

export const TwoFactorSetupScreen: React.FC<TwoFactorSetupScreenProps> = ({ navigation }) => {
  const [step, setStep] = useState<'intro' | 'verify' | 'success'>('intro');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock secret key for demo
  const secretKey = 'JBSWY3DPEHPK3PXP';

  const handleSendCode = () => {
    setIsLoading(true);
    // Simulate sending verification code
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
      Alert.alert('Code Sent', 'A verification code has been sent to your phone');
    }, 1000);
  };

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      if (verificationCode === '123456') {
        setStep('success');
      } else {
        Alert.alert('Invalid Code', 'Please check your code and try again');
      }
    }, 1000);
  };

  const handleDone = () => {
    navigation.goBack();
  };

  const renderIntroStep = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="shield-lock"
          size={80}
          color={COLORS.primary}
        />
      </View>
      
      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.description}>
        Add an extra layer of security to your account. You&apos;ll need to enter a 
        verification code each time you sign in.
      </Text>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={COLORS.success}
          />
          <Text style={styles.benefitText}>Protect against unauthorized access</Text>
        </View>
        <View style={styles.benefitRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={COLORS.success}
          />
          <Text style={styles.benefitText}>Secure your wallet and transactions</Text>
        </View>
        <View style={styles.benefitRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={COLORS.success}
          />
          <Text style={styles.benefitText}>Keep your personal data safe</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSendCode}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Setting up...' : 'Enable 2FA'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.content}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="cellphone-key"
          size={80}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.description}>
        Enter the 6-digit code sent to your phone number ending in ***1234
      </Text>

      <TextInput
        style={styles.codeInput}
        value={verificationCode}
        onChangeText={setVerificationCode}
        placeholder="000000"
        placeholderTextColor={COLORS.textTertiary}
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />

      <Text style={styles.hint}>
        Demo: Enter 123456 to verify
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleVerify}
        disabled={isLoading || verificationCode.length !== 6}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => Alert.alert('Code Resent', 'A new code has been sent')}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryButtonText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.content}>
      <View style={[styles.iconContainer, styles.successIconContainer]}>
        <MaterialCommunityIcons
          name="check-circle"
          size={80}
          color={COLORS.success}
        />
      </View>

      <Text style={styles.title}>2FA Enabled!</Text>
      <Text style={styles.description}>
        Your account is now protected with two-factor authentication. 
        You&apos;ll need to enter a code each time you sign in.
      </Text>

      <View style={styles.backupCodeContainer}>
        <Text style={styles.backupCodeLabel}>Backup Code</Text>
        <Text style={styles.backupCode}>{secretKey}</Text>
        <Text style={styles.backupCodeHint}>
          Save this code somewhere safe. You can use it to recover your account 
          if you lose access to your phone.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleDone}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'intro' && renderIntroStep()}
        {step === 'verify' && renderVerifyStep()}
        {step === 'success' && renderSuccessStep()}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    backgroundColor: `${COLORS.success}15`,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    gap: 16,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  codeInput: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 8,
    marginBottom: 16,
  },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
  backupCodeContainer: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  backupCodeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  backupCode: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: 12,
  },
  backupCodeHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default TwoFactorSetupScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

type SetupStep = 'intro' | 'qr' | 'verify' | 'success';

export const TwoFactorSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState<SetupStep>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCodeURL, setQrCodeURL] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleSetup2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        Alert.alert('Error', 'Please sign in to enable 2FA');
        return;
      }

      const response = await supabase.functions.invoke('setup-2fa', {
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { secret: totpSecret, qrCodeURL: qrUrl } = response.data;
      setSecret(totpSecret);
      setQrCodeURL(qrUrl);
      setStep('qr');
    } catch (err) {
      const message = err instanceof Error ? err.message : '2FA setup failed';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('verify-2fa', {
        body: { code: verificationCode },
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data.valid) {
        setStep('success');
      } else {
        setError('Invalid code. Please try again.');
        setVerificationCode('');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Verification failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const copySecret = async () => {
    await Clipboard.setStringAsync(secret);
    Alert.alert('Copied', 'Secret key copied to clipboard');
  };

  const renderIntro = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="shield-lock"
          size={80}
          color={COLORS.primary}
        />
      </View>

      <Text style={styles.title}>Enable Two-Factor Authentication</Text>

      <Text style={styles.description}>
        Add an extra layer of security to your account. You'll need an authenticator
        app like Google Authenticator or Authy.
      </Text>

      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.benefitText}>Protect against unauthorized access</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.benefitText}>Secure your payments and wallet</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.success} />
          <Text style={styles.benefitText}>Get verified badge on your profile</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSetup2FA}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Get Started</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderQRCode = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Scan QR Code</Text>

      <Text style={styles.stepDescription}>
        Open your authenticator app and scan this QR code
      </Text>

      <View style={styles.qrContainer}>
        {qrCodeURL ? (
          <Image
            source={{ uri: qrCodeURL }}
            style={styles.qrCode}
            resizeMode="contain"
          />
        ) : (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
      </View>

      <Text style={styles.orText}>Or enter the secret key manually:</Text>

      <TouchableOpacity style={styles.secretContainer} onPress={copySecret}>
        <Text style={styles.secretText}>{secret}</Text>
        <MaterialCommunityIcons name="content-copy" size={20} color={COLORS.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep('verify')}
      >
        <Text style={styles.primaryButtonText}>I've Scanned the Code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerify = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Verify Code</Text>

      <Text style={styles.stepDescription}>
        Enter the 6-digit code from your authenticator app
      </Text>

      <TextInput
        style={[styles.codeInput, error ? styles.codeInputError : null]}
        value={verificationCode}
        onChangeText={(text) => {
          setVerificationCode(text.replace(/[^0-9]/g, '').slice(0, 6));
          setError('');
        }}
        placeholder="000000"
        placeholderTextColor={COLORS.textTertiary}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.primaryButton, verificationCode.length !== 6 && styles.buttonDisabled]}
        onPress={handleVerify}
        disabled={isLoading || verificationCode.length !== 6}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Verify & Enable</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => setStep('qr')}
      >
        <Text style={styles.backLinkText}>Go back to QR code</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.stepContainer}>
      <View style={styles.successIconContainer}>
        <MaterialCommunityIcons
          name="check-circle"
          size={100}
          color={COLORS.success}
        />
      </View>

      <Text style={styles.successTitle}>2FA Enabled!</Text>

      <Text style={styles.successDescription}>
        Your account is now protected with two-factor authentication.
        You'll need to enter a code from your authenticator app when signing in.
      </Text>

      <View style={styles.warningBox}>
        <MaterialCommunityIcons name="alert" size={24} color={COLORS.warning} />
        <Text style={styles.warningText}>
          Save your secret key in a safe place. You'll need it if you lose access
          to your authenticator app.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.goBack()}
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
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Two-Factor Authentication</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'intro' && renderIntro()}
        {step === 'qr' && renderQRCode()}
        {step === 'verify' && renderVerify()}
        {step === 'success' && renderSuccess()}
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
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  benefitsList: {
    width: '100%',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  benefitText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.white,
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  stepTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  qrContainer: {
    width: 220,
    height: 220,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrCode: {
    width: 200,
    height: 200,
  },
  orText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  secretContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 32,
    gap: 8,
  },
  secretText: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: 'monospace',
    color: COLORS.text,
    letterSpacing: 2,
  },
  codeInput: {
    width: '100%',
    height: 64,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
    color: COLORS.text,
    marginBottom: 16,
  },
  codeInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    marginBottom: 16,
  },
  backLink: {
    padding: 12,
  },
  backLinkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: 16,
  },
  successDescription: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 12,
  },
  warningText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    flex: 1,
  },
});

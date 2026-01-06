import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Clipboard,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@/hooks/useNavigationHelpers';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '@/context/ToastContext';
import { useAccessibility } from '@/hooks/useAccessibility';
import { COLORS } from '@/constants/colors';
import { generateTotpSecret } from '@/utils/security';

type SetupStep = 'intro' | 'setup' | 'verify' | 'backup';

const CODE_LENGTH = 6;

export const TwoFactorSetupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { props: a11y } = useAccessibility();

  // Generate a unique TOTP secret for this setup session
  // In production, this should be fetched from the backend API
  const secretKey = useMemo(() => generateTotpSecret(10), []);

  const [step, setStep] = useState<SetupStep>('intro');
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: { nativeEvent: { key: string } },
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCopySecret = async () => {
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(secretKey);
    } else {
      Clipboard.setString(secretKey);
    }
    showToast('Secret key copied to clipboard', 'success');
  };

  const handleVerify = async () => {
    const codeValue = code.join('');
    if (codeValue.length !== CODE_LENGTH) {
      showToast('Please enter the complete 6-digit code', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate backup codes
      const codes = Array(8)
        .fill(null)
        .map(() => Math.random().toString(36).substring(2, 10).toUpperCase());
      setBackupCodes(codes);
      setStep('backup');
      showToast('2FA enabled successfully!', 'success');
    } catch (_twoFactorError) {
      showToast('Verification failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    const codesText = backupCodes.join('\n');
    if (Platform.OS === 'web') {
      await navigator.clipboard.writeText(codesText);
    } else {
      Clipboard.setString(codesText);
    }
    showToast('Backup codes copied to clipboard', 'success');
  };

  const handleFinish = () => {
    navigation.navigate('Settings');
  };

  const isCodeComplete = code.every((digit) => digit !== '');

  const renderIntro = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={64}
          color={COLORS.brand.primary}
        />
      </View>

      <Text style={styles.title}>Two-Factor Authentication</Text>
      <Text style={styles.subtitle}>
        Add an extra layer of security to your account by enabling two-factor
        authentication
      </Text>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={COLORS.feedback.success}
          />
          <Text style={styles.benefitText}>
            Protect against unauthorized access
          </Text>
        </View>
        <View style={styles.benefitRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={COLORS.feedback.success}
          />
          <Text style={styles.benefitText}>Secure your personal data</Text>
        </View>
        <View style={styles.benefitRow}>
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={COLORS.feedback.success}
          />
          <Text style={styles.benefitText}>Prevent account takeover</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep('setup')}
        {...a11y.button('Continue to setup')}
      >
        <Text style={styles.primaryButtonText}>Set Up 2FA</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
        {...a11y.button('Skip for now')}
      >
        <Text style={styles.secondaryButtonText}>Maybe Later</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSetup = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainerSmall}>
        <MaterialCommunityIcons
          name="qrcode-scan"
          size={40}
          color={COLORS.brand.primary}
        />
      </View>

      <Text style={styles.title}>Set Up Authenticator</Text>
      <Text style={styles.subtitle}>
        Use an authenticator app like Google Authenticator or Authy
      </Text>

      {/* QR Code Placeholder */}
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <MaterialCommunityIcons
            name="qrcode"
            size={120}
            color={COLORS.text.primary}
          />
        </View>
        <Text style={styles.qrHint}>
          Scan this QR code with your authenticator app
        </Text>
      </View>

      {/* Manual Entry */}
      <View style={styles.manualEntry}>
        <Text style={styles.manualLabel}>Or enter this key manually:</Text>
        <View style={styles.secretKeyContainer}>
          <Text style={styles.secretKey}>{secretKey}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopySecret}
            {...a11y.button('Copy secret key')}
          >
            <MaterialCommunityIcons
              name="content-copy"
              size={20}
              color={COLORS.brand.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          setStep('verify');
          setTimeout(() => inputRefs.current[0]?.focus(), 300);
        }}
        {...a11y.button('Continue to verification')}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderVerify = () => (
    <View style={styles.stepContent}>
      <View style={styles.iconContainerSmall}>
        <MaterialCommunityIcons
          name="numeric"
          size={40}
          color={COLORS.brand.primary}
        />
      </View>

      <Text style={styles.title}>Verify Setup</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code from your authenticator app to verify setup
      </Text>

      {/* Code Input */}
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.codeInput, digit && styles.codeInputFilled]}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            accessibilityLabel={`Digit ${index + 1}`}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!isCodeComplete || isLoading) && styles.buttonDisabled,
        ]}
        onPress={handleVerify}
        disabled={!isCodeComplete || isLoading}
        {...a11y.button('Verify code', undefined, !isCodeComplete || isLoading)}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.utility.white} />
        ) : (
          <Text style={styles.primaryButtonText}>Verify & Enable</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep('setup')}
        {...a11y.button('Go back')}
      >
        <Text style={styles.secondaryButtonText}>Back to Setup</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBackup = () => (
    <View style={styles.stepContent}>
      <View style={[styles.iconContainer, styles.successIcon]}>
        <MaterialCommunityIcons
          name="check-circle"
          size={64}
          color={COLORS.feedback.success}
        />
      </View>

      <Text style={styles.title}>2FA Enabled!</Text>
      <Text style={styles.subtitle}>
        Save these backup codes in a secure place. You can use them to access
        your account if you lose your device.
      </Text>

      {/* Backup Codes */}
      <View style={styles.backupCodesContainer}>
        <View style={styles.backupCodesHeader}>
          <Text style={styles.backupCodesTitle}>Backup Codes</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopyBackupCodes}
            {...a11y.button('Copy all codes')}
          >
            <MaterialCommunityIcons
              name="content-copy"
              size={18}
              color={COLORS.brand.primary}
            />
            <Text style={styles.copyButtonText}>Copy All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.codesGrid}>
          {backupCodes.map((code, index) => (
            <View key={index} style={styles.codeItem}>
              <Text style={styles.codeNumber}>{index + 1}.</Text>
              <Text style={styles.backupCode}>{code}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.warningBox}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={20}
          color={COLORS.feedback.warning}
        />
        <Text style={styles.warningText}>
          Each backup code can only be used once. Store them safely!
        </Text>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleFinish}
        {...a11y.button('Finish setup')}
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
          style={styles.backButton}
          onPress={() => {
            if (step === 'intro' || step === 'backup') {
              navigation.goBack();
            } else if (step === 'verify') {
              setStep('setup');
            } else {
              setStep('intro');
            }
          }}
          {...a11y.button('Go back')}
        >
          <MaterialCommunityIcons
            name={step === 'backup' ? 'close' : 'arrow-left'}
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>

        {/* Progress Indicator */}
        {step !== 'intro' && step !== 'backup' && (
          <View style={styles.progressIndicator}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View
              style={[
                styles.progressDot,
                step === 'verify' && styles.progressDotActive,
              ]}
            />
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'intro' && renderIntro()}
        {step === 'setup' && renderSetup()}
        {step === 'verify' && renderVerify()}
        {step === 'backup' && renderBackup()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border.default,
  },
  progressDotActive: {
    backgroundColor: COLORS.brand.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  iconContainerSmall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.brand.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  successIcon: {
    backgroundColor: `${COLORS.feedback.success}15`,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 15,
    color: COLORS.text.primary,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    padding: 12,
  },
  secondaryButtonText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrHint: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  manualEntry: {
    width: '100%',
    marginBottom: 32,
  },
  manualLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  secretKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    padding: 16,
  },
  secretKey: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 2,
    marginRight: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  copyButtonText: {
    fontSize: 13,
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  codeInput: {
    width: 46,
    height: 54,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    backgroundColor: COLORS.surface.base,
  },
  codeInputFilled: {
    borderColor: COLORS.brand.primary,
    backgroundColor: `${COLORS.brand.primary}10`,
  },
  backupCodesContainer: {
    width: '100%',
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  backupCodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backupCodesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  codeItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  codeNumber: {
    fontSize: 13,
    color: COLORS.text.secondary,
    width: 24,
  },
  backupCode: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  warningBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: `${COLORS.feedback.warning}15`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
});

export default TwoFactorSetupScreen;

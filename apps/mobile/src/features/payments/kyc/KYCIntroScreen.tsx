// KYC Intro Screen - First step of identity verification
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { NetworkGuard } from '@/components/NetworkGuard';
import { REQUIREMENTS, INITIAL_VERIFICATION_DATA } from './constants';
import { KYCHeader } from './KYCHeader';
import { kycStyles } from './styles';
import type { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<{
  KYCDocumentType: { data: typeof INITIAL_VERIFICATION_DATA };
}>;

const KYCIntroScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleStart = () => {
    navigation.navigate('KYCDocumentType', {
      data: INITIAL_VERIFICATION_DATA,
    });
  };

  return (
    <NetworkGuard offlineMessage="Kimlik doğrulama için internet bağlantısı gerekli.">
    <SafeAreaView style={kycStyles.container}>
      <View style={kycStyles.content}>
        <KYCHeader title="Identity Verification" />
        <ScrollView
          style={kycStyles.scrollView}
          contentContainerStyle={kycStyles.scrollContent}
        >
          <Text style={kycStyles.title}>Verify Your Identity</Text>
          <Text style={kycStyles.description}>
            To ensure a safe community, we need to verify your identity. This
            helps protect everyone on the platform.
          </Text>

          <View style={kycStyles.requirementsList}>
            {REQUIREMENTS.map((req) => (
              <View key={req.id} style={kycStyles.requirementItem}>
                <View style={kycStyles.requirementIcon}>
                  <MaterialCommunityIcons
                    name={req.icon}
                    size={24}
                    color={COLORS.brand.primary}
                  />
                </View>
                <Text style={kycStyles.requirementLabel}>{req.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={kycStyles.footer}>
          <TouchableOpacity
            style={kycStyles.primaryButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={kycStyles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          <View style={kycStyles.securityNote}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={14}
              color={COLORS.text.secondary}
            />
            <Text style={kycStyles.securityNoteText}>
              Your data is encrypted and secure
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
    </NetworkGuard>
  );
};

// Wrap with ErrorBoundary for critical KYC functionality
export default withErrorBoundary(KYCIntroScreen, {
  fallbackType: 'generic',
  displayName: 'KYCIntroScreen',
});

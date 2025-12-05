// KYC Selfie Screen - Liveness check and selfie capture
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { COLORS } from '../../constants/colors';
import { KYCHeader } from './KYCHeader';
import { KYCProgressBar } from './KYCProgressBar';
import { kycStyles } from './styles';
import type { VerificationData } from './types';

type RouteParams = {
  KYCSelfie: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCReview: { data: VerificationData };
}>;

const KYCSelfieScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCSelfie'>>();
  const { data: initialData } = route.params;

  const [data, setData] = useState<VerificationData>(initialData);

  const handleCaptureSelfie = useCallback(() => {
    // In a real app, this would open the camera for selfie
    Alert.alert(
      'Liveness Check',
      'Position your face in the oval and hold still...',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Simulate Capture',
          onPress: () => {
            setData((prev) => ({
              ...prev,
              selfie: 'captured',
            }));
          },
        },
      ],
    );
  }, []);

  const handleContinue = () => {
    navigation.navigate('KYCReview', { data });
  };

  return (
    <SafeAreaView style={kycStyles.container}>
      <View style={kycStyles.content}>
        <KYCHeader title="Selfie Verification" />
        <KYCProgressBar currentStep="selfie" />

        <View style={kycStyles.selfieContent}>
          <View style={kycStyles.selfieHeader}>
            <Text style={kycStyles.title}>Liveness Check</Text>
            <Text style={kycStyles.description}>
              Position your face in the oval to start verification.
            </Text>
          </View>

          <View style={kycStyles.cameraContainer}>
            <View style={kycStyles.cameraPlaceholder}>
              <View style={kycStyles.ovalMask}>
                {data.selfie ? (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={64}
                    color={COLORS.success}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="account"
                    size={64}
                    color={COLORS.textTertiary}
                  />
                )}
              </View>
            </View>
            {data.selfie && (
              <View style={kycStyles.feedbackBadge}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={COLORS.success}
                />
                <Text style={kycStyles.feedbackText}>Face Captured</Text>
              </View>
            )}
          </View>

          <View style={kycStyles.footer}>
            <TouchableOpacity
              style={kycStyles.primaryButton}
              onPress={data.selfie ? handleContinue : handleCaptureSelfie}
              activeOpacity={0.8}
            >
              <Text style={kycStyles.primaryButtonText}>
                {data.selfie ? 'Continue' : 'Start Check'}
              </Text>
            </TouchableOpacity>
            <View style={kycStyles.securityNote}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={14}
                color={COLORS.textSecondary}
              />
              <Text style={kycStyles.securityNoteText}>
                Your photo is securely encrypted
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KYCSelfieScreen;

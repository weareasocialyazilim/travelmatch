// KYC Document Capture Screen - Upload/capture document images
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { GUIDELINES } from './constants';
import { KYCHeader } from './KYCHeader';
import { KYCProgressBar } from './KYCProgressBar';
import { kycStyles } from './styles';
import type { VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';

type RouteParams = {
  KYCDocumentCapture: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCSelfie: { data: VerificationData };
}>;

const KYCDocumentCaptureScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCDocumentCapture'>>();
  const { data: initialData } = route.params;

  const [data, setData] = useState<VerificationData>(initialData);

  const handleCapture = useCallback((side: 'front' | 'back') => {
    // In a real app, this would open the camera
    // For now, simulate capturing
    Alert.alert('Capture Document', `Capturing ${side} of document...`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Simulate Capture',
        onPress: () => {
          setData((prev) => ({
            ...prev,
            [side === 'front' ? 'documentFront' : 'documentBack']: 'captured',
          }));
        },
      },
    ]);
  }, []);

  const handleContinue = () => {
    navigation.navigate('KYCSelfie', { data });
  };

  const isPassport = data.documentType === 'passport';
  const canContinue = data.documentFront && (isPassport || data.documentBack);

  return (
    <SafeAreaView style={kycStyles.container}>
      <View style={kycStyles.content}>
        <KYCHeader title="Document Upload" />
        <KYCProgressBar currentStep="upload" />

        <ScrollView
          style={kycStyles.scrollView}
          contentContainerStyle={kycStyles.scrollContent}
        >
          <Text style={kycStyles.title}>Capture Your Document</Text>
          <Text style={kycStyles.description}>
            Take clear photos of your document. Make sure all text is readable.
          </Text>

          {/* Guidelines */}
          <View style={kycStyles.guidelinesList}>
            {GUIDELINES.map((guideline) => (
              <View key={guideline.id} style={kycStyles.guidelineItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.success}
                />
                <Text style={kycStyles.guidelineText}>{guideline.text}</Text>
              </View>
            ))}
          </View>

          {/* Upload Section */}
          <View style={kycStyles.uploadSection}>
            <Text style={kycStyles.uploadLabel}>Front of Document</Text>
            <TouchableOpacity
              style={[
                kycStyles.uploadCard,
                data.documentFront && kycStyles.uploadCardDone,
              ]}
              onPress={() => handleCapture('front')}
              activeOpacity={0.7}
            >
              {data.documentFront ? (
                <View style={kycStyles.uploadedContent}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={32}
                    color={COLORS.success}
                  />
                  <Text style={kycStyles.uploadedText}>Document captured</Text>
                </View>
              ) : (
                <View style={kycStyles.uploadPlaceholder}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={32}
                    color={COLORS.textSecondary}
                  />
                  <Text style={kycStyles.uploadPlaceholderText}>
                    Tap to capture
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {!isPassport && (
              <>
                <Text style={kycStyles.uploadLabel}>Back of Document</Text>
                <TouchableOpacity
                  style={[
                    kycStyles.uploadCard,
                    data.documentBack && kycStyles.uploadCardDone,
                  ]}
                  onPress={() => handleCapture('back')}
                  activeOpacity={0.7}
                >
                  {data.documentBack ? (
                    <View style={kycStyles.uploadedContent}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={32}
                        color={COLORS.success}
                      />
                      <Text style={kycStyles.uploadedText}>
                        Document captured
                      </Text>
                    </View>
                  ) : (
                    <View style={kycStyles.uploadPlaceholder}>
                      <MaterialCommunityIcons
                        name="camera"
                        size={32}
                        color={COLORS.textSecondary}
                      />
                      <Text style={kycStyles.uploadPlaceholderText}>
                        Tap to capture
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>

        <View style={kycStyles.footer}>
          <TouchableOpacity
            style={[
              kycStyles.primaryButton,
              !canContinue && kycStyles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.8}
          >
            <Text style={kycStyles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KYCDocumentCaptureScreen;

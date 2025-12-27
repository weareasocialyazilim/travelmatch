// KYC Review Screen - Final review before submission
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { DOCUMENT_OPTIONS } from './constants';
import { KYCHeader } from './KYCHeader';
import { KYCProgressBar } from './KYCProgressBar';
import { kycStyles } from './styles';
import type { VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';

type RouteParams = {
  KYCReview: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCPending: undefined;
  KYCDocumentType: { data: VerificationData };
  KYCDocumentCapture: { data: VerificationData };
  KYCSelfie: { data: VerificationData };
}>;

const KYCReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCReview'>>();
  const { data } = route.params;
  const { showToast } = useToast();

  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!confirmed) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigation.navigate('KYCPending');
    } catch {
      showToast('Failed to submit verification. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [confirmed, navigation]);

  const handleEditPersonal = () => {
    navigation.navigate('KYCDocumentType', { data });
  };

  const handleEditDocument = () => {
    navigation.navigate('KYCDocumentCapture', { data });
  };

  const handleEditSelfie = () => {
    navigation.navigate('KYCSelfie', { data });
  };

  const documentLabel =
    DOCUMENT_OPTIONS.find((d) => d.id === data.documentType)?.label ||
    'Unknown';

  return (
    <SafeAreaView style={kycStyles.container}>
      <View style={kycStyles.content}>
        <KYCHeader title="Review" />
        <KYCProgressBar currentStep="review" />

        <Text style={kycStyles.reviewDescription}>
          Please double-check your details before submitting.
        </Text>

        <ScrollView
          style={kycStyles.scrollView}
          contentContainerStyle={kycStyles.scrollContent}
        >
          {/* Personal Details */}
          <View style={kycStyles.reviewSection}>
            <Text style={kycStyles.sectionTitle}>Personal Details</Text>
            <View style={kycStyles.reviewCard}>
              <View style={kycStyles.reviewCardContent}>
                <View style={kycStyles.reviewIcon}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={COLORS.text}
                  />
                </View>
                <View style={kycStyles.reviewInfo}>
                  <Text style={kycStyles.reviewLabel}>Full Name</Text>
                  <Text style={kycStyles.reviewValue}>{data.fullName}</Text>
                  <Text style={kycStyles.reviewLabel}>
                    DOB: {data.dateOfBirth}
                  </Text>
                  <Text style={kycStyles.reviewLabel}>
                    Country: {data.country}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditPersonal}>
                <Text style={kycStyles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Document */}
          <View style={kycStyles.reviewSection}>
            <Text style={kycStyles.sectionTitle}>Identity Document</Text>
            <View style={kycStyles.reviewCard}>
              <View style={kycStyles.reviewCardContent}>
                <View style={kycStyles.docThumbnail} />
                <View style={kycStyles.reviewInfo}>
                  <Text style={kycStyles.reviewLabel}>Document Type</Text>
                  <Text style={kycStyles.reviewValue}>{documentLabel}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditDocument}>
                <Text style={kycStyles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Selfie */}
          <View style={kycStyles.reviewSection}>
            <Text style={kycStyles.sectionTitle}>Selfie Verification</Text>
            <View style={kycStyles.reviewCard}>
              <View style={kycStyles.reviewCardContent}>
                <View style={kycStyles.selfieThumbnail}>
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </View>
                <View style={kycStyles.reviewInfo}>
                  <Text style={kycStyles.reviewLabel}>Your Selfie</Text>
                  <Text style={kycStyles.reviewValue}>
                    Ready for verification
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditSelfie}>
                <Text style={kycStyles.editButton}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={kycStyles.footer}>
          <TouchableOpacity
            style={kycStyles.checkboxRow}
            onPress={() => setConfirmed((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View
              style={[
                kycStyles.checkbox,
                confirmed && kycStyles.checkboxChecked,
              ]}
            >
              {confirmed && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={COLORS.white}
                />
              )}
            </View>
            <Text style={kycStyles.checkboxLabel}>
              I confirm that all information is accurate and complete.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              kycStyles.primaryButton,
              (!confirmed || loading) && kycStyles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!confirmed || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={kycStyles.primaryButtonText}>
                Submit for Verification
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KYCReviewScreen;

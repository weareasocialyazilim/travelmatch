// KYC Document Type Selection Screen
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { DOCUMENT_OPTIONS } from './constants';
import { KYCHeader } from './KYCHeader';
import { KYCProgressBar } from './KYCProgressBar';
import { kycStyles } from './styles';
import type { DocumentType, VerificationData } from './types';
import type { StackNavigationProp } from '@react-navigation/stack';

type RouteParams = {
  KYCDocumentType: { data: VerificationData };
};

type NavigationProp = StackNavigationProp<{
  KYCDocumentCapture: { data: VerificationData };
}>;

const KYCDocumentTypeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'KYCDocumentType'>>();
  const { data } = route.params;

  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    data.documentType,
  );

  const handleContinue = () => {
    if (!selectedType) return;

    navigation.navigate('KYCDocumentCapture', {
      data: {
        ...data,
        documentType: selectedType,
      },
    });
  };

  return (
    <SafeAreaView style={kycStyles.container}>
      <View style={kycStyles.content}>
        <KYCHeader title="Document Type" />
        <KYCProgressBar currentStep="document" />

        <ScrollView
          style={kycStyles.scrollView}
          contentContainerStyle={kycStyles.scrollContent}
        >
          <Text style={kycStyles.title}>Select Document Type</Text>
          <Text style={kycStyles.description}>
            Choose the type of government-issued ID you&apos;d like to use for
            verification.
          </Text>

          <View style={kycStyles.optionsList}>
            {DOCUMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  kycStyles.optionCard,
                  selectedType === option.id && kycStyles.optionCardSelected,
                ]}
                onPress={() => setSelectedType(option.id)}
                activeOpacity={0.7}
              >
                <View style={kycStyles.optionIcon}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={24}
                    color={
                      selectedType === option.id
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    kycStyles.optionLabel,
                    selectedType === option.id && kycStyles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedType === option.id && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={kycStyles.footer}>
          <TouchableOpacity
            style={[
              kycStyles.primaryButton,
              !selectedType && kycStyles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedType}
            activeOpacity={0.8}
          >
            <Text style={kycStyles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KYCDocumentTypeScreen;

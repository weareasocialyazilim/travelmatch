// KYC Pending Screen - Verification submitted, waiting for review
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { NEXT_STEPS } from './constants';
import { kycStyles } from './styles';

const KYCPendingScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleDone = () => {
    // Navigate back to profile or home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Discover' }],
      }),
    );
  };

  return (
    <SafeAreaView style={kycStyles.container}>
      <View style={kycStyles.content}>
        <View style={kycStyles.pendingContent}>
          <View style={kycStyles.pendingHeader}>
            <View style={kycStyles.pendingIcon}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={48}
                color={COLORS.primary}
              />
            </View>
            <Text style={kycStyles.title}>Verification in Progress</Text>
            <Text style={kycStyles.description}>
              Thanks for submitting your documents. We&apos;re now reviewing
              them to ensure everything is in order.
            </Text>
          </View>

          <View style={kycStyles.pendingCard}>
            <Text style={kycStyles.pendingCardTitle}>
              Estimated review time
            </Text>
            <View style={kycStyles.progressBarTrack}>
              {/* eslint-disable-next-line react-native/no-inline-styles */}
              <View style={[kycStyles.progressBarFill, { width: '15%' }]} />
            </View>
            <Text style={kycStyles.pendingCardSubtitle}>
              Usually takes less than 24 hours
            </Text>
          </View>

          <View style={kycStyles.nextStepsSection}>
            <Text style={kycStyles.sectionTitle}>What&apos;s Next?</Text>
            {NEXT_STEPS.map((step) => (
              <View key={step.id} style={kycStyles.nextStepItem}>
                <MaterialCommunityIcons
                  name={step.icon}
                  size={20}
                  color={COLORS.primary}
                />
                <View style={kycStyles.nextStepContent}>
                  <Text style={kycStyles.nextStepTitle}>{step.title}</Text>
                  <Text style={kycStyles.nextStepDescription}>
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={kycStyles.footer}>
          <TouchableOpacity
            style={kycStyles.primaryButton}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={kycStyles.primaryButtonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default KYCPendingScreen;

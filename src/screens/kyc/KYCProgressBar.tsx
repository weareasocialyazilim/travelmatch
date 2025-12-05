// Shared KYC Progress Bar Component
import React from 'react';
import { View, Text } from 'react-native';
import { kycStyles } from './styles';
import { getStepProgress } from './constants';

interface KYCProgressBarProps {
  currentStep: string;
}

export const KYCProgressBar: React.FC<KYCProgressBarProps> = ({
  currentStep,
}) => {
  const { current, total, percentage } = getStepProgress(currentStep);

  return (
    <View style={kycStyles.progressContainer}>
      <Text style={kycStyles.progressText}>
        Step {current} of {total}
      </Text>
      <View style={kycStyles.progressBarTrack}>
        <View
          style={[kycStyles.progressBarFill, { width: `${percentage}%` }]}
        />
      </View>
    </View>
  );
};

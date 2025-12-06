// Shared KYC Progress Bar Component
import React from 'react';
import { View, Text } from 'react-native';
import { getStepProgress } from './constants';
import { kycStyles } from './styles';

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

// Shared KYC Header Component
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import { kycStyles } from './styles';

interface KYCHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const KYCHeader: React.FC<KYCHeaderProps> = ({
  title,
  showBack = true,
  onBack,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={kycStyles.header}>
      {showBack ? (
        <TouchableOpacity
          style={kycStyles.headerButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
      ) : (
        <View style={kycStyles.headerButton} />
      )}
      <Text style={kycStyles.headerTitle}>{title}</Text>
      <View style={kycStyles.headerButton} />
    </View>
  );
};

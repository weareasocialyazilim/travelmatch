import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, variant === 'secondary' && styles.secondaryButton]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text
        style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryButtonText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.transparent,
    borderColor: COLORS.buttonPrimary,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: COLORS.buttonPrimary,
  },
});

export default Button;

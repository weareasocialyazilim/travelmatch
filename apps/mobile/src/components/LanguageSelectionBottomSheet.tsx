import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { GenericBottomSheet } from './ui/GenericBottomSheet';

interface LanguageSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelectionBottomSheet: React.FC<
  LanguageSelectionBottomSheetProps
> = ({ visible, onClose, onLanguageChange }) => {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'tr', name: 'Türkçe' },
  ];

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      title="Select Language"
      height={300}
    >
      <View style={styles.container}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={styles.option}
            onPress={() => onLanguageChange(lang.code)}
          >
            <Text style={styles.optionText}>{lang.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
});

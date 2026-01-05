import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { GenericBottomSheet } from './ui/GenericBottomSheet';

interface LanguageSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLanguageChange: (language: string) => void;
  currentLanguage?: string;
}

export const LanguageSelectionBottomSheet: React.FC<
  LanguageSelectionBottomSheetProps
> = ({ visible, onClose, onLanguageChange, currentLanguage = 'en' }) => {
  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  ];

  const title = currentLanguage === 'tr' ? 'Dil Seçin' : 'Select Language';

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      height={300}
    >
      <View style={styles.container}>
        {languages.map((lang) => {
          const isSelected = lang.code === currentLanguage;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onLanguageChange(lang.code)}
            >
              <Text style={styles.flagText}>{lang.flag}</Text>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {lang.name}
              </Text>
              {isSelected && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color={COLORS.mint}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.bg.primary,
  },
  optionSelected: {
    backgroundColor: COLORS.mintTransparent,
    borderWidth: 1,
    borderColor: COLORS.mint,
  },
  flagText: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  optionTextSelected: {
    fontWeight: '600',
    color: COLORS.mint,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { GenericBottomSheet } from './ui/GenericBottomSheet';

type Language = 'English' | 'Turkish' | 'Spanish' | 'French';

interface LanguageSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedLanguage?: Language;
  onLanguageChange: (language: Language) => void;
}

export const LanguageSelectionBottomSheet: React.FC<
  LanguageSelectionBottomSheetProps
> = ({ visible, onClose, selectedLanguage = 'English', onLanguageChange }) => {
  const [tempSelection, setTempSelection] =
    useState<Language>(selectedLanguage);

  const languages: Language[] = ['English', 'Turkish', 'Spanish', 'French'];

  const handleSave = () => {
    onLanguageChange(tempSelection);
    onClose();
  };

  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      title="Language"
      height="auto"
      showHandle
      testID="language-selection-sheet"
      accessibilityLabel="Select language"
      renderFooter={() => (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      )}
    >
      <ScrollView style={styles.languageList}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language}
            style={[
              styles.languageItem,
              tempSelection === language && styles.languageItemSelected,
            ]}
            onPress={() => setTempSelection(language)}
            accessibilityRole="radio"
            accessibilityState={{ checked: tempSelection === language }}
            accessibilityLabel={language}
          >
            <Text style={styles.languageLabel}>{language}</Text>
            <View
              style={[
                styles.radio,
                tempSelection === language && styles.radioSelected,
              ]}
            >
              {tempSelection === language && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </GenericBottomSheet>
  );
};

const styles = StyleSheet.create({
  languageList: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  languageItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}1A`, // 10% opacity
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.24,
  },
});

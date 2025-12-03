import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/colors';

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
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.sheetContainer}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <Text style={styles.header}>Language</Text>

          {/* Language List */}
          <ScrollView style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageItem,
                  tempSelection === language && styles.languageItemSelected,
                ]}
                onPress={() => setTempSelection(language)}
              >
                <Text style={styles.languageLabel}>{language}</Text>
                <View
                  style={[
                    styles.radio,
                    tempSelection === language && styles.radioSelected,
                  ]}
                >
                  {tempSelection === language && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handleContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
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

/**
 * Language Settings Screen
 * Allows users to change app language
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { RADII } from '../constants/radii';
import { useI18n, type SupportedLanguage } from '../context/I18nContext';
import { useHaptics } from '../hooks/useHaptics';

const LanguageSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { language, setLanguage, supportedLanguages, t } = useI18n();
  const { impact } = useHaptics();

  const handleLanguageSelect = useCallback(
    async (lang: SupportedLanguage) => {
      if (lang !== language) {
        impact('light');
        await setLanguage(lang);
      }
    },
    [language, setLanguage, impact],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.language')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>{t('settings.selectLanguage')}</Text>

        <View style={styles.languageList}>
          {supportedLanguages.map((lang) => {
            const isSelected = language === lang.code;

            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageItem,
                  isSelected && styles.languageItemSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageInfo}>
                  <Text
                    style={[
                      styles.languageName,
                      isSelected && styles.languageNameSelected,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                  <Text style={styles.languageSubtitle}>{lang.name}</Text>
                </View>

                {isSelected && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.note}>{t('settings.languageNote')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  languageList: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    overflow: 'hidden',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  languageItemSelected: {
    backgroundColor: COLORS.primaryMuted,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  languageNameSelected: {
    color: COLORS.primary,
  },
  languageSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  note: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: SPACING.md,
    lineHeight: 18,
    textAlign: 'center',
  },
});

export default LanguageSettingsScreen;

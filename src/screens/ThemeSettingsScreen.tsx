/**
 * Theme Settings Screen
 * Allows users to switch between light, dark, and system themes
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, type ThemeMode } from '../context/ThemeContext';
import { COLORS } from '../constants/colors';

interface ThemeOptionProps {
  mode: ThemeMode;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onSelect: (mode: ThemeMode) => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  mode,
  title,
  description,
  icon,
  isSelected,
  onSelect,
}) => {
  const handlePress = useCallback(() => {
    onSelect(mode);
  }, [mode, onSelect]);

  return (
    <TouchableOpacity
      style={[styles.option, isSelected && styles.optionSelected]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={`${title} theme`}
      accessibilityHint={description}
    >
      <View
        style={[
          styles.iconContainer,
          isSelected && styles.iconContainerSelected,
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isSelected ? COLORS.white : COLORS.textSecondary}
        />
      </View>
      <View style={styles.optionContent}>
        <Text
          style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}
        >
          {title}
        </Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
      )}
    </TouchableOpacity>
  );
};

const ThemeSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { mode, setThemeMode, isDark } = useTheme();

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const themeOptions: Array<{
    mode: ThemeMode;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    {
      mode: 'light',
      title: 'Light',
      description: 'Always use light theme',
      icon: 'sunny',
    },
    {
      mode: 'dark',
      title: 'Dark',
      description: 'Always use dark theme',
      icon: 'moon',
    },
    {
      mode: 'system',
      title: 'System',
      description: 'Follow system preference',
      icon: 'phone-portrait',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Theme Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <Text style={styles.sectionDescription}>
            Choose how TravelMatch looks to you. Select a single theme, or sync
            with your system settings.
          </Text>

          <View
            style={styles.optionsContainer}
            accessibilityRole="radiogroup"
            accessibilityLabel="Theme options"
          >
            {themeOptions.map((option) => (
              <ThemeOption
                key={option.mode}
                mode={option.mode}
                title={option.title}
                description={option.description}
                icon={option.icon}
                isSelected={mode === option.mode}
                onSelect={setThemeMode}
              />
            ))}
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.preview}>
            <View
              style={[
                styles.previewCard,
                isDark ? styles.previewCardDark : styles.previewCardLight,
              ]}
            >
              <View style={styles.previewHeader}>
                <View
                  style={[
                    styles.previewAvatar,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
                <View style={styles.previewHeaderText}>
                  <View
                    style={[
                      styles.previewLine,
                      styles.previewLineWidth100,
                      isDark && styles.previewLineDark,
                    ]}
                  />
                  <View
                    style={[
                      styles.previewLineSmall,
                      styles.previewLineWidth60,
                      isDark && styles.previewLineSmallDark,
                    ]}
                  />
                </View>
              </View>
              <View
                style={[
                  styles.previewLine,
                  styles.previewLineWidthFull,
                  isDark && styles.previewLineDark,
                ]}
              />
              <View
                style={[
                  styles.previewLine,
                  styles.previewLineWidth80,
                  isDark && styles.previewLineDark,
                ]}
              />
            </View>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.statusContainer}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.statusText}>
            Currently using {isDark ? 'dark' : 'light'} theme
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: COLORS.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionTitleSelected: {
    color: COLORS.text,
  },
  optionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  preview: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  previewCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  previewCardLight: {
    backgroundColor: COLORS.white,
  },
  previewCardDark: {
    backgroundColor: COLORS.surfaceDark,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewHeaderText: {
    gap: 6,
  },
  previewLine: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
  },
  previewLineWidth100: {
    width: 100,
  },
  previewLineWidth60: {
    width: 60,
  },
  previewLineWidth80: {
    width: '80%',
  },
  previewLineWidthFull: {
    width: '100%',
  },
  previewLineDark: {
    backgroundColor: COLORS.borderDark,
  },
  previewLineSmall: {
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 4,
  },
  previewLineSmallDark: {
    backgroundColor: COLORS.cardDark,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  statusText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

export default ThemeSettingsScreen;

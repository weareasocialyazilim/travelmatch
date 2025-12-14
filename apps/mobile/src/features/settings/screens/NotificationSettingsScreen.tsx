import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type NotificationSettingsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NotificationSettings'
>;

interface NotificationSettingsScreenProps {
  navigation: NotificationSettingsScreenNavigationProp;
}

interface NotificationSetting {
  id: string;
  icon: IconName;
  label: string;
  value: boolean;
}

interface NotificationSection {
  title: string;
  settings: NotificationSetting[];
}

export const NotificationSettingsScreen: React.FC<
  NotificationSettingsScreenProps
> = ({ navigation }) => {
  const [sections, setSections] = useState<NotificationSection[]>([
    {
      title: 'GIFTS & PROOFS',
      settings: [
        {
          id: 'gift_received',
          icon: 'gift',
          label: 'When someone gifts my moment',
          value: true,
        },
        {
          id: 'proof_status',
          icon: 'check-decagram',
          label: 'When a proof is approved or rejected',
          value: true,
        },
      ],
    },
    {
      title: 'MESSAGES',
      settings: [
        {
          id: 'new_messages',
          icon: 'message-text',
          label: 'New chat messages',
          value: false,
        },
        {
          id: 'message_requests',
          icon: 'email',
          label: 'Message requests',
          value: true,
        },
      ],
    },
    {
      title: 'DISCOVERY',
      settings: [
        {
          id: 'nearby_moments',
          icon: 'map-marker',
          label: 'Moments near me',
          value: false,
        },
        {
          id: 'trip_reminders',
          icon: 'airplane-takeoff',
          label: 'Trip reminders & travel tips',
          value: true,
        },
      ],
    },
    {
      title: 'APP UPDATES',
      settings: [
        {
          id: 'announcements',
          icon: 'bullhorn',
          label: 'New features & announcements',
          value: true,
        },
      ],
    },
  ]);

  const STORAGE_KEY = '@notification_settings';

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const savedValues = JSON.parse(saved) as Record<string, boolean>;
          setSections((prev) =>
            prev.map((section) => ({
              ...section,
              settings: section.settings.map((setting) => ({
                ...setting,
                value: savedValues[setting.id] ?? setting.value,
              })),
            })),
          );
        }
      } catch (error) {
        logger.debug('Failed to load notification settings');
      }
    };
    void loadSettings();
  }, []);

  const toggleSetting = async (sectionIndex: number, settingId: string) => {
    const newSections = [...sections];
    const setting = newSections[sectionIndex].settings.find(
      (s) => s.id === settingId,
    );
    if (setting) {
      setting.value = !setting.value;
      setSections(newSections);

      // Save to AsyncStorage
      const allSettings: Record<string, boolean> = {};
      newSections.forEach((section) => {
        section.settings.forEach((s) => {
          allSettings[s.id] = s.value;
        });
      });
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allSettings));
      } catch (error) {
        logger.debug('Failed to save notification settings');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsContainer}>
              {section.settings.map((setting, settingIndex) => (
                <View
                  key={setting.id}
                  style={[
                    styles.settingRow,
                    settingIndex < section.settings.length - 1 &&
                      styles.settingRowBorder,
                  ]}
                >
                  <View style={styles.settingContent}>
                    <View style={styles.settingIconContainer}>
                      <MaterialCommunityIcons
                        name={setting.icon}
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text style={styles.settingLabel}>{setting.label}</Text>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={() =>
                      toggleSetting(sectionIndex, setting.id)
                    }
                    trackColor={{
                      false: COLORS.border,
                      true: COLORS.primary,
                    }}
                    thumbColor={COLORS.white}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textSecondary,
    paddingHorizontal: 16,
    paddingBottom: 8,
    letterSpacing: 0.5,
  },
  settingsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    gap: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.border}40`,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
    lineHeight: 20,
  },
});

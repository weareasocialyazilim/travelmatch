import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';
import { LanguageSelectionBottomSheet } from '../components/LanguageSelectionBottomSheet';

const AppSettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  // Notification settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [requestNotifications, setRequestNotifications] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  
  // Privacy settings
  const [profileVisible, setProfileVisible] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(false);
  
  // Language
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLanguageSheetVisible, setIsLanguageSheetVisible] = useState(false);

  const handleClearCache = () => {
    console.log('Clear cache');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.coralTransparent }]}>
                <MaterialCommunityIcons name="bell" size={20} color={COLORS.coral} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Enable all notifications</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconPlaceholder} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Chat Messages</Text>
                <Text style={styles.settingDesc}>New message notifications</Text>
              </View>
              <Switch
                value={chatNotifications}
                onValueChange={setChatNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconPlaceholder} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Request Updates</Text>
                <Text style={styles.settingDesc}>Gift requests and proofs</Text>
              </View>
              <Switch
                value={requestNotifications}
                onValueChange={setRequestNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
                disabled={!pushEnabled}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconPlaceholder} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Marketing</Text>
                <Text style={styles.settingDesc}>Tips, offers, and news</Text>
              </View>
              <Switch
                value={marketingNotifications}
                onValueChange={setMarketingNotifications}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
                disabled={!pushEnabled}
              />
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRIVACY</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.mintTransparent }]}>
                <MaterialCommunityIcons name="eye" size={20} color={COLORS.mint} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Profile Visibility</Text>
                <Text style={styles.settingDesc}>Allow others to find you</Text>
              </View>
              <Switch
                value={profileVisible}
                onValueChange={setProfileVisible}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconPlaceholder} />
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Online Status</Text>
                <Text style={styles.settingDesc}>Show when you are online</Text>
              </View>
              <Switch
                value={showOnlineStatus}
                onValueChange={setShowOnlineStatus}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingIconPlaceholder} />
              <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, !showOnlineStatus && styles.settingLabelDisabled]}>Last Seen</Text>
                <Text style={styles.settingDesc}>
                  {showOnlineStatus ? 'Show your last active time' : 'Enable Online Status first'}
                </Text>
              </View>
              <Switch
                value={showLastSeen}
                onValueChange={setShowLastSeen}
                trackColor={{ false: COLORS.border, true: COLORS.mint }}
                thumbColor={COLORS.white}
                disabled={!showOnlineStatus}
              />
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LANGUAGE</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setIsLanguageSheetVisible(true)}
            >
              <View style={[styles.settingIcon, { backgroundColor: COLORS.softOrangeTransparent }]}>
                <MaterialCommunityIcons name="translate" size={20} color={COLORS.softOrange} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>App Language</Text>
                <Text style={styles.settingDesc}>{selectedLanguage}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SHARE</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => navigation.navigate('InviteFriends')}
            >
              <View style={[styles.settingIcon, { backgroundColor: COLORS.mintTransparent }]}>
                <MaterialCommunityIcons name="account-plus" size={20} color={COLORS.mint} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Invite Friends</Text>
                <Text style={styles.settingDesc}>Share TravelMatch with friends</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STORAGE</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.background }]}>
                <MaterialCommunityIcons name="broom" size={20} color={COLORS.text} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Clear Cache</Text>
                <Text style={styles.settingDesc}>Free up storage space</Text>
              </View>
              <Text style={styles.cacheSize}>24.5 MB</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Version</Text>
              </View>
              <Text style={styles.versionText}>1.0.0 (Build 100)</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Member Since</Text>
              </View>
              <Text style={styles.memberSinceText}>March 2024</Text>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Open Source Licenses</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <LanguageSelectionBottomSheet
        visible={isLanguageSheetVisible}
        onClose={() => setIsLanguageSheetVisible(false)}
        onLanguageChange={(lang: string) => {
          setSelectedLanguage(lang === 'en' ? 'English' : lang === 'tr' ? 'Türkçe' : lang);
          setIsLanguageSheetVisible(false);
        }}
      />
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Settings Card
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconPlaceholder: {
    width: 36,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 62,
  },
  cacheSize: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  memberSinceText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  settingLabelDisabled: {
    color: COLORS.textSecondary,
    opacity: 0.5,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default AppSettingsScreen;

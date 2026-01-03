/**
 * SettingsScreen - Control Center
 *
 * Awwwards-standard settings and security center.
 * Features categorized controls, silky transitions, and profile summary.
 *
 * "Kontrol Merkezi" - Command your TravelMatch experience
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { logger } from '@/utils/logger';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { TMAvatar } from '@/components/ui/TMAvatar';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Setting item component with glass effect
interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  isDestructive?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  value,
  onPress,
  color = COLORS.text.onDark,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  isDestructive = false,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (!isSwitch) {
      scale.value = withSpring(0.98, { damping: 15 });
    }
  }, [isSwitch, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15 });
  }, [scale]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = isDestructive ? COLORS.error : color;
  const bgColor = isDestructive
    ? 'rgba(239, 68, 68, 0.1)'
    : `${iconColor}15`;

  return (
    <AnimatedTouchable
      style={[styles.itemContainer, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isSwitch}
      activeOpacity={0.9}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrapper, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text
          style={[
            styles.itemLabel,
            { color: isDestructive ? COLORS.error : COLORS.text.onDark },
          ]}
        >
          {label}
        </Text>
      </View>
      <View style={styles.itemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {isSwitch ? (
          <Switch
            trackColor={{
              false: 'rgba(255, 255, 255, 0.1)',
              true: COLORS.primary,
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="rgba(255, 255, 255, 0.1)"
            onValueChange={(val) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSwitchChange?.(val);
            }}
            value={switchValue}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={COLORS.textOnDarkMuted}
          />
        )}
      </View>
    </AnimatedTouchable>
  );
};

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  // Preferences state
  const [preferences, setPreferences] = useState({
    notifications: true,
    biometric: true,
    visibility: false,
  });

  const togglePreference = useCallback((key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleSignOut = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Oturumu Kapat',
      'Çıkış yapmak istediğinden emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              logger.error('Sign out failed', error);
              showToast('Çıkış yapılamadı', 'error');
            }
          },
        },
      ],
    );
  }, [logout, showToast]);

  // User display info
  const displayName = user?.name || 'Gezgin';
  const trustScore = 94; // Mock trust score

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color={COLORS.text.onDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kontrol Merkezi</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Profile Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard
            intensity={25}
            tint="dark"
            padding={16}
            borderRadius={24}
            style={styles.profileCard}
          >
            <TMAvatar
              size="large"
              name={displayName}
              imageUrl={user?.photoUrl || user?.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayName}</Text>
              <View style={styles.trustBadge}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={COLORS.primary}
                />
                <Text style={styles.trustText}>Güven Skoru: {trustScore}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Account & Security */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.sectionTitle}>HESAP VE GÜVENLİK</Text>
          <GlassCard
            intensity={15}
            tint="dark"
            padding={0}
            borderRadius={24}
            style={styles.groupCard}
          >
            <SettingItem
              icon="person-outline"
              label="Kişisel Bilgiler"
              color={COLORS.primary}
              onPress={() => navigation.navigate('EditProfile')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label="Şifre ve Güvenlik"
              color={COLORS.trust.primary}
              onPress={() => navigation.navigate('Security')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="finger-print"
              label="FaceID / TouchID"
              color={COLORS.info}
              isSwitch
              switchValue={preferences.biometric}
              onSwitchChange={() => togglePreference('biometric')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="notifications-outline"
              label="Bildirim Tercihleri"
              color={COLORS.warning}
              onPress={() => navigation.navigate('NotificationSettings')}
            />
          </GlassCard>
        </Animated.View>

        {/* Privacy */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <Text style={styles.sectionTitle}>GİZLİLİK</Text>
          <GlassCard
            intensity={15}
            tint="dark"
            padding={0}
            borderRadius={24}
            style={styles.groupCard}
          >
            <SettingItem
              icon="eye-off-outline"
              label="Görünürlük Modu"
              color={COLORS.info}
              isSwitch
              switchValue={preferences.visibility}
              onSwitchChange={() => togglePreference('visibility')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-outline"
              label="Veri ve Gizlilik"
              color={COLORS.trust.primary}
              onPress={() => navigation.navigate('DataPrivacy')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="ban-outline"
              label="Engellenen Kullanıcılar"
              color={COLORS.textOnDarkSecondary}
              onPress={() => navigation.navigate('BlockedUsers')}
            />
          </GlassCard>
        </Animated.View>

        {/* Support */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text style={styles.sectionTitle}>DESTEK</Text>
          <GlassCard
            intensity={15}
            tint="dark"
            padding={0}
            borderRadius={24}
            style={styles.groupCard}
          >
            <SettingItem
              icon="help-circle-outline"
              label="Yardım Merkezi"
              color={COLORS.info}
              onPress={() => navigation.navigate('HelpCenter')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="chatbubble-ellipses-outline"
              label="Destek ile İletişim"
              color={COLORS.primary}
              onPress={() => navigation.navigate('ContactSupport')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              label="Kullanım Koşulları"
              color={COLORS.textOnDarkSecondary}
              onPress={() => navigation.navigate('TermsOfService')}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              label="Gizlilik Politikası"
              color={COLORS.textOnDarkSecondary}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
          </GlassCard>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Oturumu Kapat</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Version */}
        <Text style={styles.versionText}>
          TravelMatch v4.2.0 • Made with ❤️
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: FONT_SIZES_V2.bodyLarge,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
    color: COLORS.text.onDark,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: 'rgba(30, 30, 32, 0.6)',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: COLORS.text.onDark,
    fontSize: FONT_SIZES_V2.h4,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  trustText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  editButtonText: {
    color: COLORS.textOnDarkSecondary,
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  // Sections
  sectionTitle: {
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    color: COLORS.textOnDarkMuted,
    letterSpacing: 1.5,
    marginLeft: 4,
    marginBottom: 12,
  },
  groupCard: {
    marginBottom: 24,
    backgroundColor: 'rgba(30, 30, 32, 0.4)',
  },
  // Setting Item
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.regular,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    color: COLORS.textOnDarkMuted,
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.regular,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginLeft: 68,
  },
  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.semibold,
    fontWeight: '700',
  },
  // Version
  versionText: {
    textAlign: 'center',
    color: COLORS.textOnDarkMuted,
    fontSize: 10,
    fontFamily: FONTS.mono.regular,
    marginTop: 32,
  },
});

export default SettingsScreen;

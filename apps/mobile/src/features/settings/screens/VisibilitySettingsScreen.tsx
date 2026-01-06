/**
 * VisibilitySettingsScreen - Profil ve Hediye Görünürlük Ayarları
 *
 * MASTER Revizyonu: "Profile Visibility & Discoverability" için gelişmiş ayarlar.
 *
 * Özellikler:
 * - Hediye Görünürlüğü: "Herkes görebilir", "Sadece abonelerim", "Tamamen gizli"
 * - Profil Keşfedilebilirlik: "Yalnızca hediye gönderenler bulsun" vs "Herkese açık"
 * - Platinum Vitrin: Premium üyeler için özel showcase özelliği
 * - Subscription tier entegrasyonu
 *
 * @module screens/VisibilitySettingsScreen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { logger } from '@/utils/logger';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Visibility options enum
type GiftVisibility = 'public' | 'subscribers_only' | 'private';
type ProfileDiscoverability = 'everyone' | 'gift_senders_only' | 'hidden';

interface VisibilitySettings {
  giftVisibility: GiftVisibility;
  profileDiscoverability: ProfileDiscoverability;
  showTrustScore: boolean;
  showGiftHistory: boolean;
  platinumVitrin: boolean;
  showOnlineStatus: boolean;
  allowMessageRequests: boolean;
  showLocation: boolean;
}

interface OptionItem {
  value: string;
  label: string;
  description: string;
  icon: IconName;
  requiresSubscription?: 'gold' | 'platinum';
}

// Gift visibility options
const GIFT_VISIBILITY_OPTIONS: OptionItem[] = [
  {
    value: 'public',
    label: 'Herkes Görebilir',
    description: 'Tüm kullanıcılar hediye geçmişinizi görebilir',
    icon: 'eye',
  },
  {
    value: 'subscribers_only',
    label: 'Sadece Abonelerim',
    description: 'Yalnızca sizi takip eden Gold+ üyeler görebilir',
    icon: 'account-group',
    requiresSubscription: 'gold',
  },
  {
    value: 'private',
    label: 'Tamamen Gizli',
    description: 'Hediye geçmişiniz kimseye görünmez',
    icon: 'eye-off',
  },
];

// Profile discoverability options
const PROFILE_DISCOVERABILITY_OPTIONS: OptionItem[] = [
  {
    value: 'everyone',
    label: 'Herkese Açık',
    description: "Profiliniz arama ve keşfet'te görünür",
    icon: 'earth',
  },
  {
    value: 'gift_senders_only',
    label: 'Sadece Hediye Gönderenler',
    description: 'Size hediye gönderenler profilinizi bulabilir',
    icon: 'gift-outline',
  },
  {
    value: 'hidden',
    label: 'Gizli Profil',
    description: 'Profiliniz aramalardan gizlenir',
    icon: 'incognito',
    requiresSubscription: 'platinum',
  },
];

// Radio button option component
const RadioOption: React.FC<{
  option: OptionItem;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
}> = ({ option, isSelected, isLocked, onSelect }) => (
  <TouchableOpacity
    style={[
      styles.radioOption,
      isSelected && styles.radioOptionSelected,
      isLocked && styles.radioOptionLocked,
    ]}
    onPress={isLocked ? undefined : onSelect}
    activeOpacity={isLocked ? 1 : 0.7}
  >
    <View style={styles.radioLeft}>
      <View style={[styles.radioIcon, isSelected && styles.radioIconSelected]}>
        <MaterialCommunityIcons
          name={option.icon}
          size={20}
          color={isSelected ? '#0F0F23' : isLocked ? '#64748B' : '#FFFFFF'}
        />
      </View>
      <View style={styles.radioContent}>
        <View style={styles.radioLabelRow}>
          <Text
            style={[
              styles.radioLabel,
              isSelected && styles.radioLabelSelected,
              isLocked && styles.radioLabelLocked,
            ]}
          >
            {option.label}
          </Text>
          {option.requiresSubscription && (
            <View
              style={
                option.requiresSubscription === 'platinum'
                  ? styles.subscriptionBadgePlatinum
                  : styles.subscriptionBadgeGold
              }
            >
              <Text style={styles.subscriptionBadgeText}>
                {option.requiresSubscription === 'platinum' ? '💎' : '⭐'}
              </Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.radioDescription,
            isLocked && styles.radioDescriptionLocked,
          ]}
        >
          {option.description}
        </Text>
      </View>
    </View>
    <View
      style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}
    >
      {isSelected && <View style={styles.radioCircleInner} />}
    </View>
  </TouchableOpacity>
);

// Toggle setting row component
const ToggleRow: React.FC<{
  icon: IconName;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  requiresSubscription?: 'gold' | 'platinum';
  isLocked?: boolean;
}> = ({
  icon,
  label,
  description,
  value,
  onChange,
  requiresSubscription,
  isLocked,
}) => (
  <View style={[styles.toggleRow, isLocked && styles.toggleRowLocked]}>
    <View style={styles.toggleLeft}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={isLocked ? '#64748B' : '#DFFF00'}
      />
      <View style={styles.toggleContent}>
        <View style={styles.toggleLabelRow}>
          <Text
            style={[styles.toggleLabel, isLocked && styles.toggleLabelLocked]}
          >
            {label}
          </Text>
          {requiresSubscription && (
            <View
              style={
                requiresSubscription === 'platinum'
                  ? styles.subscriptionBadgePlatinum
                  : styles.subscriptionBadgeGold
              }
            >
              <Text style={styles.subscriptionBadgeText}>
                {requiresSubscription === 'platinum' ? '💎' : '⭐'}
              </Text>
            </View>
          )}
        </View>
        {description && (
          <Text
            style={[
              styles.toggleDescription,
              isLocked && styles.toggleDescriptionLocked,
            ]}
          >
            {description}
          </Text>
        )}
      </View>
    </View>
    <Switch
      value={value}
      onValueChange={isLocked ? undefined : onChange}
      disabled={isLocked}
      trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#DFFF00' }}
      thumbColor={value ? '#0F0F23' : '#64748B'}
    />
  </View>
);

// Platinum Vitrin promo card
const PlatinumVitrinCard: React.FC<{
  isEnabled: boolean;
  isPlatinum: boolean;
  onToggle: (value: boolean) => void;
  onUpgrade: () => void;
}> = ({ isEnabled, isPlatinum, onToggle, onUpgrade }) => (
  <Animated.View entering={FadeInDown.delay(200).springify()}>
    <LinearGradient
      colors={['rgba(168, 85, 247, 0.2)', 'rgba(236, 72, 153, 0.2)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.vitrinCard}
    >
      <View style={styles.vitrinHeader}>
        <View style={styles.vitrinIconContainer}>
          <MaterialCommunityIcons
            name="diamond-stone"
            size={28}
            color="#A855F7"
          />
        </View>
        <View style={styles.vitrinInfo}>
          <Text style={styles.vitrinTitle}>💎 Platinum Vitrin</Text>
          <Text style={styles.vitrinDescription}>
            Profilinizi öne çıkarın, keşfet akışında vurgulanın
          </Text>
        </View>
      </View>

      {isPlatinum ? (
        <View style={styles.vitrinToggle}>
          <Text style={styles.vitrinToggleLabel}>
            {isEnabled ? 'Vitrin Aktif' : 'Vitrini Aç'}
          </Text>
          <Switch
            value={isEnabled}
            onValueChange={onToggle}
            trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#A855F7' }}
            thumbColor={isEnabled ? '#FFFFFF' : '#64748B'}
          />
        </View>
      ) : (
        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <LinearGradient
            colors={['#A855F7', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeGradient}
          >
            <Text style={styles.upgradeButtonText}>Platinum'a Yükselt</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Benefits list */}
      <View style={styles.vitrinBenefits}>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons
            name="check-circle"
            size={14}
            color="#A855F7"
          />
          <Text style={styles.benefitText}>Keşfet'te üst sıralarda</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons
            name="check-circle"
            size={14}
            color="#A855F7"
          />
          <Text style={styles.benefitText}>Özel profil çerçevesi</Text>
        </View>
        <View style={styles.benefitItem}>
          <MaterialCommunityIcons
            name="check-circle"
            size={14}
            color="#A855F7"
          />
          <Text style={styles.benefitText}>Haftalık 3 hediye önerisi</Text>
        </View>
      </View>
    </LinearGradient>
  </Animated.View>
);

export const VisibilitySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<
    'free' | 'gold' | 'platinum'
  >('free');
  const [settings, setSettings] = useState<VisibilitySettings>({
    giftVisibility: 'public',
    profileDiscoverability: 'everyone',
    showTrustScore: true,
    showGiftHistory: true,
    platinumVitrin: false,
    showOnlineStatus: true,
    allowMessageRequests: true,
    showLocation: true,
  });

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(
            `
            gift_visibility,
            profile_discoverability,
            show_trust_score,
            show_gift_history,
            platinum_vitrin,
            show_online_status,
            allow_message_requests,
            show_location,
            subscription_tier
          `,
          )
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && typeof data === 'object' && !('error' in data)) {
          const profileData = data as Record<string, unknown>;
          setSettings({
            giftVisibility:
              (profileData.gift_visibility as GiftVisibility) || 'public',
            profileDiscoverability:
              (profileData.profile_discoverability as ProfileDiscoverability) ||
              'everyone',
            showTrustScore: (profileData.show_trust_score as boolean) ?? true,
            showGiftHistory: (profileData.show_gift_history as boolean) ?? true,
            platinumVitrin: (profileData.platinum_vitrin as boolean) ?? false,
            showOnlineStatus:
              (profileData.show_online_status as boolean) ?? true,
            allowMessageRequests:
              (profileData.allow_message_requests as boolean) ?? true,
            showLocation: (profileData.show_location as boolean) ?? true,
          });
          setSubscriptionTier(
            (profileData.subscription_tier as 'free' | 'gold' | 'platinum') ||
              'free',
          );
        }
      } catch (error) {
        logger.error('[VisibilitySettings] Fetch error:', error);
        showToast('Ayarlar yüklenemedi', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user?.id, showToast]);

  // Save settings
  const saveSettings = useCallback(
    async (newSettings: Partial<VisibilitySettings>) => {
      if (!user?.id) return;

      setSaving(true);
      try {
        const dbUpdate: Record<string, unknown> = {};

        if (newSettings.giftVisibility !== undefined) {
          dbUpdate.gift_visibility = newSettings.giftVisibility;
        }
        if (newSettings.profileDiscoverability !== undefined) {
          dbUpdate.profile_discoverability = newSettings.profileDiscoverability;
        }
        if (newSettings.showTrustScore !== undefined) {
          dbUpdate.show_trust_score = newSettings.showTrustScore;
        }
        if (newSettings.showGiftHistory !== undefined) {
          dbUpdate.show_gift_history = newSettings.showGiftHistory;
        }
        if (newSettings.platinumVitrin !== undefined) {
          dbUpdate.platinum_vitrin = newSettings.platinumVitrin;
        }
        if (newSettings.showOnlineStatus !== undefined) {
          dbUpdate.show_online_status = newSettings.showOnlineStatus;
        }
        if (newSettings.allowMessageRequests !== undefined) {
          dbUpdate.allow_message_requests = newSettings.allowMessageRequests;
        }
        if (newSettings.showLocation !== undefined) {
          dbUpdate.show_location = newSettings.showLocation;
        }

        const { error } = await supabase
          .from('profiles')
          .update(dbUpdate)
          .eq('id', user.id);

        if (error) throw error;

        setSettings((prev) => ({ ...prev, ...newSettings }));
        showToast('Ayarlar kaydedildi', 'success');
      } catch (error) {
        logger.error('[VisibilitySettings] Save error:', error);
        showToast('Ayarlar kaydedilemedi', 'error');
      } finally {
        setSaving(false);
      }
    },
    [user?.id, showToast],
  );

  // Handle gift visibility change
  const handleGiftVisibilityChange = (value: GiftVisibility) => {
    const option = GIFT_VISIBILITY_OPTIONS.find((o) => o.value === value);
    if (option?.requiresSubscription) {
      const requiredTier = option.requiresSubscription;
      const hasAccess =
        requiredTier === 'gold'
          ? subscriptionTier === 'gold' || subscriptionTier === 'platinum'
          : subscriptionTier === 'platinum';

      if (!hasAccess) {
        showAlert({
          title: 'Abonelik Gerekli',
          message: `Bu özellik ${requiredTier === 'platinum' ? 'Platinum' : 'Gold'} üyelik gerektirir.`,
          buttons: [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Yükselt',
              onPress: () => navigation.navigate('Subscription' as never),
            },
          ],
        });
        return;
      }
    }
    saveSettings({ giftVisibility: value });
  };

  // Handle profile discoverability change
  const handleDiscoverabilityChange = (value: ProfileDiscoverability) => {
    const option = PROFILE_DISCOVERABILITY_OPTIONS.find(
      (o) => o.value === value,
    );
    if (
      option?.requiresSubscription === 'platinum' &&
      subscriptionTier !== 'platinum'
    ) {
      showAlert({
        title: 'Platinum Gerekli',
        message: 'Bu özellik Platinum üyelik gerektirir.',
        buttons: [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Yükselt',
            onPress: () => navigation.navigate('Subscription' as never),
          },
        ],
      });
      return;
    }
    saveSettings({ profileDiscoverability: value });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DFFF00" />
      </View>
    );
  }

  const isGold = subscriptionTier === 'gold' || subscriptionTier === 'platinum';
  const isPlatinum = subscriptionTier === 'platinum';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Görünürlük Ayarları</Text>
          {saving && (
            <ActivityIndicator
              size="small"
              color="#DFFF00"
              style={styles.savingIndicator}
            />
          )}
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Gift Visibility Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard intensity={12} style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="gift" size={22} color="#DFFF00" />
                <Text style={styles.sectionTitle}>Hediye Görünürlüğü</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Hediye geçmişinizi kimler görebilsin?
              </Text>

              {GIFT_VISIBILITY_OPTIONS.map((option) => {
                const isLocked =
                  option.requiresSubscription === 'gold'
                    ? !isGold
                    : option.requiresSubscription === 'platinum'
                      ? !isPlatinum
                      : false;

                return (
                  <RadioOption
                    key={option.value}
                    option={option}
                    isSelected={settings.giftVisibility === option.value}
                    isLocked={isLocked}
                    onSelect={() =>
                      handleGiftVisibilityChange(option.value as GiftVisibility)
                    }
                  />
                );
              })}
            </GlassCard>
          </Animated.View>

          {/* Profile Discoverability Section */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <GlassCard intensity={12} style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="compass"
                  size={22}
                  color="#DFFF00"
                />
                <Text style={styles.sectionTitle}>
                  Profil Keşfedilebilirlik
                </Text>
              </View>
              <Text style={styles.sectionDescription}>
                Profilinizi kimler bulabilsin?
              </Text>

              {PROFILE_DISCOVERABILITY_OPTIONS.map((option) => {
                const isLocked =
                  option.requiresSubscription === 'platinum' && !isPlatinum;

                return (
                  <RadioOption
                    key={option.value}
                    option={option}
                    isSelected={
                      settings.profileDiscoverability === option.value
                    }
                    isLocked={isLocked}
                    onSelect={() =>
                      handleDiscoverabilityChange(
                        option.value as ProfileDiscoverability,
                      )
                    }
                  />
                );
              })}
            </GlassCard>
          </Animated.View>

          {/* Platinum Vitrin */}
          <PlatinumVitrinCard
            isEnabled={settings.platinumVitrin}
            isPlatinum={isPlatinum}
            onToggle={(value) => saveSettings({ platinumVitrin: value })}
            onUpgrade={() => navigation.navigate('Subscription' as never)}
          />

          {/* Additional Privacy Toggles */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <GlassCard intensity={12} style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="shield-account"
                  size={22}
                  color="#DFFF00"
                />
                <Text style={styles.sectionTitle}>Ek Gizlilik Seçenekleri</Text>
              </View>

              <ToggleRow
                icon="star-circle"
                label="Güven Puanını Göster"
                description="Profilinizde güven puanınız görünsün"
                value={settings.showTrustScore}
                onChange={(value) => saveSettings({ showTrustScore: value })}
              />

              <ToggleRow
                icon="history"
                label="Hediye Geçmişini Göster"
                description="Son hediyeleriniz profilinizde görünsün"
                value={settings.showGiftHistory}
                onChange={(value) => saveSettings({ showGiftHistory: value })}
              />

              <ToggleRow
                icon="circle"
                label="Çevrimiçi Durumunu Göster"
                description="Aktif olduğunuzda gösterge görünsün"
                value={settings.showOnlineStatus}
                onChange={(value) => saveSettings({ showOnlineStatus: value })}
              />

              <ToggleRow
                icon="message-text"
                label="Mesaj İsteklerine İzin Ver"
                description="Yabancılardan mesaj alabilin"
                value={settings.allowMessageRequests}
                onChange={(value) =>
                  saveSettings({ allowMessageRequests: value })
                }
              />

              <ToggleRow
                icon="map-marker"
                label="Konumu Göster"
                description="Şehriniz profilinizde görünsün"
                value={settings.showLocation}
                onChange={(value) => saveSettings({ showLocation: value })}
              />
            </GlassCard>
          </Animated.View>

          {/* Footer info */}
          <View style={styles.footerInfo}>
            <MaterialCommunityIcons
              name="information"
              size={16}
              color="rgba(255, 255, 255, 0.4)"
            />
            <Text style={styles.footerText}>
              Gizlilik ayarlarınız anında güncellenir. Değişiklikler diğer
              kullanıcılara hemen yansır.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  savingIndicator: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioOptionSelected: {
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    borderColor: '#DFFF00',
  },
  radioOptionLocked: {
    opacity: 0.5,
  },
  radioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  radioIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIconSelected: {
    backgroundColor: '#DFFF00',
  },
  radioContent: {
    flex: 1,
  },
  radioLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  radioLabelSelected: {
    color: '#DFFF00',
  },
  radioLabelLocked: {
    color: '#64748B',
  },
  radioDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  radioDescriptionLocked: {
    color: '#475569',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#DFFF00',
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DFFF00',
  },
  subscriptionBadgePlatinum: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#A855F7',
  },
  subscriptionBadgeGold: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
  },
  subscriptionBadgeText: {
    fontSize: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleRowLocked: {
    opacity: 0.5,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleLabelLocked: {
    color: '#64748B',
  },
  toggleDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  toggleDescriptionLocked: {
    color: '#475569',
  },
  vitrinCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  vitrinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  vitrinIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitrinInfo: {
    flex: 1,
  },
  vitrinTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vitrinDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  vitrinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 12,
  },
  vitrinToggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  vitrinBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 18,
  },
});

export default VisibilitySettingsScreen;

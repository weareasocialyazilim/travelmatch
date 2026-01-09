// EditProfileScreen - Liquid Glass Identity Management
// Awwwards standard profile editing with glass effects and neon accents
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform,
  ActionSheetIOS,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { logger } from '@/utils/logger';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { SPACING, RADIUS } from '@/constants/spacing';
import { GlassCard } from '@/components/ui/GlassCard';
import { ControlledInput } from '@/components/ui/ControlledInput';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/services/userService';
import { CityAutocomplete } from '@/components/CityAutocomplete';
import { editProfileSchema, type EditProfileInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';

// Helper to mask phone number for privacy display
const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone;
  const visibleStart = phone.slice(0, 4);
  const visibleEnd = phone.slice(-2);
  const maskedMiddle = '*'.repeat(Math.max(0, phone.length - 6));
  return `${visibleStart}${maskedMiddle}${visibleEnd}`;
};

const BIO_MAX_LENGTH = 200;

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Animation values
  const avatarGlow = useSharedValue(0);

  useEffect(() => {
    avatarGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [avatarGlow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(avatarGlow.value, [0, 1], [0.2, 0.5]),
    transform: [{ scale: interpolate(avatarGlow.value, [0, 1], [1, 1.1]) }],
  }));

  // Original profile data from auth context
  const originalProfile = useMemo(() => {
    return {
      avatarUrl: user?.profilePhoto || user?.avatarUrl || '',
      name: user?.name || '',
      bio: user?.bio || '',
      location:
        typeof user?.location === 'string'
          ? user.location
          : (user?.location as { city?: string })?.city || '',
    };
  }, [user]);

  // Form state with RHF + Zod
  const { control, handleSubmit, formState, watch, reset, setValue } =
    useForm<EditProfileInput>({
      resolver: zodResolver(editProfileSchema),
      mode: 'onChange',
      defaultValues: {
        fullName: originalProfile.name,
        bio: originalProfile.bio,
        location: originalProfile.location,
      },
    });

  // Watch fields for real-time updates
  const bio = watch('bio');
  const watchedLocation = watch('location');

  // Update form when user data loads
  useEffect(() => {
    reset({
      fullName: originalProfile.name,
      bio: originalProfile.bio,
      location: originalProfile.location,
    });
  }, [originalProfile, reset]);

  // UI state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Privacy & visibility state
  const [isDiscoverable, setIsDiscoverable] = useState<boolean>(
    (user as any)?.is_discoverable ?? true,
  );
  const [distancePreference, setDistancePreference] = useState<number>(
    (user as any)?.distance_preference ?? 50,
  );

  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    return avatarUri !== null || formState.isDirty;
  }, [avatarUri, formState.isDirty]);

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showAlert(
            'İzin Gerekli',
            "Fotoğraf çekmek için kamera izni gereklidir. Lütfen Ayarlar'dan etkinleştirin.",
            [{ text: 'Tamam' }],
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setAvatarUri(result.assets[0].uri);
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showAlert(
            'İzin Gerekli',
            "Fotoğraf seçmek için galeri izni gereklidir. Lütfen Ayarlar'dan etkinleştirin.",
            [{ text: 'Tamam' }],
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setAvatarUri(result.assets[0].uri);
        }
      }
    } catch (pickImageError) {
      logger.error('[EditProfile] Failed to pick image', {
        error: pickImageError,
      });
      showToast('Fotoğraf seçilemedi', 'error');
    }
  };

  const onSubmit = async (data: EditProfileInput) => {
    if (!hasChanges()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Upload avatar if changed
      if (avatarUri) {
        await userService.updateAvatar(avatarUri);
      }

      // Update profile
      await userService.updateProfile({
        fullName: data.fullName,
        bio: data.bio,
        location: data.location
          ? { city: data.location, country: '' }
          : undefined,
      });

      // Refresh user context
      await refreshUser();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showAlert('Başarılı', 'Profil güncellendi', [
        { text: 'Tamam', onPress: () => navigation.goBack() },
      ]);
    } catch (updateProfileError) {
      logger.error('[EditProfile] Failed to update profile', {
        error: updateProfileError,
      });
      showToast('Profil güncellenemedi', 'error');
    }
  };

  const isSubmitDisabled = !canSubmitForm(
    { formState },
    {
      requireDirty: false,
      requireValid: true,
    },
  );

  const handleChangeAvatar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const options = avatarUri
      ? ['İptal', 'Fotoğraf Çek', 'Galeriden Seç', 'Fotoğrafı Kaldır']
      : ['İptal', 'Fotoğraf Çek', 'Galeriden Seç'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: avatarUri ? 3 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          if (buttonIndex === 2) pickImage(false);
          if (buttonIndex === 3 && avatarUri) setAvatarUri(null);
        },
      );
    } else {
      const alertOptions: {
        text: string;
        onPress?: () => void;
        style?: 'cancel' | 'destructive';
      }[] = [
        { text: 'Fotoğraf Çek', onPress: () => pickImage(true) },
        { text: 'Galeriden Seç', onPress: () => pickImage(false) },
      ];
      if (avatarUri) {
        alertOptions.push({
          text: 'Fotoğrafı Kaldır',
          onPress: () => setAvatarUri(null),
          style: 'destructive',
        });
      }
      alertOptions.push({ text: 'İptal', style: 'cancel' });

      showAlert('Profil Fotoğrafı', 'Bir seçenek belirle', alertOptions);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      showAlert(
        'Değişiklikleri İptal Et?',
        'Kaydedilmemiş değişiklikler var. İptal etmek istediğine emin misin?',
        [
          { text: 'Düzenlemeye Devam Et', style: 'cancel' },
          {
            text: 'İptal Et',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>Vazgeç</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dijital Kartvizit</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButtonContainer]}
          onPress={handleSubmit(onSubmit)}
          disabled={formState.isSubmitting || isSubmitDisabled}
          activeOpacity={0.7}
        >
          {formState.isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text
              style={[
                styles.saveText,
                isSubmitDisabled && styles.saveTextDisabled,
              ]}
            >
              Kaydet
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section - Ceremony Style */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <TouchableOpacity
              style={styles.avatarSection}
              onPress={handleChangeAvatar}
              activeOpacity={0.8}
            >
              <View style={styles.avatarContainer}>
                {/* Glow ring */}
                <Animated.View style={[styles.avatarGlow, glowStyle]} />

                {/* Avatar image */}
                {avatarUri || originalProfile.avatarUrl ? (
                  <Image
                    source={{ uri: avatarUri || originalProfile.avatarUrl }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <MaterialCommunityIcons
                      name="account"
                      size={60}
                      color={COLORS.text.secondary}
                    />
                  </View>
                )}

                {/* Camera badge */}
                <View style={styles.cameraOverlay}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={18}
                    color={COLORS.white}
                  />
                </View>
              </View>
              <Text style={styles.changePhotoText}>Fotoğrafı Değiştir</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Basic Info Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KİMLİK BİLGİLERİ</Text>

              <GlassCard
                intensity={15}
                tint="light"
                style={styles.inputCard}
                borderRadius={RADIUS.xl}
                padding={SPACING.md}
              >
                {/* Name */}
                <ControlledInput<EditProfileInput>
                  name="fullName"
                  control={control}
                  label="Ad Soyad"
                  placeholder="Adını gir"
                  maxLength={50}
                  showSuccess={true}
                />
              </GlassCard>
            </View>
          </Animated.View>

          {/* Bio Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>BİYOGRAFİ</Text>

              <GlassCard
                intensity={15}
                tint="light"
                style={styles.inputCard}
                borderRadius={RADIUS.xl}
                padding={SPACING.md}
              >
                <View style={styles.bioLabelRow}>
                  <Text style={styles.inputLabel}>Kendini Tanıt</Text>
                  <Text
                    style={[
                      styles.charCount,
                      (bio?.length ?? 0) > BIO_MAX_LENGTH * 0.9 &&
                        styles.charCountWarning,
                      (bio?.length ?? 0) >= BIO_MAX_LENGTH &&
                        styles.charCountError,
                    ]}
                  >
                    {bio?.length ?? 0}/{BIO_MAX_LENGTH}
                  </Text>
                </View>
                <ControlledInput<EditProfileInput>
                  name="bio"
                  control={control}
                  placeholder="Dünyayı keşfetmek, anıları biriktirmek..."
                  multiline
                  numberOfLines={4}
                  maxLength={BIO_MAX_LENGTH}
                  showSuccess={true}
                />
              </GlassCard>
            </View>
          </Animated.View>

          {/* Location Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KONUM</Text>

              <GlassCard
                intensity={15}
                tint="light"
                style={styles.inputCard}
                borderRadius={RADIUS.xl}
                padding={SPACING.md}
              >
                <Text style={styles.inputLabel}>Şehir</Text>
                <CityAutocomplete
                  value={watchedLocation || ''}
                  onSelect={(value: string) => setValue('location', value)}
                  placeholder="Şehir ara..."
                  error={formState.errors.location?.message}
                />
              </GlassCard>
            </View>
          </Animated.View>

          {/* Private Information Section */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GİZLİLİK & GÖRÜNÜRLÜK</Text>

              <GlassCard
                intensity={15}
                tint="light"
                style={styles.inputCard}
                borderRadius={RADIUS.xl}
                padding={SPACING.md}
              >
                {/* Discovery Toggle */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <MaterialCommunityIcons
                      name="compass-outline"
                      size={22}
                      color={COLORS.brand?.primary || COLORS.primary}
                    />
                    <View style={styles.toggleTextContainer}>
                      <Text style={styles.toggleLabel}>Keşfet'te Görün</Text>
                      <Text style={styles.toggleDesc}>
                        {isDiscoverable
                          ? 'Anların haritada ve feedde görünür'
                          : 'Kapatırsan anların haritada ve feedde görünmez'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggleSwitch,
                      isDiscoverable && styles.toggleSwitchActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsDiscoverable(!isDiscoverable);
                    }}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        isDiscoverable && styles.toggleKnobActive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputDivider} />

                {/* Distance Preference */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleInfo}>
                    <MaterialCommunityIcons
                      name="map-marker-radius-outline"
                      size={22}
                      color={COLORS.brand?.primary || COLORS.primary}
                    />
                    <View style={styles.toggleTextContainer}>
                      <Text style={styles.toggleLabel}>Mesafe Tercihi</Text>
                      <Text style={styles.toggleDesc}>
                        Maksimum mesafe ayarı
                      </Text>
                    </View>
                  </View>
                  <View style={styles.distanceControls}>
                    <TouchableOpacity
                      style={styles.distanceButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setDistancePreference(Math.max(5, distancePreference - 5));
                      }}
                    >
                      <MaterialCommunityIcons name="minus" size={18} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.distanceValue}>{distancePreference} km</Text>
                    <TouchableOpacity
                      style={styles.distanceButton}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setDistancePreference(Math.min(500, distancePreference + 5));
                      }}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </View>
          </Animated.View>

          {/* Contact Information Section */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>İLETİŞİM BİLGİLERİ</Text>

              <GlassCard
                intensity={15}
                tint="light"
                style={styles.inputCard}
                borderRadius={RADIUS.xl}
                padding={0}
              >
                {/* Email */}
                <View style={styles.inputGroup}>
                  <View style={styles.privateRow}>
                    <MaterialCommunityIcons
                      name="email-outline"
                      size={18}
                      color={COLORS.text.secondary}
                    />
                    <Text style={styles.inputLabel}>E-posta</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.disabledInput]}
                    value={user?.email || ''}
                    editable={false}
                    placeholder="E-posta yok"
                    placeholderTextColor={COLORS.text.tertiary}
                  />
                </View>

                <View style={styles.inputDivider} />

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <View style={styles.privateRow}>
                    <MaterialCommunityIcons
                      name="phone-outline"
                      size={18}
                      color={COLORS.text.secondary}
                    />
                    <Text style={styles.inputLabel}>Telefon</Text>
                  </View>
                  <TextInput
                    style={[styles.textInput, styles.disabledInput]}
                    value={
                      (user as { phone?: string })?.phone
                        ? maskPhone((user as { phone?: string }).phone!)
                        : ''
                    }
                    editable={false}
                    placeholder="Telefon yok"
                    placeholderTextColor={COLORS.text.tertiary}
                  />
                </View>
              </GlassCard>

              <View style={styles.privateNoteContainer}>
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={14}
                  color={COLORS.text.tertiary}
                />
                <Text style={styles.privateInfoNote}>
                  Bu bilgiler gizlidir ve sadece sana görünür.
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Verification Notice */}
          <Animated.View entering={FadeInDown.delay(600).duration(500)}>
            <GlassCard
              intensity={20}
              tint="light"
              style={styles.verificationCard}
              borderRadius={RADIUS.xl}
              padding={0}
            >
              <View style={styles.verificationContent}>
                <View style={styles.verificationIconWrapper}>
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={24}
                    color={COLORS.trust.primary}
                  />
                </View>
                <View style={styles.verificationText}>
                  <Text style={styles.verificationTitle}>
                    Kimliğin Doğrulandı
                  </Text>
                  <Text style={styles.verificationDesc}>
                    Ad ve doğum tarihini değiştirmek için destekle iletişime
                    geç.
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerButton: {
    minWidth: 60,
    paddingVertical: SPACING.xs,
  },
  saveButtonContainer: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  cancelText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  saveText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.primary,
  },
  saveTextDisabled: {
    color: COLORS.text.tertiary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING['3xl'],
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING['2xl'],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  avatarGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.primary,
    top: -5,
    left: -5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.surface.base,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.surface.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface.base,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  changePhotoText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Sections
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.screenPadding,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text.tertiary,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  inputCard: {
    overflow: 'hidden',
  },
  inputGroup: {
    padding: SPACING.base,
  },
  inputDivider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginHorizontal: SPACING.base,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  textInput: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.primary,
    padding: 0,
  },

  // Username styles reserved for future username input UI
  // usernameInputContainer: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 2,
  // },
  // usernamePrefix: {
  //   ...TYPOGRAPHY.bodyLarge,
  //   color: COLORS.text.secondary,
  // },
  // usernameError: {
  //   ...TYPOGRAPHY.caption,
  //   color: COLORS.error,
  //   marginTop: SPACING.xs,
  // },

  // Bio
  bioLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  charCountWarning: {
    color: COLORS.secondary,
  },
  charCountError: {
    color: COLORS.error,
  },

  // Private Info
  privateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  disabledInput: {
    color: COLORS.text.tertiary,
  },
  privateNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  privateInfoNote: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
    flex: 1,
  },

  // Toggle Styles
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleLabel: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  toggleDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.tertiary,
  },
  toggleSwitch: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.border.default,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: COLORS.brand?.primary || COLORS.primary,
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.utility?.white || '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  distanceValue: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    color: COLORS.brand?.primary || COLORS.primary,
    minWidth: 60,
    textAlign: 'center',
  },
  distanceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  distanceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface?.base || '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border?.light || '#E0E0E0',
  },

  // Verification
  verificationCard: {
    marginHorizontal: SPACING.screenPadding,
    backgroundColor: `${COLORS.trust.primary}08`,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.base,
  },
  verificationIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.trust.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  verificationDesc: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  bottomSpacer: {
    height: SPACING['2xl'],
  },
});

export default EditProfileScreen;

/**
 * CreateMomentScreen - Phase 3: The Drop
 *
 * ELEVATED: Moments are the core of Lovendo.
 * Story Mode UI: Instagram-like immersive moment creation
 * - No boring forms, just layered experience on top of selected photo
 * - Neon & Glass aesthetic with brand colors
 * - Step-by-step: Media → Details → Location → Price → Review → Drop
 *
 * Design Principles:
 * - "Sürükleyici Deneyim" - Form değil, story atar gibi kolay
 * - Her adım fotoğrafın üzerine "Layer" olarak geliyor
 * - Neon Lime & Glass Black yoğun kullanım
 *
 * "Alıcı Fiyat Belirler" Model:
 * - Anıyı oluşturan (Alıcı) hediye beklentisini belirler
 * - requested_amount zorunlu alan (min: 1)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { HapticManager } from '@/services/HapticManager';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@/navigation/routeParams';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { ESCROW_THRESHOLDS } from '@/constants/values';
import { FONTS, FONT_SIZES } from '@/constants/typography';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import {
  FormStepIndicator,
  type FormStep,
} from '@/components/ui/FormStepIndicator';
import { GlassCard } from '@/components/ui/GlassCard';
import { CurrencySelectionBottomSheet } from '@/features/payments/components/CurrencySelectionBottomSheet';
import { LazyLocationPicker } from '../components/LazyLocationPicker';
import { useMoments } from '@/hooks/useMoments';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/context/ToastContext';
import { showLoginPrompt } from '@/stores/modalStore';
import { logger } from '@/utils/logger';

// Common Turkish cities for quick selection
const TURKISH_CITIES = [
  'İstanbul',
  'Ankara',
  'İzmir',
  'Antalya',
  'Bursa',
  'Adana',
  'Gaziantep',
  'Konya',
  'Mersin',
  'Eskişehir',
  'Bodrum',
  'Kapadokya',
  'Çeşme',
  'Alaçatı',
  'Kuşadası',
];

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};

// Escrow tier helper - determines protection level based on amount
const getEscrowTier = (
  amount: number,
  currency: string,
): {
  tier: 'direct' | 'optional' | 'mandatory';
  message: string;
  color: string;
} => {
  // Handle NaN or invalid amounts
  if (isNaN(amount) || amount <= 0) {
    return {
      tier: 'direct',
      message: 'Fiyat girerek ödeme türünü görün',
      color: COLORS.text.secondary,
    };
  }

  // Convert to USD equivalent for threshold comparison (simplified)
  const usdEquivalent =
    currency === 'TRY'
      ? amount / 35
      : currency === 'EUR'
        ? amount * 1.1
        : currency === 'GBP'
          ? amount * 1.27
          : amount;

  if (usdEquivalent < ESCROW_THRESHOLDS.DIRECT_MAX) {
    return {
      tier: 'direct',
      message: 'Hızlı ödeme - Anında cüzdanınıza aktarılır',
      color: COLORS.feedback.success,
    };
  } else if (usdEquivalent < ESCROW_THRESHOLDS.OPTIONAL_MAX) {
    return {
      tier: 'optional',
      message: 'Güvenli ödeme - Onayınızdan sonra ödeme alırsınız',
      color: COLORS.feedback.warning,
    };
  } else {
    return {
      tier: 'mandatory',
      message: 'Korumalı ödeme - 48 saat güvence ile tutulur',
      color: COLORS.feedback.error,
    };
  }
};

const { width: _width, height: _height } = Dimensions.get('window');

// Step-by-step flow - UPDATED with city + venue steps
type Step =
  | 'media'
  | 'details'
  | 'city'
  | 'venue'
  | 'date'
  | 'price'
  | 'review';

// Form steps for the indicator - UPDATED
const FORM_STEPS: FormStep[] = [
  { key: 'media', label: 'Görsel', icon: 'camera' },
  { key: 'details', label: 'Detaylar', icon: 'text' },
  { key: 'city', label: 'Şehir', icon: 'city' },
  { key: 'venue', label: 'Mekan', icon: 'map-marker' },
  { key: 'date', label: 'Tarih', icon: 'calendar' },
  { key: 'price', label: 'Bedel', icon: 'currency-try' },
  { key: 'review', label: 'Önizleme', icon: 'eye' },
];

const STEP_INDEX_MAP: Record<Step, number> = {
  media: 0,
  details: 1,
  city: 2,
  venue: 3,
  date: 4,
  price: 5,
  review: 6,
};

// Experience categories - CLEANED terminology
const EXPERIENCE_CATEGORIES = [
  {
    id: 'dining',
    label: 'Fine Dining',
    icon: 'silverware-fork-knife' as const,
  },
  { id: 'nightlife', label: 'Nightlife', icon: 'glass-cocktail' as const },
  { id: 'culture', label: 'Art & Culture', icon: 'palette' as const },
  { id: 'adventure', label: 'Adventure', icon: 'compass' as const },
] as const;

type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number]['id'];

// Location type for picker
interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const CreateMomentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { createMoment } = useMoments();
  const { user, isGuest } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Step state
  const [step, setStep] = useState<Step>('media');

  // Form data - UPDATED with city + date fields
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [requestedAmount, setRequestedAmount] = useState('50'); // "Alıcı Fiyat Belirler"
  const [currency, setCurrency] = useState('TRY');
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ExperienceCategory | null>(null);
  const [city, setCity] = useState<string>(''); // ZORUNLU
  const [venueName, setVenueName] = useState<string>(''); // OPSİYONEL
  const [venueCoords, setVenueCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null); // OPSİYONEL
  const [momentDate, setMomentDate] = useState<Date | null>(null); // OPSİYONEL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAsStory, setShowAsStory] = useState(true); // Default: show as story for 24h

  // Double-tap protection ref
  const isPublishingRef = useRef(false);

  // 1. Media Selection - Story format (9:16)
  // NOTE: All hooks must be defined before any conditional returns (React rules of hooks)
  const pickImage = useCallback(async () => {
    // Liquid interaction haptic
    HapticManager.buttonPress();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16], // Story format
      quality: 1,
    });

    if (!result.canceled) {
      HapticManager.buttonPress();
      setImageUri(result.assets[0].uri);
      setStep('details');
    }
  }, []);

  // Handle venue selection with haptic feedback
  const handleVenueSelect = useCallback((location: Location) => {
    // Silky haptic feedback on venue selection
    HapticManager.buttonPress();
    setVenueName(location.name || location.address);
    setVenueCoords({ lat: location.latitude, lng: location.longitude });
    setShowLocationPicker(false);
  }, []);

  // Validate title for external links
  const validateTitle = useCallback((text: string) => {
    // Check for external links
    const urlPattern =
      /(https?:\/\/[^\s]+|www\.[^\s]+|bit\.ly[^\s]+|t\.co[^\s]+)/gi;
    const linkPattern =
      /(link[:\s]*https?|www\.|bit\.ly|t\.co|instagram\.com|tiktok\.com)/i;

    if (urlPattern.test(text) || linkPattern.test(text)) {
      setTitleError('Dış link içeremez. İhtiyacınızı kelimelerle anlatın.');
    } else {
      setTitleError(null);
    }
    setTitle(text);
  }, []);

  // Handle city selection
  const handleCitySelect = useCallback((selectedCity: string) => {
    HapticManager.buttonPress();
    setCity(selectedCity);
    setShowCityPicker(false);
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date | null) => {
    HapticManager.buttonPress();
    setMomentDate(date);
    setShowDatePicker(false);
  }, []);

  // 2. Drop Action (Submit to API) - UPDATED with new fields
  const handleDrop = useCallback(async () => {
    // Double-tap protection
    if (isPublishingRef.current) {
      logger.info('[CreateMoment] Ignoring duplicate publish tap');
      return;
    }

    // Check if user is authenticated
    if (isGuest || !user) {
      showLoginPrompt({ action: 'create_moment' });
      return;
    }

    // Validate required fields
    if (!title || title.trim().length < 3) {
      HapticManager.error();
      showAlert({
        title: 'Eksik Bilgi',
        message: 'Lütfen anınızı kısaca tanımlayın (min. 3 karakter).',
      });
      return;
    }

    if (!selectedCategory) {
      HapticManager.error();
      showAlert({
        title: 'Eksik Bilgi',
        message: 'Lütfen bir kategori seçin.',
      });
      return;
    }

    // City is REQUIRED
    if (!city) {
      HapticManager.error();
      showAlert({
        title: 'Şehir Gerekli',
        message: 'Lütfen şehir seçin. Bu, momentinizi keşfedilebilir kılar.',
      });
      return;
    }

    // Validate requested amount (min: 1)
    const amount = parseFloat(requestedAmount);
    if (!amount || amount < 1) {
      HapticManager.error();
      showAlert({
        title: 'Geçersiz Miktar',
        message: 'Fiyat en az 1 olmalıdır.',
      });
      return;
    }

    // Set double-tap protection
    isPublishingRef.current = true;
    setIsSubmitting(true);
    HapticManager.buttonPress();

    try {
      const momentData = {
        title: title.trim(),
        description: '',
        category: selectedCategory, // experience_category
        city: city, // ZORUNLU
        venue: venueName || null, // OPSİYONEL
        ...(venueCoords && {
          coordinates: venueCoords,
        }),
        date: momentDate ? momentDate.toISOString() : null, // OPSİYONEL
        images: imageUri ? [imageUri] : [], // Filter out null
        pricePerGuest: amount, // requested_amount
        currency: currency,
        maxGuests: 4,
        duration: '2 hours',
        showAsStory: showAsStory, // Show as story for 24 hours
      };

      const createdMoment = await createMoment(momentData);

      if (createdMoment) {
        HapticManager.success();

        // Navigate to Profile first, then show success toast
        // Using setTimeout to avoid modal conflict with navigation
        navigation.navigate('MainTabs', { screen: 'Profile' });

        // Show toast after navigation completes
        setTimeout(() => {
          showAlert({
            title: t('common.success', 'Başarılı'),
            message: t(
              'screens.createMoment.securityCheckMessage',
              'Moment yayınlandı! İçeriğiniz topluluk güvenliği için kısa bir AI kontrolünden geçiyor. Onaylandığında herkes görebilecek.',
            ),
          });
        }, 500);
      } else {
        HapticManager.error();
        showToast('Could not create moment. Please try again.', 'error');
      }
    } catch (createMomentError) {
      logger.error('[CreateMoment] Failed to create moment', {
        error: createMomentError,
      });
      HapticManager.error();
      showToast('Bir şeyler yanlış gitti. Lütfen tekrar deneyin.', 'error');
    } finally {
      setIsSubmitting(false);
      isPublishingRef.current = false;
    }
  }, [
    title,
    selectedCategory,
    imageUri,
    city,
    venueName,
    venueCoords,
    momentDate,
    requestedAmount,
    currency,
    showAsStory,
    createMoment,
    navigation,
    showToast,
    t,
    isGuest,
    user,
  ]);

  // Navigate back - UPDATED for new step flow
  const handleBack = useCallback(() => {
    HapticManager.buttonPress();
    if (step === 'details') {
      setStep('media');
    } else if (step === 'city') {
      setStep('details');
    } else if (step === 'venue') {
      setStep('city');
    } else if (step === 'date') {
      setStep('venue');
    } else if (step === 'price') {
      setStep('date');
    } else if (step === 'review') {
      setStep('price');
    }
  }, [step]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // --- Render Steps ---

  // Handle step navigation from indicator - UPDATED for new steps
  const handleStepPress = useCallback(
    (stepIndex: number) => {
      const stepKeys: Step[] = [
        'media',
        'details',
        'city',
        'venue',
        'date',
        'price',
        'review',
      ];
      if (stepIndex < STEP_INDEX_MAP[step]) {
        HapticManager.buttonPress();
        setStep(stepKeys[stepIndex]);
      }
    },
    [step],
  );

  // GUEST LOOP FIX: Block guests at component mount
  // This prevents guests from filling out the entire form before being asked to login
  useEffect(() => {
    if (isGuest || !user) {
      // Show login prompt immediately when guest tries to create a moment
      showLoginPrompt({
        action: 'create_moment',
        onSuccess: () => {
          // User logged in successfully, form will render
        },
      });
    }
  }, [isGuest, user]);

  // If guest, don't render the form - waiting for login redirect
  // NOTE: This conditional return must come AFTER all hooks are defined
  if (isGuest || !user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[...GRADIENTS.dark] as [string, string, ...string[]]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.guestBlockContainer}>
          <MaterialCommunityIcons
            name="account-lock"
            size={64}
            color={COLORS.brand.primary}
          />
          <Text style={styles.guestBlockTitle}>
            {t('screens.createMoment.loginRequired', 'Giriş Yapın')}
          </Text>
          <Text style={styles.guestBlockSubtitle}>
            {t(
              'screens.createMoment.loginRequiredMessage',
              'Anı oluşturmak için giriş yapmanız gerekiyor.',
            )}
          </Text>
        </View>
      </View>
    );
  }

  // Step 1: Media Selection - Clean upload UI
  const renderMediaStep = () => (
    <Animated.View entering={FadeIn} style={styles.centerContent}>
      {/* Header with Close Button and Step Indicator */}
      <View style={[styles.mediaHeader, { paddingTop: insets.top + 10 }]}>
        <View style={styles.mediaHeaderSpacer} />
        <View style={styles.mediaHeaderCenter}>
          <FormStepIndicator
            steps={FORM_STEPS}
            currentStep={STEP_INDEX_MAP[step]}
            onStepPress={handleStepPress}
            showLabels={false}
            compact
          />
        </View>
        <TouchableOpacity
          onPress={handleClose}
          style={styles.mediaCloseButton}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.mediaStepContent}>
        <Text style={styles.stepTitle}>Anını Görselleştir</Text>
        <Text style={styles.stepSubtitle}>
          Unutulmaz anılarını en kaliteli haliyle paylaş.
        </Text>

        <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.gradientBorder}
          >
            <View style={styles.uploadInner}>
              <MaterialCommunityIcons
                name="camera-plus"
                size={40}
                color="white"
              />
              <Text style={styles.uploadText}>Fotoğraf Ekle</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.stepHint}>
          {t('screens.createMoment.uploadHint')}
        </Text>
      </View>
    </Animated.View>
  );

  // Steps 2-4: Overlay controls on top of selected image
  const renderControls = () => {
    if (step === 'media') return null;

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlayContainer}
      >
        {/* Top Controls: Back, Step Indicator & Close */}
        <View style={[styles.topBar, { marginTop: insets.top }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.iconButton}
            accessibilityLabel={t('screens.createMoment.a11y.back')}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Step Indicator in Header */}
          <View style={styles.headerStepIndicator}>
            <FormStepIndicator
              steps={FORM_STEPS}
              currentStep={STEP_INDEX_MAP[step]}
              onStepPress={handleStepPress}
              showLabels={false}
              compact
            />
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.iconButton}
            accessibilityLabel={t('screens.createMoment.a11y.close')}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Content Layer */}
        <View style={styles.contentLayer}>
          {/* STEP: DETAILS (Title & Experience Category) */}
          {step === 'details' && (
            <Animated.View entering={SlideInDown} exiting={SlideOutDown}>
              <Text style={styles.label}>SET THE VIBE</Text>

              <TextInput
                style={styles.titleInput}
                placeholder="Bu hafta İstanbul'da bir nefes almak istiyorum..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={title}
                onChangeText={validateTitle}
                maxLength={80}
                autoFocus
                autoCorrect={false}
                autoCapitalize="sentences"
                spellCheck={false}
                keyboardType="default"
                accessibilityLabel={t('screens.createMoment.a11y.momentTitle')}
              />
              {titleError && (
                <Text style={styles.titleError}>{titleError}</Text>
              )}
              <Text style={styles.titleHint}>
                İhtiyacını veya isteğini kendi cümlelerinle anlat
              </Text>

              <View style={styles.categoryGrid}>
                {EXPERIENCE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryPill,
                      selectedCategory === cat.id && styles.categoryPillActive,
                    ]}
                    onPress={() => {
                      HapticManager.buttonPress();
                      setSelectedCategory(cat.id);
                    }}
                    accessibilityLabel={cat.label}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: selectedCategory === cat.id,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={cat.icon}
                      size={18}
                      color={selectedCategory === cat.id ? 'black' : 'white'}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === cat.id &&
                          styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!title || !selectedCategory) && styles.nextButtonDisabled,
                ]}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('city');
                }}
                disabled={!title || !selectedCategory}
                accessibilityLabel="Next: Select City"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Sonraki: Şehir Seç</Text>
                <Ionicons name="location-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP: CITY - ZORUNLU */}
          {step === 'city' && (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.cityStep}
            >
              <Text style={styles.label}>ŞEHRİNİ SEÇ</Text>
              <Text style={styles.cityHint}>
                Momentin hangi şehirde görüneceğini seç
              </Text>

              {/* Quick City Selection */}
              <View style={styles.cityGrid}>
                {TURKISH_CITIES.slice(0, 8).map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.cityPill,
                      city === c && styles.cityPillActive,
                    ]}
                    onPress={() => {
                      HapticManager.buttonPress();
                      setCity(c);
                    }}
                  >
                    <Text
                      style={[
                        styles.cityPillText,
                        city === c && styles.cityPillTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom City Input */}
              <TouchableOpacity
                style={styles.customCityButton}
                onPress={() => setShowCityPicker(true)}
              >
                <Ionicons name="add" size={24} color={COLORS.brand.primary} />
                <Text style={styles.customCityButtonText}>
                  {city ? city : 'Diğer şehir...'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, !city && styles.nextButtonDisabled]}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('venue');
                }}
                disabled={!city}
                accessibilityLabel="Next: Select Venue"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>
                  {venueName ? 'Mekanı Değiştir' : 'Sonraki: Mekan (Opsiyonel)'}
                </Text>
                <Ionicons name="location-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP: VENUE - OPSİYONEL */}
          {step === 'venue' && (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.venueStep}
            >
              <Text style={styles.label}>MEKAN (OPSİYONEL)</Text>
              <Text style={styles.venueHint}>
                Bu deneyimin gerçekleşeceği yeri seç{' '}
                <Text style={{ opacity: 0.6 }}>(isteğe bağlı)</Text>
              </Text>

              {venueName ? (
                <TouchableOpacity
                  style={styles.venueSelected}
                  onPress={() => {
                    HapticManager.buttonPress();
                    setShowLocationPicker(true);
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker-check"
                    size={24}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.venueText}>{venueName}</Text>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.venueButton}
                  onPress={() => {
                    HapticManager.buttonPress();
                    setShowLocationPicker(true);
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker-plus"
                    size={32}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.venueButtonText}>Mekan Seç</Text>
                  <Text style={styles.venueButtonSubtext}>
                    Boş bırakırsanız sadece şehir bazlı kalır
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.skipVenueButton}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('date');
                }}
                accessibilityLabel="Skip venue selection"
                accessibilityRole="button"
              >
                <Text style={styles.skipVenueButtonText}>
                  Atla (Sadece şehir yeterli)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('date');
                }}
                accessibilityLabel="Next: Select Date"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Sonraki: Tarih</Text>
                <Ionicons name="calendar-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP: DATE - OPSİYONEL */}
          {step === 'date' && (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.dateStep}
            >
              <Text style={styles.label}>TARİH (OPSİYONEL)</Text>
              <Text style={styles.dateHint}>
                Bu moment için özel bir tarih var mı?{' '}
                <Text style={{ opacity: 0.6 }}>(isteğe bağlı)</Text>
              </Text>

              {momentDate ? (
                <TouchableOpacity
                  style={styles.dateSelected}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={24}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.dateText}>
                    {momentDate.toLocaleDateString('tr-TR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </Text>
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                    onPress={() => setMomentDate(null)}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <MaterialCommunityIcons
                    name="calendar-plus"
                    size={32}
                    color={COLORS.brand.primary}
                  />
                  <Text style={styles.dateButtonText}>Tarih Ekle</Text>
                  <Text style={styles.dateButtonSubtext}>
                    Tarih eklerseniz, bu tarih yaklaştığında hatırlatılır
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.skipDateButton}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('price');
                }}
                accessibilityLabel="Skip date selection"
                accessibilityRole="button"
              >
                <Text style={styles.skipDateButtonText}>
                  Atla (Sonsuza kadar açık kalabilir)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('price');
                }}
                accessibilityLabel="Next: Set Price"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>
                  Sonraki: Destek Bedeli
                </Text>
                <Ionicons name="cash-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP: PRICE (Creator sets support amount) */}
          {step === 'price' && (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.priceStep}
            >
              <Text style={styles.label}>DESTEK BEDELİ</Text>

              <View style={styles.priceContainer}>
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => {
                    HapticManager.buttonPress();
                    setShowCurrencySheet(true);
                  }}
                  accessibilityLabel={t('screens.createMoment.a11y.currency')}
                  accessibilityRole="button"
                >
                  <Text style={styles.currency}>
                    {CURRENCY_SYMBOLS[currency] || currency}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={24}
                    color={COLORS.brand.primary}
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.priceInput}
                  value={requestedAmount}
                  onChangeText={(text) => {
                    // Only allow numeric input
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setRequestedAmount(numericValue);
                  }}
                  keyboardType="number-pad"
                  maxLength={5}
                  autoCorrect={false}
                  autoCapitalize="none"
                  spellCheck={false}
                  contextMenuHidden={true}
                  accessibilityLabel="Destek miktarı"
                />
              </View>

              <Text style={styles.currencyName}>
                {currency === 'USD' && 'United States Dollar'}
                {currency === 'EUR' && 'Euro'}
                {currency === 'TRY' && 'Türk Lirası'}
                {currency === 'GBP' && 'British Pound'}
                {currency === 'JPY' && 'Japanese Yen'}
                {currency === 'CAD' && 'Canadian Dollar'}
              </Text>

              {/* Escrow Rules Display */}
              {requestedAmount && parseFloat(requestedAmount) > 0 && (
                <View style={styles.escrowRulesContainer}>
                  <View
                    style={[
                      styles.escrowTierBadge,
                      {
                        backgroundColor: `${getEscrowTier(parseFloat(requestedAmount), currency).color}20`,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        getEscrowTier(parseFloat(requestedAmount), currency)
                          .tier === 'direct'
                          ? 'flash'
                          : getEscrowTier(parseFloat(requestedAmount), currency)
                                .tier === 'optional'
                            ? 'shield-half-full'
                            : 'shield-lock'
                      }
                      size={16}
                      color={
                        getEscrowTier(parseFloat(requestedAmount), currency)
                          .color
                      }
                    />
                    <Text
                      style={[
                        styles.escrowTierText,
                        {
                          color: getEscrowTier(
                            parseFloat(requestedAmount),
                            currency,
                          ).color,
                        },
                      ]}
                    >
                      {
                        getEscrowTier(parseFloat(requestedAmount), currency)
                          .message
                      }
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.priceHint}>
                Bu miktar, anını desteklemek isteyenlerin ödeyeceği tutardır.
                {'\n'}Platform komisyonu: %5 • Min: {CURRENCY_SYMBOLS[currency]}
                1 • Maks: {CURRENCY_SYMBOLS[currency]}99999
              </Text>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!requestedAmount || parseFloat(requestedAmount) < 1) &&
                    styles.nextButtonDisabled,
                ]}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('review');
                }}
                disabled={!requestedAmount || parseFloat(requestedAmount) < 1}
                accessibilityLabel={t('screens.createMoment.a11y.reviewDrop')}
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Önizleme</Text>
                <Ionicons name="eye-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Currency Selection Bottom Sheet */}
          <CurrencySelectionBottomSheet
            visible={showCurrencySheet}
            onClose={() => setShowCurrencySheet(false)}
            selectedCurrency={currency}
            onCurrencyChange={(newCurrency) => {
              HapticManager.buttonPress();
              setCurrency(newCurrency);
            }}
          />

          {/* Location Picker Bottom Sheet - Lazy loaded for performance */}
          <LazyLocationPicker
            visible={showLocationPicker}
            onClose={() => setShowLocationPicker(false)}
            onSelectLocation={handleVenueSelect}
          />

          {/* Simple City Picker Alert */}
          {showCityPicker && (
            <View style={styles.cityPickerOverlay}>
              <View style={styles.cityPickerContainer}>
                <Text style={styles.cityPickerTitle}>Şehir Seç</Text>
                <ScrollView style={{ maxHeight: 300 }}>
                  {TURKISH_CITIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={styles.cityDialogItem}
                      onPress={() => {
                        handleCitySelect(c);
                      }}
                    >
                      <Text style={styles.cityDialogItemText}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.cityPickerClose}
                  onPress={() => setShowCityPicker(false)}
                >
                  <Text style={styles.cityPickerCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Simple Date Picker */}
          {showDatePicker && (
            <View style={styles.datePickerOverlay}>
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerTitle}>
                  Tarih Seç (Opsiyonel)
                </Text>
                <View style={styles.datePickerActions}>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      handleDateSelect(tomorrow);
                    }}
                  >
                    <Text style={styles.datePickerButtonText}>Yarın</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      handleDateSelect(nextWeek);
                    }}
                  >
                    <Text style={styles.datePickerButtonText}>1 Hafta</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.clearDateButton}
                  onPress={() => handleDateSelect(null)}
                >
                  <Text style={styles.clearDateButtonText}>Tarihi Temizle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cityPickerClose}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.cityPickerCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP: REVIEW (Final Look) - Liquid Glass */}
          {step === 'review' && (
            <Animated.View entering={SlideInDown} style={styles.reviewStep}>
              <GlassCard intensity={30} tint="dark" style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.reviewLabel}>ÖNİZLEME</Text>
                </View>
                <Text style={styles.reviewTitle}>{title}</Text>
                <View style={styles.reviewMetaRow}>
                  <View style={styles.reviewMetaItem}>
                    <MaterialCommunityIcons
                      name={
                        EXPERIENCE_CATEGORIES.find(
                          (c) => c.id === selectedCategory,
                        )?.icon || 'tag'
                      }
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.reviewMeta}>
                      {
                        EXPERIENCE_CATEGORIES.find(
                          (c) => c.id === selectedCategory,
                        )?.label
                      }
                    </Text>
                  </View>
                </View>
                {/* City - ZORUNLU */}
                <View style={styles.reviewMetaRow}>
                  <View style={styles.reviewMetaItem}>
                    <MaterialCommunityIcons
                      name="city"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.reviewMeta}>{city}</Text>
                  </View>
                </View>
                {/* Venue - OPSİYONEL */}
                {venueName && (
                  <View style={styles.reviewMetaRow}>
                    <View style={styles.reviewMetaItem}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.reviewMeta} numberOfLines={1}>
                        {venueName}
                      </Text>
                    </View>
                  </View>
                )}
                {/* Date - OPSİYONEL */}
                {momentDate && (
                  <View style={styles.reviewMetaRow}>
                    <View style={styles.reviewMetaItem}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.reviewMeta}>
                        {momentDate.toLocaleDateString('tr-TR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                )}
                <View style={styles.reviewMetaRow}>
                  <View style={styles.reviewMetaItem}>
                    <MaterialCommunityIcons
                      name="cash"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.reviewMeta}>
                      Destek Bedeli: {CURRENCY_SYMBOLS[currency]}
                      {requestedAmount} {currency}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewInfoBox}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={16}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.reviewInfoText}>
                    Bu anıyı beğenenler sana {CURRENCY_SYMBOLS[currency]}
                    {requestedAmount} ödeyerek destek olabilir.
                  </Text>
                </View>

                {/* Story Toggle Option */}
                <View style={styles.storyToggleContainer}>
                  <View style={styles.storyToggleInfo}>
                    <MaterialCommunityIcons
                      name="fire"
                      size={20}
                      color={
                        showAsStory ? COLORS.primary : COLORS.text.secondary
                      }
                    />
                    <View style={styles.storyToggleText}>
                      <Text style={styles.storyToggleTitle}>
                        Story olarak göster
                      </Text>
                      <Text
                        style={[
                          styles.storyToggleSubtitle,
                          showAsStory && styles.storyActiveSubtitle,
                        ]}
                      >
                        {showAsStory
                          ? '🔥 23:59:59 sonra silinir'
                          : '24 saat boyunca öne çıkar'}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={showAsStory}
                    onValueChange={setShowAsStory}
                    trackColor={{
                      false: '#3e3e3e',
                      true: COLORS.primary + '60',
                    }}
                    thumbColor={showAsStory ? COLORS.primary : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                  />
                </View>

                {/* Story Visibility Info */}
                {showAsStory && (
                  <View style={styles.storyVisibilityBox}>
                    <View style={styles.storyVisibilityHeader}>
                      <MaterialCommunityIcons
                        name="information-outline"
                        size={16}
                        color={COLORS.primary}
                      />
                      <Text style={styles.storyVisibilityTitle}>
                        Kimler görür?
                      </Text>
                    </View>
                    <Text style={styles.storyVisibilityContent}>
                      Story'n 24 saat görünür kalır. Paylaşılmaz — sadece
                      etkileşimde olduğun kişiler veya yakınındaki kullanıcılar
                      (50km) görür.
                    </Text>
                  </View>
                )}
              </GlassCard>

              <TouchableOpacity
                style={[
                  styles.publishButton,
                  isSubmitting && styles.publishButtonDisabled,
                ]}
                onPress={handleDrop}
                disabled={isSubmitting}
                accessibilityLabel={t('screens.createMoment.a11y.dropMoment')}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.publishButtonGradient}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color="black" />
                      <Text style={styles.publishButtonText}>
                        Yayınlanıyor...
                      </Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="rocket-launch"
                        size={20}
                        color="black"
                      />
                      <Text style={styles.publishButtonText}>
                        Anını Yayınla
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Image or Gradient Placeholder */}
      <ImageBackground
        source={imageUri ? { uri: imageUri } : undefined}
        style={styles.background}
        resizeMode="cover"
      >
        {!imageUri && (
          <LinearGradient
            colors={[COLORS.backgroundDark, '#1a1a1a']}
            style={StyleSheet.absoluteFill}
          />
        )}

        {/* Dark Overlay for Text Readability */}
        {imageUri && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
        )}

        {step === 'media' ? renderMediaStep() : renderControls()}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  // Guest block screen - shown when unauthenticated user tries to create moment
  guestBlockContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  guestBlockTitle: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 16,
  },
  guestBlockSubtitle: {
    fontSize: FONT_SIZES.body,
    fontFamily: FONTS.body.regular,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mediaStepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepTitle: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.bodySmall,
    fontFamily: FONTS.body.regular,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 40,
  },

  // Upload Button - Gradient border effect
  uploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  gradientBorder: {
    flex: 1,
    borderRadius: 60,
    padding: 3, // Creates border effect
  },
  uploadInner: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: 'white',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  stepHint: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },

  // Media Step Header
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  mediaHeaderSpacer: {
    width: 44,
  },
  mediaHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    paddingVertical: 10,
    marginHorizontal: 12,
  },
  mediaCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  // Overlay Controls
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerStepIndicator: {
    flex: 1,
    marginHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  contentLayer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 24,
  },

  // Labels & Inputs
  label: {
    color: COLORS.brand.primary,
    fontWeight: '800',
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 1,
  },
  titleInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },

  // Category Grid - Pills layout
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    gap: 8,
  },
  categoryPillActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  categoryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryTextActive: {
    color: 'black',
  },

  // Location Step
  locationStep: {
    alignItems: 'center',
  },
  locationHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  locationButton: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  locationSelected: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  locationText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },

  // Price Step
  priceStep: {
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  currencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  currency: {
    fontSize: 40,
    color: COLORS.brand.primary,
    fontWeight: 'bold',
  },
  currencyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 12,
  },
  escrowRulesContainer: {
    marginBottom: 16,
  },
  escrowTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  escrowTierText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  priceInput: {
    fontSize: 64,
    fontWeight: '900',
    color: 'white',
    minWidth: 100,
    textAlign: 'center',
  },
  priceHint: {
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 30,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },

  // Review Step - Liquid Glass
  reviewStep: {
    alignItems: 'center',
    width: '100%',
  },
  reviewCard: {
    width: '100%',
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 10,
    fontFamily: FONTS.mono.medium,
    color: COLORS.primary,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  reviewTitle: {
    fontSize: FONT_SIZES.h3,
    fontFamily: FONTS.display.bold,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  reviewInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  reviewInfoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },

  // Story Toggle
  storyToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  storyToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  storyToggleText: {
    flex: 1,
  },
  storyToggleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  storyToggleSubtitle: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 14,
  },
  storyActiveSubtitle: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  storyVisibilityBox: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  storyVisibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  storyVisibilityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  storyVisibilityContent: {
    fontSize: 11,
    color: COLORS.text.secondary,
    lineHeight: 16,
    paddingLeft: 22,
  },

  reviewMetaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  reviewMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewMeta: {
    fontSize: FONT_SIZES.bodySmall,
    fontFamily: FONTS.body.semibold,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },

  // Buttons
  nextButton: {
    backgroundColor: COLORS.brand.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  publishButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  publishButtonDisabled: {
    opacity: 0.6,
  },
  publishButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 28,
  },
  publishButtonText: {
    color: 'black',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Title input error
  titleError: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  titleHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  // City Step
  cityStep: {
    alignItems: 'center',
  },
  cityHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
    justifyContent: 'center',
  },
  cityPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cityPillActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  cityPillText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  cityPillTextActive: {
    color: 'black',
  },
  customCityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  customCityButtonText: {
    color: COLORS.brand.primary,
    fontSize: 14,
  },

  // Venue Step
  venueStep: {
    alignItems: 'center',
  },
  venueHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  venueButton: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  venueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  venueButtonSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  venueSelected: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  venueText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  skipVenueButton: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  skipVenueButtonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },

  // Date Step
  dateStep: {
    alignItems: 'center',
  },
  dateHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  dateButton: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dateButtonSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
  },
  dateSelected: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  dateText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  skipDateButton: {
    paddingVertical: 16,
    marginBottom: 12,
  },
  skipDateButtonText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },

  // City/Date Picker Modal
  cityPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  cityPickerContainer: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 16,
    width: '85%',
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cityPickerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  cityDialogItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  cityDialogItemText: {
    color: 'white',
    fontSize: 16,
  },
  cityPickerClose: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cityPickerCloseText: {
    color: COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Date Picker Modal
  datePickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerContainer: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 16,
    width: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  datePickerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
    textAlign: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    justifyContent: 'center',
  },
  datePickerButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  datePickerButtonText: {
    color: 'black',
    fontWeight: '600',
  },
  clearDateButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  clearDateButtonText: {
    color: COLORS.feedback.error,
    fontSize: 14,
  },
});

export default withErrorBoundary(CreateMomentScreen);

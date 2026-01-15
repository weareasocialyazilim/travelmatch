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

// Step-by-step flow - UPDATED with location step
type Step = 'media' | 'details' | 'location' | 'price' | 'review';

// Form steps for the indicator - UPDATED
const FORM_STEPS: FormStep[] = [
  { key: 'media', label: 'Görsel', icon: 'camera' },
  { key: 'details', label: 'Detaylar', icon: 'text' },
  { key: 'location', label: 'Konum', icon: 'map-marker' },
  { key: 'price', label: 'Fiyat', icon: 'currency-try' },
  { key: 'review', label: 'Önizleme', icon: 'eye' },
];

const STEP_INDEX_MAP: Record<Step, number> = {
  media: 0,
  details: 1,
  location: 2,
  price: 3,
  review: 4,
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

  // Form data - CLEANED terminology
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('50'); // "Alıcı Fiyat Belirler"
  const [currency, setCurrency] = useState('TRY');
  const [showCurrencySheet, setShowCurrencySheet] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ExperienceCategory | null>(null);
  const [locationName, setLocationName] = useState<string>(''); // Replaces destination
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
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

  // Handle location selection with haptic feedback
  const handleLocationSelect = useCallback((location: Location) => {
    // Silky haptic feedback on location selection
    HapticManager.buttonPress();
    setLocationName(location.name || location.address);
    setLocationCoords({ lat: location.latitude, lng: location.longitude });
    setShowLocationPicker(false);
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

    if (!title || !selectedCategory || !imageUri || !locationName) {
      HapticManager.error();
      showAlert({
        title: t('screens.createMoment.missingInfoTitle'),
        message: t('screens.createMoment.missingInfoMessage'),
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
        location: {
          city: locationName,
          country: '',
          ...(locationCoords && {
            coordinates: locationCoords,
          }),
        },
        images: [imageUri],
        pricePerGuest: amount, // requested_amount
        currency: currency,
        maxGuests: 4,
        duration: '2 hours',
        availability: [new Date().toISOString()],
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
          showToast(
            t('screens.createMoment.successMessage') ||
              'Moment başarıyla yayınlandı!',
            'success',
          );
        }, 300);
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
    locationName,
    locationCoords,
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
    } else if (step === 'location') {
      setStep('details');
    } else if (step === 'price') {
      setStep('location');
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
        'location',
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
                placeholder="Dinner at Hotel Costes..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={title}
                onChangeText={setTitle}
                maxLength={40}
                autoFocus
                autoCorrect={false}
                autoCapitalize="sentences"
                spellCheck={false}
                keyboardType="default"
                accessibilityLabel={t('screens.createMoment.a11y.momentTitle')}
              />

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
                  setStep('location');
                }}
                disabled={!title || !selectedCategory}
                accessibilityLabel="Next: Select Location"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>Sonraki: Konum Seç</Text>
                <Ionicons name="location-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP: LOCATION - NEW */}
          {step === 'location' && (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.locationStep}
            >
              <Text style={styles.label}>ANININ KONUMU</Text>
              <Text style={styles.locationHint}>
                Bu deneyimin gerçekleştiği yeri seç
              </Text>

              {locationName ? (
                <TouchableOpacity
                  style={styles.locationSelected}
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
                  <Text style={styles.locationText}>{locationName}</Text>
                  <MaterialCommunityIcons
                    name="pencil"
                    size={20}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.locationButton}
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
                  <Text style={styles.locationButtonText}>Konum Seç</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  !locationName && styles.nextButtonDisabled,
                ]}
                onPress={() => {
                  HapticManager.buttonPress();
                  setStep('price');
                }}
                disabled={!locationName}
                accessibilityLabel="Next: Set Price"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>
                  Sonraki: Fiyat Belirle
                </Text>
                <Ionicons name="cash-outline" size={20} color="black" />
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* STEP: PRICE (Hediye Beklentisi - "Alıcı Fiyat Belirler") */}
          {step === 'price' && (
            <Animated.View
              entering={SlideInDown}
              exiting={SlideOutDown}
              style={styles.priceStep}
            >
              <Text style={styles.label}>FİYAT BELİRLE</Text>

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
                  accessibilityLabel="Fiyat miktarı"
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
                Bu fiyatı ödeyenler anını desteklemiş olur.
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
            onSelectLocation={handleLocationSelect}
          />

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
                  <View style={styles.reviewMetaItem}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.reviewMeta} numberOfLines={1}>
                      {locationName}
                    </Text>
                  </View>
                </View>
                <View style={styles.reviewMetaRow}>
                  <View style={styles.reviewMetaItem}>
                    <MaterialCommunityIcons
                      name="cash"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.reviewMeta}>
                      {CURRENCY_SYMBOLS[currency]}
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
                      <Text style={styles.storyToggleSubtitle}>
                        24 saat boyunca öne çıkar, sonra normal akışta kalır
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
});

export default withErrorBoundary(CreateMomentScreen);

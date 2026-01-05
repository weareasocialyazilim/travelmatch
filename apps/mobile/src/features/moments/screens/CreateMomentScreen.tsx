/**
 * CreateMomentScreen - Phase 3: The Drop
 *
 * ELEVATED: Moments are the core of TravelMatch.
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

import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { RootStackParamList } from '@/navigation/routeParams';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import {
  FormStepIndicator,
  type FormStep,
} from '@/components/ui/FormStepIndicator';
import { GlassCard } from '@/components/ui/GlassCard';
import { CurrencySelectionBottomSheet } from '@/features/payments/components/CurrencySelectionBottomSheet';
import { LazyLocationPicker } from '../components/LazyLocationPicker';
import { useMoments } from '@/hooks/useMoments';
import { useToast } from '@/context/ToastContext';

// Currency symbols for display
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
};

const { width: _width, height: _height } = Dimensions.get('window');

// Step-by-step flow - UPDATED with location step
type Step = 'media' | 'details' | 'location' | 'price' | 'review';

// Form steps for the indicator - UPDATED
const FORM_STEPS: FormStep[] = [
  { key: 'media', label: 'Görsel', icon: 'camera' },
  { key: 'details', label: 'Detaylar', icon: 'text' },
  { key: 'location', label: 'Konum', icon: 'location' },
  { key: 'price', label: 'Hediye', icon: 'gift' },
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

  // 1. Media Selection - Story format (9:16)
  const pickImage = useCallback(async () => {
    // Liquid interaction haptic
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16], // Story format
      quality: 1,
    });

    if (!result.canceled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setImageUri(result.assets[0].uri);
      setStep('details');
    }
  }, []);

  // Handle location selection with haptic feedback
  const handleLocationSelect = useCallback((location: Location) => {
    // Silky haptic feedback on location selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocationName(location.name || location.address);
    setLocationCoords({ lat: location.latitude, lng: location.longitude });
    setShowLocationPicker(false);
  }, []);

  // 2. Drop Action (Submit to API) - UPDATED with new fields
  const handleDrop = useCallback(async () => {
    if (!title || !selectedCategory || !imageUri || !locationName) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: t('screens.createMoment.missingInfoTitle'),
        message: t('screens.createMoment.missingInfoMessage'),
      });
      return;
    }

    // Validate requested amount (min: 1)
    const amount = parseFloat(requestedAmount);
    if (!amount || amount < 1) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showAlert({
        title: 'Geçersiz Miktar',
        message: 'Hediye beklentisi en az 1 olmalıdır.',
      });
      return;
    }

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
      };

      const createdMoment = await createMoment(momentData);

      if (createdMoment) {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        showAlert({
          title: t('screens.createMoment.successTitle'),
          message: t('screens.createMoment.successMessage'),
          buttons: [
            {
              text: t('screens.createMoment.successButton'),
              onPress: () => navigation.navigate('Discover'),
            },
          ],
        });
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        showToast('Could not create moment. Please try again.', 'error');
      }
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    selectedCategory,
    imageUri,
    locationName,
    locationCoords,
    requestedAmount,
    currency,
    createMoment,
    navigation,
    showToast,
    t,
  ]);

  // Navigate back - UPDATED for new step flow
  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStep(stepKeys[stepIndex]);
      }
    },
    [step],
  );

  // Step 1: Media Selection - Clean upload UI
  const renderMediaStep = () => (
    <Animated.View entering={FadeIn} style={styles.centerContent}>
      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        <FormStepIndicator
          steps={FORM_STEPS}
          currentStep={STEP_INDEX_MAP[step]}
          onStepPress={handleStepPress}
          showLabels={false}
          compact
        />
      </View>

      <View style={styles.mediaStepContent}>
        <Text style={styles.stepTitle}>Görsel Kanıtını Yükle</Text>
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
              <Text style={styles.uploadText}>Upload Visual</Text>
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
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStep('price');
                }}
                disabled={!locationName}
                accessibilityLabel="Next: Set Gift Expectation"
                accessibilityRole="button"
              >
                <Text style={styles.nextButtonText}>
                  Sonraki: Hediye Beklentisi
                </Text>
                <Ionicons name="gift-outline" size={20} color="black" />
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
              <Text style={styles.label}>HEDİYE BEKLENTİN</Text>

              <View style={styles.priceContainer}>
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                  onChangeText={setRequestedAmount}
                  keyboardType="number-pad"
                  maxLength={5}
                  accessibilityLabel="Hediye miktarı"
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

              <Text style={styles.priceHint}>
                Bu miktarı kabul eden kişiler sana hediye gönderebilir.
                {'\n'}Platform komisyonu: %5 • Minimum: 1
              </Text>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!requestedAmount || parseFloat(requestedAmount) < 1) &&
                    styles.nextButtonDisabled,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
              Haptics.selectionAsync();
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
                      name="gift-outline"
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
                    {requestedAmount} hediye göndererek destek olabilir.
                  </Text>
                </View>
              </GlassCard>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  styles.dropButton,
                  isSubmitting && styles.nextButtonDisabled,
                ]}
                onPress={handleDrop}
                disabled={isSubmitting}
                accessibilityLabel={t('screens.createMoment.a11y.dropMoment')}
                accessibilityRole="button"
              >
                <LinearGradient
                  colors={GRADIENTS.gift}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.dropButtonGradient}
                >
                  <Text style={styles.dropButtonText}>
                    {isSubmitting ? 'DROPPING...' : 'YAYINLA 🔥'}
                  </Text>
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
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stepIndicatorContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mediaStepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepTitle: {
    fontSize: FONT_SIZES_V2.h2,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES_V2.bodySmall,
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
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 16,
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
    fontSize: FONT_SIZES_V2.h3,
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
    fontSize: FONT_SIZES_V2.bodySmall,
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
  dropButton: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    // Neon glow effect
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  dropButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
  dropButtonText: {
    color: 'white',
    fontSize: FONT_SIZES_V2.bodyLarge,
    fontFamily: FONTS.body.bold,
    fontWeight: 'bold',
  },
});

export default withErrorBoundary(CreateMomentScreen);

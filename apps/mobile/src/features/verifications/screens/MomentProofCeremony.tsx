/**
 * MomentProofCeremony - Kanıt Yükleme Seremonisi
 *
 * MASTER Revizyonu: UploadPhotoScreen.tsx yerine.
 * Alıcının (Host) parayı hak etmesi için kanıt yüklemesi.
 *
 * Cerrahi Müdahale:
 * - Kategori Bazlı Kamera Modu (Yemek = AI Food Mode vb.)
 * - PayTR Trigger: Kanıt yüklenince escrowService'e Capture sinyali
 * - "Anı mühürlendi mi?" sorusu (eski: "Seyahat bitti mi?")
 *
 * @module screens/MomentProofCeremony
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { Card as GlassCard } from '@/components/ui/Card';
import { LoadingState } from '@/components/LoadingState';
import { launchCamera } from '@/utils/cameraConfig';
import { uploadFile } from '@/services/supabaseStorageService';
import { escrowService } from '@/services/escrowService';
import { supabase } from '@/config/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Camera mode configurations based on moment category
const CAMERA_MODES: Record<
  string,
  {
    title: string;
    icon: IconName;
    tips: string[];
    aiMode: string;
    color: string;
  }
> = {
  food: {
    title: 'Yemek Fotoğrafı Modu',
    icon: 'food',
    tips: [
      'Yemeği üstten veya 45° açıyla çekin',
      'Doğal ışık tercih edin',
      'Tabağın tamamını kadrajlayın',
    ],
    aiMode: 'food_recognition',
    color: '#F59E0B',
  },
  landscape: {
    title: 'Manzara Modu',
    icon: 'image-filter-hdr',
    tips: [
      'Ufuk çizgisini düz tutun',
      'Altın saat ışığı ideal',
      'Geniş açı tercih edin',
    ],
    aiMode: 'landscape_verification',
    color: '#06B6D4',
  },
  selfie: {
    title: 'Deneyim Selfie',
    icon: 'account-box',
    tips: [
      'Yüzünüz net görünsün',
      'Arkadaki anı dahil edin',
      'Doğal gülümseyin',
    ],
    aiMode: 'face_location_match',
    color: '#EC4899',
  },
  product: {
    title: 'Ürün Fotoğrafı',
    icon: 'shopping',
    tips: [
      'Ürün etiketini gösterin',
      'İyi aydınlatma kullanın',
      'Detayları net çekin',
    ],
    aiMode: 'product_verification',
    color: '#8B5CF6',
  },
  default: {
    title: 'Kanıt Fotoğrafı',
    icon: 'camera',
    tips: ['Net ve aydınlık çekin', 'Konumu gösterin', 'Anıyı yansıtın'],
    aiMode: 'general_verification',
    color: '#10B981',
  },
};

// Category to camera mode mapping
const CATEGORY_TO_MODE: Record<string, string> = {
  gastronomy: 'food',
  dining: 'food',
  cafe: 'food',
  restaurant: 'food',
  travel: 'landscape',
  adventure: 'landscape',
  nature: 'landscape',
  shopping: 'product',
  retail: 'product',
  experience: 'selfie',
  wellness: 'selfie',
  entertainment: 'selfie',
};

type MomentProofParams = {
  MomentProofCeremony: {
    escrowId: string;
    giftId: string;
    momentId: string;
    momentTitle: string;
    momentCategory?: string;
    senderId: string;
    senderName: string;
    amount: number;
  };
};

// Step indicator component
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({
  currentStep,
  totalSteps,
}) => (
  <View style={styles.stepIndicator}>
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        style={[
          styles.stepDot,
          index <= currentStep && styles.stepDotActive,
          index < currentStep && styles.stepDotCompleted,
        ]}
      />
    ))}
  </View>
);

export const MomentProofCeremony: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<MomentProofParams, 'MomentProofCeremony'>>();
  const { user } = useAuth();
  const { showToast } = useToast();

  const {
    escrowId,
    giftId,
    momentId,
    momentTitle,
    momentCategory,
    senderId,
    senderName,
    amount,
  } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // isSealed state removed - ceremony completion tracked via escrowService

  // Determine camera mode based on category
  const cameraMode = useMemo(() => {
    const modeKey = momentCategory
      ? CATEGORY_TO_MODE[momentCategory.toLowerCase()] || 'default'
      : 'default';
    return CAMERA_MODES[modeKey];
  }, [momentCategory]);

  // Animation values
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  // Get current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          logger.warn('[MomentProof] Location permission denied');
          return;
        }

        const locationResult = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync({
          latitude: locationResult.coords.latitude,
          longitude: locationResult.coords.longitude,
        });

        const locationName = address
          ? `${address.street || ''}, ${address.city || ''}`
          : 'Current Location';

        setLocation({
          lat: locationResult.coords.latitude,
          lng: locationResult.coords.longitude,
          name: locationName.trim(),
        });
      } catch (error) {
        logger.error('[MomentProof] Location error:', error);
      }
    };

    getLocation();
  }, []);

  // Handle camera capture with category-specific mode
  const handleCameraCapture = useCallback(async () => {
    if (photos.length >= 3) {
      showToast('En fazla 3 fotoğraf ekleyebilirsiniz', 'info');
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Launch camera with PROOF_PHOTO config
      const asset = await launchCamera('PROOF_PHOTO');

      if (asset?.uri) {
        setPhotos((prev) => [...prev, asset.uri]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Auto-advance to next step after first photo
        if (photos.length === 0) {
          setTimeout(() => setCurrentStep(1), 500);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        showAlert({
          title: 'Kamera İzni Gerekli',
          message: 'Kanıt fotoğrafı çekmek için kamera iznine ihtiyacımız var.',
          buttons: [{ text: 'Tamam' }],
        });
      } else {
        showToast('Fotoğraf çekilemedi', 'error');
      }
    }
  }, [photos.length, showToast]);

  // Remove photo
  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit proof and trigger PayTR capture
  const handleSealMoment = async () => {
    if (!user?.id || photos.length === 0) {
      showToast('En az bir fotoğraf gerekli', 'error');
      return;
    }

    setIsUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      // 1. Upload photos to storage
      const uploadedUrls: string[] = [];
      for (const photoUri of photos) {
        const result = await uploadFile('proofs', photoUri, user.id);
        if (result.error) {
          throw new Error(`Fotoğraf yüklenemedi: ${result.error.message}`);
        }
        if (result.url) {
          uploadedUrls.push(result.url);
        }
      }

      // 2. Create proof record
      const { error: proofError } = await supabase
        .from('proof_verifications')
        .insert({
          user_id: user.id,
          moment_id: momentId,
          photo_urls: uploadedUrls,
          location: location,
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
          video_url: uploadedUrls[0] || '',
          claimed_location: location?.name || '',
          ai_verified: false,
          confidence_score: 0,
          camera_mode: cameraMode.aiMode,
        } as any);

      if (proofError) {
        throw new Error(`Kanıt kaydedilemedi: ${proofError.message}`);
      }

      // 3. Update escrow status
      await supabase
        .from('escrow_transactions')
        .update({
          proof_submitted: true,
          proof_verification_date: new Date().toISOString(),
        })
        .eq('id', escrowId);

      // 4. CRITICAL: Trigger PayTR Capture signal
      // This releases the funds to the recipient's sub-merchant account
      try {
        const releaseResult = await escrowService.releaseEscrow(escrowId);
        if (!releaseResult.success) {
          logger.warn(
            '[MomentProof] Escrow release returned false, may need manual review',
          );
        }
      } catch (escrowError) {
        // Log but don't fail - proof is submitted, release can be retried
        logger.error('[MomentProof] Escrow release error:', escrowError);
      }

      // 5. Send notification to gift sender
      await supabase.from('notifications').insert({
        user_id: senderId,
        type: 'proof_submitted',
        title: 'Anı Kanıtlandı! 📸',
        body: `${momentTitle} için kanıt yüklendi. İnceleyin!`,
        data: {
          escrow_id: escrowId,
          gift_id: giftId,
          moment_id: momentId,
        },
      });

      // Success - ceremony completed!
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to success after animation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Success',
              params: {
                type: 'proof_uploaded',
                title: 'Anı Mühürlendi! 🎉',
                subtitle: `${senderName} bilgilendirildi ve ödeme onay sürecinde.`,
              },
            },
          ],
        });
      }, 2000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Kanıt yüklenirken hata oluştu';
      showToast(message, 'error');
      logger.error('[MomentProof] Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isUploading) {
    return (
      <LoadingState
        type="overlay"
        message="Anı mühürleniyor... PayTR'a sinyal gönderiliyor"
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#16213E']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kanıt Yükle</Text>
          <View style={styles.headerSpacer} />
        </View>

        <StepIndicator currentStep={currentStep} totalSteps={3} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Moment Info Card */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard intensity={15} style={styles.momentInfoCard}>
              <View style={styles.momentInfoRow}>
                <MaterialCommunityIcons
                  name="gift"
                  size={24}
                  color={COLORS.brand.primary}
                />
                <View style={styles.momentInfoText}>
                  <Text style={styles.momentTitle} numberOfLines={1}>
                    {momentTitle}
                  </Text>
                  <Text style={styles.momentMeta}>
                    {senderName} tarafından • ₺{amount}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Camera Mode Indicator */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard
              intensity={10}
              style={{
                ...styles.cameraModeCard,
                borderColor: cameraMode.color + '50',
              }}
            >
              <View
                style={[
                  styles.cameraModeIcon,
                  { backgroundColor: cameraMode.color + '20' },
                ]}
              >
                <MaterialCommunityIcons
                  name={cameraMode.icon}
                  size={28}
                  color={cameraMode.color}
                />
              </View>
              <View style={styles.cameraModeInfo}>
                <Text
                  style={[styles.cameraModeTitle, { color: cameraMode.color }]}
                >
                  {cameraMode.title}
                </Text>
                <Text style={styles.cameraModeTips}>{cameraMode.tips[0]}</Text>
              </View>
              {momentCategory && (
                <View
                  style={[
                    styles.aiModeBadge,
                    { backgroundColor: cameraMode.color },
                  ]}
                >
                  <Text style={styles.aiModeText}>AI</Text>
                </View>
              )}
            </GlassCard>
          </Animated.View>

          {/* Photo Gallery */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={styles.photoSection}
          >
            <Text style={styles.sectionTitle}>Kanıt Fotoğrafları</Text>

            <View style={styles.photoGrid}>
              {/* Existing photos */}
              {photos.map((uri, index) => (
                <Animated.View
                  key={uri}
                  entering={SlideInRight.delay(index * 100)}
                  style={styles.photoWrapper}
                >
                  <Image source={{ uri }} style={styles.photoImage} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={24}
                      color="#EF4444"
                    />
                  </TouchableOpacity>
                </Animated.View>
              ))}

              {/* Add photo button */}
              {photos.length < 3 && (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handleCameraCapture}
                  activeOpacity={0.8}
                >
                  <Animated.View style={pulseStyle}>
                    <LinearGradient
                      colors={[
                        cameraMode.color + '30',
                        cameraMode.color + '10',
                      ]}
                      style={styles.addPhotoGradient}
                    >
                      <MaterialCommunityIcons
                        name="camera-plus"
                        size={32}
                        color={cameraMode.color}
                      />
                      <Text
                        style={[
                          styles.addPhotoText,
                          { color: cameraMode.color },
                        ]}
                      >
                        {photos.length === 0 ? 'Fotoğraf Çek' : 'Ekle'}
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Location Info */}
          {location && (
            <Animated.View entering={FadeIn.delay(400)}>
              <GlassCard intensity={10} style={styles.locationCard}>
                <MaterialCommunityIcons
                  name="map-marker-check"
                  size={20}
                  color="#10B981"
                />
                <Text style={styles.locationText}>{location.name}</Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* Master Question: "Anı mühürlendi mi?" */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={styles.sealSection}
          >
            <Text style={styles.sealQuestion}>Anı mühürlendi mi?</Text>
            <Text style={styles.sealDescription}>
              Bu düğmeye bastığınızda, hediye tutarı PayTR tarafından
              onaylanacak ve hesabınıza aktarılacaktır.
            </Text>

            <TouchableOpacity
              style={[
                styles.sealButton,
                photos.length === 0 && styles.sealButtonDisabled,
              ]}
              onPress={handleSealMoment}
              disabled={photos.length === 0}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  photos.length > 0
                    ? ['#10B981', '#059669']
                    : ['#64748B', '#475569']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sealButtonGradient}
              >
                <MaterialCommunityIcons name="seal" size={24} color="#FFFFFF" />
                <Text style={styles.sealButtonText}>Anıyı Mühürle</Text>
              </LinearGradient>
            </TouchableOpacity>

            {photos.length === 0 && (
              <Text style={styles.warningText}>En az 1 fotoğraf yükleyin</Text>
            )}
          </Animated.View>
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
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: '#DFFF00',
    width: 24,
  },
  stepDotCompleted: {
    backgroundColor: '#10B981',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  momentInfoCard: {
    borderRadius: 16,
    padding: 16,
  },
  momentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  momentInfoText: {
    flex: 1,
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  momentMeta: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cameraModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  cameraModeIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraModeInfo: {
    flex: 1,
  },
  cameraModeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  cameraModeTips: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  aiModeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiModeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  photoSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoWrapper: {
    width: (SCREEN_WIDTH - 64) / 3,
    height: (SCREEN_WIDTH - 64) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: (SCREEN_WIDTH - 64) / 3,
    height: (SCREEN_WIDTH - 64) / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addPhotoGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  sealSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  sealQuestion: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sealDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sealButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sealButtonDisabled: {
    opacity: 0.6,
  },
  sealButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  sealButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  warningText: {
    fontSize: 13,
    color: '#F59E0B',
    marginTop: 12,
  },
});

export default MomentProofCeremony;

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proofSchema, type ProofInput } from '../../../utils/forms/schemas';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import { logger } from '@/utils/logger';
import { launchCamera } from '@/utils/cameraConfig';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import { supabase } from '@/config/supabase';
import { uploadFile } from '@/services/supabaseStorageService';
import { useAuth } from '@/context/AuthContext';

type IconName = React.ComponentProps<typeof Icon>['name'];
type ProofStep = 'type' | 'upload' | 'details' | 'verify';
type ProofType = 'micro-kindness' | 'verified-experience' | 'community-proof';

// ProofUpload interface for future implementation
export interface ProofUpload {
  type: ProofType;
  photos: string[];
  ticket?: string;
  location?: { lat: number; lng: number; name: string };
  title: string;
  description: string;
  amount?: number;
  receiver?: string;
}

const PROOF_TYPES: {
  id: string;
  name: string;
  icon: IconName;
  color: string;
  description: string;
}[] = [
  {
    id: 'micro-kindness',
    name: 'Micro Kindness',
    icon: 'hand-heart',
    color: COLORS.brand.primary,
    description:
      'Small acts of kindness like buying coffee or giving directions',
  },
  {
    id: 'verified-experience',
    name: 'Verified Experience',
    icon: 'check-decagram',
    color: COLORS.feedback.success,
    description: 'Share your authentic experiences at places you visited',
  },
  {
    id: 'community-proof',
    name: 'Community Proof',
    icon: 'account-group',
    color: COLORS.brand.accent,
    description: 'Group activities, volunteering, or community events',
  },
];

type ProofFlowScreenProps = StackScreenProps<RootStackParamList, 'ProofFlow'>;

export const ProofFlowScreen: React.FC<ProofFlowScreenProps> = ({
  navigation,
  route,
}) => {
  const { showToast } = useToast();
  const { showConfirmation: _showConfirmation } = useConfirmation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<ProofStep>('type');
  const [loading, setLoading] = useState(false);

  // Get escrow/gift context from route params
  const {
    escrowId,
    giftId,
    momentId,
    momentTitle: _routeMomentTitle,
    senderId,
  } = route.params || {};

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<ProofInput>({
    resolver: zodResolver(proofSchema),
    mode: 'onChange',
    defaultValues: {
      type: undefined,
      photos: [],
      title: '',
      description: '',
      ticket: '',
      location: null,
      amount: undefined,
      receiver: '',
    },
  });

  const proofType = watch('type');
  const photos = watch('photos');
  const title = watch('title');
  const description = watch('description');
  const location = watch('location');
  const amount = watch('amount');

  const handleSelectType = (type: ProofType) => {
    setValue('type', type);
    setCurrentStep('upload');
  };

  const handleCameraCapture = useCallback(async () => {
    try {
      // Use PROOF_PHOTO config for maximum quality verification photos
      const asset = await launchCamera('PROOF_PHOTO');
      if (asset) {
        setValue('photos', [...photos, asset.uri]);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        Alert.alert(
          'Permission Required',
          'Camera permission is needed to take photos',
        );
      } else {
        showToast('Failed to capture photo', 'error');
      }
    }
  }, [photos, setValue, showToast]);

  const handleAddPhoto = useCallback(() => {
    // If max photos reached, show warning
    if (photos.length >= 3) {
      showToast('En fazla 3 fotoğraf ekleyebilirsiniz', 'info');
      return;
    }

    // Show security explanation on first use
    if (photos.length === 0) {
      Alert.alert(
        '📸 Anlık Fotoğraf Gerekli',
        'Güvenlik nedeniyle kanıt fotoğrafları sadece kamera ile çekilebilir. Galeriden seçim yapılamaz.',
        [
          { text: 'Anladım', onPress: () => void handleCameraCapture() },
          { text: 'Vazgeç', style: 'cancel' },
        ],
      );
    } else {
      // Direct camera launch for subsequent photos
      void handleCameraCapture();
    }
  }, [handleCameraCapture, photos.length, showToast]);

  const handleAddTicket = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setValue('ticket', asset.uri);
        logger.info('Ticket added', { uri: asset.uri });
      }
    } catch (error) {
      logger.error('Error picking document', error as Error);
      showToast('Failed to pick document', 'error');
    }
  };

  const handleSelectLocation = () => {
    const getCurrentLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Location permission is needed', 'info');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        const locationName = address
          ? `${address.street || ''} ${address.city || ''}, ${
              address.country || ''
            }`.trim()
          : 'Current Location';

        setValue('location', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          name: locationName,
        });

        Alert.alert('Location Set', locationName);
      } catch {
        showToast('Could not get current location', 'error');
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Use Current Location', 'Enter Manually'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) getCurrentLocation();
          if (buttonIndex === 2) {
            Alert.prompt('Enter Location', 'Type the location name', (text) => {
              if (text) {
                setValue('location', { lat: 0, lng: 0, name: text });
              }
            });
          }
        },
      );
    } else {
      Alert.alert('Select Location', 'Choose location option', [
        { text: 'Use Current Location', onPress: getCurrentLocation },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleNext = () => {
    if (currentStep === 'upload') {
      if (!photos || photos.length === 0) {
        showToast('Please add at least one photo as proof', 'info');
        return;
      }
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      if (!title || title.trim() === '') {
        showToast('Please add a title for your proof', 'info');
        return;
      }
      setCurrentStep('verify');
    }
  };

  const handleRemovePhoto = (photoUri: string) => {
    setValue(
      'photos',
      photos.filter((p) => p !== photoUri),
    );
  };

  const onSubmit = async (data: ProofInput) => {
    if (!user?.id) {
      showToast('Lütfen giriş yapın', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Upload all photos to Supabase Storage
      const uploadedPhotoUrls: string[] = [];
      for (const photoUri of data.photos) {
        const result = await uploadFile('proofs', photoUri, user.id);
        if (result.error) {
          throw new Error(`Fotoğraf yüklenemedi: ${result.error.message}`);
        }
        if (result.url) {
          uploadedPhotoUrls.push(result.url);
        }
      }

      // 2. Upload ticket if exists
      let ticketUrl: string | null = null;
      if (data.ticket) {
        const ticketResult = await uploadFile('proofs', data.ticket, user.id, {
          fileName: `${user.id}/ticket-${Date.now()}.pdf`,
        });
        if (ticketResult.url) {
          ticketUrl = ticketResult.url;
        }
      }

      // 3. Create proof_verifications record
      // NOTE: The actual table schema may differ from generated TypeScript types
      // This uses runtime insertion - schema validation happens at database level
      const proofInsertData = {
        user_id: user.id,
        moment_id: momentId || '',
        photo_urls: uploadedPhotoUrls,
        ticket_url: ticketUrl,
        location: data.location
          ? {
              lat: data.location.lat,
              lng: data.location.lng,
              name: data.location.name,
            }
          : null,
        title: data.title,
        description: data.description,
        proof_type: data.type,
        status: 'pending_review',
        submitted_at: new Date().toISOString(),
        // Required fields for AI verification (will be updated later)
        video_url: uploadedPhotoUrls[0] || '',
        claimed_location: data.location?.name || '',
        ai_verified: false,
        confidence_score: 0,
      };

      const { data: proofRecord, error: proofError } = await supabase
        .from('proof_verifications')
        .insert(proofInsertData as Record<string, unknown>)
        .select('id')
        .single();

      if (proofError) {
        throw new Error(`Kanıt kaydedilemedi: ${proofError.message}`);
      }

      // 4. Update escrow_transactions if escrowId exists
      if (escrowId) {
        const { error: escrowError } = await supabase
          .from('escrow_transactions')
          .update({
            proof_submitted: true,
            proof_verification_date: new Date().toISOString(),
          })
          .eq('id', escrowId);

        if (escrowError) {
          logger.warn('Failed to update escrow', escrowError);
        }
      }

      // 5. Send notification to the gift sender
      if (senderId) {
        const { error: notifError } = await supabase
          .from('notifications')
          .insert({
            user_id: senderId,
            type: 'proof_submitted',
            title: 'Kanıt yüklendi! 📸',
            body: `Hediyeniz için kanıt yüklendi. Onayınız bekleniyor.`,
            data: {
              proof_id: proofRecord?.id,
              escrow_id: escrowId,
              gift_id: giftId,
            },
          });

        if (notifError) {
          logger.warn('Failed to send notification', notifError);
        }
      }

      // 6. Navigate to success
      setLoading(false);
      navigation.navigate('Success', { type: 'proof_uploaded' });
    } catch (error) {
      setLoading(false);
      const message =
        error instanceof Error
          ? error.message
          : 'Kanıt yüklenirken hata oluştu';
      showToast(message, 'error');
      logger.error('Proof upload failed', error as Error);
    }
  };

  const renderTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Choose Proof Type</Text>
      <Text style={styles.stepSubtitle}>
        Select the type of gesture you want to verify
      </Text>

      <View style={styles.typesContainer}>
        {PROOF_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={styles.typeCard}
            onPress={() => handleSelectType(type.id as ProofType)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[type.color, type.color + '80']}
              style={styles.typeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name={type.icon} size={48} color={COLORS.utility.white} />
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderUploadStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Upload Evidence</Text>
      <Text style={styles.stepSubtitle}>
        Add photos, tickets, or location to verify your gesture
      </Text>

      {/* Photos */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionLabel}>Photos (Required)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
          >
            <Icon name="camera-plus" size={32} color={COLORS.brand.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
          {photos?.map((photo) => (
            <View key={photo} style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => handleRemovePhoto(photo)}
              >
                <Icon
                  name="close-circle"
                  size={24}
                  color={COLORS.feedback.error}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
        {errors.photos && (
          <Text style={styles.errorText}>{errors.photos.message}</Text>
        )}
      </View>

      {/* Ticket/Receipt */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionLabel}>Ticket/Receipt (Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleAddTicket}>
          <Icon name="receipt" size={24} color={COLORS.brand.primary} />
          <Text style={styles.uploadButtonText}>Upload Ticket</Text>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.uploadSection}>
        <Text style={styles.sectionLabel}>Location</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleSelectLocation}
        >
          <Icon name="map-marker" size={24} color={COLORS.brand.primary} />
          <Text style={styles.uploadButtonText}>
            {location ? location.name : 'Add Location'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={[COLORS.brand.primary, COLORS.brand.accent]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Next</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderDetailsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Details</Text>
      <Text style={styles.stepSubtitle}>
        Describe your gesture to help others understand
      </Text>

      {/* Title */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Title *</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="e.g., Coffee for a stranger"
              placeholderTextColor={COLORS.text.secondary}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.title && (
          <Text style={styles.errorText}>{errors.title.message}</Text>
        )}
      </View>

      {/* Description */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Description *</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share the story behind your gesture..."
              placeholderTextColor={COLORS.text.secondary}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              multiline
              numberOfLines={4}
            />
          )}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description.message}</Text>
        )}
      </View>

      {/* Amount (for micro-kindness) */}
      {proofType === 'micro-kindness' && (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount (Optional)</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currency}>$</Text>
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.amountValue]}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.text.secondary}
                  keyboardType="decimal-pad"
                  value={value?.toString() || ''}
                  onChangeText={(text) =>
                    onChange(parseFloat(text) || undefined)
                  }
                />
              )}
            />
          </View>
        </View>
      )}

      {/* Receiver */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Receiver (Optional)</Text>
        <Controller
          control={control}
          name="receiver"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Name or username of the receiver"
              placeholderTextColor={COLORS.text.secondary}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={[COLORS.brand.primary, COLORS.brand.accent]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Review</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderVerifyStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>
        Check your proof before submitting for verification
      </Text>

      <View style={styles.reviewCard}>
        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Type</Text>
          <Text style={styles.reviewValue}>
            {PROOF_TYPES.find((t) => t.id === proofType)?.name}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Title</Text>
          <Text style={styles.reviewValue}>{title}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Description</Text>
          <Text style={styles.reviewValue}>{description}</Text>
        </View>

        {location && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Location</Text>
            <Text style={styles.reviewValue}>{location.name}</Text>
          </View>
        )}

        {amount && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Amount</Text>
            <Text style={styles.reviewValue}>${amount}</Text>
          </View>
        )}

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Photos</Text>
          <Text style={styles.reviewValue}>{photos?.length || 0} photos</Text>
        </View>
      </View>

      <View style={styles.verificationNote}>
        <Icon name="information" size={20} color={COLORS.feedback.info} />
        <Text style={styles.verificationText}>
          Your proof will be verified using AI and blockchain technology. This
          process usually takes 2-5 minutes.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          (loading || !isValid) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={loading || !isValid}
      >
        <LinearGradient
          colors={[COLORS.brand.primary, COLORS.brand.accent]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Uploading Proof...' : 'Submit Proof'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      {!loading && (
        <Text style={styles.uploadHint}>
          This may take a moment to upload your photos. Please don't close the
          screen.
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && (
        <>
          <LoadingState type="overlay" message="Uploading your proof..." />
          <View style={styles.loadingWarning}>
            <Text style={styles.loadingWarningText}>
              Please don't close the screen while uploading.
            </Text>
          </View>
        </>
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep === 'type') {
              navigation.goBack();
            } else {
              const steps: ProofStep[] = [
                'type',
                'upload',
                'details',
                'verify',
              ];
              const currentIndex = steps.indexOf(currentStep);
              setCurrentStep(steps[currentIndex - 1]);
            }
          }}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Proof</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {['type', 'upload', 'details', 'verify'].map((step) => (
          <View
            key={step}
            style={[
              styles.progressStep,
              currentStep === step && styles.activeProgressStep,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'type' && renderTypeSelection()}
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'verify' && renderVerifyStep()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeProgressStep: {
    backgroundColor: COLORS.brand.primary,
  },
  addPhotoButton: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
    borderRadius: VALUES.borderRadius,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 120,
    justifyContent: 'center',
    marginRight: LAYOUT.padding,
    width: 120,
  },
  addPhotoText: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: LAYOUT.padding / 2,
  },
  amountInput: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  amountValue: {
    flex: 1,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  buttonGradient: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  buttonText: {
    color: COLORS.utility.white,
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.bg.primary,
    flex: 1,
  },
  currency: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginRight: LAYOUT.padding,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '500',
    padding: LAYOUT.padding * 1.5,
  },
  inputLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: LAYOUT.padding,
  },
  inputSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  nextButton: {
    borderRadius: VALUES.borderRadius,
    marginTop: LAYOUT.padding * 2,
    overflow: 'hidden',
  },
  photoImage: {
    borderRadius: VALUES.borderRadius,
    height: '100%',
    width: '100%',
  },
  photoPreview: {
    height: 120,
    marginRight: LAYOUT.padding,
    position: 'relative',
    width: 120,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  progressStep: {
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    flex: 1,
    height: 4,
    marginHorizontal: LAYOUT.padding / 4,
  },
  removePhoto: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    position: 'absolute',
    right: -8,
    top: -8,
  },
  reviewCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 2,
    ...VALUES.shadow,
  },
  reviewLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: LAYOUT.padding / 2,
  },
  reviewSection: {
    marginBottom: LAYOUT.padding * 1.5,
  },
  reviewValue: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 4,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  scrollView: {
    flex: 1,
  },
  sectionLabel: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: LAYOUT.padding,
  },
  stepContainer: {
    flex: 1,
  },
  stepSubtitle: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: LAYOUT.padding * 3,
  },
  stepTitle: {
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
  },
  submitButton: {
    borderRadius: VALUES.borderRadius,
    marginTop: LAYOUT.padding * 2,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  typeCard: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    ...VALUES.shadow,
  },
  typeDescription: {
    color: COLORS.utility.white,
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.9,
    textAlign: 'center',
  },
  typeGradient: {
    alignItems: 'center',
    padding: LAYOUT.padding * 2,
  },
  typeName: {
    color: COLORS.utility.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 2,
    marginTop: LAYOUT.padding,
  },
  typesContainer: {
    gap: LAYOUT.padding * 1.5,
  },
  uploadButton: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    flexDirection: 'row',
    padding: LAYOUT.padding * 1.5,
  },
  uploadButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: LAYOUT.padding,
  },
  uploadSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  verificationNote: {
    backgroundColor: COLORS.feedback.info + '20',
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginTop: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 1.5,
  },
  verificationText: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginLeft: LAYOUT.padding,
  },
  closeButton: {
    padding: 8,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  uploadHint: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  loadingWarning: {
    position: 'absolute',
    bottom: 40,
    left: LAYOUT.padding * 2,
    right: LAYOUT.padding * 2,
    backgroundColor: COLORS.feedback.warning + '20',
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    borderWidth: 1,
    borderColor: COLORS.feedback.warning,
    zIndex: 1000,
  },
  loadingWarningText: {
    fontSize: 13,
    color: COLORS.feedback.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
});

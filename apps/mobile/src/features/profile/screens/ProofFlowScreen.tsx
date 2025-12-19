import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image, // eslint-disable-next-line react-native/split-platform-components
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { proofSchema, type ProofInput } from '../../../utils/forms/schemas';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import { logger } from '@/utils/logger';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

type IconName = React.ComponentProps<typeof Icon>['name'];
type ProofStep = 'type' | 'upload' | 'details' | 'verify';
type ProofType = 'micro-kindness' | 'verified-experience' | 'community-proof';

interface _ProofUpload {
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
    color: COLORS.primary,
    description:
      'Small acts of kindness like buying coffee or giving directions',
  },
  {
    id: 'verified-experience',
    name: 'Verified Experience',
    icon: 'check-decagram',
    color: COLORS.success,
    description: 'Share your authentic experiences at places you visited',
  },
  {
    id: 'community-proof',
    name: 'Community Proof',
    icon: 'account-group',
    color: COLORS.accent,
    description: 'Group activities, volunteering, or community events',
  },
];

type ProofFlowScreenProps = StackScreenProps<RootStackParamList, 'ProofFlow'>;

export const ProofFlowScreen: React.FC<ProofFlowScreenProps> = ({
  navigation,
}) => {
  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();
  const [currentStep, setCurrentStep] = useState<ProofStep>('type');
  const [loading, setLoading] = useState(false);

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

  const handleAddPhoto = () => {
    const showPicker = async (useCamera: boolean) => {
      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Camera permission is needed to take photos',
          );
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Gallery permission is needed to select photos',
          );
          return;
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setValue('photos', [...photos, result.assets[0].uri]);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) showPicker(true);
          if (buttonIndex === 2) showPicker(false);
        },
      );
    } else {
      Alert.alert('Add Photo', 'Select proof photo', [
        { text: 'Take Photo', onPress: () => showPicker(true) },
        { text: 'Choose from Gallery', onPress: () => showPicker(false) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleAddTicket = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset) {
          setValue('ticket', asset.uri);
          logger.info('Ticket added', { uri: asset.uri });
        }
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
      } catch (error) {
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

  const onSubmit = (data: ProofInput) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Success', { type: 'proof_uploaded' });
    }, 2000);
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
              <Icon name={type.icon} size={48} color={COLORS.white} />
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
            <Icon name="camera-plus" size={32} color={COLORS.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
          {photos?.map((photo) => (
            <View key={photo} style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => handleRemovePhoto(photo)}
              >
                <Icon name="close-circle" size={24} color={COLORS.error} />
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
          <Icon name="receipt" size={24} color={COLORS.primary} />
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
          <Icon name="map-marker" size={24} color={COLORS.primary} />
          <Text style={styles.uploadButtonText}>
            {location ? location.name : 'Add Location'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
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
              placeholderTextColor={COLORS.textSecondary}
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
              placeholderTextColor={COLORS.textSecondary}
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
                  placeholderTextColor={COLORS.textSecondary}
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
              placeholderTextColor={COLORS.textSecondary}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
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
        <Icon name="information" size={20} color={COLORS.info} />
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
          colors={[COLORS.primary, COLORS.accent]}
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
              const prevStep = steps[currentIndex - 1];
              if (prevStep) {
                setCurrentStep(prevStep);
              }
            }
          }}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Proof</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color={COLORS.textSecondary} />
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
    backgroundColor: COLORS.primary,
  },
  addPhotoButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 120,
    justifyContent: 'center',
    marginRight: LAYOUT.padding,
    width: 120,
  },
  addPhotoText: {
    color: COLORS.primary,
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
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  currency: {
    color: COLORS.text,
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
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
    padding: LAYOUT.padding * 1.5,
  },
  inputLabel: {
    color: COLORS.text,
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
    backgroundColor: COLORS.border,
    borderRadius: 2,
    flex: 1,
    height: 4,
    marginHorizontal: LAYOUT.padding / 4,
  },
  removePhoto: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    position: 'absolute',
    right: -8,
    top: -8,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 2,
    ...VALUES.shadow,
  },
  reviewLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: LAYOUT.padding / 2,
  },
  reviewSection: {
    marginBottom: LAYOUT.padding * 1.5,
  },
  reviewValue: {
    color: COLORS.text,
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
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: LAYOUT.padding,
  },
  stepContainer: {
    flex: 1,
  },
  stepSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: LAYOUT.padding * 3,
  },
  stepTitle: {
    color: COLORS.text,
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
    color: COLORS.white,
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
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    flexDirection: 'row',
    padding: LAYOUT.padding * 1.5,
  },
  uploadButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: LAYOUT.padding,
  },
  uploadSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  verificationNote: {
    backgroundColor: COLORS.info + '20',
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginTop: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 1.5,
  },
  verificationText: {
    color: COLORS.text,
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
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  uploadHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  loadingWarning: {
    position: 'absolute',
    bottom: 40,
    left: LAYOUT.padding * 2,
    right: LAYOUT.padding * 2,
    backgroundColor: COLORS.warning + '20',
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    borderWidth: 1,
    borderColor: COLORS.warning,
    zIndex: 1000,
  },
  loadingWarningText: {
    fontSize: 13,
    color: COLORS.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
});

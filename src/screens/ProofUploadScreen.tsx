import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

type ProofStep = 'type' | 'upload' | 'details' | 'verify';

interface ProofUpload {
  type: 'micro-kindness' | 'verified-experience' | 'community-proof';
  photos: string[];
  ticket?: string;
  location?: { lat: number; lng: number; name: string };
  title: string;
  description: string;
  amount?: number;
  receiver?: string;
}

const PROOF_TYPES = [
  {
    id: 'micro-kindness',
    name: 'Micro Kindness',
    icon: 'hand-heart',
    color: COLORS.primary,
    description: 'Small acts of kindness like buying coffee or giving directions',
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

export const ProofUploadScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<ProofStep>('type');
  const [proof, setProof] = useState<Partial<ProofUpload>>({
    photos: [],
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSelectType = (type: string) => {
    setProof({ ...proof, type: type as any });
    setCurrentStep('upload');
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Photo', 'Image picker implementation needed');
    // Implement image picker
  };

  const handleAddTicket = () => {
    Alert.alert('Add Ticket', 'Document picker implementation needed');
    // Implement document picker
  };

  const handleSelectLocation = () => {
    Alert.alert('Select Location', 'Map picker implementation needed');
    // Navigate to location picker
  };

  const handleNext = () => {
    if (currentStep === 'upload') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      setCurrentStep('verify');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('PostProofSuccess', { proofId: '123' });
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
            onPress={() => handleSelectType(type.id)}
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
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Icon name="camera-plus" size={32} color={COLORS.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
          {proof.photos?.map((photo, index) => (
            <View key={index} style={styles.photoPreview}>
              <Image source={{ uri: photo }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhoto}>
                <Icon name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
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
        <TouchableOpacity style={styles.uploadButton} onPress={handleSelectLocation}>
          <Icon name="map-marker" size={24} color={COLORS.primary} />
          <Text style={styles.uploadButtonText}>
            {proof.location ? proof.location.name : 'Add Location'}
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
        <TextInput
          style={styles.input}
          placeholder="e.g., Coffee for a stranger"
          placeholderTextColor={COLORS.textSecondary}
          value={proof.title}
          onChangeText={(text) => setProof({ ...proof, title: text })}
        />
      </View>

      {/* Description */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share the story behind your gesture..."
          placeholderTextColor={COLORS.textSecondary}
          value={proof.description}
          onChangeText={(text) => setProof({ ...proof, description: text })}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Amount (for micro-kindness) */}
      {proof.type === 'micro-kindness' && (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount (Optional)</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={[styles.input, styles.amountValue]}
              placeholder="0.00"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="decimal-pad"
              value={proof.amount?.toString()}
              onChangeText={(text) => setProof({ ...proof, amount: parseFloat(text) })}
            />
          </View>
        </View>
      )}

      {/* Receiver */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Receiver (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Name or username of the receiver"
          placeholderTextColor={COLORS.textSecondary}
          value={proof.receiver}
          onChangeText={(text) => setProof({ ...proof, receiver: text })}
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
            {PROOF_TYPES.find((t) => t.id === proof.type)?.name}
          </Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Title</Text>
          <Text style={styles.reviewValue}>{proof.title}</Text>
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Description</Text>
          <Text style={styles.reviewValue}>{proof.description}</Text>
        </View>

        {proof.location && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Location</Text>
            <Text style={styles.reviewValue}>{proof.location.name}</Text>
          </View>
        )}

        {proof.amount && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewLabel}>Amount</Text>
            <Text style={styles.reviewValue}>${proof.amount}</Text>
          </View>
        )}

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Photos</Text>
          <Text style={styles.reviewValue}>{proof.photos?.length || 0} photos</Text>
        </View>
      </View>

      <View style={styles.verificationNote}>
        <Icon name="information" size={20} color={COLORS.info} />
        <Text style={styles.verificationText}>
          Your proof will be verified using AI and blockchain technology. This process
          usually takes 2-5 minutes.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <Text style={styles.buttonText}>Submitting...</Text>
          ) : (
            <Text style={styles.buttonText}>Submit Proof</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep === 'type') {
              navigation.goBack();
            } else {
              const steps: ProofStep[] = ['type', 'upload', 'details', 'verify'];
              const currentIndex = steps.indexOf(currentStep);
              setCurrentStep(steps[currentIndex - 1]);
            }
          }}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Proof</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {['type', 'upload', 'details', 'verify'].map((step, index) => (
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 2,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: LAYOUT.padding / 4,
    borderRadius: 2,
  },
  activeProgressStep: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 4,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  stepSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding * 3,
    lineHeight: 24,
  },
  typesContainer: {
    gap: LAYOUT.padding * 1.5,
  },
  typeCard: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    ...VALUES.shadow,
  },
  typeGradient: {
    padding: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  typeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: LAYOUT.padding,
    marginBottom: LAYOUT.padding / 2,
  },
  typeDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  uploadSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: LAYOUT.padding,
  },
  addPhotoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: LAYOUT.padding / 2,
  },
  photoPreview: {
    width: 120,
    height: 120,
    marginRight: LAYOUT.padding,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: VALUES.borderRadius,
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.padding * 1.5,
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
  },
  inputSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginRight: LAYOUT.padding,
  },
  amountValue: {
    flex: 1,
  },
  nextButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    marginTop: LAYOUT.padding * 2,
  },
  submitButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    marginTop: LAYOUT.padding * 2,
  },
  buttonGradient: {
    paddingVertical: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 2,
    ...VALUES.shadow,
  },
  reviewSection: {
    marginBottom: LAYOUT.padding * 1.5,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding / 2,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  verificationNote: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '20',
    padding: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
    marginTop: LAYOUT.padding * 2,
  },
  verificationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
    lineHeight: 20,
  },
});

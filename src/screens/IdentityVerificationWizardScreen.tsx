/**
 * Unified Identity Verification Wizard Screen
 * Replaces: IdentityVerificationIntroScreen, IdentityVerificationDocumentScreen,
 * IdentityVerificationUploadScreen, IdentityVerificationSelfieScreen,
 * IdentityVerificationReviewScreen, IdentityVerificationPendingScreen
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IdentityVerificationWizardProps = StackScreenProps<
  RootStackParamList,
  'IdentityVerification'
>;

type Step = 'intro' | 'document' | 'upload' | 'selfie' | 'review' | 'pending';
type DocumentType = 'passport' | 'id_card' | 'drivers_license';

interface VerificationData {
  documentType: DocumentType;
  documentFront: string | null;
  documentBack: string | null;
  selfie: string | null;
  fullName: string;
  dateOfBirth: string;
  country: string;
  confirmed: boolean;
}

// Constants
const REQUIREMENTS = [
  { id: '1', icon: 'card-account-details-outline' as IconName, label: 'Government-issued ID' },
  { id: '2', icon: 'map-marker-outline' as IconName, label: 'Proof of address' },
  { id: '3', icon: 'camera-outline' as IconName, label: 'Selfie' },
];

const DOCUMENT_OPTIONS = [
  { id: 'passport' as DocumentType, icon: 'book-open-outline' as IconName, label: 'Passport' },
  { id: 'id_card' as DocumentType, icon: 'badge-account-outline' as IconName, label: 'National ID Card' },
  { id: 'drivers_license' as DocumentType, icon: 'card-account-details-outline' as IconName, label: "Driver's License" },
];

const GUIDELINES = [
  { id: '1', text: 'Place document on a flat, well-lit surface.' },
  { id: '2', text: 'Ensure all four corners are visible.' },
  { id: '3', text: 'Avoid glare and reflections.' },
  { id: '4', text: 'Make sure the text is clear and readable.' },
];

const NEXT_STEPS = [
  { id: '1', icon: 'file-document-outline' as IconName, title: 'We\'re reviewing', description: 'Our team is carefully checking the documents you submitted.' },
  { id: '2', icon: 'bell-outline' as IconName, title: 'You\'ll be notified', description: 'We\'ll send you an email and a push notification once we\'re done.' },
  { id: '3', icon: 'gift-outline' as IconName, title: 'Start gifting', description: 'Once verified, you can create and support travel gifts.' },
];

export const IdentityVerificationWizardScreen: React.FC<IdentityVerificationWizardProps> = ({ navigation }) => {
  const [step, setStep] = useState<Step>('intro');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VerificationData>({
    documentType: 'passport',
    documentFront: null,
    documentBack: null,
    selfie: null,
    fullName: 'Amelia Earhart',
    dateOfBirth: 'July 24, 1897',
    country: 'United States',
    confirmed: false,
  });

  // Step management
  const getStepIndex = (s: Step): number => {
    const steps: Step[] = ['intro', 'document', 'upload', 'selfie', 'review', 'pending'];
    return steps.indexOf(s);
  };

  const getProgress = (): number => {
    const index = getStepIndex(step);
    return ((index) / 5) * 100;
  };

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const steps: Step[] = ['intro', 'document', 'upload', 'selfie', 'review', 'pending'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const handleNext = useCallback((nextStep: Step) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(nextStep);
  }, []);

  const handleCapture = useCallback((type: 'front' | 'back' | 'selfie') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Simulate camera capture
    setData(prev => ({
      ...prev,
      [type === 'front' ? 'documentFront' : type === 'back' ? 'documentBack' : 'selfie']: 'captured_image_uri'
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!data.confirmed) {
      Alert.alert('Please confirm', 'You must confirm that your information is accurate.');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('pending');
    }, 2000);
  }, [data.confirmed]);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    (navigation as any).navigate('Discover');
  }, [navigation]);

  // Render helpers
  const renderHeader = (title: string, showProgress: boolean = true) => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={handleBack} activeOpacity={0.7}>
        <MaterialCommunityIcons
          name={step === 'intro' ? 'close' : 'arrow-left'}
          size={24}
          color={COLORS.text}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerButton} />
    </View>
  );

  const renderProgressBar = () => {
    if (step === 'intro' || step === 'pending') return null;
    const stepNumber = getStepIndex(step);
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step {stepNumber} of 4</Text>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${getProgress()}%` }]} />
        </View>
      </View>
    );
  };

  // Step: Intro
  const renderIntro = () => (
    <View style={styles.content}>
      {renderHeader('Verify Identity', false)}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.description}>
          To keep our community safe, we need to confirm you are who you say you are. Here&apos;s what you&apos;ll need:
        </Text>
        <View style={styles.requirementsList}>
          {REQUIREMENTS.map((req) => (
            <View key={req.id} style={styles.requirementItem}>
              <View style={styles.requirementIcon}>
                <MaterialCommunityIcons name={req.icon} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.requirementLabel}>{req.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="lock-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.securityNoteText}>
            Your documents are encrypted and stored securely.
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleNext('document')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step: Document Selection
  const renderDocumentSelection = () => (
    <View style={styles.content}>
      {renderHeader('Verify Your Identity')}
      {renderProgressBar()}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.description}>
          Please select the type of document you&apos;d like to use.
        </Text>
        <View style={styles.optionsList}>
          {DOCUMENT_OPTIONS.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.optionCard,
                data.documentType === doc.id && styles.optionCardSelected
              ]}
              onPress={() => setData(prev => ({ ...prev, documentType: doc.id }))}
              activeOpacity={0.7}
            >
              <View style={styles.optionIcon}>
                <MaterialCommunityIcons
                  name={doc.icon}
                  size={32}
                  color={data.documentType === doc.id ? COLORS.primary : COLORS.text}
                />
              </View>
              <Text style={[
                styles.optionLabel,
                data.documentType === doc.id && styles.optionLabelSelected
              ]}>
                {doc.label}
              </Text>
              {data.documentType === doc.id && (
                <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => handleNext('upload')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step: Document Upload
  const renderDocumentUpload = () => (
    <View style={styles.content}>
      {renderHeader('Upload Document')}
      {renderProgressBar()}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Upload Your Document</Text>
        <Text style={styles.description}>
          To keep our community safe, we need to verify your identity. Your information is encrypted and secure.
        </Text>
        
        <View style={styles.guidelinesList}>
          {GUIDELINES.map((guide) => (
            <View key={guide.id} style={styles.guidelineItem}>
              <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.success} />
              <Text style={styles.guidelineText}>{guide.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Front of Document</Text>
          <TouchableOpacity
            style={[styles.uploadCard, data.documentFront && styles.uploadCardDone]}
            onPress={() => handleCapture('front')}
            activeOpacity={0.7}
          >
            {data.documentFront ? (
              <View style={styles.uploadedContent}>
                <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.success} />
                <Text style={styles.uploadedText}>Document captured</Text>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <MaterialCommunityIcons name="camera" size={32} color={COLORS.textSecondary} />
                <Text style={styles.uploadPlaceholderText}>Tap to capture</Text>
              </View>
            )}
          </TouchableOpacity>

          {data.documentType !== 'passport' && (
            <>
              <Text style={styles.uploadLabel}>Back of Document</Text>
              <TouchableOpacity
                style={[styles.uploadCard, data.documentBack && styles.uploadCardDone]}
                onPress={() => handleCapture('back')}
                activeOpacity={0.7}
              >
                {data.documentBack ? (
                  <View style={styles.uploadedContent}>
                    <MaterialCommunityIcons name="check-circle" size={32} color={COLORS.success} />
                    <Text style={styles.uploadedText}>Document captured</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <MaterialCommunityIcons name="camera" size={32} color={COLORS.textSecondary} />
                    <Text style={styles.uploadPlaceholderText}>Tap to capture</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !data.documentFront && styles.buttonDisabled]}
          onPress={() => handleNext('selfie')}
          disabled={!data.documentFront}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step: Selfie
  const renderSelfie = () => (
    <View style={styles.content}>
      {renderHeader('Verify Your Identity')}
      {renderProgressBar()}
      <View style={styles.selfieContent}>
        <View style={styles.selfieHeader}>
          <Text style={styles.title}>Liveness Check</Text>
          <Text style={styles.description}>
            Position your face in the oval to start verification.
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          <View style={styles.cameraPlaceholder}>
            <View style={styles.ovalMask}>
              {data.selfie ? (
                <MaterialCommunityIcons name="check-circle" size={64} color={COLORS.success} />
              ) : (
                <MaterialCommunityIcons name="account" size={64} color={COLORS.textTertiary} />
              )}
            </View>
          </View>
          {data.selfie && (
            <View style={styles.feedbackBadge}>
              <MaterialCommunityIcons name="check" size={16} color={COLORS.success} />
              <Text style={styles.feedbackText}>Face Captured</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              if (!data.selfie) {
                handleCapture('selfie');
              } else {
                handleNext('review');
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {data.selfie ? 'Continue' : 'Start Check'}
            </Text>
          </TouchableOpacity>
          <View style={styles.securityNote}>
            <MaterialCommunityIcons name="lock-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.securityNoteText}>Your photo is securely encrypted</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Step: Review
  const renderReview = () => (
    <View style={styles.content}>
      {renderHeader('Review Your Information')}
      {renderProgressBar()}
      <Text style={styles.reviewDescription}>
        Please double-check your details before submitting.
      </Text>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Personal Details */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardContent}>
              <View style={styles.reviewIcon}>
                <MaterialCommunityIcons name="account" size={24} color={COLORS.text} />
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewLabel}>Full Name</Text>
                <Text style={styles.reviewValue}>{data.fullName}</Text>
                <Text style={styles.reviewLabel}>DOB: {data.dateOfBirth}</Text>
                <Text style={styles.reviewLabel}>Country: {data.country}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setStep('document')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Document */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Identity Document</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardContent}>
              <View style={styles.docThumbnail} />
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewLabel}>Document Type</Text>
                <Text style={styles.reviewValue}>
                  {DOCUMENT_OPTIONS.find(d => d.id === data.documentType)?.label}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setStep('upload')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selfie */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Selfie Verification</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewCardContent}>
              <View style={styles.selfieThumbnail}>
                <MaterialCommunityIcons name="account" size={24} color={COLORS.textSecondary} />
              </View>
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewLabel}>Your Selfie</Text>
                <Text style={styles.reviewValue}>Ready for verification</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setStep('selfie')}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setData(prev => ({ ...prev, confirmed: !prev.confirmed }))}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, data.confirmed && styles.checkboxChecked]}>
            {data.confirmed && (
              <MaterialCommunityIcons name="check" size={16} color={COLORS.white} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            I confirm that all information is accurate and complete.
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, (!data.confirmed || loading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!data.confirmed || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.text} />
          ) : (
            <Text style={styles.primaryButtonText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Step: Pending
  const renderPending = () => (
    <View style={styles.content}>
      <View style={styles.pendingContent}>
        <View style={styles.pendingHeader}>
          <View style={styles.pendingIcon}>
            <MaterialCommunityIcons name="clock-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Verification in Progress</Text>
          <Text style={styles.description}>
            Thanks for submitting your documents. We&apos;re now reviewing them to ensure everything is in order.
          </Text>
        </View>

        <View style={styles.pendingCard}>
          <Text style={styles.pendingCardTitle}>Estimated review time</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: '15%' }]} />
          </View>
          <Text style={styles.pendingCardSubtitle}>Usually takes less than 24 hours</Text>
        </View>

        <View style={styles.nextStepsSection}>
          <Text style={styles.sectionTitle}>What&apos;s Next?</Text>
          {NEXT_STEPS.map((step) => (
            <View key={step.id} style={styles.nextStepItem}>
              <MaterialCommunityIcons name={step.icon} size={20} color={COLORS.primary} />
              <View style={styles.nextStepContent}>
                <Text style={styles.nextStepTitle}>{step.title}</Text>
                <Text style={styles.nextStepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Got It</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main render
  const renderStep = () => {
    switch (step) {
      case 'intro': return renderIntro();
      case 'document': return renderDocumentSelection();
      case 'upload': return renderDocumentUpload();
      case 'selfie': return renderSelfie();
      case 'review': return renderReview();
      case 'pending': return renderPending();
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderStep()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  reviewDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  requirementsList: {
    gap: 16,
    marginBottom: 24,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  requirementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requirementLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  securityNoteText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}08`,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionLabelSelected: {
    color: COLORS.primary,
  },
  guidelinesList: {
    gap: 12,
    marginBottom: 24,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  uploadSection: {
    gap: 12,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 8,
  },
  uploadCard: {
    height: 160,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCardDone: {
    borderColor: COLORS.success,
    borderStyle: 'solid',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  uploadedContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadedText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
  },
  selfieContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  selfieHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cameraContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  cameraPlaceholder: {
    width: 250,
    height: 320,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ovalMask: {
    width: 200,
    height: 260,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
  },
  reviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  reviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  editButton: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  docThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  selfieThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  pendingContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    gap: 32,
  },
  pendingHeader: {
    alignItems: 'center',
  },
  pendingIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  pendingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  pendingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  pendingCardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  nextStepsSection: {
    gap: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    gap: 12,
  },
  nextStepContent: {
    flex: 1,
  },
  nextStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  nextStepDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default IdentityVerificationWizardScreen;

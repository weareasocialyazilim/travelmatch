import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { LeaveTrustNoteBottomSheet } from '@/components/LeaveTrustNoteBottomSheet';
import { ThankYouModal } from '@/components/ThankYouModal';
import { createTrustNote, hasWrittenNoteForGift } from '@/services/trustNotesService';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type GestureReceivedScreenProps = StackScreenProps<
  RootStackParamList,
  'GestureReceived'
>;

type TimelineStep = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  status: 'completed' | 'current' | 'pending';
  time?: string;
};

export const GestureReceivedScreen: React.FC<GestureReceivedScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    gestureId,
    senderId,
    momentTitle,
    amount,
    senderName,
    senderAvatar,
    isAnonymous,
    status,
  } = route.params;

  // State for trust note flow
  const [showTrustNoteSheet, setShowTrustNoteSheet] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Determine steps based on status
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: '1',
        title: 'Gesture Received',
        subtitle: isAnonymous
          ? `Anonymous supporter sent you $${amount}`
          : `${senderName ?? 'Someone'} sent you $${amount}`,
        icon: 'gift-outline',
        status: 'completed',
        time: '3 days ago',
      },
      {
        id: '2',
        title: 'Proof Uploaded',
        subtitle: `You uploaded proof for "${momentTitle}"`,
        icon: 'camera-outline',
        status: status === 'pending_proof' ? 'current' : 'completed',
        time: status === 'pending_proof' ? undefined : '2 days ago',
      },
      {
        id: '3',
        title: 'Verification',
        subtitle: 'System verified your proof',
        icon: 'check-decagram',
        status:
          status === 'pending_verification'
            ? 'current'
            : status === 'verified'
            ? 'completed'
            : 'pending',
        time: status === 'verified' ? '1 day ago' : undefined,
      },
      {
        id: '4',
        title: 'Funds Added',
        subtitle: `$${amount} added to your balance`,
        icon: 'wallet-plus-outline',
        status: status === 'verified' ? 'completed' : 'pending',
        time: status === 'verified' ? 'Just now' : undefined,
      },
    ];

    return steps;
  };

  const steps = getTimelineSteps();

  const getStepColor = (stepStatus: string) => {
    switch (stepStatus) {
      case 'completed':
        return COLORS.mint;
      case 'current':
        return COLORS.brand.primary;
      case 'pending':
        return COLORS.border.default;
      default:
        return COLORS.border.default;
    }
  };

  const handleSayThanks = async () => {
    if (!isAnonymous && senderId) {
      // Check if user already wrote a note for this gift
      const alreadyWrote = await hasWrittenNoteForGift(gestureId);
      if (alreadyWrote) {
        // Directly go to chat if already wrote note
        navigateToChat();
      } else {
        // Show trust note bottom sheet first
        setShowTrustNoteSheet(true);
      }
    }
  };

  const handleSubmitTrustNote = async (note: string) => {
    if (!senderId) return;

    setIsSubmittingNote(true);
    try {
      const result = await createTrustNote({
        receiverId: senderId,
        note,
        giftId: gestureId,
      });

      setShowTrustNoteSheet(false);

      if (result.success) {
        // Show thank you modal
        setShowThankYouModal(true);
      } else {
        Alert.alert('Hata', result.error || 'Not gönderilemedi');
      }
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleThankYouModalClose = () => {
    setShowThankYouModal(false);
    // Navigate to chat after modal closes
    navigateToChat();
  };

  const handleSkipTrustNote = () => {
    setShowTrustNoteSheet(false);
    navigateToChat();
  };

  const navigateToChat = () => {
    if (senderId) {
      navigation.navigate('Chat', {
        otherUser: {
          id: senderId,
          name: senderName || 'Anonymous',
          avatar: senderAvatar || 'https://via.placeholder.com/100',
          isVerified: true,
          type: 'traveler',
          role: 'Traveler',
          kyc: 'Verified',
          location: '',
        },
      });
    }
  };

  const handleUploadProof = () => {
    navigation.navigate('ProofFlow', {
      escrowId: gestureId,  // gestureId is the escrow/gift transaction ID
      giftId: gestureId,
      momentTitle,
      senderId,
    });
  };

  const handleViewBalance = () => {
    navigation.navigate('Wallet');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gesture Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gift Card */}
        <View style={styles.giftCard}>
          <View style={styles.giftIconContainer}>
            <MaterialCommunityIcons name="gift" size={40} color={COLORS.mint} />
          </View>

          <Text style={styles.giftTitle}>You received a gesture!</Text>

          <View style={styles.amountContainer}>
            <Text style={styles.amountValue}>${amount}</Text>
            <Text style={styles.amountLabel}>
              for &quot;{momentTitle}&quot;
            </Text>
          </View>

          {/* Sender Info */}
          <View style={styles.senderContainer}>
            {isAnonymous ? (
              <View style={styles.anonymousContainer}>
                <View style={styles.anonymousAvatar}>
                  <MaterialCommunityIcons
                    name="incognito"
                    size={24}
                    color={COLORS.text.secondary}
                  />
                </View>
                <Text style={styles.senderName}>Anonymous Supporter</Text>
              </View>
            ) : (
              <View style={styles.senderInfo}>
                <Image
                  source={{
                    uri: senderAvatar || 'https://via.placeholder.com/100',
                  }}
                  style={styles.senderAvatar}
                />
                <View>
                  <Text style={styles.senderLabel}>From</Text>
                  <Text style={styles.senderName}>{senderName}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status === 'verified'
                    ? COLORS.mint + '20'
                    : COLORS.brand.primary + '20',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={status === 'verified' ? 'check-circle' : 'timer-sand'}
              size={16}
              color={status === 'verified' ? COLORS.mint : COLORS.brand.primary}
            />
            <Text
              style={[
                styles.statusText,
                { color: status === 'verified' ? COLORS.mint : COLORS.brand.primary },
              ]}
            >
              {status === 'verified'
                ? 'Verified & Added to Balance'
                : 'Pending Verification'}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Progress</Text>

          {steps.map((step, index) => (
            <View key={step.id} style={styles.timelineItem}>
              {/* Timeline Line */}
              <View style={styles.timelineLineContainer}>
                <View
                  style={[
                    styles.timelineDot,
                    { backgroundColor: getStepColor(step.status) },
                  ]}
                >
                  {step.status === 'completed' && (
                    <MaterialCommunityIcons
                      name="check"
                      size={12}
                      color={COLORS.utility.white}
                    />
                  )}
                  {step.status === 'current' && (
                    <View style={styles.currentDot} />
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.timelineLine,
                      {
                        backgroundColor:
                          step.status === 'completed'
                            ? COLORS.mint
                            : COLORS.border.default,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Step Content */}
              <View style={styles.stepContent}>
                <View style={styles.stepHeader}>
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={20}
                    color={getStepColor(step.status)}
                  />
                  <Text
                    style={[
                      styles.stepTitle,
                      step.status === 'pending' && styles.stepTitlePending,
                    ]}
                  >
                    {step.title}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepSubtitle,
                    step.status === 'pending' && styles.stepSubtitlePending,
                  ]}
                >
                  {step.subtitle}
                </Text>
                {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {status === 'pending_proof' && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUploadProof}
            >
              <MaterialCommunityIcons
                name="camera-outline"
                size={20}
                color={COLORS.utility.white}
              />
              <Text style={styles.primaryButtonText}>Upload Proof</Text>
            </TouchableOpacity>
          )}

          {status === 'verified' && (
            <>
              {!isAnonymous && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSayThanks}
                >
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={20}
                    color={COLORS.utility.white}
                  />
                  <Text style={styles.primaryButtonText}>
                    Say Thanks to {senderName}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.secondaryButton,
                  isAnonymous && styles.primaryButton,
                ]}
                onPress={handleViewBalance}
              >
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={20}
                  color={isAnonymous ? COLORS.utility.white : COLORS.brand.primary}
                />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isAnonymous && styles.primaryButtonText,
                  ]}
                >
                  View Balance
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={COLORS.brand.primary}
          />
          <Text style={styles.infoText}>
            {status === 'verified'
              ? 'The funds have been added to your balance. You can withdraw or use them for your next experience.'
              : 'Upload proof of your experience to unlock the funds. Our system will verify automatically.'}
          </Text>
        </View>
      </ScrollView>

      {/* Trust Note Bottom Sheet */}
      <LeaveTrustNoteBottomSheet
        visible={showTrustNoteSheet}
        onClose={handleSkipTrustNote}
        onSubmit={handleSubmitTrustNote}
        recipientName={senderName || 'Destekçi'}
        momentTitle={momentTitle}
      />

      {/* Thank You Modal */}
      <ThankYouModal
        visible={showThankYouModal}
        onClose={handleThankYouModalClose}
        giverName={senderName || 'Destekçi'}
        amount={amount}
      />
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  giftCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  giftIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.mint + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  giftTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.brand.primary,
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  senderContainer: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    marginBottom: 16,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  senderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  senderLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  anonymousAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.bg.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timelineContainer: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timelineLineContainer: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.utility.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 40,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  stepTitlePending: {
    color: COLORS.text.secondary,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginLeft: 28,
  },
  stepSubtitlePending: {
    color: COLORS.border.default,
  },
  stepTime: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginTop: 4,
    marginLeft: 28,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.utility.white,
    borderWidth: 1,
    borderColor: COLORS.brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
});

export default GestureReceivedScreen;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';

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
    momentTitle,
    amount,
    senderName,
    senderAvatar,
    isAnonymous,
    status,
  } = route.params;

  // Determine steps based on status
  const getTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: '1',
        title: 'Gesture Received',
        subtitle: isAnonymous
          ? `Anonymous supporter sent you $${amount}`
          : `${senderName} sent you $${amount}`,
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
        return COLORS.primary;
      case 'pending':
        return COLORS.border;
      default:
        return COLORS.border;
    }
  };

  const handleSayThanks = () => {
    if (!isAnonymous) {
      navigation.navigate('Chat', {
        otherUser: {
          id: gestureId,
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
    navigation.navigate('ProofUpload');
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
            color={COLORS.text}
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
                    color={COLORS.textSecondary}
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
                    : COLORS.primary + '20',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={status === 'verified' ? 'check-circle' : 'timer-sand'}
              size={16}
              color={status === 'verified' ? COLORS.mint : COLORS.primary}
            />
            <Text
              style={[
                styles.statusText,
                { color: status === 'verified' ? COLORS.mint : COLORS.primary },
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
                      color={COLORS.white}
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
                            : COLORS.border,
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
                color={COLORS.white}
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
                    color={COLORS.white}
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
                  color={isAnonymous ? COLORS.white : COLORS.primary}
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
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            {status === 'verified'
              ? 'The funds have been added to your balance. You can withdraw or use them for your next experience.'
              : 'Upload proof of your experience to unlock the funds. Our system will verify automatically.'}
          </Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.black,
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
    color: COLORS.text,
    marginBottom: 12,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  senderContainer: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    color: COLORS.textSecondary,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
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
    backgroundColor: COLORS.backgroundDark,
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
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
  },
  stepTitlePending: {
    color: COLORS.textSecondary,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginLeft: 28,
  },
  stepSubtitlePending: {
    color: COLORS.border,
  },
  stepTime: {
    fontSize: 12,
    color: COLORS.textTertiary,
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
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default GestureReceivedScreen;

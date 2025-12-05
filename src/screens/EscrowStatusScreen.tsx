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

type EscrowStatusScreenProps = StackScreenProps<
  RootStackParamList,
  'EscrowStatus'
>;

type EscrowStep = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  status: 'completed' | 'current' | 'pending';
  time?: string;
};

export const EscrowStatusScreen: React.FC<EscrowStatusScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    escrowId,
    momentTitle,
    amount,
    receiverName,
    receiverAvatar,
    status,
  } = route.params;

  // Determine escrow steps based on status
  const getEscrowSteps = (): EscrowStep[] => {
    const baseSteps: EscrowStep[] = [
      {
        id: '1',
        title: 'Gift Sent',
        subtitle: `You sent $${amount} for "${momentTitle}"`,
        icon: 'gift-outline',
        status: 'completed',
        time: '2 days ago',
      },
      {
        id: '2',
        title: 'Funds in Escrow',
        subtitle: 'Money is securely held until proof is verified',
        icon: 'shield-lock-outline',
        status: status === 'pending_proof' ? 'current' : 'completed',
        time: status === 'pending_proof' ? undefined : '2 days ago',
      },
      {
        id: '3',
        title: 'Proof Uploaded',
        subtitle: `${receiverName} uploaded proof of experience`,
        icon: 'camera-outline',
        status:
          status === 'pending_proof'
            ? 'pending'
            : status === 'in_escrow'
            ? 'current'
            : 'completed',
        time:
          status === 'pending_proof'
            ? undefined
            : status === 'in_escrow'
            ? undefined
            : '1 day ago',
      },
      {
        id: '4',
        title: 'System Verification',
        subtitle: 'Our system is verifying the proof',
        icon: 'check-decagram',
        status:
          status === 'pending_verification'
            ? 'current'
            : status === 'pending_proof' || status === 'in_escrow'
            ? 'pending'
            : 'completed',
        time: status === 'verified' ? '3 hours ago' : undefined,
      },
      {
        id: '5',
        title: status === 'refunded' ? 'Refunded' : 'Funds Released',
        subtitle:
          status === 'refunded'
            ? 'Verification failed. Funds returned to your balance.'
            : `$${amount} released to ${receiverName}`,
        icon: status === 'refunded' ? 'undo-variant' : 'check-circle-outline',
        status:
          status === 'verified' || status === 'refunded'
            ? 'completed'
            : 'pending',
        time:
          status === 'verified' || status === 'refunded'
            ? 'Just now'
            : undefined,
      },
    ];

    return baseSteps;
  };

  const steps = getEscrowSteps();

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

  const getStatusTitle = () => {
    switch (status) {
      case 'pending_proof':
        return 'Waiting for Proof';
      case 'in_escrow':
        return 'Proof Uploaded';
      case 'pending_verification':
        return 'Verifying Proof';
      case 'verified':
        return 'Completed ✓';
      case 'refunded':
        return 'Refunded';
      default:
        return 'In Progress';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'verified':
        return COLORS.mint;
      case 'refunded':
        return COLORS.softRed;
      default:
        return COLORS.primary;
    }
  };

  const handleSendReminder = () => {
    // TODO: Implement reminder logic
    navigation.navigate('Chat', {
      otherUser: {
        id: escrowId,
        name: receiverName,
        avatar: receiverAvatar || 'https://via.placeholder.com/100',
        isVerified: true,
        type: 'local',
        role: 'Local',
        kyc: 'Verified',
        location: '',
      },
    });
  };

  const handleMessageReceiver = () => {
    navigation.navigate('Chat', {
      otherUser: {
        id: escrowId,
        name: receiverName,
        avatar: receiverAvatar || 'https://via.placeholder.com/100',
        isVerified: true,
        type: 'local',
        role: 'Local',
        kyc: 'Verified',
        location: '',
      },
    });
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
        <Text style={styles.headerTitle}>Escrow Status</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.receiverInfo}>
            <Image
              source={{
                uri: receiverAvatar || 'https://via.placeholder.com/100',
              }}
              style={styles.receiverAvatar}
            />
            <View style={styles.receiverDetails}>
              <Text style={styles.receiverName}>{receiverName}</Text>
              <Text style={styles.momentTitle}>{momentTitle}</Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Gesture Amount</Text>
            <Text style={styles.amountValue}>${amount}</Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor() + '20' },
            ]}
          >
            <MaterialCommunityIcons
              name={
                status === 'verified'
                  ? 'check-circle'
                  : status === 'refunded'
                  ? 'undo-variant'
                  : 'timer-sand'
              }
              size={16}
              color={getStatusColor()}
            />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusTitle()}
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          <Text style={styles.sectionTitle}>Escrow Timeline</Text>

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

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Your funds are securely held until the proof is verified by our
            system. If verification fails, your money will be automatically
            refunded.
          </Text>
        </View>

        {/* Actions */}
        {(status === 'pending_proof' || status === 'in_escrow') && (
          <View style={styles.actionsContainer}>
            {status === 'pending_proof' && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSendReminder}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.secondaryButtonText}>Send Reminder</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleMessageReceiver}
            >
              <MaterialCommunityIcons
                name="message-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.primaryButtonText}>
                Message {receiverName}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'verified' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleMessageReceiver}
            >
              <MaterialCommunityIcons
                name="message-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.primaryButtonText}>Say Thanks</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'refunded' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Wallet')}
            >
              <MaterialCommunityIcons
                name="wallet-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.primaryButtonText}>View Balance</Text>
            </TouchableOpacity>
          </View>
        )}
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
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  receiverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  receiverDetails: {
    flex: 1,
  },
  receiverName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  momentTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 12,
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
});

export default EscrowStatusScreen;

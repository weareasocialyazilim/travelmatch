import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logger } from '@/utils/logger';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Proof } from '../types';
import type { StackScreenProps } from '@react-navigation/stack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProofDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'ProofDetail'
>;

export const ProofDetailScreen: React.FC<ProofDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { proofId } = route.params;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Mock data - gerçek uygulamada API'den gelecek
  const proof: Proof = {
    id: proofId,
    type: 'micro-kindness',
    title: 'Coffee for a Stranger',
    description:
      'Today I met an amazing person at Starbucks who was having a tough day. I bought them a coffee and we had a wonderful conversation about travel and kindness. Small gestures can make a big difference! 💙',
    date: '2024-01-15',
    location: 'Starbucks, 5th Avenue, New York',
    amount: 5,
    status: 'verified',
    receiver: 'John D.',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    ],
    trustScore: 95,
    createdAt: '2024-01-15T10:30:00Z',
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'micro-kindness':
        return 'heart';
      case 'verified-experience':
        return 'star';
      case 'community-proof':
        return 'account-group';
      default:
        return 'check-circle';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'micro-kindness':
        return COLORS.coral;
      case 'verified-experience':
        return COLORS.mint;
      case 'community-proof':
        return COLORS.purple;
      default:
        return COLORS.primary;
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this proof: ${proof.title ?? 'Proof'}\n${
          proof.description ?? ''
        }`,
        url: `travelmatch://proof/${proof.id}`,
      });
    } catch (error) {
      logger.error('Share error', error as Error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Proof Detail</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Icon name="share-variant" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {proof.images && proof.images.length > 0 && (
          <View style={styles.imageSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(
                  e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                );
                setActiveImageIndex(index);
              }}
            >
              {proof.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.proofImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Image Indicators */}
            {proof.images.length > 1 && (
              <View style={styles.imageIndicators}>
                {proof.images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      activeImageIndex === index && styles.activeIndicator,
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Status Badge */}
            <LinearGradient
              colors={
                proof.status === 'verified'
                  ? [COLORS.mint, COLORS.successDark]
                  : proof.status === 'pending'
                  ? [COLORS.orange, COLORS.orangeDark]
                  : [COLORS.softRed, COLORS.error]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusBadge}
            >
              <Icon
                name={
                  proof.status === 'verified'
                    ? 'check-decagram'
                    : proof.status === 'pending'
                    ? 'clock-outline'
                    : 'close-circle'
                }
                size={16}
                color={COLORS.white}
              />
              <Text style={styles.statusText}>
                {proof.status === 'verified'
                  ? 'Verified'
                  : proof.status === 'pending'
                  ? 'Pending'
                  : 'Rejected'}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Icon
              name={getTypeIcon(proof.type)}
              size={18}
              color={getTypeColor(proof.type)}
            />
            <Text
              style={[styles.typeText, { color: getTypeColor(proof.type) }]}
            >
              {proof.type
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{proof.title}</Text>

          {/* Info Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon name="calendar" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>{proof.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="map-marker" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                {typeof proof.location === 'string'
                  ? proof.location
                  : proof.location?.name ||
                    `${proof.location?.city || ''}, ${
                      proof.location?.country || ''
                    }`}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{proof.description}</Text>
          </View>

          {/* Details Grid */}
          <View style={styles.detailsGrid}>
            {proof.amount && (
              <View style={styles.detailCard}>
                <Icon name="currency-usd" size={24} color={COLORS.mint} />
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>${proof.amount}</Text>
              </View>
            )}

            {proof.receiver && (
              <View style={styles.detailCard}>
                <Icon name="account" size={24} color={COLORS.coral} />
                <Text style={styles.detailLabel}>Receiver</Text>
                <Text style={styles.detailValue}>
                  {typeof proof.receiver === 'string'
                    ? proof.receiver
                    : proof.receiver.name}
                </Text>
              </View>
            )}

            {proof.trustScore && (
              <View style={styles.detailCard}>
                <Icon name="shield-check" size={24} color={COLORS.purple} />
                <Text style={styles.detailLabel}>Trust Score</Text>
                <Text style={styles.detailValue}>{proof.trustScore}%</Text>
              </View>
            )}
          </View>

          {/* Verification Timeline */}
          {proof.status === 'verified' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification Timeline</Text>
              <View style={styles.timeline}>
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotActive]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Proof Submitted</Text>
                    <Text style={styles.timelineDate}>
                      Jan 15, 2024 - 10:30 AM
                    </Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotActive]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>AI Verification</Text>
                    <Text style={styles.timelineDate}>
                      Jan 15, 2024 - 10:32 AM
                    </Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View
                    style={[styles.timelineDot, styles.timelineDotActive]}
                  />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Community Verified</Text>
                    <Text style={styles.timelineDate}>
                      Jan 15, 2024 - 11:00 AM
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeIndicator: {
    backgroundColor: COLORS.white,
    width: 20,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    padding: 20,
  },
  description: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
  },
  detailCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flex: 1,
    padding: 16,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.lightGray,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  imageIndicators: {
    bottom: 16,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  imageSection: {
    position: 'relative',
  },
  indicator: {
    backgroundColor: COLORS.whiteTransparentLight,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoText: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  proofImage: {
    height: SCREEN_WIDTH * 0.75,
    width: SCREEN_WIDTH,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  shareButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  timeline: {
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
  },
  timelineDate: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  timelineDot: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    height: 12,
    marginTop: 4,
    width: 12,
  },
  timelineDotActive: {
    backgroundColor: COLORS.mint,
  },
  timelineItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  timelineLine: {
    backgroundColor: COLORS.lightGray,
    height: 24,
    marginLeft: 5,
    width: 2,
  },
  timelineTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  typeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gray[100],
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

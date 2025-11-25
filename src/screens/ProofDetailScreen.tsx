import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { Proof } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ProofDetailScreen: React.FC<{ navigation: any; route: any }> = ({
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
    description: 'Today I met an amazing person at Starbucks who was having a tough day. I bought them a coffee and we had a wonderful conversation about travel and kindness. Small gestures can make a big difference! 💙',
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
        message: `Check out this proof: ${proof.title}\n${proof.description}`,
        url: `travelmatch://proof/${proof.id}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
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
                  ? [COLORS.mint, '#00D084']
                  : proof.status === 'pending'
                  ? ['#FFB84D', '#FF9500']
                  : ['#FF6B6B', '#EE5A52']
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
            <Icon name={getTypeIcon(proof.type)} size={18} color={getTypeColor(proof.type)} />
            <Text style={[styles.typeText, { color: getTypeColor(proof.type) }]}>
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
                {proof.location}
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
                <Text style={styles.detailValue}>{proof.receiver}</Text>
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
                  <View style={[styles.timelineDot, styles.timelineDotActive]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Proof Submitted</Text>
                    <Text style={styles.timelineDate}>Jan 15, 2024 - 10:30 AM</Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.timelineDotActive]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>AI Verification</Text>
                    <Text style={styles.timelineDate}>Jan 15, 2024 - 10:32 AM</Text>
                  </View>
                </View>
                <View style={styles.timelineLine} />
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.timelineDotActive]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Community Verified</Text>
                    <Text style={styles.timelineDate}>Jan 15, 2024 - 11:00 AM</Text>
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
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  shareButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    position: 'relative',
  },
  proofImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: COLORS.white,
    width: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  content: {
    padding: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.gray,
    borderRadius: 16,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  detailCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    ...VALUES.shadow,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  timeline: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.lightGray,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: COLORS.mint,
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: COLORS.lightGray,
    marginLeft: 5,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

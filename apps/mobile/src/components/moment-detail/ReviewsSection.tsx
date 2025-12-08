import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { Review } from './types';

interface ReviewsSectionProps {
  reviews: Review[];
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = React.memo(
  ({ reviews }) => {
    if (reviews.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Reviews</Text>
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Image
                source={{ uri: review.avatar }}
                style={styles.reviewAvatar}
              />
              <View style={styles.reviewInfo}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <View style={styles.reviewStars}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name="star"
                      size={14}
                      color={i < review.rating ? COLORS.warning : COLORS.border}
                    />
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.reviewText}>{review.text}</Text>
          </View>
        ))}
      </View>
    );
  },
);

ReviewsSection.displayName = 'ReviewsSection';

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  reviewHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewAvatar: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  reviewInfo: {
    marginLeft: 10,
  },
  reviewName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});

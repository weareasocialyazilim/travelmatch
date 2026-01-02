import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';

type ReviewRouteProp = RouteProp<RootStackParamList, 'Review'>;

interface RatingStarsProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  size = 40,
}) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRatingChange(star);
          }}
          style={styles.starButton}
        >
          <MaterialCommunityIcons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FBBF24' : COLORS.text.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const ReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ReviewRouteProp>();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { momentId, userId, userName, userAvatar, momentTitle } =
    route.params || {};

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || isSubmitting) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // API call to submit review
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Success', {
        type: 'review',
        title: 'Review Submitted',
        subtitle: 'Thank you for your feedback!',
      });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, navigation, isSubmitting]);

  const getRatingLabel = (value: number): string => {
    switch (value) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Leave a Review</Text>
          <View style={styles.placeholder} />
        </View>

        {/* User/Moment Info */}
        <View style={styles.infoSection}>
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <MaterialCommunityIcons
                  name="account"
                  size={40}
                  color={COLORS.text.muted}
                />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{userName || 'User'}</Text>
          {momentTitle && (
            <Text style={styles.momentTitle}>for "{momentTitle}"</Text>
          )}
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>How was your experience?</Text>
          <RatingStars rating={rating} onRatingChange={setRating} />
          <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
        </View>

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Write a review (optional)</Text>
          <TextInput
            style={styles.reviewInput}
            placeholder="Share details of your experience..."
            placeholderTextColor={COLORS.text.muted}
            multiline
            maxLength={500}
            value={reviewText}
            onChangeText={setReviewText}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {reviewText.length}/500 characters
          </Text>
        </View>

        {/* Quick Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionTitle}>Quick feedback</Text>
          <View style={styles.tagsGrid}>
            {[
              'Friendly',
              'On time',
              'Great company',
              'Helpful',
              'Would meet again',
              'Good communication',
            ].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setReviewText((prev) =>
                    prev.includes(tag) ? prev : `${prev} ${tag}`.trim(),
                  );
                }}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (rating === 0 || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 32,
  },
  infoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  momentTitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  ratingSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 12,
    fontWeight: '500',
  },
  reviewSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  reviewInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 120,
    lineHeight: 24,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'right',
    marginTop: 8,
  },
  tagsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border.default,
  },
  submitButton: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});

export default withErrorBoundary(ReviewScreen, { displayName: 'ReviewScreen' });

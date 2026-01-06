/**
 * In-App Feedback Modal
 * Collects user feedback with rating and comments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RADII } from '../constants/radii';
import { SPACING } from '../constants/spacing';
import { useHaptics } from '../hooks/useHaptics';
import { useTranslation } from '../hooks/useTranslation';
import { analytics } from '../services/analytics';
import { feedbackSchema, type FeedbackInput } from '../utils/forms';
import { canSubmitForm } from '../utils/forms/helpers';
import { COLORS, primitives } from '../constants/colors';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (feedback: {
    rating: number;
    comment: string;
    category: string;
  }) => void;
  title?: string;
  subtitle?: string;
  categories?: string[];
}

/**
 * Default category keys for i18n lookup
 */
const DEFAULT_CATEGORY_KEYS = [
  'suspiciousActivity',
  'fakeProfile',
  'inappropriateContent',
  'fraudSuspicion',
  'giftIssue',
  'generalFeedback',
  'bugReport',
  'featureRequest',
] as const;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  subtitle,
  categories,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { t } = useTranslation();
  const { impact } = useHaptics();

  // Use i18n for default categories if not provided
  const displayCategories =
    categories ??
    DEFAULT_CATEGORY_KEYS.map((key) => t(`feedback.categories.${key}`));

  // Use i18n for title/subtitle if not provided
  const displayTitle = title ?? t('feedback.title');
  const displaySubtitle = subtitle ?? t('feedback.subtitle');

  const { control, handleSubmit, formState, setValue, watch, reset } =
    useForm<FeedbackInput>({
      resolver: zodResolver(feedbackSchema),
      mode: 'onChange',
      defaultValues: {
        rating: 0,
        category: '',
        comment: '',
      },
    });

  const rating = watch('rating');
  const category = watch('category');

  // Fade animation
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const handleRatingPress = (value: number) => {
    setValue('rating', value);
    void impact('light');
  };

  const handleCategorySelect = (cat: string) => {
    setValue('category', cat);
    void impact('light');
  };

  const onSubmitFeedback = (data: FeedbackInput) => {
    setIsSubmitting(true);
    void impact('medium');

    // Track feedback event using trackEvent for custom event names
    analytics.trackEvent('feedback_submitted', {
      rating: data.rating,
      category: data.category,
      hasComment: (data.comment?.length || 0) > 0,
      commentLength: data.comment?.length || 0,
      screen: 'app',
      timestamp: Date.now(),
    });

    // Call parent handler
    if (onSubmit) {
      onSubmit({
        rating: data.rating,
        comment: data.comment || '',
        category: data.category,
      });
    }

    // Reset and close
    setTimeout(() => {
      reset();
      setIsSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <Modal
      testID="feedback-modal"
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          testID="feedback-backdrop"
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View style={[styles.modal, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text testID="feedback-title" style={styles.title}>
              {displayTitle}
            </Text>
            <Text testID="feedback-subtitle" style={styles.subtitle}>
              {displaySubtitle}
            </Text>
            <TouchableOpacity
              testID="feedback-close-button"
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={t('common.close')}
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text testID="feedback-rating-label" style={styles.label}>
              {t('feedback.ratingQuestion')}
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  testID={`feedback-star-button-${value}`}
                  onPress={() => handleRatingPress(value)}
                  style={styles.starButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={`${value} star rating`}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={value <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={
                      value <= rating ? COLORS.gold : primitives.stone[300]
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text testID="feedback-category-label" style={styles.label}>
              {t('feedback.categoryLabel')}
            </Text>
            <View style={styles.categoriesContainer}>
              {displayCategories.map((cat, index) => (
                <TouchableOpacity
                  key={cat}
                  testID={`feedback-category-${index}`}
                  onPress={() => handleCategorySelect(cat)}
                  style={[
                    styles.categoryPill,
                    category === cat && styles.categoryPillActive,
                  ]}
                  accessibilityLabel={cat}
                  accessibilityRole="button"
                  accessibilityState={{ selected: category === cat }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text testID="feedback-comment-label" style={styles.label}>
              {t('feedback.commentLabel')}
            </Text>
            <Controller
              control={control}
              name="comment"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    testID="feedback-comment-input"
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    placeholder={t('feedback.commentPlaceholder')}
                    placeholderTextColor={COLORS.text.tertiary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={500}
                    accessibilityLabel={t('feedback.commentLabel')}
                  />
                  <Text style={styles.charCount}>{value?.length || 0}/500</Text>
                </>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            testID="feedback-submit-button"
            style={[
              styles.submitButton,
              !canSubmitForm({ formState }) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmitFeedback)}
            disabled={!canSubmitForm({ formState }) || isSubmitting}
            accessibilityLabel={t('feedback.submitButton')}
            accessibilityRole="button"
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting
                ? t('feedback.submitting')
                : t('feedback.submitButton')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.modalBackdrop,
  },
  modal: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: COLORS.utility.white,
    borderRadius: RADII.xl,
    padding: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  starButton: {
    padding: SPACING.xs,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.full,
    backgroundColor: primitives.stone[100],
    borderWidth: 1,
    borderColor: primitives.stone[200],
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.brand.primary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: primitives.stone[50],
  },
  charCount: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
});

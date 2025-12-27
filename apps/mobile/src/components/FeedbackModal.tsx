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
import { analytics } from '../services/analytics';
import { feedbackSchema, type FeedbackInput } from '../utils/forms';
import { canSubmitForm } from '../utils/forms/helpers';
import { COLORS } from '../constants/colors';

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

const DEFAULT_CATEGORIES = [
  'Bug Report',
  'Feature Request',
  'General Feedback',
  'Performance Issue',
  'UI/UX Suggestion',
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  onSubmit,
  title = 'Share Your Feedback',
  subtitle = 'Help us improve your experience',
  categories = DEFAULT_CATEGORIES,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { impact } = useHaptics();

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
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View style={[styles.modal, animatedStyle]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.label}>
              How would you rate your experience?
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => handleRatingPress(value)}
                  style={styles.starButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={value <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={value <= rating ? COLORS.gold : COLORS.gray[300]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Category (optional)</Text>
            <View style={styles.categoriesContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => handleCategorySelect(cat)}
                  style={[
                    styles.categoryPill,
                    category === cat && styles.categoryPillActive,
                  ]}
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
            <Text style={styles.label}>Additional comments (optional)</Text>
            <Controller
              control={control}
              name="comment"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Tell us more about your experience..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{value?.length || 0}/500</Text>
                </>
              )}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              !canSubmitForm({ formState }) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit(onSubmitFeedback)}
            disabled={!canSubmitForm({ formState }) || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
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
    backgroundColor: COLORS.white,
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
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.gray[100],
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  categoryPillActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: COLORS.gray[50],
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.white,
  },
});

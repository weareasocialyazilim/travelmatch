/**
 * StorySection Component
 * Optional story/description input for CreateMoment screen
 */

import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS, CARD_SHADOW } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { VALUES } from '../../constants/values';

interface StorySectionProps {
  story: string;
  onStoryChange: (story: string) => void;
}

const StorySection: React.FC<StorySectionProps> = memo(
  ({ story, onStoryChange }) => {
    return (
      <View style={styles.storySection}>
        <Text style={styles.sectionLabel}>
          Why this matters <Text style={styles.optionalLabel}>(optional)</Text>
        </Text>
        <TextInput
          style={styles.storyInput}
          placeholder="Share the story behind this moment..."
          placeholderTextColor={COLORS.text.tertiary}
          value={story}
          onChangeText={onStoryChange}
          multiline
          numberOfLines={4}
          maxLength={VALUES.STORY_MAX_LENGTH}
          textAlignVertical="top"
          accessibilityLabel="Story or description"
          accessibilityHint="Optional - share the story behind this moment"
        />
        <Text style={styles.storyCounter}>
          {story.length}/{VALUES.STORY_MAX_LENGTH}
        </Text>
      </View>
    );
  },
);

StorySection.displayName = 'StorySection';

const styles = StyleSheet.create({
  storySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    color: COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  optionalLabel: {
    color: COLORS.text.tertiary,
    fontWeight: '400',
  },
  storyInput: {
    backgroundColor: COLORS.utility.white,
    borderRadius: LAYOUT.borderRadius.md,
    color: COLORS.text.primary,
    fontSize: 15,
    marginTop: 12,
    minHeight: 100,
    padding: 16,
    ...CARD_SHADOW,
  },
  storyCounter: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
});

export default StorySection;

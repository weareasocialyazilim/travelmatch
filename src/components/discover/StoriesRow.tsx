/**
 * StoriesRow Component
 * Horizontal stories row for Discover screen
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { UserStory } from './constants';

interface StoriesRowProps {
  stories: UserStory[];
  onStoryPress: (story: UserStory, index: number) => void;
  onCreatePress: () => void;
}

const StoriesRow: React.FC<StoriesRowProps> = memo(
  ({ stories, onStoryPress, onCreatePress }) => {
    return (
      <View style={styles.storiesSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {/* Create Story Button */}
          <TouchableOpacity
            style={styles.storyItem}
            onPress={onCreatePress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Create new moment"
          >
            <View style={styles.createStoryRing}>
              <View style={styles.createStoryInner}>
                <MaterialCommunityIcons
                  name="plus"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
            </View>
            <Text style={styles.storyName}>Create</Text>
          </TouchableOpacity>

          {/* User Stories */}
          {stories.map((user, index) => (
            <TouchableOpacity
              key={user.id}
              style={styles.storyItem}
              onPress={() => onStoryPress(user, index)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`View ${user.name}'s story`}
            >
              <View
                style={[
                  styles.storyRing,
                  user.isNew && styles.storyRingNew,
                  !user.isNew && styles.storyRingViewed,
                ]}
              >
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.storyAvatar}
                />
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {user.name}
              </Text>
              {user.isNew && <View style={styles.newIndicator} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  },
);

StoriesRow.displayName = 'StoriesRow';

const styles = StyleSheet.create({
  storiesSection: {
    backgroundColor: COLORS.white,
    paddingBottom: 16,
    paddingTop: 8,
  },
  storiesScroll: {
    gap: 16,
    paddingHorizontal: 20,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  createStoryRing: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderRadius: 36,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  createStoryInner: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  storyRing: {
    alignItems: 'center',
    borderRadius: 36,
    borderWidth: 3,
    height: 72,
    justifyContent: 'center',
    padding: 3,
    width: 72,
  },
  storyRingNew: {
    borderColor: COLORS.primary,
  },
  storyRingViewed: {
    borderColor: COLORS.border,
  },
  storyAvatar: {
    borderRadius: 30,
    height: 60,
    width: 60,
  },
  storyName: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  newIndicator: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: 12,
    top: 0,
    width: 12,
  },
});

export default StoriesRow;

/**
 * StoryList - Bounded Story Strip
 *
 * Displays stories as a horizontal strip with:
 * - Single row, no infinite scroll
 * - Clear visual boundary
 * - No pull-to-refresh
 * - Clear exit point
 */
import React, { memo, useCallback } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { StoryItem } from './StoryItem';

interface UserStory {
  id: string;
  name: string;
  avatar?: string | null;
  avatarCloudflareId?: string | null;
  avatarBlurHash?: string | null;
  stories: {
    id: string;
    imageUrl: string;
    isNew: boolean;
  }[];
}

interface StoryListProps {
  stories: UserStory[];
  onStoryPress: (userStory: UserStory, storyIndex: number) => void;
  onAvatarPress: (userId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_ITEM_WIDTH = 72;
const AVATAR_SIZE = 64;

export const StoryList = memo<StoryListProps>(function StoryList({
  stories,
  onStoryPress,
  onAvatarPress,
}) {
  const keyExtractor = useCallback((item: UserStory) => `user-${item.id}`, []);

  const renderItem = useCallback(
    ({ item, index }: { item: UserStory; index: number }) => (
      <View style={styles.storyWrapper}>
        {/* Avatar */}
        <StoryItem
          item={{
            id: item.id,
            name: item.name,
            avatar: item.avatar ?? '',
            avatarCloudflareId: item.avatarCloudflareId,
            avatarBlurHash: item.avatarBlurHash,
            hasStory: item.stories.length > 0,
            isNew: item.stories.some((s) => s.isNew),
          }}
          onPress={() => onAvatarPress(item.id)}
        />
        {/* First story indicator (if multiple stories) */}
        {item.stories.length > 0 && (
          <View style={styles.storyIndicator}>
            <View
              style={[
                styles.indicatorDot,
                item.stories[0].isNew && styles.indicatorDotNew,
              ]}
            />
          </View>
        )}
      </View>
    ),
    [onAvatarPress],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <FlatList
          data={stories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
          // Important: prevent infinite scroll behavior
          bounces={false}
          pagingEnabled={false}
        />
      </View>

      {/* Boundary indicator */}
      <View style={styles.boundary}>
        <View style={styles.boundaryLine} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  storyWrapper: {
    marginRight: 12,
    alignItems: 'center',
  },
  storyIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  indicatorDotNew: {
    backgroundColor: '#1a1a1a',
  },
  boundary: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  boundaryLine: {
    flex: 1,
    backgroundColor: '#eee',
  },
});

export default StoryList;

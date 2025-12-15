// Story Item Component - Individual story in the horizontal list
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OptimizedImage } from '../ui/OptimizedImage';
import { getAvatarImageProps, IMAGE_VARIANTS_BY_CONTEXT } from '../../utils/cloudflareImageHelpers';
import { COLORS } from '../../constants/colors';
import type { StoryItemProps } from './types';

export const StoryItem: React.FC<StoryItemProps> = ({ item, onPress }) => {
  // Prepare user object for avatar helper
  const user = {
    avatar: item.avatar,
    avatarCloudflareId: (item as any).avatarCloudflareId,
    avatarBlurHash: (item as any).avatarBlurHash,
  };

  return (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.storyCircle,
          item.isNew && styles.storyCircleNew,
          !item.isNew && styles.storyCircleSeen,
        ]}
      >
        <OptimizedImage
          {...getAvatarImageProps(user, IMAGE_VARIANTS_BY_CONTEXT.STORY_AVATAR)}
          contentFit="cover"
          style={styles.storyAvatar}
          transition={150}
          priority="normal"
          accessibilityLabel={`${item.name}'s story`}
        />
      </View>
      <Text style={styles.storyName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  storyItem: {
    alignItems: 'center',
    marginRight: 12,
    width: 72,
  },
  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    marginBottom: 4,
  },
  storyCircleNew: {
    borderWidth: 2,
    borderColor: COLORS.mint,
  },
  storyCircleSeen: {
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: COLORS.background,
  },
  storyName: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
  },
});

// Story Item Component - Individual story in the horizontal list
import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { OptimizedImage } from '../ui/OptimizedImage';
import {
  getAvatarImageProps,
  IMAGE_VARIANTS_BY_CONTEXT,
} from '../../utils/cloudflareImageHelpers';
import { COLORS } from '../../constants/colors';
import type { StoryItemProps } from './types';

export const StoryItem: React.FC<StoryItemProps> = memo(
  ({ item, onPress }) => {
    // Memoize user object to prevent recreating on every render
    const user = useMemo(() => {
      const it = item as unknown as {
        avatarCloudflareId?: string;
        avatarBlurHash?: string;
      };
      return {
        avatar: item.avatar,
        avatarCloudflareId: it.avatarCloudflareId,
        avatarBlurHash: it.avatarBlurHash,
      };
    }, [item]);

    // Memoize press handler to prevent recreating on every render
    const handlePress = useCallback(() => {
      onPress(item);
    }, [item, onPress]);

    // Memoize circle style to prevent recreation
    const circleStyle = useMemo(
      () => [
        styles.storyCircle,
        item.isNew ? styles.storyCircleNew : styles.storyCircleSeen,
      ],
      [item.isNew],
    );

    return (
      <TouchableOpacity
        style={styles.storyItem}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={circleStyle}>
          <OptimizedImage
            {...getAvatarImageProps(
              user,
              IMAGE_VARIANTS_BY_CONTEXT.STORY_AVATAR,
            )}
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
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.isNew === nextProps.item.isNew &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.avatar === nextProps.item.avatar,
);

StoryItem.displayName = 'StoryItem';

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
    borderColor: COLORS.border.default,
  },
  storyAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: COLORS.bg.primary,
  },
  storyName: {
    fontSize: 11,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
});

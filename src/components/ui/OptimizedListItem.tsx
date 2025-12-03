/**
 * Optimized List Item Component
 * React.memo ile optimize edilmiş liste item örneği
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { radii } from '../../constants/radii';
import { TYPOGRAPHY } from '../../constants/typography';

interface OptimizedListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  onPress: (id: string) => void;
}

/**
 * Memoized List Item
 * Only re-renders when props actually change
 */
export const OptimizedListItem = memo<OptimizedListItemProps>(
  ({ id, title, subtitle, imageUrl, onPress }) => {
    const handlePress = React.useCallback(() => {
      onPress(id);
    }, [id, onPress]);

    return (
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  },
  // Custom comparison function
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.imageUrl === nextProps.imageUrl
    );
  },
);

OptimizedListItem.displayName = 'OptimizedListItem';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    padding: spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    borderRadius: radii.sm,
    height: 60,
    marginRight: spacing.md,
    width: 60,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  title: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: '600',
  },
});

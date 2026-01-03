/**
 * EnhancedSearchBar Component
 *
 * Modern Discovery search bar with Liquid Glass effect.
 * Features integrated filter button and smooth transitions.
 *
 * Part of the Awwwards-standard Discovery experience.
 */
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY, FONT_SIZES_V2 } from '../../constants/typography';
import { GlassCard } from '../ui/GlassCard';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface EnhancedSearchBarProps {
  /** Callback when filter button is pressed */
  onFilterPress?: () => void;
  /** Callback when search value changes */
  onChangeText?: (text: string) => void;
  /** Callback when search is submitted */
  onSubmit?: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Current search value */
  value?: string;
  /** Whether filters are active (shows badge) */
  hasActiveFilters?: boolean;
  /** Auto-focus the input */
  autoFocus?: boolean;
  /** Additional TextInput props */
  inputProps?: Omit<TextInputProps, 'style' | 'placeholder' | 'placeholderTextColor'>;
}

/**
 * Modern Discovery Search Bar with Liquid Glass effect.
 * Features integrated filter button and subtle animations.
 */
export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onFilterPress,
  onChangeText,
  onSubmit,
  placeholder = 'Nereye gitmek istersin?',
  value,
  hasActiveFilters = false,
  autoFocus = false,
  inputProps,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState('');
  const searchValue = value ?? internalValue;

  const focusAnimation = useSharedValue(0);
  const filterScale = useSharedValue(1);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
  }, [focusAnimation]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
  }, [focusAnimation]);

  const handleChangeText = useCallback(
    (text: string) => {
      if (onChangeText) {
        onChangeText(text);
      } else {
        setInternalValue(text);
      }
    },
    [onChangeText],
  );

  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(searchValue);
    }
  }, [onSubmit, searchValue]);

  const handleFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFilterPress?.();
  }, [onFilterPress]);

  const handleFilterPressIn = useCallback(() => {
    filterScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  }, [filterScale]);

  const handleFilterPressOut = useCallback(() => {
    filterScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [filterScale]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    borderColor: interpolate(
      focusAnimation.value,
      [0, 1],
      [0, 1],
    ) === 1 ? COLORS.primary : COLORS.surface.glassBorder,
  }));

  const filterButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filterScale.value }],
  }));

  return (
    <View style={styles.container}>
      <GlassCard
        intensity={20}
        padding={0}
        borderRadius={20}
        style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}
      >
        <View style={styles.innerContainer}>
          {/* Search Icon */}
          <Ionicons
            name="search"
            size={20}
            color={isFocused ? COLORS.primary : COLORS.text.muted}
            style={styles.searchIcon}
          />

          {/* Text Input */}
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text.muted}
            value={searchValue}
            onChangeText={handleChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus={autoFocus}
            autoCorrect={false}
            autoCapitalize="none"
            {...inputProps}
          />

          {/* Filter Button */}
          {onFilterPress && (
            <AnimatedTouchable
              style={[styles.filterButton, filterButtonStyle]}
              onPress={handleFilterPress}
              onPressIn={handleFilterPressIn}
              onPressOut={handleFilterPressOut}
              activeOpacity={0.8}
            >
              <View style={styles.divider} />
              <View style={styles.filterIconWrapper}>
                <Ionicons
                  name="options-outline"
                  size={20}
                  color={hasActiveFilters ? COLORS.primary : COLORS.text.secondary}
                />
                {/* Active filter indicator */}
                {hasActiveFilters && <View style={styles.filterBadge} />}
              </View>
            </AnimatedTouchable>
          )}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchWrapper: {
    overflow: 'hidden',
  },
  searchWrapperFocused: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: FONT_SIZES_V2.body,
    fontFamily: TYPOGRAPHY.body?.fontFamily ?? 'System',
    paddingVertical: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    height: '100%',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border.light,
    marginRight: 12,
  },
  filterIconWrapper: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
});

export default EnhancedSearchBar;

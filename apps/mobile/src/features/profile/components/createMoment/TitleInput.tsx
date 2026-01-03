/**
 * TitleInput Component
 * Title input section for CreateMoment screen
 *
 * Also includes AwwwardsTitleInput variant:
 * - Liquid Glass surface with depth
 * - Neon focus glow effect
 * - Character counter with mono font
 * - Turkish placeholder text
 */

import React, { memo, useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY_SYSTEM } from '../../constants/typography';
import { VALUES } from '../../constants/values';

interface TitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
}

const TitleInput: React.FC<TitleInputProps> = memo(
  ({ title, onTitleChange }) => {
    return (
      <View style={styles.titleSection}>
        <TextInput
          style={styles.titleInput}
          placeholder="Give your moment a title..."
          placeholderTextColor={COLORS.text.tertiary}
          value={title}
          onChangeText={onTitleChange}
          maxLength={VALUES.TITLE_MAX_LENGTH}
          multiline
          accessibilityLabel="Moment title"
          accessibilityHint="Enter a title for your moment"
        />
        <Text style={styles.titleCounter}>
          {title.length}/{VALUES.TITLE_MAX_LENGTH}
        </Text>
      </View>
    );
  },
);

TitleInput.displayName = 'TitleInput';

const styles = StyleSheet.create({
  titleSection: {
    backgroundColor: COLORS.utility.white,
    borderBottomColor: COLORS.border.default,
    borderBottomWidth: 1,
    padding: 20,
  },
  titleInput: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '600',
    minHeight: 60,
  },
  titleCounter: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsTitleInput - Liquid Glass with Neon Focus
// Premium input with depth and glow effect
// ═══════════════════════════════════════════════════════════════════════════

interface AwwwardsTitleInputProps {
  /** Current title value */
  value: string;
  /** Callback when title changes */
  onChangeText: (text: string) => void;
  /** Placeholder text (default: "Bu anı nasıl tanımlarsın?") */
  placeholder?: string;
  /** Maximum character length (default: 50) */
  maxLength?: number;
}

/**
 * AwwwardsTitleInput - Liquid Glass Title Input
 *
 * Premium title input with:
 * - Liquid glass surface effect
 * - Neon glow on focus (brand.primary)
 * - Character counter with mono font
 * - Multiline support
 */
export const AwwwardsTitleInput: React.FC<AwwwardsTitleInputProps> = memo(
  ({
    value,
    onChangeText,
    placeholder = 'Bu anı nasıl tanımlarsın?',
    maxLength = 50,
  }) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    return (
      <View style={awwwardsStyles.container}>
        {/* Input wrapper with focus glow */}
        <View
          style={[
            awwwardsStyles.inputWrapper,
            isFocused && awwwardsStyles.inputFocused,
          ]}
        >
          <TextInput
            style={awwwardsStyles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.text.tertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            multiline
            accessibilityLabel="Moment başlığı"
            accessibilityHint="Anınız için bir başlık girin"
          />
        </View>

        {/* Character counter */}
        <Text style={awwwardsStyles.counter}>
          {value.length} / {maxLength}
        </Text>
      </View>
    );
  },
);

AwwwardsTitleInput.displayName = 'AwwwardsTitleInput';

const awwwardsStyles = StyleSheet.create({
  // Container
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },

  // Input wrapper with glass effect
  inputWrapper: {
    backgroundColor: COLORS.surface.base,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 80,
    justifyContent: 'center',
  },

  // Focused state with neon glow
  inputFocused: {
    borderColor: COLORS.brand.primary,
    // Neon glow effect
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },

  // Input text
  input: {
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyL,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    lineHeight: TYPOGRAPHY_SYSTEM.sizes.bodyL * TYPOGRAPHY_SYSTEM.lineHeights.normal,
  },

  // Character counter
  counter: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 10,
    color: COLORS.text.tertiary,
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    letterSpacing: 0.5,
  },
});

export default TitleInput;

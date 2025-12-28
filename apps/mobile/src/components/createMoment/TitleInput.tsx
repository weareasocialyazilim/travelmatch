/**
 * TitleInput Component
 * Title input section for CreateMoment screen
 */

import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
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

export default TitleInput;

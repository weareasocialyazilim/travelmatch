import React, { useCallback, useRef, useState } from 'react';
import type { ViewStyle } from 'react-native';
import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface DismissKeyboardViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Wrapper that dismisses keyboard on tap outside
 */
export const DismissKeyboardView: React.FC<DismissKeyboardViewProps> = ({
  children,
  style,
}) => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={[styles.container, style]}>{children}</View>
    </TouchableWithoutFeedback>
  );
};

interface KeyboardAwareScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  extraScrollHeight?: number;
}

/**
 * ScrollView that handles keyboard properly
 */
export const KeyboardAwareScrollView: React.FC<
  KeyboardAwareScrollViewProps
> = ({
  children,
  style,
  contentContainerStyle,
  keyboardShouldPersistTaps = 'handled',
  extraScrollHeight = 20,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={style}
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
          { paddingBottom: extraScrollHeight },
        ]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface FormInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'name' | 'tel' | 'off';
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  editable?: boolean;
  style?: ViewStyle;
  onBlur?: () => void;
  onFocus?: () => void;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  testID?: string;
}

/**
 * Form Input with validation state
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  touched = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  style,
  onBlur,
  onFocus,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit = true,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(!secureTextEntry);

  const showError = touched && !!error;
  const actualSecureEntry = secureTextEntry && !isSecureVisible;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const toggleSecureEntry = useCallback(() => {
    setIsSecureVisible((prev) => !prev);
  }, []);

  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          showError && styles.inputWrapperError,
          !editable && styles.inputWrapperDisabled,
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary : COLORS.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray[400]}
          secureTextEntry={actualSecureEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
          ]}
          testID={testID}
          accessibilityLabel={label || placeholder}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={toggleSecureEntry}
            style={styles.rightIconButton}
            accessibilityLabel={
              isSecureVisible ? 'Hide password' : 'Show password'
            }
            testID={testID ? `${testID}-toggle-visibility` : undefined}
          >
            <MaterialCommunityIcons
              name={isSecureVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            disabled={!onRightIconPress}
            testID={testID ? `${testID}-right-icon` : undefined}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {showError && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={14}
            color={COLORS.error}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {maxLength && (
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorBackground,
  },
  inputWrapperDisabled: {
    backgroundColor: COLORS.gray[100],
    opacity: 0.7,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
    minHeight: 100,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 76,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 4,
  },
  rightIconButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
});

export default {
  DismissKeyboardView,
  KeyboardAwareScrollView,
  FormInput,
};

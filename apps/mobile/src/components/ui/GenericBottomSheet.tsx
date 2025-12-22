/**
 * Generic Bottom Sheet Component
 * Reusable bottom sheet with customizable content, animations, and gestures
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  type ReactNode,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { a11yProps } from '../../utils/accessibility';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bottom sheet height presets
export type BottomSheetHeight =
  | 'auto'
  | 'small'
  | 'medium'
  | 'large'
  | 'full'
  | number;

const HEIGHT_MAP: Record<string, number> = {
  small: SCREEN_HEIGHT * 0.3,
  medium: SCREEN_HEIGHT * 0.5,
  large: SCREEN_HEIGHT * 0.75,
  full: SCREEN_HEIGHT * 0.9,
};

export interface BottomSheetRef {
  open: () => void;
  close: () => void;
  expand: () => void;
  collapse: () => void;
}

export interface GenericBottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when bottom sheet is closed */
  onClose: () => void;
  /** Title of the bottom sheet */
  title?: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Height preset or exact value */
  height?: BottomSheetHeight;
  /** Content to render inside the sheet */
  children: ReactNode;
  /** Whether to show the drag handle */
  showHandle?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether the sheet can be dismissed by tapping backdrop */
  dismissible?: boolean;
  /** Whether the sheet can be dismissed by swiping down */
  swipeToDismiss?: boolean;
  /** Custom header component */
  renderHeader?: () => ReactNode;
  /** Custom footer component */
  renderFooter?: () => ReactNode;
  /** Whether to avoid keyboard */
  keyboardAware?: boolean;
  /** Whether content is scrollable */
  scrollable?: boolean;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

export const GenericBottomSheet = forwardRef<
  BottomSheetRef,
  GenericBottomSheetProps
>(
  (
    {
      visible,
      onClose,
      title,
      subtitle,
      height = 'medium',
      children,
      showHandle = true,
      showCloseButton = true,
      dismissible = true,
      swipeToDismiss = true,
      renderHeader,
      renderFooter,
      keyboardAware = true,
      scrollable = true,
      testID,
      accessibilityLabel,
    },
    ref,
  ) => {
    const insets = useSafeAreaInsets();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    // Calculate sheet height
    const sheetHeight =
      height === 'auto'
        ? undefined
        : typeof height === 'number'
        ? height
        : HEIGHT_MAP[height] || HEIGHT_MAP.medium;

    // Reset translateY when visibility changes
    useEffect(() => {
      if (!visible) {
        translateY.setValue(SCREEN_HEIGHT);
        backdropOpacity.setValue(0);
      }
    }, [visible, translateY, backdropOpacity]);

    // Pan responder for swipe gestures
    const panResponder = useRef(
      PanResponder?.create
        ? PanResponder.create({
            onStartShouldSetPanResponder: () => swipeToDismiss,
            onMoveShouldSetPanResponder: (_, gestureState) =>
              swipeToDismiss && Math.abs(gestureState.dy) > 5,
            onPanResponderMove: (_, gestureState) => {
              if (gestureState.dy > 0) {
                translateY.setValue(gestureState.dy);
              }
            },
            onPanResponderRelease: (_, gestureState) => {
              if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                closeSheet();
              } else {
                Animated.spring(translateY, {
                  toValue: 0,
                  useNativeDriver: true,
                  tension: 100,
                  friction: 10,
                }).start();
              }
            },
          })
        : { panHandlers: {} },
    ).current;

    const openSheet = useCallback(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, [backdropOpacity, translateY]);

    const closeSheet = useCallback(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: sheetHeight || SCREEN_HEIGHT,
          useNativeDriver: true,
          tension: 100,
          friction: 10,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }, [backdropOpacity, onClose, sheetHeight, translateY]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      open: openSheet,
      close: closeSheet,
      expand: () => {
        Animated.spring(translateY, {
          toValue: -SCREEN_HEIGHT * 0.2,
          useNativeDriver: true,
        }).start();
      },
      collapse: () => {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    }));

    useEffect(() => {
      if (visible) {
        openSheet();
      }
    }, [visible, openSheet]);

    const handleBackdropPress = useCallback(() => {
      if (dismissible) {
        closeSheet();
      }
    }, [dismissible, closeSheet]);

    const ContentWrapper = scrollable ? ScrollView : View;

    const content = (
      <>
        {/* Handle */}
        {showHandle && (
          <View
            style={styles.handleContainer}
            testID={testID ? `${testID}-handle` : undefined}
            {...panResponder.panHandlers}
          >
            <View style={styles.handle} />
          </View>
        )}

        {/* Header */}
        {renderHeader
          ? renderHeader()
          : (title || subtitle) && (
              <View
                style={styles.header}
                testID={testID ? `${testID}-header` : undefined}
              >
                <View style={styles.titleContainer}>
                  {title && (
                    <Text style={styles.title} {...a11yProps.header(1, title)}>
                      {title}
                    </Text>
                  )}
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    onPress={closeSheet}
                    style={styles.closeButton}
                    testID={testID ? `${testID}-close-button` : undefined}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    {...a11yProps.button('Close', 'Close this sheet')}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

        {/* Content */}
        <ContentWrapper
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          testID={
            testID
              ? scrollable
                ? `${testID}-scroll-view`
                : `${testID}-content`
              : undefined
          }
        >
          {children}
        </ContentWrapper>

        {/* Footer */}
        {renderFooter && (
          <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
            {renderFooter()}
          </View>
        )}
      </>
    );

    // Don't render anything when not visible
    if (!visible) {
      return null;
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleBackdropPress}
        statusBarTranslucent
      >
        <View style={styles.container}>
          {/* Backdrop */}
          <TouchableWithoutFeedback
            onPress={handleBackdropPress}
            testID={testID ? `${testID}-backdrop` : undefined}
          >
            <Animated.View
              style={[styles.backdrop, { opacity: backdropOpacity }]}
            />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet */}
          <Animated.View
            testID={testID}
            accessibilityLabel={accessibilityLabel || title}
            accessibilityRole="none"
            accessibilityLiveRegion="polite"
            accessible={true}
            style={[
              styles.sheet,
              sheetHeight ? { height: sheetHeight } : undefined,
              { transform: [{ translateY }] },
              { paddingBottom: insets.bottom },
            ]}
          >
            {keyboardAware ? (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                testID={testID ? `${testID}-keyboard-avoiding` : undefined}
              >
                {content}
              </KeyboardAvoidingView>
            ) : (
              content
            )}
          </Animated.View>
        </View>
      </Modal>
    );
  },
);

GenericBottomSheet.displayName = 'GenericBottomSheet';

/**
 * Confirmation Bottom Sheet
 * Pre-built confirmation dialog using GenericBottomSheet
 */
export interface ConfirmationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmDestructive?: boolean;
  loading?: boolean;
}

export const ConfirmationBottomSheet: React.FC<
  ConfirmationBottomSheetProps
> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmDestructive = false,
  loading = false,
}) => {
  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      height="small"
      showCloseButton={false}
      testID="confirmation-sheet"
    >
      <View style={confirmStyles.container}>
        <Text style={confirmStyles.message}>{message}</Text>

        <View style={confirmStyles.buttons}>
          <TouchableOpacity
            style={[confirmStyles.button, confirmStyles.cancelButton]}
            onPress={onClose}
            disabled={loading}
            testID="confirmation-cancel-button"
            {...a11yProps.button(cancelText)}
          >
            <Text style={confirmStyles.cancelText}>{cancelText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              confirmStyles.button,
              confirmStyles.confirmButton,
              confirmDestructive && confirmStyles.destructiveButton,
            ]}
            onPress={onConfirm}
            disabled={loading}
            testID="confirmation-confirm-button"
            {...a11yProps.button(confirmText)}
          >
            {loading ? (
              <Text
                style={[
                  confirmStyles.confirmText,
                  confirmDestructive && confirmStyles.destructiveText,
                ]}
                testID="confirmation-loading-text"
              >
                Loading...
              </Text>
            ) : (
              <Text
                style={[
                  confirmStyles.confirmText,
                  confirmDestructive && confirmStyles.destructiveText,
                ]}
              >
                {confirmText}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </GenericBottomSheet>
  );
};

/**
 * Selection Bottom Sheet
 * Pre-built selection list using GenericBottomSheet
 */
export interface SelectionOption<T = string> {
  value: T;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectionBottomSheetProps<T = string> {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: T) => void;
  title: string;
  options: SelectionOption<T>[];
  selectedValue?: T;
  multiple?: boolean;
}

export function SelectionBottomSheet<T = string>({
  visible,
  onClose,
  onSelect,
  title,
  options,
  selectedValue,
}: SelectionBottomSheetProps<T>) {
  return (
    <GenericBottomSheet
      visible={visible}
      onClose={onClose}
      title={title}
      height="medium"
      testID="selection-sheet"
    >
      <View style={selectionStyles.container}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={String(option.value)}
            style={[
              selectionStyles.option,
              option.disabled && selectionStyles.optionDisabled,
              selectedValue === option.value && selectionStyles.optionSelected,
              index === options.length - 1 && selectionStyles.lastOption,
            ]}
            onPress={() => {
              if (!option.disabled) {
                onSelect(option.value);
                onClose();
              }
            }}
            disabled={option.disabled}
            testID={`selection-option-${String(option.value)}`}
            {...a11yProps.button(
              option.label,
              option.description,
              option.disabled,
            )}
          >
            {option.icon && (
              <MaterialCommunityIcons
                name={
                  option.icon as keyof typeof MaterialCommunityIcons.glyphMap
                }
                size={24}
                color={option.disabled ? COLORS.gray[300] : COLORS.text}
                style={selectionStyles.optionIcon}
                testID={`selection-option-${String(option.value)}-icon`}
              />
            )}
            <View style={selectionStyles.optionContent}>
              <Text
                style={[
                  selectionStyles.optionLabel,
                  option.disabled && selectionStyles.optionLabelDisabled,
                ]}
              >
                {option.label}
              </Text>
              {option.description && (
                <Text style={selectionStyles.optionDescription}>
                  {option.description}
                </Text>
              )}
            </View>
            {selectedValue === option.value && (
              <MaterialCommunityIcons
                name="check"
                size={24}
                color={COLORS.primary}
                testID={`selection-option-${String(option.value)}-check`}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </GenericBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay50,
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.gray[300],
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  keyboardView: {
    flex: 1,
  },
});

const confirmStyles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray[100],
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  destructiveText: {
    color: COLORS.white,
  },
});

const selectionStyles = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  optionLabelDisabled: {
    color: COLORS.gray[400],
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default GenericBottomSheet;

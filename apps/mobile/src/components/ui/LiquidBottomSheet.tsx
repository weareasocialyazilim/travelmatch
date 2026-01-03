// components/ui/LiquidBottomSheet.tsx
// TravelMatch Ultimate Design System 2026
// Awwwards standardında cam Bottom Sheet
// Tüm seçim ve giriş menüleri için ortak ipeksi zemin sağlar

import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/typography';
import { HAPTIC, SPRING } from '@/hooks/useMotion';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface LiquidBottomSheetProps {
  /** Sheet title displayed in header */
  title: string;
  /** Callback when sheet is closed */
  onClose: () => void;
  /** Content to render inside the sheet */
  children: React.ReactNode;
  /** Sheet height (default: 50% of screen) */
  height?: number | 'auto';
  /** Whether sheet is visible */
  visible?: boolean;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Show drag handle */
  showHandle?: boolean;
  /** Enable swipe to dismiss */
  swipeToDismiss?: boolean;
  /** Blur intensity (0-100) */
  blurIntensity?: number;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

/**
 * Awwwards standardında cam Bottom Sheet.
 * Tüm seçim ve giriş menüleri için ortak ipeksi zemin sağlar.
 *
 * @example
 * ```tsx
 * <LiquidBottomSheet
 *   title="Filtrele"
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 * >
 *   <FilterContent />
 * </LiquidBottomSheet>
 * ```
 */
export const LiquidBottomSheet: React.FC<LiquidBottomSheetProps> = ({
  title,
  onClose,
  children,
  height = SCREEN_HEIGHT * 0.5,
  visible = true,
  showCloseButton = true,
  showHandle = true,
  swipeToDismiss = true,
  blurIntensity = 60,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const overlayOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  const sheetHeight = height === 'auto' ? SCREEN_HEIGHT * 0.5 : height;
  const dismissThreshold = sheetHeight * 0.3;

  // Open animation
  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SPRING.default);
      overlayOpacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, SPRING.default);
      overlayOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    HAPTIC.light();
    translateY.value = withSpring(SCREEN_HEIGHT, SPRING.default, () => {
      runOnJS(onClose)();
    });
    overlayOpacity.value = withTiming(0, { duration: 200 });
  }, [onClose]);

  // Pan gesture for swipe to dismiss
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      if (swipeToDismiss) {
        // Only allow dragging down
        translateY.value = Math.max(0, context.value.y + event.translationY);
      }
    })
    .onEnd((event) => {
      if (swipeToDismiss) {
        if (event.translationY > dismissThreshold || event.velocityY > 500) {
          runOnJS(HAPTIC.medium)();
          translateY.value = withSpring(SCREEN_HEIGHT, SPRING.default, () => {
            runOnJS(onClose)();
          });
          overlayOpacity.value = withTiming(0, { duration: 200 });
        } else {
          translateY.value = withSpring(0, SPRING.snappy);
        }
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!visible) return null;

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={styles.container}>
        {/* Overlay */}
        <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
          <Pressable style={styles.dismissArea} onPress={handleClose} />
        </Animated.View>

        {/* Sheet */}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.sheetContainer,
              { height: sheetHeight + insets.bottom },
              animatedSheetStyle,
            ]}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              {Platform.OS === 'ios' ? (
                <BlurView
                  intensity={blurIntensity}
                  tint="dark"
                  style={[styles.sheet, { paddingBottom: insets.bottom }]}
                >
                  <SheetContent
                    title={title}
                    onClose={handleClose}
                    showHandle={showHandle}
                    showCloseButton={showCloseButton}
                  >
                    {children}
                  </SheetContent>
                </BlurView>
              ) : (
                <View style={[styles.sheetAndroid, { paddingBottom: insets.bottom }]}>
                  <SheetContent
                    title={title}
                    onClose={handleClose}
                    showHandle={showHandle}
                    showCloseButton={showCloseButton}
                  >
                    {children}
                  </SheetContent>
                </View>
              )}
            </KeyboardAvoidingView>
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
};

// Internal component for sheet content
const SheetContent: React.FC<{
  title: string;
  onClose: () => void;
  showHandle: boolean;
  showCloseButton: boolean;
  children: React.ReactNode;
}> = ({ title, onClose, showHandle, showCloseButton, children }) => (
  <>
    {/* Handle */}
    {showHandle && <View style={styles.handle} />}

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.title}>{title.toUpperCase()}</Text>
      {showCloseButton && (
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          accessibilityLabel="Kapat"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={COLORS.text.secondary}
          />
        </TouchableOpacity>
      )}
    </View>

    {/* Content */}
    <View style={styles.content}>{children}</View>
  </>
);

/**
 * Simple static variant without animations (for Modal usage)
 */
export const LiquidBottomSheetStatic: React.FC<
  Omit<LiquidBottomSheetProps, 'visible' | 'swipeToDismiss'>
> = ({
  title,
  onClose,
  children,
  height = SCREEN_HEIGHT * 0.5,
  showCloseButton = true,
  showHandle = true,
  blurIntensity = 60,
}) => {
  const insets = useSafeAreaInsets();
  const sheetHeight = height === 'auto' ? SCREEN_HEIGHT * 0.5 : height;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dismissArea}
        onPress={onClose}
        activeOpacity={1}
      />

      <View style={[styles.sheetContainer, { height: sheetHeight + insets.bottom }]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={blurIntensity}
            tint="dark"
            style={[styles.sheet, { paddingBottom: insets.bottom }]}
          >
            <SheetContent
              title={title}
              onClose={onClose}
              showHandle={showHandle}
              showCloseButton={showCloseButton}
            >
              {children}
            </SheetContent>
          </BlurView>
        ) : (
          <View style={[styles.sheetAndroid, { paddingBottom: insets.bottom }]}>
            <SheetContent
              title={title}
              onClose={onClose}
              showHandle={showHandle}
              showCloseButton={showCloseButton}
            >
              {children}
            </SheetContent>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  dismissArea: {
    flex: 1,
  },
  sheetContainer: {
    width: SCREEN_WIDTH,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  keyboardView: {
    flex: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 32, 0.8)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.border.light,
    padding: 24,
    overflow: 'hidden',
  },
  sheetAndroid: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 32, 0.95)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: COLORS.border.light,
    padding: 24,
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.text.muted,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    fontFamily: FONTS.mono.medium,
    color: COLORS.text.secondary,
    letterSpacing: 2,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  content: {
    flex: 1,
  },
});

export default LiquidBottomSheet;

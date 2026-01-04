/**
 * StoryViewer Component
 * Full-screen story/moment viewer
 *
 * Features:
 * - User avatar & name (tap to go profile)
 * - Moment image fullscreen
 * - Compact Moment Card with info
 * - Gift button (send gift for this moment)
 * - Share button
 * - Progress bars & navigation
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import { STORY_DURATION } from './constants';
import type { UserStory, Story } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoryViewerProps {
  visible: boolean;
  user: UserStory | null;
  currentStoryIndex: number;
  onClose: () => void;
  onNextStory: () => void;
  onPreviousStory: () => void;
  onViewMoment: (story: Story) => void;
  onUserPress: (userId: string) => void;
  onGift: (story: Story) => void;
  onShare: (story: Story) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  visible,
  user,
  currentStoryIndex,
  onClose,
  onNextStory,
  onPreviousStory,
  onViewMoment,
  onUserPress,
  onGift,
  onShare,
  isPaused,
  setIsPaused,
}) => {
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const pausedProgress = useSharedValue(0);

  const currentStory = user?.stories[currentStoryIndex];

  // Animated progress bar
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Start timer
  const startStoryTimer = useCallback(() => {
    if (!user) return;

    progress.value = 0;
    progress.value = withTiming(
      1,
      {
        duration: STORY_DURATION,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(onNextStory)();
        }
      },
    );
  }, [user, onNextStory, progress]);

  // Pause
  const pauseStory = useCallback(() => {
    setIsPaused(true);
    pausedProgress.value = progress.value;
    cancelAnimation(progress);
  }, [setIsPaused, progress, pausedProgress]);

  // Resume
  const resumeStory = useCallback(() => {
    setIsPaused(false);
    const remainingProgress = 1 - pausedProgress.value;
    const remainingDuration = STORY_DURATION * remainingProgress;

    progress.value = withTiming(
      1,
      {
        duration: remainingDuration,
        easing: Easing.linear,
      },
      (finished) => {
        if (finished) {
          runOnJS(onNextStory)();
        }
      },
    );
  }, [onNextStory, progress, pausedProgress, setIsPaused]);

  // Handle tap navigation
  const handleStoryTap = useCallback(
    (event: GestureResponderEvent) => {
      const { locationX } = event.nativeEvent;
      const screenMiddle = SCREEN_WIDTH / 2;

      if (locationX < screenMiddle) {
        onPreviousStory();
      } else {
        onNextStory();
      }
    },
    [onPreviousStory, onNextStory],
  );

  // Effect: start timer on story change
  useEffect(() => {
    if (visible && user && !isPaused) {
      startStoryTimer();
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [visible, user, currentStoryIndex, isPaused, startStoryTimer, progress]);

  if (!user || !currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="black"
          translucent
        />

        {/* Background Image & Touch Handler */}
        <TouchableWithoutFeedback
          onPress={handleStoryTap}
          onPressIn={pauseStory}
          onPressOut={resumeStory}
        >
          <View style={styles.backgroundContainer}>
            <Image
              source={{ uri: currentStory.imageUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.5)', 'transparent']}
              style={styles.topGradient}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bottomGradient}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* UI Layer */}
        <View
          style={[
            styles.uiContainer,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
          pointerEvents="box-none"
        >
          {/* === TOP SECTION === */}
          <View style={styles.topSection} pointerEvents="box-none">
            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {user.stories.map((_, index) => (
                <View key={index} style={styles.progressBarWrapper}>
                  {index < currentStoryIndex ? (
                    <View style={[styles.progressBarFill, styles.fullWidth]} />
                  ) : index === currentStoryIndex ? (
                    <Animated.View
                      style={[styles.progressBarFill, progressStyle]}
                    />
                  ) : null}
                </View>
              ))}
            </View>

            {/* Header: User Info & Close */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.userTouchable}
                onPress={() => {
                  onClose();
                  onUserPress(user.id);
                }}
                activeOpacity={0.7}
              >
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text style={styles.storyTime}>{currentStory.time}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.utility.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* === BOTTOM SECTION === */}
          <View style={styles.bottomSection} pointerEvents="box-none">
            {/* Moment Card (Compact) */}
            <View style={styles.momentCard}>
              <View style={styles.momentCardContent}>
                <Text style={styles.momentTitle} numberOfLines={1}>
                  {currentStory.title}
                </Text>
                <Text style={styles.momentDescription} numberOfLines={2}>
                  {currentStory.description}
                </Text>
                <View style={styles.momentMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={14}
                      color={COLORS.utility.white}
                    />
                    <Text style={styles.metaText}>{currentStory.distance}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons
                      name="tag"
                      size={14}
                      color={COLORS.utility.white}
                    />
                    <Text style={styles.metaText}>
                      {currentStory.price === 0
                        ? 'Ücretsiz'
                        : `₺${currentStory.price}`}
                    </Text>
                  </View>
                </View>
              </View>

              {/* View Moment Button */}
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => onViewMoment(currentStory)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewButtonText}>Görüntüle</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={18}
                  color={COLORS.utility.white}
                />
              </TouchableOpacity>
            </View>

            {/* Action Buttons: Gift & Share */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.giftButton}
                onPress={() => onGift(currentStory)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="gift"
                  size={20}
                  color={COLORS.utility.white}
                />
                <Text style={styles.giftButtonText}>
                  Hediye Teklifi ile Yanıtla
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => onShare(currentStory)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color={COLORS.utility.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.utility.black,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  uiContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    width: '100%',
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },

  // Progress Bars
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 4,
  },
  progressBarWrapper: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.utility.white,
    borderRadius: 1,
  },
  fullWidth: {
    width: '100%',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.utility.white,
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    color: COLORS.utility.white,
    fontWeight: '600',
    fontSize: 15,
  },
  storyTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Moment Card
  momentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  momentCardContent: {
    flex: 1,
    marginRight: 12,
  },
  momentTitle: {
    color: COLORS.utility.white,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  momentDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  momentMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  viewButtonText: {
    color: COLORS.utility.white,
    fontWeight: '600',
    fontSize: 13,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  giftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.mint,
    paddingVertical: 14,
    borderRadius: 14,
  },
  giftButtonText: {
    color: COLORS.utility.white,
    fontWeight: '700',
    fontSize: 15,
  },
  shareButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
  },
});

export default StoryViewer;

/**
 * StoryViewer Component
 * Full-screen story viewer with progress bars and navigation
 *
 * Updated to use Reanimated for 60 FPS animations on UI thread
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
import { COLORS } from '../../constants/colors';
import { STORY_DURATION } from './constants';
import type { UserStory, Story } from './types';
import { StoryActionBar } from './StoryActionBar';

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
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  // Social interactions (Reels-style)
  onLike?: (storyId: string) => void;
  onComment?: (storyId: string) => void;
  onShare?: (storyId: string) => void;
  onSave?: (storyId: string) => void;
  showActionBar?: boolean;
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
  isPaused,
  setIsPaused,
  onLike,
  onComment,
  onShare,
  onSave,
  showActionBar = true,
}) => {
  const insets = useSafeAreaInsets();

  // Reanimated shared value for progress (runs on UI thread)
  const progress = useSharedValue(0);
  const pausedProgress = useSharedValue(0);

  const currentStory = user?.stories[currentStoryIndex];

  // Animated style for progress bar width
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  // Start timer animation using Reanimated (60 FPS on UI thread)
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
      }
    );
  }, [user, onNextStory, progress]);

  // Pause story
  const pauseStory = useCallback(() => {
    setIsPaused(true);
    pausedProgress.value = progress.value;
    cancelAnimation(progress);
  }, [setIsPaused, progress, pausedProgress]);

  // Resume story
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
      }
    );
  }, [onNextStory, progress, pausedProgress, setIsPaused]);

  // Handle tap on story
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

  // Start timer when story changes
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

        {/* Layer 1: Background Image & Touch Handler */}
        <TouchableWithoutFeedback
          onPress={handleStoryTap}
          onPressIn={pauseStory}
          onPressOut={resumeStory}
        >
          <View style={styles.backgroundContainer}>
            <Image
              source={{ uri: currentStory?.imageUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            {/* Gradient Overlays for better text visibility */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.topGradient}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.bottomGradient}
            />
          </View>
        </TouchableWithoutFeedback>

        {/* Layer 2: UI Elements (Safe Area) */}
        <View
          style={[
            styles.uiContainer,
            { paddingTop: insets.top, paddingBottom: insets.bottom },
          ]}
          pointerEvents="box-none"
        >
          {/* Top Section: Progress & Header */}
          <View style={styles.topSection} pointerEvents="box-none">
            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {user.stories.map((_, index) => (
                <View key={index} style={styles.progressBarWrapper}>
                  <View style={styles.progressBarBg} />
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

            {/* Header - User Info & Close */}
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
                  <Text style={styles.storyTime}>
                    {currentStory?.time || '2h ago'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={COLORS.utility.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Section: Info Card */}
          <View style={styles.bottomSection} pointerEvents="box-none">
            <View style={styles.bottomContent}>
              {/* Info Card */}
              <View style={styles.infoCard}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoTitle} numberOfLines={1}>
                    {currentStory?.title}
                  </Text>
                  <Text style={styles.infoDescription} numberOfLines={2}>
                    {currentStory?.description}
                  </Text>
                  <View style={styles.infoMeta}>
                    <View style={styles.infoMetaItem}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={14}
                        color={COLORS.utility.white}
                      />
                      <Text style={styles.infoMetaText}>
                        {currentStory?.distance}
                      </Text>
                    </View>
                    <View style={styles.infoMetaItem}>
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={14}
                        color={COLORS.utility.white}
                      />
                      <Text style={styles.infoMetaText}>
                        {currentStory?.price === 0
                          ? 'Ücretsiz'
                          : `₺${currentStory?.price}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.viewMomentBtn}
                  onPress={() => onViewMoment(currentStory)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.viewMomentText}>Görüntüle</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color={COLORS.utility.white}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Right Side Action Bar (Reels-style) */}
          {showActionBar && (
            <View style={[styles.actionBarContainer, { bottom: insets.bottom + 100 }]}>
              <StoryActionBar
                likeCount={currentStory?.likeCount || 0}
                commentCount={currentStory?.commentCount || 0}
                shareCount={currentStory?.shareCount}
                isLiked={currentStory?.isLiked}
                isSaved={currentStory?.isSaved}
                onLike={() => onLike?.(currentStory?.id || '')}
                onComment={() => onComment?.(currentStory?.id || '')}
                onShare={() => onShare?.(currentStory?.id || '')}
                onSave={() => onSave?.(currentStory?.id || '')}
              />
            </View>
          )}
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
    height: 150,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
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
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    gap: 4,
  },
  progressBarWrapper: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.utility.white,
    borderRadius: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  userTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.utility.white,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    color: COLORS.utility.white,
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  storyTime: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 20,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginRight: 12,
  },
  infoTitle: {
    color: COLORS.utility.white,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  infoMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoMetaText: {
    color: COLORS.utility.white,
    fontSize: 13,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  viewMomentBtn: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  viewMomentText: {
    color: COLORS.utility.white,
    fontWeight: '700',
    fontSize: 14,
  },
  bottomContent: {
    flex: 1,
  },
  actionBarContainer: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
  },
});

export default StoryViewer;

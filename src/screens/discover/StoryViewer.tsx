/**
 * StoryViewer Component
 * Full-screen story viewer with progress bars and navigation
 */

import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { UserStory, Story } from './types';
import { STORY_DURATION } from './constants';

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
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  const currentStory = user?.stories[currentStoryIndex];

  // Start timer animation
  const startStoryTimer = useCallback(() => {
    if (!user) return;

    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        onNextStory();
      }
    });
  }, [user, isPaused, onNextStory, progressAnim]);

  // Pause story
  const pauseStory = useCallback(() => {
    setIsPaused(true);
    progressAnim.stopAnimation();
  }, [setIsPaused, progressAnim]);

  // Resume story
  const resumeStory = useCallback(() => {
    setIsPaused(false);
    const currentValue =
      (progressAnim as unknown as { _value: number })._value || 0;
    const remainingDuration = STORY_DURATION * (1 - currentValue);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: remainingDuration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !isPaused) {
        onNextStory();
      }
    });
  }, [isPaused, onNextStory, progressAnim, setIsPaused]);

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
      progressAnim.stopAnimation();
    };
  }, [
    visible,
    user,
    currentStoryIndex,
    isPaused,
    startStoryTimer,
    progressAnim,
  ]);

  if (!user || !currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Progress Bars */}
          <View style={styles.progressContainer}>
            {user.stories.map((_, index) => (
              <View key={index} style={styles.progressBarWrapper}>
                <View style={styles.progressBarBg} />
                {index < currentStoryIndex ? (
                  <View style={[styles.progressBarFill, styles.fullWidth]} />
                ) : index === currentStoryIndex ? (
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                ) : null}
              </View>
            ))}
          </View>

          {/* Header - User Info */}
          <View style={styles.header}>
            <View style={styles.userRow}>
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
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={26}
                  color={COLORS.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Story Content with Touch Areas */}
          <TouchableWithoutFeedback
            onPress={handleStoryTap}
            onPressIn={pauseStory}
            onPressOut={resumeStory}
          >
            <View style={styles.content}>
              <Image
                source={{ uri: currentStory?.imageUrl }}
                style={styles.storyImage}
                resizeMode="cover"
              />

              {/* Touch indicators (invisible but helpful) */}
              <View style={styles.touchAreas}>
                <View style={styles.touchLeft} />
                <View style={styles.touchRight} />
              </View>
            </View>
          </TouchableWithoutFeedback>

          {/* Moment Info Card */}
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
                    color={COLORS.white}
                  />
                  <Text style={styles.infoMetaText}>
                    {currentStory?.distance}
                  </Text>
                </View>
                <View style={styles.infoMetaItem}>
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={14}
                    color={COLORS.white}
                  />
                  <Text style={styles.infoMetaText}>
                    {currentStory?.price === 0
                      ? 'Free'
                      : `$${currentStory?.price}`}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.viewMomentBtn}
              onPress={() => onViewMoment(currentStory)}
            >
              <Text style={styles.viewMomentText}>View</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 4,
  },
  progressBarWrapper: {
    flex: 1,
    height: 3,
    position: 'relative',
  },
  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.whiteOverlay30,
    borderRadius: 1.5,
  },
  progressBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    borderRadius: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  storyTime: {
    color: COLORS.textWhite70,
    fontSize: 12,
    marginTop: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  storyImage: {
    flex: 1,
    width: '100%',
  },
  touchAreas: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  touchLeft: {
    flex: 1,
  },
  touchRight: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.overlay70,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginRight: 12,
  },
  infoTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  infoDescription: {
    color: COLORS.textWhite80,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
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
    color: COLORS.textWhite80,
    fontSize: 12,
  },
  viewMomentBtn: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMomentText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});

export default StoryViewer;

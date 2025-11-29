import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { MOCK_PROOF_STORY } from '../mocks';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ProofStoryScreenProps = StackScreenProps<RootStackParamList, 'ProofStory'>;

export const ProofStoryScreen: React.FC<ProofStoryScreenProps> = ({
  navigation,
  route: _route,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  const story = MOCK_PROOF_STORY; // In real app, fetch from route.params or API

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = () => {
    // Implement share functionality
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['rgba(0,0,0,0.6)', 'transparent']}
      style={styles.header}
    >
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Icon name="close" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        {story.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressBar,
              index === currentImageIndex && styles.activeProgressBar,
            ]}
          />
        ))}
      </View>

      <View style={styles.authorContainer}>
        <Image
          source={{ uri: story.author.avatar }}
          style={styles.authorAvatar}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{story.author.name}</Text>
          <View style={styles.trustBadge}>
            <Icon name="shield-check" size={12} color={COLORS.success} />
            <Text style={styles.trustScore}>
              {story.author.trustScore}% Trust
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  const renderContent = () => (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.8)']}
      style={styles.content}
    >
      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Icon
          name={
            story.type === 'micro-kindness'
              ? 'hand-heart'
              : story.type === 'verified-experience'
              ? 'check-decagram'
              : 'account-group'
          }
          size={16}
          color={COLORS.white}
        />
        <Text style={styles.typeText}>
          {story.type === 'micro-kindness'
            ? 'Micro Kindness'
            : story.type === 'verified-experience'
            ? 'Verified Experience'
            : 'Community Proof'}
        </Text>
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>{story.title}</Text>
      <Text style={styles.description}>{story.description}</Text>

      {/* Meta Info */}
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon name="map-marker" size={16} color={COLORS.white} />
          <Text style={styles.metaText}>{story.location}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={16} color={COLORS.white} />
          <Text style={styles.metaText}>{story.date}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="eye" size={18} color={COLORS.white} />
          <Text style={styles.statText}>{story.stats.views}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="heart" size={18} color={COLORS.white} />
          <Text style={styles.statText}>{story.stats.likes}</Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="share" size={18} color={COLORS.white} />
          <Text style={styles.statText}>{story.stats.shares}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderActions = () => (
    <View style={styles.actions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleLike}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={
            liked
              ? [COLORS.error, COLORS.error]
              : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)']
          }
          style={styles.actionButtonGradient}
        >
          <Icon
            name={liked ? 'heart' : 'heart-outline'}
            size={28}
            color={COLORS.white}
          />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleShare}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)']}
          style={styles.actionButtonGradient}
        >
          <Icon name="share-variant" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() =>
          navigation.navigate('Chat', {
            otherUser: story.author,
          })
        }
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)']}
          style={styles.actionButtonGradient}
        >
          <Icon name="message" size={28} color={COLORS.white} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={{ uri: story.images[currentImageIndex] }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Overlay for better text visibility */}
      <View style={styles.overlay} />

      {/* Tap Zones for Navigation */}
      <View style={styles.tapZones}>
        <TouchableOpacity
          style={styles.tapZoneLeft}
          onPress={() => {
            if (currentImageIndex > 0) {
              setCurrentImageIndex(currentImageIndex - 1);
            }
          }}
          activeOpacity={1}
        />
        <TouchableOpacity
          style={styles.tapZoneRight}
          onPress={() => {
            if (currentImageIndex < story.images.length - 1) {
              setCurrentImageIndex(currentImageIndex + 1);
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={1}
        />
      </View>

      {/* Header */}
      {renderHeader()}

      {/* Content */}
      {renderContent()}

      {/* Actions */}
      {renderActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 30,
    marginBottom: LAYOUT.padding * 1.5,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  actions: {
    alignItems: 'center',
    bottom: 30,
    position: 'absolute',
    right: LAYOUT.padding * 2,
  },
  activeProgressBar: {
    backgroundColor: COLORS.white,
  },
  authorAvatar: {
    borderColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    width: 40,
  },
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  authorInfo: {
    marginLeft: LAYOUT.padding,
  },
  authorName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 4,
  },
  backgroundImage: {
    height: SCREEN_HEIGHT,
    position: 'absolute',
    width: SCREEN_WIDTH,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: LAYOUT.padding / 2,
  },
  container: {
    backgroundColor: COLORS.text,
    flex: 1,
  },
  content: {
    bottom: 100,
    left: 0,
    paddingBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 4,
    position: 'absolute',
    right: 0,
  },
  description: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    marginBottom: LAYOUT.padding * 1.5,
  },
  header: {
    left: 0,
    paddingBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: 50,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 1.5,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: LAYOUT.padding * 2,
  },
  metaText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: LAYOUT.padding / 2,
  },
  overlay: {
    backgroundColor: COLORS.blackTransparentLight,
    height: SCREEN_HEIGHT,
    position: 'absolute',
    width: SCREEN_WIDTH,
  },
  progressBar: {
    backgroundColor: COLORS.whiteTransparentLight,
    borderRadius: 1.5,
    flex: 1,
    height: 3,
    marginHorizontal: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 2,
    marginTop: LAYOUT.padding,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: LAYOUT.padding * 2,
  },
  statText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  tapZoneLeft: {
    flex: 1,
  },
  tapZoneRight: {
    flex: 1,
  },
  tapZones: {
    flexDirection: 'row',
    height: SCREEN_HEIGHT,
    position: 'absolute',
    width: SCREEN_WIDTH,
  },
  title: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
  },
  trustBadge: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  trustScore: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 4,
  },
  typeBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.whiteTransparentDark,
    borderRadius: VALUES.borderRadius / 2,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
  },
  typeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: LAYOUT.padding / 2,
    textTransform: 'uppercase',
  },
});

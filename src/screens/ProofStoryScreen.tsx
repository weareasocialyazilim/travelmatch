import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { MOCK_PROOF_STORY } from '../mocks';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ProofStoryScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
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
        <Image source={{ uri: story.author.avatar }} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{story.author.name}</Text>
          <View style={styles.trustBadge}>
            <Icon name="shield-check" size={12} color={COLORS.success} />
            <Text style={styles.trustScore}>{story.author.trustScore}% Trust</Text>
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
          colors={liked ? [COLORS.error, COLORS.error] : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.2)']}
          style={styles.actionButtonGradient}
        >
          <Icon name={liked ? 'heart' : 'heart-outline'} size={28} color={COLORS.white} />
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
        onPress={() => navigation.navigate('Chat', { 
          otherUser: {
            id: story.author,
            name: 'Story Author',
            avatar: 'https://via.placeholder.com/100'
          }
        })}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.text,
  },
  backgroundImage: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tapZones: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    flexDirection: 'row',
  },
  tapZoneLeft: {
    flex: 1,
  },
  tapZoneRight: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 2,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: LAYOUT.padding / 2,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: LAYOUT.padding,
    marginBottom: LAYOUT.padding * 2,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
  activeProgressBar: {
    backgroundColor: COLORS.white,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  authorInfo: {
    marginLeft: LAYOUT.padding,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.padding / 4,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScore: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 4,
  },
  content: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 4,
    paddingBottom: LAYOUT.padding * 2,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
    marginBottom: LAYOUT.padding,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: LAYOUT.padding,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.white,
    lineHeight: 24,
    marginBottom: LAYOUT.padding * 1.5,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 1.5,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: LAYOUT.padding * 2,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 2,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: LAYOUT.padding * 2,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 2,
  },
  actions: {
    position: 'absolute',
    bottom: 30,
    right: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  actionButton: {
    marginBottom: LAYOUT.padding * 1.5,
    borderRadius: 30,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 350;

// Dark theme colors
const DARK_THEME = {
  background: COLORS.backgroundDark,
  backgroundSecondary: COLORS.backgroundDarkSecondary,
  text: COLORS.textOnDark,
  textSecondary: COLORS.textOnDarkSecondary,
  textMuted: COLORS.textOnDarkMuted,
  accent: COLORS.brand.primary,
  border: COLORS.hairlineLight,
  cardBg: 'rgba(255,255,255,0.03)',
  buttonBg: 'rgba(255,255,255,0.1)',
  buttonBorder: 'rgba(255,255,255,0.2)',
};

// --- MOCK DATA ---
const USER = {
  id: 'u1',
  name: 'Selin Yılmaz',
  username: '@selin.y',
  bio: 'Digital Nomad exploring hidden gems 💎. Coffee snob & Sunset lover.',
  location: 'Istanbul, TR',
  trustScore: 98,
  followers: '2.4k',
  trips: 45,
  avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500',
  cover:
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000',
  moments: [
    {
      id: 'm1',
      image:
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=300',
    },
    {
      id: 'm2',
      image:
        'https://images.unsplash.com/photo-1514362545857-3bc16549766b?q=80&w=300',
    },
    {
      id: 'm3',
      image:
        'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=300',
    },
    {
      id: 'm4',
      image:
        'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=300',
    },
  ],
};

type UserProfileScreenProps = StackScreenProps<
  RootStackParamList,
  'UserProfile'
>;

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // Parallax Header Animation
  const headerStyle = useAnimatedStyle(() => {
    return {
      height: HEADER_HEIGHT,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollY.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* FIXED HEADER ACTIONS */}
      <View style={[styles.topActions, { top: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <BlurView intensity={30} style={styles.blurIcon}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <BlurView intensity={30} style={styles.blurIcon}>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </BlurView>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PARALLAX IMAGE */}
        <Animated.View style={[styles.headerContainer, headerStyle]}>
          <Image
            source={{ uri: USER.cover }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', DARK_THEME.background]}
            style={styles.gradientOverlay}
          />
        </Animated.View>

        {/* PROFILE CONTENT */}
        <View style={styles.contentContainer}>
          {/* Avatar & Trust Badge */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: USER.avatar }} style={styles.avatar} />
              <View style={styles.trustBadge}>
                <Text style={styles.trustScore}>{USER.trustScore}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followText}>Connect</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.name}>{USER.name}</Text>
            <Text style={styles.username}>{USER.username}</Text>
            <Text style={styles.bio}>{USER.bio}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{USER.followers}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{USER.trips}</Text>
                <Text style={styles.statLabel}>Moments</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.9 ★</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </View>

          {/* Recent Moments Grid */}
          <Text style={styles.sectionTitle}>Recent Vibes</Text>
          <View style={styles.gridContainer}>
            {USER.moments.map((moment) => (
              <TouchableOpacity key={moment.id} style={styles.gridItem}>
                <Image
                  source={{ uri: moment.image }}
                  style={styles.gridImage}
                />
                <View style={styles.gridOverlay}>
                  <MaterialCommunityIcons
                    name="heart-outline"
                    size={16}
                    color="white"
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  topActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  iconButton: {
    overflow: 'hidden',
    borderRadius: 20,
  },
  blurIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },

  // Content
  contentContainer: {
    paddingHorizontal: 24,
    marginTop: -40, // Overlap
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: DARK_THEME.background,
  },
  trustBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: DARK_THEME.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: DARK_THEME.background,
  },
  trustScore: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  followButton: {
    backgroundColor: DARK_THEME.buttonBg,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARK_THEME.buttonBorder,
    marginBottom: 10,
  },
  followText: {
    color: DARK_THEME.text,
    fontWeight: '600',
  },

  // Info
  infoSection: {
    marginBottom: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DARK_THEME.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 16,
    color: DARK_THEME.textSecondary,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: DARK_THEME.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DARK_THEME.cardBg,
    padding: 16,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DARK_THEME.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: DARK_THEME.textSecondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: DARK_THEME.border,
  },

  // Grid
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_THEME.text,
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (width - 60) / 2, // 2 column with padding/gap
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 6,
  },
});

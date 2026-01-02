import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';

const { width: _width } = Dimensions.get('window');

interface Leader {
  id: string;
  name: string;
  score: number;
  avatar: string;
  rank: number;
}

const LEADERS: Leader[] = [
  {
    id: '1',
    name: 'Selin Y.',
    score: 9850,
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    rank: 1,
  },
  {
    id: '2',
    name: 'Marc B.',
    score: 8720,
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200',
    rank: 2,
  },
  {
    id: '3',
    name: 'Elena K.',
    score: 7600,
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
    rank: 3,
  },
  {
    id: '4',
    name: 'Kemal A.',
    score: 5400,
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
    rank: 4,
  },
  {
    id: '5',
    name: 'John D.',
    score: 4300,
    avatar:
      'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200',
    rank: 5,
  },
];

type FilterType = 'Global' | 'Local';

export const LeaderboardScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState<FilterType>('Global');

  const renderTopThree = () => {
    const [first, second, third] = LEADERS;
    return (
      <View style={styles.podiumContainer}>
        {/* 2nd Place */}
        <View style={[styles.podiumItem, styles.podiumSecond]}>
          <Image source={{ uri: second.avatar }} style={styles.podiumAvatar} />
          <View style={styles.rankBadgeSilver}>
            <Text style={styles.rankText}>2</Text>
          </View>
          <Text style={styles.podiumName}>{second.name}</Text>
          <Text style={styles.podiumScore}>{second.score}</Text>
        </View>

        {/* 1st Place */}
        <View style={[styles.podiumItem, styles.podiumFirst]}>
          <View style={styles.crownContainer}>
            <MaterialCommunityIcons name="crown" size={32} color="#FFD700" />
          </View>
          <Image
            source={{ uri: first.avatar }}
            style={[styles.podiumAvatar, styles.avatarFirst]}
          />
          <View style={styles.rankBadgeGold}>
            <Text style={styles.rankText}>1</Text>
          </View>
          <Text style={styles.podiumName}>{first.name}</Text>
          <Text style={styles.podiumScore}>{first.score}</Text>
        </View>

        {/* 3rd Place */}
        <View style={[styles.podiumItem, styles.podiumThird]}>
          <Image source={{ uri: third.avatar }} style={styles.podiumAvatar} />
          <View style={styles.rankBadgeBronze}>
            <Text style={styles.rankText}>3</Text>
          </View>
          <Text style={styles.podiumName}>{third.name}</Text>
          <Text style={styles.podiumScore}>{third.score}</Text>
        </View>
      </View>
    );
  };

  const renderListItem = ({ item }: { item: Leader }) => {
    if (item.rank <= 3) return null;
    return (
      <Animated.View entering={FadeInUp} style={styles.listItem}>
        <Text style={styles.listRank}>{item.rank}</Text>
        <Image source={{ uri: item.avatar }} style={styles.listAvatar} />
        <Text style={styles.listName}>{item.name}</Text>
        <Text style={styles.listScore}>{item.score} pts</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2a1f45', COLORS.background.primary]}
        style={styles.gradientBg}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Top Travelers</Text>
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            onPress={() => setFilter('Global')}
            style={[styles.tab, filter === 'Global' && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, filter === 'Global' && styles.activeTabText]}
            >
              Global
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('Local')}
            style={[styles.tab, filter === 'Local' && styles.activeTab]}
          >
            <Text
              style={[styles.tabText, filter === 'Local' && styles.activeTabText]}
            >
              Local
            </Text>
          </TouchableOpacity>
        </View>

        {renderTopThree()}

        <View style={styles.listContainer}>
          <FlatList
            data={LEADERS}
            renderItem={renderListItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  gradientBg: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  tabs: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  tab: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 16 },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabText: { color: COLORS.text.secondary, fontWeight: '600' },
  activeTabText: { color: 'white' },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 30,
  },
  podiumItem: { alignItems: 'center' },
  podiumFirst: { zIndex: 10 },
  podiumSecond: { marginTop: 40 },
  podiumThird: { marginTop: 60 },
  listContent: { paddingBottom: 40 },
  crownContainer: { marginBottom: -10, zIndex: 2 },
  podiumAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarFirst: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderColor: '#FFD700',
    borderWidth: 3,
  },
  rankBadgeGold: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#FFD700',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  rankBadgeSilver: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#C0C0C0',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  rankBadgeBronze: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#CD7F32',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  rankText: { fontSize: 12, fontWeight: 'bold', color: 'black' },
  podiumName: { color: 'white', fontWeight: 'bold', marginTop: 8, fontSize: 14 },
  podiumScore: { color: COLORS.brand.primary, fontWeight: 'bold', fontSize: 12 },

  // List
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  listRank: { color: '#666', fontWeight: 'bold', fontSize: 16, width: 30 },
  listAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  listName: { color: 'white', fontWeight: '600', flex: 1 },
  listScore: { color: COLORS.brand.primary, fontWeight: 'bold' },
});

export default LeaderboardScreen;

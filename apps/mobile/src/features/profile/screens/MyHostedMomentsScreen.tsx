import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@/hooks/useNavigationHelpers';
import type { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MOMENTS = [
  {
    id: '1',
    title: 'Dinner at Hotel Costes',
    date: 'Jan 24, 2026',
    status: 'active',
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=200',
  },
  {
    id: '2',
    title: 'Jazz Night',
    date: 'Dec 12, 2025',
    status: 'completed',
    image:
      'https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=200',
  },
  {
    id: '3',
    title: 'Coffee Run',
    date: 'Nov 30, 2025',
    status: 'archived',
    image:
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=200',
  },
];

type MomentItem = (typeof MOMENTS)[0];

export const MyHostedMomentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'active' | 'history'>('active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'completed':
        return COLORS.brand.primary;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderItem = ({ item }: { item: MomentItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('MomentDetail', { moment: item as unknown as RootStackParamList['MomentDetail']['moment'] })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{item.title}</Text>
          <View
            style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]}
          />
        </View>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={COLORS.text.secondary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Drops</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateMoment')}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={COLORS.brand.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setFilter('active')}
          style={[styles.tab, filter === 'active' && styles.activeTab]}
        >
          <Text
            style={[styles.tabText, filter === 'active' && styles.activeTabText]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('history')}
          style={[styles.tab, filter === 'history' && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              filter === 'history' && styles.activeTabText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOMENTS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.surfaceMuted,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.brand.primary,
  },
  tabText: {
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.utility.white,
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  title: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  date: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default MyHostedMomentsScreen;

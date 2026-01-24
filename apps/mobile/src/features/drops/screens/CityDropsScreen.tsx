import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { supabase } from '@/services/supabase';
import type { RootStackParamList } from '@/navigation/routeParams';
import { EmptyState } from '@/components/ui/EmptyState';
import { logger } from '@/utils/logger';

// Types (Move to central types if reused)
export interface CreatorDrop {
  id: string;
  creator_id: string;
  city: string;
  starts_at: string;
  ends_at: string;
  status: 'draft' | 'live' | 'ended' | 'paused';
  creator?: {
    full_name: string;
    avatar_url: string;
  };
  _count?: {
    templates: number;
  };
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const CityDropsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [drops, setDrops] = useState<CreatorDrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null); // Filter by city

  // Fetch Live Drops
  useEffect(() => {
    const fetchDrops = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('creator_drops')
          .select(`
            id, city, starts_at, ends_at, status,
            creator:users!creator_id(full_name, avatar_url)
          `)
          .eq('status', 'live')
          .order('starts_at', { ascending: true });

        if (selectedCity) {
          query = query.eq('city', selectedCity);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        setDrops(data as any); // Cast for minimal MVP
      } catch (error) {
        logger.error('Failed to fetch drops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrops();
  }, [selectedCity]);

  const renderItem: ListRenderItem<CreatorDrop> = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DropDetail', { dropId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: item.creator?.avatar_url || 'https://ui-avatars.com/api/?name=C' }} 
          style={styles.avatar} 
        />
        <View style={styles.headerText}>
          <Text style={styles.creatorName}>{item.creator?.full_name}</Text>
          <Text style={styles.location}>{item.city}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.dates}>
          {new Date(item.starts_at).toLocaleDateString()} - {new Date(item.ends_at).toLocaleDateString()}
        </Text>
        <View style={styles.actionRow}>
          <Text style={styles.actionText}>View Drop & Offers</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.brand.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>City Drops</Text>
      </View>
      
      <FlatList
        data={drops}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading ? (
             <EmptyState 
               icon="city-variant-outline" 
               title="No Active Drops" 
               description="There are no creator drops live in your area right now." 
             /> 
          ) : null
        }
        refreshing={loading}
        onRefresh={() => { /* re-fetch logic */ }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  location: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.feedback.error + '20', // transparent red
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.feedback.error,
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.feedback.error,
  },
  cardBody: {
    marginTop: 8,
  },
  dates: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionText: {
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
});

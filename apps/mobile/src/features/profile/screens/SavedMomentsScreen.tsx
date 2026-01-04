import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMoments, type Moment } from '@/hooks/useMoments';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

type SavedMomentsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SavedMoments'
>;

interface SavedMomentsScreenProps {
  navigation: SavedMomentsScreenNavigationProp;
}

export const SavedMomentsScreen: React.FC<SavedMomentsScreenProps> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { savedMoments, savedMomentsLoading, loadSavedMoments, unsaveMoment } =
    useMoments();

  useEffect(() => {
    loadSavedMoments();
  }, [loadSavedMoments]);

  const handleMomentPress = (moment: Moment) => {
    const categoryLabel =
      typeof moment.category === 'string'
        ? moment.category
        : moment.category?.label || 'Other';
    navigation.navigate('MomentDetail', {
      moment: {
        ...moment,
        story: moment.description || '',
        imageUrl: moment.images?.[0] || '',
        image: moment.images?.[0] || '',
        availability: 'Available',
        user: {
          id: moment.hostId,
          name: moment.hostName,
          avatar: moment.hostAvatar,
          type: 'host',
          isVerified: true,
          location: '',
          travelDays: 0,
        },
        giftCount: 0,
        category: categoryLabel,
      } as unknown as RootStackParamList['MomentDetail']['moment'],
    });
  };

  const handleUnsave = async (id: string) => {
    await unsaveMoment(id);
  };

  const renderItem = ({ item }: { item: Moment }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleMomentPress(item)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: item.images?.[0] || '' }} style={styles.image} />
      <View style={styles.overlay}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.likeBtn}
        onPress={() => handleUnsave(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="heart" size={16} color={COLORS.brand.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (savedMomentsLoading && savedMoments.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Saved Vibes</Text>
          <View style={styles.headerSpacer} />
        </View>
        <LoadingState type="skeleton" count={4} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Saved Vibes</Text>
        <View style={styles.spacer} />
      </View>

      {savedMoments.length === 0 ? (
        <EmptyState
          illustrationType="no_moments"
          title="No Saved Vibes Yet"
          subtitle="Tap the heart icon on moments you'd like to save for later."
        />
      ) : (
        <FlatList
          data={savedMoments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={savedMomentsLoading}
              onRefresh={loadSavedMoments}
              tintColor={COLORS.brand.accent}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  list: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundDarkSecondary,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  itemTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  likeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 12,
  },
  spacer: { width: 24 },
  headerSpacer: {
    width: 24,
  },
});

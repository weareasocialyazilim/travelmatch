import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import { useMoments, type Moment } from '@/hooks/useMoments';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

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
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const { savedMoments, savedMomentsLoading, loadSavedMoments, unsaveMoment } =
    useMoments();

  useEffect(() => {
    loadSavedMoments();
  }, [loadSavedMoments]);

  // Extract unique categories from saved moments
  const filterOptions = useMemo(() => {
    const categories = new Set(
      savedMoments.map((m) => {
        return typeof m.category === 'string'
          ? m.category
          : m.category?.label || 'Other';
      }),
    );
    return ['All', ...Array.from(categories)];
  }, [savedMoments]);

  const filteredMoments = useMemo(() => {
    if (selectedFilter === 'All') return savedMoments;
    return savedMoments.filter((m) => {
      const categoryLabel =
        typeof m.category === 'string'
          ? m.category
          : m.category?.label || 'Other';
      return categoryLabel === selectedFilter;
    });
  }, [savedMoments, selectedFilter]);

  const handleUnsave = async (id: string) => {
    await unsaveMoment(id);
  };

  const handleMomentPress = (moment: Moment) => {
    const categoryLabel =
      typeof moment.category === 'string'
        ? moment.category
        : moment.category?.label || 'Other';
    navigation.navigate('MomentDetail', {
      moment: {
        ...moment,
        // Ensure required fields for MomentDetail are present
        story: moment.description || '',
        imageUrl: moment.images?.[0] || '',
        image: moment.images?.[0] || '',
        availability: 'Available', // Default
        user: {
          id: moment.hostId,
          name: moment.hostName,
          avatar: moment.hostAvatar,
          type: 'traveler',
          isVerified: true,
          location: '',
          travelDays: 0,
        },
        giftCount: 0,
        category: categoryLabel,
      } as unknown as RootStackParamList['MomentDetail']['moment'],
    });
  };

  if (savedMomentsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Moments</Text>
          <View style={styles.headerButton} />
        </View>
        <LoadingState type="skeleton" count={3} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={'arrow-left' as IconName}
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Segmented Control - Only show if we have categories */}
      {filterOptions.length > 1 && (
        <View style={styles.segmentedContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentedControlContent}
          >
            <View style={styles.segmentedControl}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.segmentButton,
                    selectedFilter === option && styles.segmentButtonActive,
                  ]}
                  onPress={() => setSelectedFilter(option)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedFilter === option && styles.segmentTextActive,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={savedMomentsLoading}
            onRefresh={loadSavedMoments}
            tintColor={COLORS.coral}
          />
        }
      >
        {savedMomentsLoading && savedMoments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.coral} />
          </View>
        ) : filteredMoments.length === 0 ? (
          // Empty State
          <EmptyState
            illustrationType="no_moments"
            title="No Saved Moments Yet"
            subtitle="Tap the bookmark icon on moments you'd like to save for later."
          />
        ) : (
          // List of Saved Moments
          <View style={styles.momentsList}>
            {filteredMoments.map((moment) => (
              <TouchableOpacity
                key={moment.id}
                style={styles.momentItem}
                onPress={() => handleMomentPress(moment)}
                activeOpacity={0.7}
              >
                <View style={styles.momentContent}>
                  <Image
                    source={{
                      uri:
                        moment.images?.[0] || 'https://via.placeholder.com/70',
                    }}
                    style={styles.momentImage}
                  />
                  <View style={styles.momentInfo}>
                    <Text style={styles.momentTitle} numberOfLines={1}>
                      {moment.title}
                    </Text>
                    <Text style={styles.momentDetails} numberOfLines={1}>
                      {typeof moment.location === 'string'
                        ? moment.location
                        : moment.location?.city}{' '}
                      • ${moment.pricePerGuest} •{' '}
                      {typeof moment.category === 'string'
                        ? moment.category
                        : moment.category?.label || 'Other'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleUnsave(moment.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name="bookmark"
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  segmentedContainer: {
    paddingVertical: 12,
  },
  segmentedControlContent: {
    paddingHorizontal: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.border}80`,
    borderRadius: 8,
    padding: 4,
    height: 40,
    alignSelf: 'flex-start',
  },
  segmentButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 16,
    minWidth: 80,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  momentsList: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  momentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
  },
  momentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  momentImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  momentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  momentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  momentDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

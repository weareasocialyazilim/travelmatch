import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import EmptyState from '../components/EmptyState';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type SavedMomentsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'SavedMoments'
>;

interface SavedMomentsScreenProps {
  navigation: SavedMomentsScreenNavigationProp;
}

interface SavedMoment {
  id: string;
  title: string;
  location: string;
  price: number;
  category: string;
  imageUrl: string;
  isSaved: boolean;
}

const MOCK_MOMENTS: SavedMoment[] = [
  {
    id: '1',
    title: 'Artisan Roastery Tour',
    location: 'Paris',
    price: 15,
    category: 'Coffee',
    imageUrl: 'https://via.placeholder.com/70',
    isSaved: true,
  },
  {
    id: '2',
    title: 'Sunrise Hot Air Balloon Ride',
    location: 'Cappadocia',
    price: 150,
    category: 'Experiences',
    imageUrl: 'https://via.placeholder.com/70',
    isSaved: true,
  },
  {
    id: '3',
    title: 'Barista Masterclass',
    location: 'Milan',
    price: 45,
    category: 'Coffee',
    imageUrl: 'https://via.placeholder.com/70',
    isSaved: true,
  },
];

type FilterOption = 'All' | 'Coffee' | 'Experiences';

export const SavedMomentsScreen: React.FC<SavedMomentsScreenProps> = ({
  navigation,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');
  const [moments, setMoments] = useState<SavedMoment[]>(MOCK_MOMENTS);

  const filteredMoments = moments.filter((moment) => {
    if (selectedFilter === 'All') return true;
    return moment.category === selectedFilter;
  });

  const toggleSave = (id: string) => {
    setMoments((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isSaved: !m.isSaved } : m)),
    );
  };

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

      {/* Segmented Control */}
      <View style={styles.segmentedContainer}>
        <View style={styles.segmentedControl}>
          {(['All', 'Coffee', 'Experiences'] as FilterOption[]).map(
            (option) => (
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
            ),
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredMoments.length === 0 ? (
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
              <View key={moment.id} style={styles.momentItem}>
                <View style={styles.momentContent}>
                  <View style={styles.momentImage} />
                  <View style={styles.momentInfo}>
                    <Text style={styles.momentTitle} numberOfLines={1}>
                      {moment.title}
                    </Text>
                    <Text style={styles.momentDetails} numberOfLines={1}>
                      {moment.location} • ${moment.price} • {moment.category}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => toggleSave(moment.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={moment.isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: `${COLORS.border}80`,
    borderRadius: 8,
    padding: 4,
    height: 40,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
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

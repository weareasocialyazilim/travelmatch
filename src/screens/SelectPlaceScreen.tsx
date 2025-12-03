import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { COLORS } from '../constants/colors';

type SelectPlaceScreenProps = StackScreenProps<
  RootStackParamList,
  'SelectPlace'
>;

interface Place {
  id: string;
  name: string;
  address: string;
  type: 'recent' | 'nearby';
  icon: 'history' | 'map-marker';
}

const PLACES: Place[] = [
  {
    id: '1',
    name: 'Louvre Museum',
    address: 'Rue de Rivoli, 75001 Paris, France',
    type: 'recent',
    icon: 'history',
  },
  {
    id: '2',
    name: 'Eiffel Tower',
    address: 'Champ de Mars, 5 Av. Anatole, Paris',
    type: 'nearby',
    icon: 'map-marker',
  },
  {
    id: '3',
    name: 'Shakespeare and Company',
    address: '37 Rue de la Bûcherie, 75005 Paris',
    type: 'nearby',
    icon: 'map-marker',
  },
];

export const SelectPlaceScreen: React.FC<SelectPlaceScreenProps> = ({
  navigation,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<string>('2');
  const [searchQuery, setSearchQuery] = useState('');

  const recentPlaces = PLACES.filter((p) => p.type === 'recent');
  const nearbyPlaces = PLACES.filter((p) => p.type === 'nearby');

  const handleUsePlace = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Place</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.searchIconContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color={COLORS.success}
            />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search places, cafes, landmarks..."
            placeholderTextColor={COLORS.success}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        <View style={styles.mapContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800',
            }}
            style={styles.map}
            resizeMode="cover"
          />
        </View>

        {/* Recent Section */}
        {recentPlaces.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent</Text>
            {recentPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                style={styles.placeItem}
                onPress={() => setSelectedPlace(place.id)}
              >
                <View style={styles.placeIconContainer}>
                  <MaterialCommunityIcons
                    name={place.icon}
                    size={24}
                    color={COLORS.text}
                  />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{place.name}</Text>
                  <Text style={styles.placeAddress}>{place.address}</Text>
                </View>
                <View style={styles.radioContainer}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedPlace === place.id && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedPlace === place.id && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Nearby Section */}
        <Text style={styles.sectionTitle}>Nearby</Text>
        {nearbyPlaces.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={[
              styles.placeItem,
              selectedPlace === place.id && styles.placeItemSelected,
            ]}
            onPress={() => setSelectedPlace(place.id)}
          >
            <View style={styles.placeIconContainer}>
              <MaterialCommunityIcons
                name={place.icon}
                size={24}
                color={COLORS.text}
              />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <Text style={styles.placeAddress}>{place.address}</Text>
            </View>
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radioOuter,
                  selectedPlace === place.id && styles.radioOuterSelected,
                ]}
              >
                {selectedPlace === place.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Results Section - Empty State */}
        {searchQuery.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Results</Text>
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                  name="magnify-close"
                  size={32}
                  color={COLORS.success}
                />
              </View>
              <View style={styles.emptyTextContainer}>
                <Text style={styles.emptyTitle}>No places found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching for something else or check your spelling.
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Bottom padding to avoid button overlap */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.useButton, !selectedPlace && styles.useButtonDisabled]}
          onPress={handleUsePlace}
          disabled={!selectedPlace}
        >
          <Text style={styles.useButtonText}>Use this place</Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.15,
  },
  headerSpacer: {
    width: 48,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: COLORS.mintTransparent,
    borderRadius: 12,
  },
  searchIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.text,
    paddingRight: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  mapContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  map: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    letterSpacing: -0.15,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 72,
    backgroundColor: COLORS.background,
  },
  placeItemSelected: {
    backgroundColor: COLORS.mintTransparent,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  placeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.mintTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: COLORS.success,
    lineHeight: 20,
  },
  radioContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.mintTransparent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTextContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.mintTransparent,
  },
  useButton: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  useButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
});

/**
 * LocationModal Component
 * Location picker modal for Discover screen
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { POPULAR_CITIES } from './constants';

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedLocation: string;
  recentLocations: string[];
  onLocationSelect: (location: string) => void;
  onUseCurrentLocation: () => void;
}

const LocationModal: React.FC<LocationModalProps> = memo(
  ({
    visible,
    onClose,
    selectedLocation,
    recentLocations,
    onLocationSelect,
    onUseCurrentLocation,
  }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleLocationSelect = (location: string) => {
      onLocationSelect(location);
      onClose();
    };

    const handleUseCurrentLocation = () => {
      onUseCurrentLocation();
      onClose();
    };

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.locationModal}>
                {/* Header */}
                <View style={styles.locationHeader}>
                  <Text style={styles.locationTitle}>Select Location</Text>
                  <TouchableOpacity onPress={onClose}>
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={COLORS.text}
                    />
                  </TouchableOpacity>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                  <MaterialCommunityIcons
                    name="magnify"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search city or place..."
                    placeholderTextColor={COLORS.textTertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    accessibilityLabel="Search location"
                  />
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Current Location */}
                  <TouchableOpacity
                    style={styles.currentLocationButton}
                    onPress={handleUseCurrentLocation}
                    accessibilityRole="button"
                    accessibilityLabel="Use current location"
                  >
                    <View style={styles.currentLocationIcon}>
                      <MaterialCommunityIcons
                        name="crosshairs-gps"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.currentLocationContent}>
                      <Text style={styles.currentLocationTitle}>
                        Use Current Location
                      </Text>
                      <Text style={styles.currentLocationSubtitle}>
                        {selectedLocation}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color={COLORS.textTertiary}
                    />
                  </TouchableOpacity>

                  {/* Recent Locations */}
                  {recentLocations.length > 0 && (
                    <View style={styles.locationSection}>
                      <Text style={styles.locationSectionTitle}>Recent</Text>
                      {recentLocations.map((location, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.locationItem}
                          onPress={() => handleLocationSelect(location)}
                          accessibilityRole="button"
                        >
                          <MaterialCommunityIcons
                            name="history"
                            size={20}
                            color={COLORS.textSecondary}
                          />
                          <Text style={styles.locationItemText}>
                            {location}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Popular Cities */}
                  <View style={styles.locationSection}>
                    <Text style={styles.locationSectionTitle}>
                      Popular Cities
                    </Text>
                    {POPULAR_CITIES.map((city) => (
                      <TouchableOpacity
                        key={city.id}
                        style={styles.locationItem}
                        onPress={() =>
                          handleLocationSelect(`${city.name}, ${city.country}`)
                        }
                        accessibilityRole="button"
                      >
                        <Text style={styles.cityEmoji}>{city.emoji}</Text>
                        <View style={styles.cityInfo}>
                          <Text style={styles.cityName}>{city.name}</Text>
                          <Text style={styles.cityCountry}>{city.country}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

LocationModal.displayName = 'LocationModal';

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: COLORS.overlay50,
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  locationHeader: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  locationTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.borderRadius.md,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 15,
  },
  currentLocationButton: {
    alignItems: 'center',
    backgroundColor: COLORS.filterPillActive,
    borderRadius: LAYOUT.borderRadius.md,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
  },
  currentLocationIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  currentLocationContent: {
    flex: 1,
  },
  currentLocationTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  currentLocationSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  locationSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  locationSectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  locationItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  locationItemText: {
    color: COLORS.text,
    fontSize: 15,
  },
  cityEmoji: {
    fontSize: 24,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  cityCountry: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});

export default LocationModal;

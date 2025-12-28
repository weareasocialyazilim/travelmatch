import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface City {
  id: string;
  name: string;
  country: string;
  emoji: string;
}

interface LocationModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  selectedLocation: string;
  recentLocations: string[];
  popularCities: City[];
  currentLocationName?: string;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  selectedLocation,
  recentLocations,
  popularCities,
  currentLocationName = 'San Francisco, CA',
}) => {
  const handleLocationSelect = (location: string) => {
    onLocationSelect(location);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.locationModal}>
          {/* Header */}
          <View style={styles.locationModalHeader}>
            <Text style={styles.locationModalTitle}>Select Location</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={COLORS.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Location */}
            <TouchableOpacity
              style={styles.locationOptionCurrent}
              onPress={() => handleLocationSelect(currentLocationName)}
            >
              <View style={styles.locationOptionIconWrapper}>
                <MaterialCommunityIcons
                  name="crosshairs-gps"
                  size={22}
                  color={COLORS.mint}
                />
              </View>
              <View style={styles.locationOptionInfo}>
                <Text style={styles.locationOptionTitle}>
                  Use Current Location
                </Text>
                <Text style={styles.locationOptionSubtitle}>
                  {currentLocationName} (detected)
                </Text>
              </View>
              {selectedLocation === currentLocationName && (
                <MaterialCommunityIcons
                  name="check"
                  size={22}
                  color={COLORS.mint}
                />
              )}
            </TouchableOpacity>

            {/* Recent Locations */}
            {recentLocations.length > 0 && (
              <View style={styles.locationSection}>
                <Text style={styles.locationSectionTitle}>Recent</Text>
                {recentLocations.map((loc, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.locationOption}
                    onPress={() => handleLocationSelect(loc)}
                  >
                    <View style={styles.locationOptionIconWrapper}>
                      <MaterialCommunityIcons
                        name="history"
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </View>
                    <Text style={styles.locationOptionText}>{loc}</Text>
                    {selectedLocation === loc && (
                      <MaterialCommunityIcons
                        name="check"
                        size={22}
                        color={COLORS.mint}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Popular Cities */}
            <View style={styles.locationSection}>
              <Text style={styles.locationSectionTitle}>Popular Cities</Text>
              {popularCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={styles.locationOption}
                  onPress={() =>
                    handleLocationSelect(`${city.name}, ${city.country}`)
                  }
                >
                  <View style={styles.locationOptionIconWrapper}>
                    <Text style={styles.locationEmoji}>{city.emoji}</Text>
                  </View>
                  <Text style={styles.locationOptionText}>
                    {city.name}, {city.country}
                  </Text>
                  {selectedLocation === `${city.name}, ${city.country}` && (
                    <MaterialCommunityIcons
                      name="check"
                      size={22}
                      color={COLORS.mint}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'flex-end',
  },
  locationModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  locationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationOptionCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.mint,
  },
  locationOptionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationOptionInfo: {
    flex: 1,
  },
  locationOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationOptionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  locationSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  locationSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationOptionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  locationEmoji: {
    fontSize: 20,
  },
});

export default LocationModal;

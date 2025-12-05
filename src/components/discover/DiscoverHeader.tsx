/**
 * DiscoverHeader Component
 * Header with location and view toggle for Discover screen
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

type ViewMode = 'single' | 'grid';

interface DiscoverHeaderProps {
  selectedLocation: string;
  viewMode: ViewMode;
  onLocationPress: () => void;
  onViewModeToggle: () => void;
  onFilterPress: () => void;
}

const DiscoverHeader: React.FC<DiscoverHeaderProps> = memo(
  ({
    selectedLocation,
    viewMode,
    onLocationPress,
    onViewModeToggle,
    onFilterPress,
  }) => {
    return (
      <View style={styles.header}>
        {/* Location Selector */}
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={onLocationPress}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Change location"
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={20}
            color={COLORS.primary}
          />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Discover in</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText} numberOfLines={1}>
                {selectedLocation}
              </Text>
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color={COLORS.text}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Right Actions */}
        <View style={styles.headerActions}>
          {/* View Mode Toggle */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onViewModeToggle}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${
              viewMode === 'single' ? 'grid' : 'single'
            } view`}
          >
            <MaterialCommunityIcons
              name={viewMode === 'single' ? 'view-grid' : 'view-agenda'}
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>

          {/* Filter Button */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onFilterPress}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
          >
            <MaterialCommunityIcons
              name="tune-variant"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

DiscoverHeader.displayName = 'DiscoverHeader';

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  locationSelector: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  locationText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});

export default DiscoverHeader;

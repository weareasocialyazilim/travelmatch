// Discover Header - Top bar with location, filter and view toggle
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import type { DiscoverHeaderProps } from './types';

export const DiscoverHeader: React.FC<DiscoverHeaderProps> = ({
  location,
  viewMode,
  activeFiltersCount,
  onLocationPress,
  onFilterPress,
  onViewModeToggle,
}) => (
  <View style={styles.header}>
    {/* Location Selector */}
    <TouchableOpacity
      style={styles.locationSelector}
      onPress={onLocationPress}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons name="map-marker" size={18} color={COLORS.mint} />
      <Text style={styles.locationText} numberOfLines={1}>
        {location}
      </Text>
      <MaterialCommunityIcons
        name="chevron-down"
        size={18}
        color={COLORS.textSecondary}
      />
    </TouchableOpacity>

    {/* Right Controls */}
    <View style={styles.headerControls}>
      {/* Filter Button */}
      <TouchableOpacity
        style={styles.controlButton}
        onPress={onFilterPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="filter-variant"
          size={22}
          color={COLORS.text}
        />
        {activeFiltersCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* View Toggle */}
      <TouchableOpacity
        style={styles.controlButton}
        onPress={onViewModeToggle}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={viewMode === 'single' ? 'view-grid' : 'view-agenda'}
          size={22}
          color={COLORS.text}
        />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  locationText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 6,
    flex: 1,
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
});

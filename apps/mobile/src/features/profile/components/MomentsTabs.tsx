import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface MomentsTabsProps {
  activeTab: 'active' | 'past';
  activeMomentsCount: number;
  pastMomentsCount: number;
  onTabChange: (tab: 'active' | 'past') => void;
}

const MomentsTabs: React.FC<MomentsTabsProps> = memo(
  ({ activeTab, activeMomentsCount, pastMomentsCount, onTabChange }) => {
    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => onTabChange('active')}
          accessibilityLabel="Active Moments tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'active' }}
        >
          <MaterialCommunityIcons
            name="map-marker-star"
            size={18}
            color={activeTab === 'active' ? COLORS.mint : COLORS.text.secondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'active' && styles.tabTextActive,
            ]}
          >
            Active ({activeMomentsCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => onTabChange('past')}
          accessibilityLabel="Past Moments tab"
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'past' }}
        >
          <MaterialCommunityIcons
            name="history"
            size={18}
            color={activeTab === 'past' ? COLORS.mint : COLORS.text.secondary}
          />
          <Text
            style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}
          >
            Past ({pastMomentsCount})
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.activeTab === nextProps.activeTab &&
    prevProps.activeMomentsCount === nextProps.activeMomentsCount &&
    prevProps.pastMomentsCount === nextProps.pastMomentsCount,
);

MomentsTabs.displayName = 'MomentsTabs';

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: COLORS.surface.base,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.utility.white,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.mint,
    fontWeight: '600',
  },
});

export default MomentsTabs;

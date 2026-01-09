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
            Anlar ({activeMomentsCount})
          </Text>
        </TouchableOpacity>
        <View style={styles.separator} />
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
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Pasif ({pastMomentsCount})
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
    marginHorizontal: 20,
    marginTop: 6,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginHorizontal: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.mint,
    fontWeight: '900',
  },
});

export default MomentsTabs;

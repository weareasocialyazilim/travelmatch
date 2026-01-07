/**
 * FilterPanel - Dashboard filter sidebar/panel
 *
 * Implements UX patterns from analytics dashboard design:
 * - Collapsible filter sections
 * - Checkbox and radio options
 * - Date range filters
 * - Category filters with icons
 * - Search input
 * - Turkish localization
 */

import React, { memo, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS, primitives } from '@/constants/colors';

// Filter option types
interface FilterOption {
  id: string;
  label: string;
  value: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  count?: number;
}

interface FilterSection {
  id: string;
  title: string;
  type: 'checkbox' | 'radio' | 'date';
  options?: FilterOption[];
  collapsed?: boolean;
}

interface FilterPanelProps {
  sections: FilterSection[];
  selectedFilters: Record<string, string[]>;
  onFilterChange: (sectionId: string, values: string[]) => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
  onClearAll?: () => void;
  variant?: 'sidebar' | 'bottom' | 'inline';
  style?: ViewStyle;
  testID?: string;
}

export const FilterPanel = memo<FilterPanelProps>(function FilterPanel({
  sections,
  selectedFilters,
  onFilterChange,
  onSearch,
  searchPlaceholder = 'Ara...',
  showSearch = true,
  onClearAll,
  variant = 'sidebar',
  style,
  testID,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(sections.filter((s) => s.collapsed).map((s) => s.id)),
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      onSearch?.(query);
    },
    [onSearch],
  );

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  const handleOptionToggle = useCallback(
    (sectionId: string, value: string, type: 'checkbox' | 'radio' | 'date') => {
      const currentValues = selectedFilters[sectionId] || [];

      if (type === 'radio') {
        // Radio: single selection
        onFilterChange(sectionId, [value]);
      } else {
        // Checkbox: multi selection
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        onFilterChange(sectionId, newValues);
      }
    },
    [selectedFilters, onFilterChange],
  );

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(selectedFilters).reduce(
      (sum, values) => sum + values.length,
      0,
    );
  }, [selectedFilters]);

  const isSidebar = variant === 'sidebar';
  const isBottom = variant === 'bottom';

  return (
    <View
      style={[
        styles.container,
        isSidebar && styles.containerSidebar,
        isBottom && styles.containerBottom,
        style,
      ]}
      testID={testID}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="filter-variant"
            size={20}
            color={COLORS.text.primary}
          />
          <Text style={styles.headerTitle}>Filtreler</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterCount}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>
        {onClearAll && activeFilterCount > 0 && (
          <TouchableOpacity onPress={onClearAll} activeOpacity={0.7}>
            <Text style={styles.clearAllText}>Temizle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={COLORS.text.secondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={COLORS.text.secondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={18}
                color={COLORS.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Filter sections */}
      <ScrollView
        style={styles.sectionsContainer}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <FilterSectionComponent
            key={section.id}
            section={section}
            isCollapsed={collapsedSections.has(section.id)}
            selectedValues={selectedFilters[section.id] || []}
            onToggleSection={() => toggleSection(section.id)}
            onOptionToggle={(value) =>
              handleOptionToggle(section.id, value, section.type)
            }
          />
        ))}
      </ScrollView>
    </View>
  );
});

// Filter section component
interface FilterSectionComponentProps {
  section: FilterSection;
  isCollapsed: boolean;
  selectedValues: string[];
  onToggleSection: () => void;
  onOptionToggle: (value: string) => void;
}

const FilterSectionComponent = memo<FilterSectionComponentProps>(
  function FilterSectionComponent({
    section,
    isCollapsed,
    selectedValues,
    onToggleSection,
    onOptionToggle,
  }) {
    const rotation = useSharedValue(isCollapsed ? -90 : 0);

    React.useEffect(() => {
      rotation.value = withTiming(isCollapsed ? -90 : 0, {
        duration: 200,
        easing: Easing.ease,
      });
    }, [isCollapsed]);

    const chevronStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return (
      <View style={styles.section}>
        {/* Section header */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={onToggleSection}
          activeOpacity={0.7}
        >
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Animated.View style={chevronStyle}>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={COLORS.text.secondary}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Section options */}
        {!isCollapsed && section.options && (
          <View style={styles.optionsContainer}>
            {section.options.map((option) => (
              <FilterOptionItem
                key={option.id}
                option={option}
                isSelected={selectedValues.includes(option.value)}
                isRadio={section.type === 'radio'}
                onPress={() => onOptionToggle(option.value)}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
);

// Filter option item
interface FilterOptionItemProps {
  option: FilterOption;
  isSelected: boolean;
  isRadio: boolean;
  onPress: () => void;
}

const FilterOptionItem = memo<FilterOptionItemProps>(function FilterOptionItem({
  option,
  isSelected,
  isRadio,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Checkbox/Radio indicator */}
      <View
        style={[
          styles.optionIndicator,
          isRadio && styles.optionIndicatorRadio,
          isSelected && styles.optionIndicatorSelected,
        ]}
      >
        {isSelected && (
          <MaterialCommunityIcons
            name={isRadio ? 'circle' : 'check'}
            size={isRadio ? 8 : 14}
            color={COLORS.white}
          />
        )}
      </View>

      {/* Icon */}
      {option.icon && (
        <MaterialCommunityIcons
          name={option.icon}
          size={18}
          color={isSelected ? COLORS.brand.primary : COLORS.text.secondary}
          style={styles.optionIcon}
        />
      )}

      {/* Label */}
      <Text
        style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
      >
        {option.label}
      </Text>

      {/* Count badge */}
      {option.count !== undefined && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{option.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

/**
 * FilterChips - Horizontal scrollable filter chips
 */
interface FilterChip {
  id: string;
  label: string;
  isActive?: boolean;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onChipPress: (chipId: string) => void;
  style?: ViewStyle;
}

export const FilterChips = memo<FilterChipsProps>(function FilterChips({
  chips,
  onChipPress,
  style,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
      style={style}
    >
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip.id}
          style={[styles.chip, chip.isActive && styles.chipActive]}
          onPress={() => onChipPress(chip.id)}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.chipText, chip.isActive && styles.chipTextActive]}
          >
            {chip.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.utility.white,
  },
  containerSidebar: {
    width: 280,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: primitives.stone[200],
  },
  containerBottom: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: primitives.stone[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  filterCount: {
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  clearAllText: {
    fontSize: 14,
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: primitives.stone[50],
    margin: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
    padding: 0,
  },
  sectionsContainer: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: primitives.stone[100],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: primitives.stone[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIndicatorRadio: {
    borderRadius: 10,
  },
  optionIndicatorSelected: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  optionLabelSelected: {
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: primitives.stone[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  // Filter chips
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: primitives.stone[100],
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.brand.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
});

export default FilterPanel;

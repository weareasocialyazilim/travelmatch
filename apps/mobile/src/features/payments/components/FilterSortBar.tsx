import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { SortOption, FilterOption } from '../hooks/useGiftInbox';

interface FilterSortBarProps {
  sortBy: SortOption;
  filterBy: FilterOption;
  onSortPress: () => void;
  onFilterPress: () => void;
  getSortLabel: (sort: SortOption) => string;
  getFilterLabel: (filter: FilterOption) => string;
}

export const FilterSortBar: React.FC<FilterSortBarProps> = ({
  sortBy,
  filterBy,
  onSortPress,
  onFilterPress,
  getSortLabel,
  getFilterLabel,
}) => {
  return (
    <View style={styles.filterBar}>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <MaterialCommunityIcons
          name="filter-variant"
          size={16}
          color={COLORS.primary}
        />
        <Text style={styles.filterButtonText}>
          {getFilterLabel(filterBy)}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={16}
          color={COLORS.primary}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.filterButton} onPress={onSortPress}>
        <MaterialCommunityIcons
          name="sort"
          size={16}
          color={COLORS.primary}
        />
        <Text style={styles.filterButtonText}>
          {getSortLabel(sortBy)}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={16}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

interface SortFilterModalProps {
  visible: boolean;
  title: string;
  options: readonly string[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  getLabel: (value: string) => string;
}

export const SortFilterModal: React.FC<SortFilterModalProps> = ({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
  getLabel,
}) => {
  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={styles.modalOption}
            onPress={() => {
              onSelect(option);
              onClose();
            }}
          >
            <Text
              style={[
                styles.modalOptionText,
                selectedValue === option && styles.modalOptionSelected,
              ]}
            >
              {getLabel(option)}
            </Text>
            {selectedValue === option && (
              <MaterialCommunityIcons
                name="check"
                size={20}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text,
  },
  modalOptionSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

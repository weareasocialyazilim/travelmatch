import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Category {
  id: string;
  label: string;
  icon: IconName;
}

interface ChooseCategoryBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  selectedCategoryId?: string;
}

const CATEGORIES: Category[] = [
  { id: 'adventure', label: 'Adventure', icon: 'compass' },
  { id: 'food', label: 'Food & Drink', icon: 'food' },
  { id: 'culture', label: 'Culture', icon: 'bank' },
  { id: 'relaxation', label: 'Relaxation', icon: 'meditation' },
  { id: 'milestone', label: 'Milestone', icon: 'flag' },
  { id: 'challenge', label: 'Challenge', icon: 'trophy' },
  { id: 'local', label: 'Local Experience', icon: 'account-group' },
];

export const ChooseCategoryBottomSheet: React.FC<
  ChooseCategoryBottomSheetProps
> = ({ visible, onClose, onSelectCategory, selectedCategoryId }) => {
  const handleSelectCategory = (category: Category) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <Text style={styles.header}>Choose Category</Text>

        {/* Category List */}
        <ScrollView style={styles.listContainer}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategoryId === category.id &&
                  styles.categoryItemSelected,
              ]}
              onPress={() => handleSelectCategory(category)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryContent}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={category.icon}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <Text style={styles.categoryLabel}>{category.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay40,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
  },
  header: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    paddingVertical: 12,
  },
  listContainer: {
    paddingTop: 8,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryItemSelected: {
    backgroundColor: `${COLORS.primary}10`,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  bottomPadding: {
    height: 24,
  },
});

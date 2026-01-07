/**
 * BlurFilterModal Component
 * A stylish filter modal with blur background effect
 * Used for filtering vibes with price range and category options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../constants/colors';

const { height } = Dimensions.get('window');

interface BlurFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: { priceRange: number; category: string }) => void;
  initialPriceRange?: number;
  initialCategory?: string;
  resultCount?: number;
}

const PRICE_LABELS = ['$', '$$', '$$$', '$$$$'];
const CATEGORIES = [
  'All',
  'Dining',
  'Nightlife',
  'Adventure',
  'Culture',
  'Relax',
];

export const BlurFilterModal: React.FC<BlurFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialPriceRange = 2,
  initialCategory = 'All',
  resultCount = 24,
}) => {
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const handleReset = () => {
    setPriceRange(2);
    setSelectedCategory('All');
  };

  const handleApply = () => {
    onApply?.({ priceRange, category: selectedCategory });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={onClose}
          activeOpacity={1}
        />

        <BlurView intensity={90} tint="dark" style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Vibes</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Price Range */}
          <Text style={styles.sectionLabel}>Price Range</Text>
          <View style={styles.priceRow}>
            {PRICE_LABELS.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.priceBtn,
                  priceRange === index + 1 && styles.priceBtnActive,
                ]}
                onPress={() => setPriceRange(index + 1)}
              >
                <Text
                  style={[
                    styles.priceText,
                    priceRange === index + 1 && styles.priceTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Categories */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.tagsContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.tag,
                  selectedCategory === cat && styles.tagActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedCategory === cat && styles.tagTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyText}>Show {resultCount} Vibes</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    height: height * 0.55,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    backgroundColor: 'rgba(10,10,10,0.95)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resetText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  sectionLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  priceBtn: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  priceBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: COLORS.brand.primary,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
  },
  priceTextActive: {
    color: COLORS.brand.primary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 40,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagActive: {
    backgroundColor: COLORS.brand.secondary,
    borderColor: COLORS.brand.secondary,
  },
  tagText: {
    color: 'white',
  },
  tagTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  applyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default BlurFilterModal;

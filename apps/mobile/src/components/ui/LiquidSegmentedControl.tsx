import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../../constants/colors';
import { FONT_FAMILIES } from '../../theme/typography';
import { GlassCard } from './GlassCard';

interface LiquidSegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

/**
 * Awwwards standardında animasyonlu cam sekme sistemi.
 * Haptik geri bildirim ve ipeksi geçişler içerir.
 */
export const LiquidSegmentedControl: React.FC<LiquidSegmentedControlProps> = ({
  options,
  selectedIndex,
  onChange,
}) => {
  const handlePress = (index: number) => {
    if (index !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onChange(index);
    }
  };

  return (
    <GlassCard intensity={20} showBorder style={styles.container}>
      <View style={styles.inner}>
        {options.map((option, index) => {
          const isActive = index === selectedIndex;
          return (
            <TouchableOpacity
              key={option}
              onPress={() => handlePress(index)}
              style={[styles.tab, isActive && styles.activeTab]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.label,
                  isActive ? styles.activeLabel : styles.inactiveLabel,
                ]}
              >
                {option}
              </Text>
              {isActive && <View style={styles.neonIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    borderRadius: 16,
  },
  inner: {
    flexDirection: 'row',
    height: 44,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  label: {
    fontSize: 13,
    fontFamily: FONT_FAMILIES.regular,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activeLabel: {
    color: COLORS.text.primary,
  },
  inactiveLabel: {
    color: COLORS.textMuted,
  },
  neonIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.brand.primary,
    shadowColor: COLORS.brand.primary,
    shadowRadius: 4,
    shadowOpacity: 1,
  },
});

export default LiquidSegmentedControl;

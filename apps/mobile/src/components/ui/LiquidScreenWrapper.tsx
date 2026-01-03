import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';

interface LiquidScreenWrapperProps {
  children: React.ReactNode;
  useInsets?: boolean;
  backgroundColor?: string;
}

/**
 * Tüm ekranlar için standart "Liquid" kapsayıcı.
 * Twilight Zinc arka planı ve Safe Area yönetimini sağlar.
 */
export const LiquidScreenWrapper: React.FC<LiquidScreenWrapperProps> = ({
  children,
  useInsets = true,
  backgroundColor = COLORS.background.primary,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle="light-content" />
      <View
        style={[
          styles.inner,
          useInsets && {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        {children}
      </View>

      {/* İpeksi Arka Plan Detayı (Grain veya Mesh Gradient simülasyonu için) */}
      <View style={styles.backgroundDetail} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  backgroundDetail: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primaryMuted,
    opacity: 0.03,
    zIndex: -1,
  },
});

export default LiquidScreenWrapper;

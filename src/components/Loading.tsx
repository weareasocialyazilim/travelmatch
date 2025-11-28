import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants/colors';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  mode?: 'overlay' | 'fullscreen';
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  mode = 'fullscreen',
}) => {
  const containerStyle =
    mode === 'overlay' ? styles.overlayContainer : styles.fullscreenContainer;

  return (
    <View style={containerStyle}>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    zIndex: 999,
  },
  indicatorContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.blackTransparent,
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
});

export default Loading;

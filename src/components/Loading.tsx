import React from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import { COLORS } from '../constants/colors';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
}

const Loading: React.FC<LoadingProps> = ({size = 'large', color = COLORS.buttonPrimary}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;

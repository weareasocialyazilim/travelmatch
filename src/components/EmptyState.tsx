import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Icon name={icon} size={64} color={COLORS.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: LAYOUT.padding * 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: LAYOUT.padding,
    marginTop: LAYOUT.padding * 2,
  },
});

export default EmptyState;

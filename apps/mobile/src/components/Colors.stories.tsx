import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../constants/colors';

const meta: Meta = {
  title: 'Design System/Colors',
};

export default meta;

export const AllColors: StoryObj = {
  render: () => (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Primary Colors</Text>
      <View style={styles.row}>
        <ColorSwatch name="Primary" color={COLORS.primary} />
        <ColorSwatch name="Secondary" color={COLORS.secondary} />
        <ColorSwatch name="Accent" color={COLORS.accent} />
      </View>

      <Text style={styles.sectionTitle}>Semantic Colors</Text>
      <View style={styles.row}>
        <ColorSwatch name="Success" color={COLORS.success} />
        <ColorSwatch name="Error" color={COLORS.error} />
        <ColorSwatch name="Warning" color={COLORS.warning} />
        <ColorSwatch name="Info" color={COLORS.info} />
      </View>

      <Text style={styles.sectionTitle}>Text Colors</Text>
      <View style={styles.row}>
        <ColorSwatch name="Text Primary" color={COLORS.text} />
        <ColorSwatch name="Text Secondary" color={COLORS.textSecondary} />
        <ColorSwatch name="Text Disabled" color={COLORS.textDisabled || '#999'} />
      </View>

      <Text style={styles.sectionTitle}>Neutral Colors</Text>
      <View style={styles.row}>
        <ColorSwatch name="White" color={COLORS.white} />
        <ColorSwatch name="Black" color={COLORS.black} />
        <ColorSwatch name="Background" color={COLORS.background} />
        <ColorSwatch name="Surface" color={COLORS.surface || '#f9f9f9'} />
      </View>

      <Text style={styles.sectionTitle}>Gray Scale</Text>
      <View style={styles.row}>
        {COLORS.gray && Object.entries(COLORS.gray).map(([shade, color]) => (
          <ColorSwatch key={shade} name={`Gray ${shade}`} color={color} />
        ))}
      </View>
    </ScrollView>
  ),
};

export const PrimaryPalette: StoryObj = {
  render: () => (
    <View style={styles.container}>
      <ColorSwatch name="Primary" color={COLORS.primary} large />
      <View style={styles.description}>
        <Text style={styles.descText}>Main brand color used for primary actions, links, and key UI elements</Text>
      </View>
    </View>
  ),
};

export const SemanticColors: StoryObj = {
  render: () => (
    <View style={styles.container}>
      <ColorSwatch name="Success" color={COLORS.success} />
      <ColorSwatch name="Error" color={COLORS.error} />
      <ColorSwatch name="Warning" color={COLORS.warning} />
      <ColorSwatch name="Info" color={COLORS.info} />
    </View>
  ),
};

const ColorSwatch = ({ name, color, large }: { name: string; color: string; large?: boolean }) => (
  <View style={[styles.swatch, large && styles.swatchLarge]}>
    <View style={[styles.color, { backgroundColor: color }, large && styles.colorLarge]} />
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.hex}>{color}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    alignItems: 'center',
    marginBottom: 16,
  },
  swatchLarge: {
    marginBottom: 24,
  },
  color: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorLarge: {
    width: 120,
    height: 120,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  hex: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  description: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  descText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

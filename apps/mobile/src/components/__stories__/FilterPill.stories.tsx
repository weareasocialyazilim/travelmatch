import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { FilterPill } from '../FilterPill';

const meta: Meta<typeof FilterPill> = {
  title: 'Components/FilterPill',
  component: FilterPill,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    isSelected: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FilterPill>;

export const Default: Story = {
  args: {
    filter: {
      id: 'adventure',
      label: 'Adventure',
      icon: 'hiking',
    },
    isSelected: false,
    onPress: (id) => console.log('Pressed:', id),
  },
};

export const Selected: Story = {
  args: {
    filter: {
      id: 'adventure',
      label: 'Adventure',
      icon: 'hiking',
    },
    isSelected: true,
    onPress: (id) => console.log('Pressed:', id),
  },
};

export const WithoutIcon: Story = {
  args: {
    filter: {
      id: 'all',
      label: 'All Categories',
    },
    isSelected: false,
    onPress: (id) => console.log('Pressed:', id),
  },
};

export const LongLabel: Story = {
  args: {
    filter: {
      id: 'cultural',
      label: 'Cultural & Heritage Tours',
      icon: 'temple-buddhist',
    },
    isSelected: false,
    onPress: (id) => console.log('Pressed:', id),
  },
};

// Show multiple filter pills in a row
export const FilterRow: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      <FilterPill
        filter={{ id: '1', label: 'Adventure', icon: 'hiking' }}
        isSelected={true}
        onPress={() => {}}
      />
      <FilterPill
        filter={{ id: '2', label: 'Food', icon: 'food-variant' }}
        isSelected={false}
        onPress={() => {}}
      />
      <FilterPill
        filter={{ id: '3', label: 'Culture', icon: 'temple-buddhist' }}
        isSelected={false}
        onPress={() => {}}
      />
      <FilterPill
        filter={{ id: '4', label: 'Nightlife', icon: 'glass-cocktail' }}
        isSelected={false}
        onPress={() => {}}
      />
      <FilterPill
        filter={{ id: '5', label: 'Nature', icon: 'pine-tree' }}
        isSelected={true}
        onPress={() => {}}
      />
    </View>
  ),
};

export const AllCategories: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
      {[
        { id: '1', label: 'All', icon: 'view-grid-outline' },
        { id: '2', label: 'Adventure', icon: 'hiking' },
        { id: '3', label: 'Food & Drink', icon: 'food-variant' },
        { id: '4', label: 'Culture', icon: 'temple-buddhist' },
        { id: '5', label: 'Nightlife', icon: 'glass-cocktail' },
        { id: '6', label: 'Nature', icon: 'pine-tree' },
        { id: '7', label: 'Sports', icon: 'basketball' },
        { id: '8', label: 'Art', icon: 'palette-outline' },
        { id: '9', label: 'Music', icon: 'music-note' },
        { id: '10', label: 'Wellness', icon: 'yoga' },
      ].map((filter, index) => (
        <FilterPill
          key={filter.id}
          filter={filter}
          isSelected={index === 0}
          onPress={() => {}}
        />
      ))}
    </View>
  ),
};

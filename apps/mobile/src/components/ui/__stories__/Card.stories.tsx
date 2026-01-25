import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../Card';

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  variantLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  imagePlaceholder: {
    height: 150,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tripMeta: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

const meta = {
  title: 'Components/Card',
  component: Card,
  argTypes: {
    variant: {
      options: ['elevated', 'outlined', 'filled'],
      control: { type: 'select' },
      description: 'Visual style variant',
    },
    padding: {
      options: ['none', 'sm', 'md', 'lg'],
      control: { type: 'select' },
      description: 'Internal padding size',
    },
    onPress: {
      action: 'pressed',
      description: 'Press handler - makes card interactive',
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ padding: 16, backgroundColor: '#f9fafb' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const CardContent = () => (
  <View>
    <Text style={styles.title}>Card Title</Text>
    <Text style={styles.description}>
      This is a sample card with some content to demonstrate the component.
    </Text>
  </View>
);

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    padding: 'md',
    children: <CardContent />,
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    children: <CardContent />,
  },
};

export const Filled: Story = {
  args: {
    variant: 'filled',
    padding: 'md',
    children: <CardContent />,
  },
};

export const SmallPadding: Story = {
  args: {
    variant: 'elevated',
    padding: 'sm',
    children: <CardContent />,
  },
};

export const LargePadding: Story = {
  args: {
    variant: 'elevated',
    padding: 'lg',
    children: <CardContent />,
  },
};

export const NoPadding: Story = {
  args: {
    variant: 'elevated',
    padding: 'none',
    children: (
      <View style={{ padding: 16 }}>
        <CardContent />
      </View>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'outlined',
    padding: 'md',
    onPress: () => console.log('Card pressed'),
    children: (
      <View>
        <Text style={styles.title}>Clickable Card</Text>
        <Text style={styles.description}>
          Tap me to trigger the press handler
        </Text>
      </View>
    ),
  },
};

export const WithImage: Story = {
  args: {
    variant: 'elevated',
    padding: 'none',
    children: (
      <View>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Image Area</Text>
        </View>
        <View style={{ padding: 16 }}>
          <Text style={styles.title}>Card with Image</Text>
          <Text style={styles.description}>
            Demonstrates a card with image and content below
          </Text>
        </View>
      </View>
    ),
  },
};

export const AllVariants: Story = {
  args: {
    children: <Text />,
  },
  render: () => (
    <View style={{ gap: 16 }}>
      <Card variant="elevated" padding="md">
        <Text style={styles.variantLabel}>Elevated (default)</Text>
      </Card>
      <Card variant="outlined" padding="md">
        <Text style={styles.variantLabel}>Outlined</Text>
      </Card>
      <Card variant="filled" padding="md">
        <Text style={styles.variantLabel}>Filled</Text>
      </Card>
    </View>
  ),
};

export const AllPaddings: Story = {
  args: {
    children: <Text />,
  },
  render: () => (
    <View style={{ gap: 16 }}>
      <Card variant="outlined" padding="none">
        <View style={{ padding: 8, backgroundColor: '#e5e7eb' }}>
          <Text style={styles.variantLabel}>None (0px)</Text>
        </View>
      </Card>
      <Card variant="outlined" padding="sm">
        <View style={{ backgroundColor: '#e5e7eb' }}>
          <Text style={styles.variantLabel}>Small (12px)</Text>
        </View>
      </Card>
      <Card variant="outlined" padding="md">
        <View style={{ backgroundColor: '#e5e7eb' }}>
          <Text style={styles.variantLabel}>Medium (16px)</Text>
        </View>
      </Card>
      <Card variant="outlined" padding="lg">
        <View style={{ backgroundColor: '#e5e7eb' }}>
          <Text style={styles.variantLabel}>Large (24px)</Text>
        </View>
      </Card>
    </View>
  ),
};

export const NestedCards: Story = {
  args: {
    children: <Text />,
  },
  render: () => (
    <Card variant="elevated" padding="lg">
      <Text style={styles.title}>Parent Card</Text>
      <View style={{ marginTop: 12, gap: 12 }}>
        <Card variant="outlined" padding="sm">
          <Text style={styles.description}>Nested Card 1</Text>
        </Card>
        <Card variant="outlined" padding="sm">
          <Text style={styles.description}>Nested Card 2</Text>
        </Card>
      </View>
    </Card>
  ),
};

export const TripCard: Story = {
  args: {
    children: <Text />,
  },
  render: () => (
    <Card
      variant="elevated"
      padding="md"
      onPress={() => console.log('Trip pressed')}
    >
      <View>
        <Text style={styles.title}>Paris Adventure</Text>
        <Text style={[styles.description, { marginTop: 4 }]}>
          Explore the city of lights with fellow travelers
        </Text>
        <View style={styles.tripMeta}>
          <Text style={styles.metaText}>📅 Dec 15-20</Text>
          <Text style={styles.metaText}>👥 3/5 travelers</Text>
        </View>
      </View>
    </Card>
  ),
};

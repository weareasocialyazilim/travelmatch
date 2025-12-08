import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Badge text content',
    },
    variant: {
      options: ['default', 'success', 'warning', 'error', 'info', 'primary'],
      control: { type: 'select' },
      description: 'Color variant',
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
      description: 'Badge size',
    },
    icon: {
      control: { type: 'text' },
      description: 'Material icon name',
    },
    dot: {
      control: { type: 'boolean' },
      description: 'Show dot indicator',
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: '#f9fafb', alignItems: 'flex-start' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Default',
    variant: 'default',
    size: 'md',
  },
};

export const Success: Story = {
  args: {
    label: 'Success',
    variant: 'success',
    size: 'md',
  },
};

export const Warning: Story = {
  args: {
    label: 'Warning',
    variant: 'warning',
    size: 'md',
  },
};

export const Error: Story = {
  args: {
    label: 'Error',
    variant: 'error',
    size: 'md',
  },
};

export const Info: Story = {
  args: {
    label: 'Info',
    variant: 'info',
    size: 'md',
  },
};

export const Primary: Story = {
  args: {
    label: 'Primary',
    variant: 'primary',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    label: 'Small Badge',
    variant: 'primary',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium Badge',
    variant: 'primary',
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    label: 'Large Badge',
    variant: 'primary',
    size: 'lg',
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Verified',
    variant: 'success',
    size: 'md',
    icon: 'check-circle',
  },
};

export const WithDot: Story = {
  args: {
    label: 'Active',
    variant: 'success',
    size: 'md',
    dot: true,
  },
};

export const WithIconAndDot: Story = {
  args: {
    label: 'Premium',
    variant: 'primary',
    size: 'md',
    icon: 'star',
    dot: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={styles.grid}>
      <Badge label="Default" variant="default" />
      <Badge label="Primary" variant="primary" />
      <Badge label="Success" variant="success" />
      <Badge label="Warning" variant="warning" />
      <Badge label="Error" variant="error" />
      <Badge label="Info" variant="info" />
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={styles.column}>
      <View style={styles.row}>
        <Text style={styles.sizeLabel}>Small:</Text>
        <Badge label="Small Badge" variant="primary" size="sm" />
      </View>
      <View style={styles.row}>
        <Text style={styles.sizeLabel}>Medium:</Text>
        <Badge label="Medium Badge" variant="primary" size="md" />
      </View>
      <View style={styles.row}>
        <Text style={styles.sizeLabel}>Large:</Text>
        <Badge label="Large Badge" variant="primary" size="lg" />
      </View>
    </View>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <View style={styles.grid}>
      <Badge label="Active" variant="success" icon="check-circle" />
      <Badge label="Pending" variant="warning" icon="clock" />
      <Badge label="Rejected" variant="error" icon="close-circle" />
      <Badge label="Verified" variant="info" icon="shield-check" />
    </View>
  ),
};

export const CategoryBadges: Story = {
  render: () => (
    <View style={styles.grid}>
      <Badge label="Travel" variant="primary" icon="airplane" />
      <Badge label="Adventure" variant="success" icon="terrain" />
      <Badge label="Food" variant="warning" icon="food" />
      <Badge label="Culture" variant="info" icon="palette" />
    </View>
  ),
};

export const NotificationBadges: Story = {
  render: () => (
    <View style={styles.grid}>
      <Badge label="3 new" variant="error" dot />
      <Badge label="Online" variant="success" dot />
      <Badge label="2 messages" variant="primary" icon="message" />
      <Badge label="Alert" variant="warning" icon="alert" />
    </View>
  ),
};

export const UserRoles: Story = {
  render: () => (
    <View style={styles.grid}>
      <Badge label="Admin" variant="error" icon="shield-star" />
      <Badge label="Moderator" variant="warning" icon="shield-check" />
      <Badge label="Premium" variant="primary" icon="star" />
      <Badge label="Verified" variant="success" icon="check-decagram" />
    </View>
  ),
};

export const TripTags: Story = {
  render: () => (
    <View style={styles.wrap}>
      <Badge label="Beach" variant="info" size="sm" />
      <Badge label="Mountains" variant="success" size="sm" />
      <Badge label="City Tour" variant="primary" size="sm" />
      <Badge label="Adventure" variant="warning" size="sm" />
      <Badge label="Food & Drink" variant="error" size="sm" />
      <Badge label="Cultural" variant="default" size="sm" />
      <Badge label="Photography" variant="info" size="sm" />
      <Badge label="Budget-Friendly" variant="success" size="sm" />
    </View>
  ),
};

export const TrustScoreBadges: Story = {
  render: () => (
    <View style={styles.column}>
      <View style={styles.listItem}>
        <Text style={styles.listLabel}>Excellent Trust Score</Text>
        <Badge label="95%" variant="success" icon="star" size="lg" />
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listLabel}>Good Trust Score</Text>
        <Badge label="75%" variant="primary" icon="thumb-up" size="lg" />
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listLabel}>Average Trust Score</Text>
        <Badge label="50%" variant="warning" icon="alert-circle" size="lg" />
      </View>
      <View style={styles.listItem}>
        <Text style={styles.listLabel}>Low Trust Score</Text>
        <Badge label="25%" variant="error" icon="alert" size="lg" />
      </View>
    </View>
  ),
};

export const InteractiveBadges: Story = {
  render: () => (
    <View style={styles.column}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>John Doe</Text>
        <View style={styles.badgeGroup}>
          <Badge label="Verified" variant="success" icon="check-circle" size="sm" />
          <Badge label="Premium" variant="primary" icon="star" size="sm" />
          <Badge label="Guide" variant="info" icon="map-marker" size="sm" />
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Paris Adventure Trip</Text>
        <View style={styles.badgeGroup}>
          <Badge label="Trending" variant="warning" icon="fire" size="sm" dot />
          <Badge label="5 spots left" variant="error" size="sm" />
          <Badge label="Dec 15-20" variant="default" icon="calendar" size="sm" />
        </View>
      </View>
    </View>
  ),
};

export const CompactList: Story = {
  render: () => (
    <View style={styles.compactList}>
      {[
        { name: 'John Doe', status: 'Online', variant: 'success' as const },
        { name: 'Sarah Johnson', status: 'Busy', variant: 'error' as const },
        { name: 'Mike Williams', status: 'Away', variant: 'warning' as const },
        { name: 'Emma Davis', status: 'Offline', variant: 'default' as const },
      ].map((user, index) => (
        <View key={index} style={styles.compactItem}>
          <Text style={styles.compactName}>{user.name}</Text>
          <Badge label={user.status} variant={user.variant} size="sm" dot />
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: 300,
  },
  column: {
    gap: 12,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  listLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  card: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badgeGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactList: {
    gap: 8,
    width: '100%',
  },
  compactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  compactName: {
    fontSize: 14,
    color: '#374151',
  },
});

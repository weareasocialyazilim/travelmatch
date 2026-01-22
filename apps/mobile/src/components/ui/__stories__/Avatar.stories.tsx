import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from '../Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    source: {
      control: { type: 'text' },
      description: 'Image URL for the avatar',
    },
    name: {
      control: { type: 'text' },
      description: 'User name - used for initials fallback',
    },
    size: {
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      control: { type: 'select' },
      description: 'Avatar size',
    },
    showBadge: {
      control: { type: 'boolean' },
      description: 'Show online status badge',
    },
    badgeColor: {
      control: { type: 'color' },
      description: 'Badge indicator color',
    },
    showVerified: {
      control: { type: 'boolean' },
      description: 'Show verified checkmark',
    },
  },
  decorators: [
    (Story) => (
      <View
        style={{
          padding: 16,
          backgroundColor: '#f9fafb',
          alignItems: 'center',
        }}
      >
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_IMAGE = 'https://i.pravatar.cc/150?img=1';

export const Default: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'md',
  },
};

export const WithName: Story = {
  args: {
    name: 'John Doe',
    size: 'md',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'Sarah Johnson',
    size: 'lg',
  },
};

export const WithBadge: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'lg',
    showBadge: true,
  },
};

export const WithVerified: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'lg',
    showVerified: true,
  },
};

export const WithBadgeAndVerified: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'xl',
    showBadge: true,
    showVerified: true,
  },
};

export const ExtraSmall: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    source: SAMPLE_IMAGE,
    size: 'xl',
  },
};

export const AllSizes: Story = {
  render: () => (
    <View style={styles.sizeGrid}>
      <View style={styles.sizeItem}>
        <Avatar source={SAMPLE_IMAGE} size="xs" />
        <Text style={styles.sizeLabel}>XS (24px)</Text>
      </View>
      <View style={styles.sizeItem}>
        <Avatar source={SAMPLE_IMAGE} size="sm" />
        <Text style={styles.sizeLabel}>SM (32px)</Text>
      </View>
      <View style={styles.sizeItem}>
        <Avatar source={SAMPLE_IMAGE} size="md" />
        <Text style={styles.sizeLabel}>MD (48px)</Text>
      </View>
      <View style={styles.sizeItem}>
        <Avatar source={SAMPLE_IMAGE} size="lg" />
        <Text style={styles.sizeLabel}>LG (64px)</Text>
      </View>
      <View style={styles.sizeItem}>
        <Avatar source={SAMPLE_IMAGE} size="xl" />
        <Text style={styles.sizeLabel}>XL (96px)</Text>
      </View>
    </View>
  ),
};

export const InitialsFallback: Story = {
  render: () => (
    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <Avatar name="John Doe" size="md" />
        <Text style={styles.label}>John Doe</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar name="Sarah Johnson" size="md" />
        <Text style={styles.label}>Sarah Johnson</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar name="Mike Williams" size="md" />
        <Text style={styles.label}>Mike Williams</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar name="Emma Davis" size="md" />
        <Text style={styles.label}>Emma Davis</Text>
      </View>
    </View>
  ),
};

export const OnlineStatuses: Story = {
  render: () => (
    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <Avatar
          source={SAMPLE_IMAGE}
          size="lg"
          showBadge
          badgeColor="#22c55e"
        />
        <Text style={styles.label}>Online</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar
          source={SAMPLE_IMAGE}
          size="lg"
          showBadge
          badgeColor="#ef4444"
        />
        <Text style={styles.label}>Busy</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar
          source={SAMPLE_IMAGE}
          size="lg"
          showBadge
          badgeColor="#f59e0b"
        />
        <Text style={styles.label}>Away</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar
          source={SAMPLE_IMAGE}
          size="lg"
          showBadge
          badgeColor="#6b7280"
        />
        <Text style={styles.label}>Offline</Text>
      </View>
    </View>
  ),
};

export const VerifiedUsers: Story = {
  render: () => (
    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <Avatar source={SAMPLE_IMAGE} size="lg" showVerified />
        <Text style={styles.label}>Verified</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar name="John Doe" size="lg" showVerified />
        <Text style={styles.label}>Verified (Initials)</Text>
      </View>
      <View style={styles.gridItem}>
        <Avatar source={SAMPLE_IMAGE} size="lg" showBadge showVerified />
        <Text style={styles.label}>Online + Verified</Text>
      </View>
    </View>
  ),
};

export const UserList: Story = {
  render: () => (
    <View style={styles.list}>
      {[
        { name: 'John Doe', verified: true, online: true },
        { name: 'Sarah Johnson', verified: false, online: true },
        { name: 'Mike Williams', verified: true, online: false },
        { name: 'Emma Davis', verified: false, online: false },
      ].map((user, index) => (
        <View key={index} style={styles.listItem}>
          <Avatar
            source={`https://i.pravatar.cc/150?img=${index + 1}`}
            name={user.name}
            size="md"
            showBadge={user.online}
            showVerified={user.verified}
          />
          <View style={styles.listContent}>
            <Text style={styles.listName}>{user.name}</Text>
            <Text style={styles.listStatus}>
              {user.online ? 'Online' : 'Offline'} •{' '}
              {user.verified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
        </View>
      ))}
    </View>
  ),
};

export const AvatarGroup: Story = {
  render: () => (
    <View style={styles.avatarGroup}>
      <Avatar
        source="https://i.pravatar.cc/150?img=1"
        size="md"
        style={styles.groupAvatar}
      />
      <Avatar
        source="https://i.pravatar.cc/150?img=2"
        size="md"
        style={styles.groupAvatar}
      />
      <Avatar
        source="https://i.pravatar.cc/150?img=3"
        size="md"
        style={styles.groupAvatar}
      />
      <View style={styles.moreIndicator}>
        <Text style={styles.moreText}>+5</Text>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  gridItem: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sizeGrid: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-end',
  },
  sizeItem: {
    alignItems: 'center',
    gap: 8,
  },
  sizeLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  list: {
    width: '100%',
    gap: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupAvatar: {
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
});

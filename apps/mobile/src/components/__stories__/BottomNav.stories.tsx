import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import BottomNav from '../BottomNav';

const meta: Meta<typeof BottomNav> = {
  title: 'Components/BottomNav',
  component: BottomNav,
  decorators: [
    (Story) => (
      <View
        style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'flex-end' }}
      >
        <Story />
      </View>
    ),
  ],
  argTypes: {
    activeTab: {
      control: { type: 'select' },
      options: ['Discover', 'Requests', 'Create', 'Messages', 'Profile'],
    },
    requestsBadge: {
      control: { type: 'number', min: 0, max: 99 },
    },
    messagesBadge: {
      control: { type: 'number', min: 0, max: 99 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BottomNav>;

export const DiscoverActive: Story = {
  args: {
    activeTab: 'Discover',
    requestsBadge: 0,
    messagesBadge: 0,
  },
};

export const RequestsActive: Story = {
  args: {
    activeTab: 'Requests',
    requestsBadge: 3,
    messagesBadge: 0,
  },
};

export const CreateActive: Story = {
  args: {
    activeTab: 'Create',
    requestsBadge: 0,
    messagesBadge: 0,
  },
};

export const MessagesActive: Story = {
  args: {
    activeTab: 'Messages',
    requestsBadge: 0,
    messagesBadge: 5,
  },
};

export const ProfileActive: Story = {
  args: {
    activeTab: 'Profile',
    requestsBadge: 0,
    messagesBadge: 0,
  },
};

export const WithBadges: Story = {
  args: {
    activeTab: 'Discover',
    requestsBadge: 12,
    messagesBadge: 7,
  },
};

export const ManyNotifications: Story = {
  args: {
    activeTab: 'Discover',
    requestsBadge: 50,
    messagesBadge: 99,
  },
};

export const SingleNotifications: Story = {
  args: {
    activeTab: 'Profile',
    requestsBadge: 1,
    messagesBadge: 1,
  },
};

// Visual states overview
export const AllTabs: Story = {
  render: () => (
    <View style={{ gap: 16, flex: 1, justifyContent: 'flex-end' }}>
      <View>
        <BottomNav activeTab="Discover" requestsBadge={0} messagesBadge={0} />
      </View>
      <View>
        <BottomNav activeTab="Requests" requestsBadge={3} messagesBadge={0} />
      </View>
      <View>
        <BottomNav activeTab="Create" requestsBadge={0} messagesBadge={0} />
      </View>
      <View>
        <BottomNav activeTab="Messages" requestsBadge={0} messagesBadge={5} />
      </View>
      <View>
        <BottomNav activeTab="Profile" requestsBadge={0} messagesBadge={0} />
      </View>
    </View>
  ),
};

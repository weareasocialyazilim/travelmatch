import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import OfflineBanner from './OfflineBanner';

const meta: Meta<typeof OfflineBanner> = {
  title: 'Components/OfflineBanner',
  component: OfflineBanner,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    showRetry: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof OfflineBanner>;

// Note: This component only renders when offline
// For demo purposes, we'll create a wrapper that always shows it
const AlwaysVisibleOfflineBanner = (props: any) => {
  // Mock the useNetwork hook to always return offline
  return (
    <View
      style={{
        backgroundColor: '#dc2626',
        paddingVertical: 10,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View
          style={{
            width: 18,
            height: 18,
            backgroundColor: '#fff',
            borderRadius: 9,
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: 14,
              height: 2,
              backgroundColor: '#dc2626',
              top: 8,
              left: 2,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 14,
              height: 2,
              backgroundColor: '#dc2626',
              top: 8,
              left: 2,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
        <View style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>
          {props.message || "You're offline"}
        </View>
      </View>
      {props.showRetry !== false && (
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <View style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>
            Retry
          </View>
        </View>
      )}
    </View>
  );
};

export const Default: Story = {
  render: (args) => <AlwaysVisibleOfflineBanner {...args} />,
  args: {
    message: "You're offline",
    showRetry: true,
    onRetry: () => console.log('Retry pressed'),
  },
};

export const CustomMessage: Story = {
  render: (args) => <AlwaysVisibleOfflineBanner {...args} />,
  args: {
    message: 'No internet connection',
    showRetry: true,
    onRetry: () => console.log('Retry pressed'),
  },
};

export const WithoutRetry: Story = {
  render: (args) => <AlwaysVisibleOfflineBanner {...args} />,
  args: {
    message: "You're offline. Some features may be limited.",
    showRetry: false,
  },
};

export const LongMessage: Story = {
  render: (args) => <AlwaysVisibleOfflineBanner {...args} />,
  args: {
    message:
      'No internet connection detected. Please check your network settings.',
    showRetry: true,
    onRetry: () => console.log('Retry pressed'),
  },
};

// Visual states documentation
export const VisualStates: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <AlwaysVisibleOfflineBanner
        message="You're offline"
        showRetry={true}
        onRetry={() => {}}
      />
      <AlwaysVisibleOfflineBanner
        message="No internet connection"
        showRetry={true}
        onRetry={() => {}}
      />
      <AlwaysVisibleOfflineBanner
        message="Offline mode active"
        showRetry={false}
      />
    </View>
  ),
};

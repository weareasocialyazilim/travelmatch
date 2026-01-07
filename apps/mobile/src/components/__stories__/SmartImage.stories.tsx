import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import SmartImage from './SmartImage';

const meta: Meta<typeof SmartImage> = {
  title: 'Components/SmartImage',
  component: SmartImage,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    showLoader: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof SmartImage>;

export const Default: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    style: { width: 300, height: 200, borderRadius: 12 },
    showLoader: true,
  },
};

export const WithFallback: Story = {
  args: {
    uri: 'https://invalid-url.com/image.jpg',
    fallbackUri:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    style: { width: 300, height: 200, borderRadius: 12 },
    showLoader: true,
  },
};

export const ErrorState: Story = {
  args: {
    uri: 'https://invalid-url.com/nonexistent-image.jpg',
    style: {
      width: 300,
      height: 200,
      borderRadius: 12,
      backgroundColor: '#e0e0e0',
    },
    fallbackIcon: 'image-off-outline',
    fallbackIconSize: 48,
  },
};

export const CustomFallbackIcon: Story = {
  args: {
    uri: '',
    style: { width: 150, height: 150, borderRadius: 75 },
    fallbackIcon: 'account-circle-outline',
    fallbackIconSize: 60,
  },
};

export const SquareImage: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=400',
    style: { width: 200, height: 200, borderRadius: 8 },
  },
};

export const CircularImage: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    style: { width: 120, height: 120, borderRadius: 60 },
  },
};

export const WideImage: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    style: { width: '100%', height: 180, borderRadius: 12 },
  },
};

export const TallImage: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=800',
    style: { width: 200, height: 300, borderRadius: 12 },
  },
};

export const ImageGrid: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {[
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
        'https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=300',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=300',
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=300',
      ].map((uri, index) => (
        <SmartImage
          key={index}
          uri={uri}
          style={{ width: 100, height: 100, borderRadius: 8 }}
        />
      ))}
    </View>
  ),
};

export const LoadingState: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&delay=5000',
    style: { width: 300, height: 200, borderRadius: 12 },
    showLoader: true,
    loaderColor: '#007AFF',
  },
};

export const NoLoader: Story = {
  args: {
    uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    style: { width: 300, height: 200, borderRadius: 12 },
    showLoader: false,
  },
};

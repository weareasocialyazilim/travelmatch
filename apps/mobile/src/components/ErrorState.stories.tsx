import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { ErrorState } from './ErrorState';

const meta: Meta<typeof ErrorState> = {
  title: 'Components/ErrorState',
  component: ErrorState,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ErrorState>;

export const Default: Story = {
  args: {
    message: 'Something went wrong',
    onRetry: () => console.log('Retry pressed'),
    retryText: 'Try Again',
  },
};

export const NetworkError: Story = {
  args: {
    message: 'Unable to connect. Please check your internet connection and try again.',
    icon: 'wifi-off',
    onRetry: () => console.log('Retry pressed'),
    retryText: 'Retry Connection',
  },
};

export const NotFoundError: Story = {
  args: {
    message: 'The page you're looking for doesn't exist.',
    icon: 'map-marker-question-outline',
    onRetry: undefined,
  },
};

export const AuthenticationError: Story = {
  args: {
    message: 'Your session has expired. Please log in again to continue.',
    icon: 'lock-alert-outline',
    onRetry: () => console.log('Re-authenticate'),
    retryText: 'Log In',
  },
};

export const ServerError: Story = {
  args: {
    message: 'Our servers are experiencing issues. We're working on it!',
    icon: 'server-network-off',
    onRetry: () => console.log('Retry pressed'),
    retryText: 'Try Again',
  },
};

export const PermissionDenied: Story = {
  args: {
    message: 'You don't have permission to view this content.',
    icon: 'shield-lock-outline',
    onRetry: undefined,
  },
};

export const DataLoadError: Story = {
  args: {
    message: 'Failed to load data. Please try again.',
    icon: 'database-alert-outline',
    onRetry: () => console.log('Retry pressed'),
  },
};

export const CustomIcon: Story = {
  args: {
    message: 'No results found. Try adjusting your filters.',
    icon: 'magnify',
    onRetry: () => console.log('Clear filters'),
    retryText: 'Clear Filters',
  },
};

export const WithoutRetryButton: Story = {
  args: {
    message: 'This feature is currently unavailable.',
    icon: 'alert-octagon-outline',
    onRetry: undefined,
  },
};

export const LongErrorMessage: Story = {
  args: {
    message: 'We encountered an unexpected error while processing your request. This could be due to network issues, server problems, or invalid data. Please check your connection and try again. If the problem persists, contact support.',
    icon: 'alert-circle-outline',
    onRetry: () => console.log('Retry pressed'),
    retryText: 'Try Again',
  },
};

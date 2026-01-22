import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Button } from '../Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: [
        'primary',
        'secondary',
        'outline',
        'ghost',
        'destructive',
        'link',
      ],
      control: { type: 'select' },
    },
    size: {
      options: ['sm', 'md', 'lg'],
      control: { type: 'select' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, backgroundColor: '#f9fafb' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Primary Button',
    disabled: false,
    loading: false,
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    size: 'md',
    children: 'Delete Account',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Disabled Button',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Loading Button',
    loading: true,
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button with Icon',
    icon: 'heart',
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </View>
  ),
};

export const InteractiveStates: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button>Normal State</Button>
      <Button disabled>Disabled State</Button>
      <Button loading>Loading State</Button>
    </View>
  ),
};

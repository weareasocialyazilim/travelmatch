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
        'danger',
        'neon',
        'glass',
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
    (Story: React.ComponentType) => (
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
    onPress: () => {},
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Secondary Button',
    onPress: () => {},
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    size: 'md',
    children: 'Outline Button',
    onPress: () => {},
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    size: 'md',
    children: 'Ghost Button',
    onPress: () => {},
  },
};

export const Destructive: Story = {
  args: {
    variant: 'danger',
    size: 'md',
    children: 'Delete Account',
    onPress: () => {},
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'sm',
    children: 'Small Button',
    onPress: () => {},
  },
};

export const Large: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Large Button',
    onPress: () => {},
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Disabled Button',
    disabled: true,
    onPress: () => {},
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Loading Button',
    loading: true,
    onPress: () => {},
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button with Icon',
    leftIcon: 'heart',
    onPress: () => {},
  },
};

export const AllVariants: Story = {
  args: {
    onPress: () => {},
  },
  render: () => (
    <View style={{ gap: 12 }}>
      <Button variant="primary" onPress={() => {}}>
        Primary
      </Button>
      <Button variant="secondary" onPress={() => {}}>
        Secondary
      </Button>
      <Button variant="outline" onPress={() => {}}>
        Outline
      </Button>
      <Button variant="ghost" onPress={() => {}}>
        Ghost
      </Button>
      <Button variant="danger" onPress={() => {}}>
        Danger
      </Button>
      <Button variant="neon" onPress={() => {}}>
        Neon
      </Button>
      <Button variant="glass" onPress={() => {}}>
        Glass
      </Button>
    </View>
  ),
};

export const AllSizes: Story = {
  args: {
    onPress: () => {},
  },
  render: () => (
    <View style={{ gap: 12 }}>
      <Button size="sm" onPress={() => {}}>
        Small Button
      </Button>
      <Button size="md" onPress={() => {}}>
        Medium Button
      </Button>
      <Button size="lg" onPress={() => {}}>
        Large Button
      </Button>
    </View>
  ),
};

export const InteractiveStates: Story = {
  args: {
    onPress: () => {},
  },
  render: () => (
    <View style={{ gap: 12 }}>
      <Button onPress={() => {}}>Normal State</Button>
      <Button onPress={() => {}} disabled>
        Disabled State
      </Button>
      <Button onPress={() => {}} loading>
        Loading State
      </Button>
    </View>
  ),
};

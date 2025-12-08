import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import Input from '../Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  argTypes: {
    label: {
      control: { type: 'text' },
    },
    placeholder: {
      control: { type: 'text' },
    },
    error: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    secureTextEntry: {
      control: { type: 'boolean' },
    },
    multiline: {
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
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

export const WithValue: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    value: 'johndoe',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    secureTextEntry: true,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    value: 'user@example.com',
    disabled: true,
  },
};

export const Multiline: Story = {
  args: {
    label: 'Bio',
    placeholder: 'Tell us about yourself',
    multiline: true,
    numberOfLines: 4,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search destinations',
    leftIcon: 'search',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    value: 'user@example.com',
    rightIcon: 'check-circle',
  },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Input label="Normal" placeholder="Enter value" />
      <Input label="With Value" value="Example value" />
      <Input label="With Error" error="This field is required" />
      <Input label="Disabled" value="Disabled input" disabled />
      <Input label="Password" secureTextEntry placeholder="Enter password" />
    </View>
  ),
};

export const FormExample: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Input label="Full Name" placeholder="John Doe" />
      <Input label="Email" placeholder="john@example.com" />
      <Input label="Password" secureTextEntry placeholder="••••••••" />
      <Input
        label="Bio"
        multiline
        numberOfLines={4}
        placeholder="Tell us about yourself"
      />
    </View>
  ),
};

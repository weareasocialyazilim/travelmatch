/**
 * Button Component Stories
 * @storybook
 */
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'primary' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    enableHaptic: {
      control: 'boolean',
      description: 'Enable haptic feedback on press',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    title: {
      control: 'text',
      description: 'Button text label',
    },
    onPress: {
      action: 'pressed',
      description: 'Press handler function',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
Primary button component with variants, haptic feedback, and press animations.

## Features
- 3 visual variants: primary, secondary, outline
- Haptic feedback on press
- Scale animation on press
- Full accessibility support
- Disabled state styling

## Usage
\`\`\`tsx
import { Button } from '@/components';

<Button 
  title="Continue"
  variant="primary"
  onPress={handleSubmit}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default story
export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
    disabled: false,
    enableHaptic: true,
  },
};

// Secondary variant
export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
    disabled: false,
  },
};

// Outline variant
export const Outline: Story = {
  args: {
    title: 'Outline Button',
    variant: 'outline',
    disabled: false,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    variant: 'primary',
    disabled: true,
  },
};

// All variants together
export const AllVariants: Story = {
  render: () => (
    <View style={styles.container}>
      <Button title="Primary" variant="primary" onPress={() => {}} />
      <View style={styles.spacer} />
      <Button title="Secondary" variant="secondary" onPress={() => {}} />
      <View style={styles.spacer} />
      <Button title="Outline" variant="outline" onPress={() => {}} />
      <View style={styles.spacer} />
      <Button title="Disabled" variant="primary" disabled onPress={() => {}} />
    </View>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together for comparison.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    title: 'Click Me',
    variant: 'primary',
    disabled: false,
    enableHaptic: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Use the controls panel to experiment with different props.',
      },
    },
  },
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
    width: 200,
  },
  spacer: {
    height: 8,
  },
});

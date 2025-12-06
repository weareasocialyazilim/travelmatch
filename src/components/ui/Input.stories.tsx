/**
 * Input Component Stories
 * @storybook
 */
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/UI/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Input label text',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    hint: {
      control: 'text',
      description: 'Helper text hint',
    },
    required: {
      control: 'boolean',
      description: 'Show required asterisk',
    },
    secureTextEntry: {
      control: 'boolean',
      description: 'Password input mode',
    },
    showSuccess: {
      control: 'boolean',
      description: 'Show success checkmark',
    },
    leftIcon: {
      control: 'select',
      options: ['email', 'lock', 'account', 'magnify', 'phone', undefined],
      description: 'Left icon name',
    },
    rightIcon: {
      control: 'select',
      options: ['close', 'eye', 'eye-off', 'check', undefined],
      description: 'Right icon name',
    },
  },
  parameters: {
    docs: {
      description: {
        component: `
A feature-rich text input component with label, error handling, icons, and validation states.

## Features
- Floating label
- Error/hint messages
- Left/right icons
- Password visibility toggle
- Focus state styling
- Required field indicator
- Success state

## Usage
\`\`\`tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  keyboardType="email-address"
  error={errors.email?.message}
/>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Default input
export const Default: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
  },
};

// With error
export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    value: 'invalid-email',
    error: 'Please enter a valid email address',
  },
};

// With hint
export const WithHint: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter password',
    secureTextEntry: true,
    hint: 'Must be at least 8 characters',
  },
};

// With icons
export const WithIcons: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search moments...',
    leftIcon: 'magnify',
    rightIcon: 'close',
  },
};

// Password input
export const Password: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    secureTextEntry: true,
    leftIcon: 'lock',
  },
};

// Required field
export const Required: Story = {
  args: {
    label: 'Full Name',
    placeholder: 'Enter your name',
    required: true,
  },
};

// Success state
export const Success: Story = {
  args: {
    label: 'Email',
    value: 'user@example.com',
    showSuccess: true,
  },
};

// All states
export const AllStates: Story = {
  render: () => (
    <View style={styles.container}>
      <Input label="Default" placeholder="Default input" />
      <Input label="With Value" value="John Doe" />
      <Input label="With Error" value="bad" error="This field has an error" />
      <Input
        label="With Hint"
        placeholder="Enter value"
        hint="This is a helpful hint"
      />
      <Input label="Required" placeholder="Required field" required />
      <Input label="Success" value="valid@email.com" showSuccess />
      <Input label="Disabled" value="Cannot edit" editable={false} />
    </View>
  ),
};

// Interactive form example
export const FormExample: Story = {
  render: function FormExample() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateEmail = (value: string) => {
      setEmail(value);
      if (value && !value.includes('@')) {
        setEmailError('Please enter a valid email');
      } else {
        setEmailError('');
      }
    };

    const validatePassword = (value: string) => {
      setPassword(value);
      if (value && value.length < 8) {
        setPasswordError('Password must be at least 8 characters');
      } else {
        setPasswordError('');
      }
    };

    return (
      <View style={styles.container}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={validateEmail}
          error={emailError}
          leftIcon="email"
          keyboardType="email-address"
          autoCapitalize="none"
          required
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={validatePassword}
          error={passwordError}
          hint={
            !passwordError && password.length >= 8
              ? '✓ Strong password'
              : undefined
          }
          leftIcon="lock"
          secureTextEntry
          required
        />
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    width: 300,
  },
});

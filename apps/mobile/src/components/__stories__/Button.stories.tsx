import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Since we don't have a dedicated Button component file, let's create stories for common button patterns
interface ButtonProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
  onPress?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  fullWidth = false,
  loading = false,
}) => {
  const getButtonStyle = () => {
    // Size styles accessed dynamically - explicit mapping for linter
    const sizeStyles = {
      small: styles.small,
      medium: styles.medium,
      large: styles.large,
    };
    const base = [styles.button, sizeStyles[size]];
    if (fullWidth) base.push(styles.fullWidth as any);
    if (disabled) base.push(styles.disabled as any);

    switch (variant) {
      case 'primary':
        return [...base, styles.primary];
      case 'secondary':
        return [...base, styles.secondary];
      case 'outline':
        return [...base, styles.outline];
      case 'text':
        return [...base, styles.text];
      case 'danger':
        return [...base, styles.danger];
      default:
        return [...base, styles.primary];
    }
  };

  const getTextColor = () => {
    if (disabled) return '#999';
    if (variant === 'outline' || variant === 'text') return '#007AFF';
    if (variant === 'danger') return '#fff';
    return '#fff';
  };

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <View style={getButtonStyle()}>
      {loading ? (
        <RNText style={[styles.buttonText, { color: getTextColor() }]}>
          Loading...
        </RNText>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <MaterialCommunityIcons
              name={icon}
              size={iconSize}
              color={getTextColor()}
            />
          )}
          <RNText style={[styles.buttonText, { color: getTextColor() }]}>
            {label}
          </RNText>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={iconSize}
              color={getTextColor()}
            />
          )}
        </>
      )}
    </View>
  );
};

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'text', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

// Variant Stories
export const Primary: Story = {
  args: {
    label: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    label: 'Outline Button',
    variant: 'outline',
  },
};

export const Text: Story = {
  args: {
    label: 'Text Button',
    variant: 'text',
  },
};

export const Danger: Story = {
  args: {
    label: 'Delete',
    variant: 'danger',
  },
};

// Size Stories
export const Small: Story = {
  args: {
    label: 'Small',
    size: 'small',
  },
};

export const Medium: Story = {
  args: {
    label: 'Medium',
    size: 'medium',
  },
};

export const Large: Story = {
  args: {
    label: 'Large',
    size: 'large',
  },
};

// Icon Stories
export const WithLeftIcon: Story = {
  args: {
    label: 'Add Moment',
    icon: 'plus-circle-outline',
    iconPosition: 'left',
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Continue',
    icon: 'arrow-right',
    iconPosition: 'right',
  },
};

export const IconOnly: Story = {
  args: {
    label: '',
    icon: 'heart-outline',
  },
};

// State Stories
export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    label: 'Submit',
    loading: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Button',
    fullWidth: true,
  },
};

// Combined Stories
export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button label="Primary" variant="primary" />
      <Button label="Secondary" variant="secondary" />
      <Button label="Outline" variant="outline" />
      <Button label="Text" variant="text" />
      <Button label="Danger" variant="danger" />
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button label="Small" size="small" />
      <Button label="Medium" size="medium" />
      <Button label="Large" size="large" />
    </View>
  ),
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button label="Normal" />
      <Button label="Disabled" disabled={true} />
      <Button label="Loading" loading={true} />
    </View>
  ),
};

export const CommonActions: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button label="Save Changes" icon="content-save" iconPosition="left" />
      <Button label="Continue" icon="arrow-right" iconPosition="right" />
      <Button label="Add to Favorites" icon="heart-outline" variant="outline" />
      <Button label="Share" icon="share-variant" variant="text" />
      <Button label="Delete" icon="delete-outline" variant="danger" />
      <Button label="" icon="dots-vertical" variant="text" />
    </View>
  ),
};

export const CTAExamples: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Button
        label="Create Moment"
        variant="primary"
        fullWidth
        icon="plus-circle-outline"
      />
      <Button label="Join Request" variant="secondary" fullWidth />
      <Button label="Cancel" variant="outline" fullWidth />
    </View>
  ),
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  fullWidth: {
    width: '100%',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#5856D6',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  text: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

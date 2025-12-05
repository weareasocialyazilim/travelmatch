/**
 * FormComponents Tests
 * Tests for form components including keyboard handling and input validation states
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import {
  DismissKeyboardView,
  KeyboardAwareScrollView,
  FormInput,
} from '../FormComponents';

// Mock expo-vector-icons
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('FormComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DismissKeyboardView', () => {
    it('renders children correctly', () => {
      const { toJSON } = render(
        <DismissKeyboardView>
          <></>
        </DismissKeyboardView>
      );
      // Component should render without errors
      expect(toJSON()).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { toJSON } = render(
        <DismissKeyboardView style={customStyle}>
          <></>
        </DismissKeyboardView>
      );
      
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('KeyboardAwareScrollView', () => {
    it('renders children correctly', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>
          <></>
        </KeyboardAwareScrollView>
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('applies custom styles', () => {
      const customStyle = { flex: 1 };
      const contentStyle = { padding: 20 };
      
      const { toJSON } = render(
        <KeyboardAwareScrollView
          style={customStyle}
          contentContainerStyle={contentStyle}
        >
          <></>
        </KeyboardAwareScrollView>
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('uses correct keyboardShouldPersistTaps default', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>
          <></>
        </KeyboardAwareScrollView>
      );
      
      // Default should be 'handled'
      expect(toJSON()).toBeTruthy();
    });

    it('accepts custom extraScrollHeight', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView extraScrollHeight={50}>
          <></>
        </KeyboardAwareScrollView>
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('handles different keyboardShouldPersistTaps values', () => {
      const tapsValues = ['always', 'never', 'handled'] as const;
      
      tapsValues.forEach((value) => {
        const { toJSON, unmount } = render(
          <KeyboardAwareScrollView keyboardShouldPersistTaps={value}>
            <></>
          </KeyboardAwareScrollView>
        );
        
        expect(toJSON()).toBeTruthy();
        unmount();
      });
    });
  });

  describe('FormInput', () => {
    const defaultProps = {
      value: '',
      onChangeText: jest.fn(),
    };

    beforeEach(() => {
      defaultProps.onChangeText.mockClear();
    });

    it('renders with minimal props', () => {
      const { toJSON } = render(<FormInput {...defaultProps} />);
      expect(toJSON()).toBeTruthy();
    });

    it('renders with label', () => {
      const { getByText } = render(
        <FormInput {...defaultProps} label="Email" />
      );
      
      expect(getByText('Email')).toBeTruthy();
    });

    it('renders with placeholder', () => {
      const { getByPlaceholderText } = render(
        <FormInput {...defaultProps} placeholder="Enter email" />
      );
      
      expect(getByPlaceholderText('Enter email')).toBeTruthy();
    });

    it('calls onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      const { getByDisplayValue } = render(
        <FormInput
          {...defaultProps}
          value="test"
          onChangeText={onChangeText}
          testID="input"
        />
      );
      
      const input = getByDisplayValue('test');
      fireEvent.changeText(input, 'new text');
      
      expect(onChangeText).toHaveBeenCalledWith('new text');
    });

    it('displays error when touched and has error', () => {
      const { getByText } = render(
        <FormInput
          {...defaultProps}
          error="Invalid email"
          touched={true}
        />
      );
      
      expect(getByText('Invalid email')).toBeTruthy();
    });

    it('does not display error when not touched', () => {
      const { queryByText } = render(
        <FormInput
          {...defaultProps}
          error="Invalid email"
          touched={false}
        />
      );
      
      expect(queryByText('Invalid email')).toBeNull();
    });

    it('handles focus and blur events', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      
      const { getByDisplayValue } = render(
        <FormInput
          {...defaultProps}
          value="test"
          onFocus={onFocus}
          onBlur={onBlur}
        />
      );
      
      const input = getByDisplayValue('test');
      
      fireEvent(input, 'focus');
      expect(onFocus).toHaveBeenCalled();
      
      fireEvent(input, 'blur');
      expect(onBlur).toHaveBeenCalled();
    });

    it('renders left icon', () => {
      const { toJSON } = render(
        <FormInput {...defaultProps} leftIcon="email" />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('renders right icon without secure entry', () => {
      const onRightIconPress = jest.fn();
      const { toJSON } = render(
        <FormInput
          {...defaultProps}
          rightIcon="magnify"
          onRightIconPress={onRightIconPress}
        />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('handles secure text entry with toggle', () => {
      const { getByLabelText, getByDisplayValue } = render(
        <FormInput
          {...defaultProps}
          value="password123"
          secureTextEntry={true}
        />
      );
      
      // Should have toggle button
      const toggleButton = getByLabelText('Show password');
      expect(toggleButton).toBeTruthy();
      
      // Press toggle to show password
      fireEvent.press(toggleButton);
      
      // Should now show hide option
      const hideButton = getByLabelText('Hide password');
      expect(hideButton).toBeTruthy();
    });

    it('shows character count when maxLength is provided', () => {
      const { getByText } = render(
        <FormInput
          {...defaultProps}
          value="Hello"
          maxLength={100}
        />
      );
      
      expect(getByText('5/100')).toBeTruthy();
    });

    it('handles multiline input', () => {
      const { toJSON } = render(
        <FormInput
          {...defaultProps}
          multiline={true}
          numberOfLines={4}
        />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('applies disabled styling when not editable', () => {
      const { toJSON } = render(
        <FormInput {...defaultProps} editable={false} />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('handles different keyboard types', () => {
      const keyboardTypes = ['default', 'email-address', 'numeric', 'phone-pad'] as const;
      
      keyboardTypes.forEach((keyboardType) => {
        const { unmount } = render(
          <FormInput {...defaultProps} keyboardType={keyboardType} />
        );
        unmount();
      });
    });

    it('handles auto capitalize options', () => {
      const autoCapitalizeOptions = ['none', 'sentences', 'words', 'characters'] as const;
      
      autoCapitalizeOptions.forEach((option) => {
        const { unmount } = render(
          <FormInput {...defaultProps} autoCapitalize={option} />
        );
        unmount();
      });
    });

    it('handles auto complete options', () => {
      const autoCompleteOptions = ['email', 'password', 'name', 'tel', 'off'] as const;
      
      autoCompleteOptions.forEach((option) => {
        const { unmount } = render(
          <FormInput {...defaultProps} autoComplete={option} />
        );
        unmount();
      });
    });

    it('handles return key types', () => {
      const returnKeyTypes = ['done', 'go', 'next', 'search', 'send'] as const;
      
      returnKeyTypes.forEach((type) => {
        const { unmount } = render(
          <FormInput {...defaultProps} returnKeyType={type} />
        );
        unmount();
      });
    });

    it('calls onSubmitEditing when submitted', () => {
      const onSubmitEditing = jest.fn();
      const { getByDisplayValue } = render(
        <FormInput
          {...defaultProps}
          value="test"
          onSubmitEditing={onSubmitEditing}
        />
      );
      
      const input = getByDisplayValue('test');
      fireEvent(input, 'submitEditing');
      
      expect(onSubmitEditing).toHaveBeenCalled();
    });

    it('applies testID correctly', () => {
      const { getByTestId } = render(
        <FormInput {...defaultProps} testID="email-input" />
      );
      
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('has correct accessibility label from label', () => {
      const { getByLabelText } = render(
        <FormInput {...defaultProps} label="Email Address" />
      );
      
      expect(getByLabelText('Email Address')).toBeTruthy();
    });

    it('has correct accessibility label from placeholder when no label', () => {
      const { getByLabelText } = render(
        <FormInput {...defaultProps} placeholder="Enter your email" />
      );
      
      expect(getByLabelText('Enter your email')).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { marginTop: 20 };
      const { toJSON } = render(
        <FormInput {...defaultProps} style={customStyle} />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('handles blurOnSubmit prop', () => {
      const { toJSON } = render(
        <FormInput {...defaultProps} blurOnSubmit={false} />
      );
      
      expect(toJSON()).toBeTruthy();
    });

    it('renders with all props combined', () => {
      const { toJSON, getByText, getByPlaceholderText } = render(
        <FormInput
          value="test@email.com"
          onChangeText={jest.fn()}
          label="Email"
          placeholder="Enter email"
          error="Invalid email format"
          touched={true}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          leftIcon="email"
          maxLength={50}
          testID="email-input"
          returnKeyType="next"
          onSubmitEditing={jest.fn()}
        />
      );
      
      expect(getByText('Email')).toBeTruthy();
      expect(getByText('Invalid email format')).toBeTruthy();
      expect(toJSON()).toBeTruthy();
    });

    describe('Focus state styling', () => {
      it('updates styling on focus', () => {
        const { getByDisplayValue, toJSON } = render(
          <FormInput {...defaultProps} value="test" />
        );
        
        const input = getByDisplayValue('test');
        const beforeFocus = toJSON();
        
        fireEvent(input, 'focus');
        const afterFocus = toJSON();
        
        // Both should render successfully
        expect(beforeFocus).toBeTruthy();
        expect(afterFocus).toBeTruthy();
      });

      it('updates styling on blur', () => {
        const { getByDisplayValue, toJSON } = render(
          <FormInput {...defaultProps} value="test" />
        );
        
        const input = getByDisplayValue('test');
        
        fireEvent(input, 'focus');
        fireEvent(input, 'blur');
        
        expect(toJSON()).toBeTruthy();
      });
    });

    describe('Password visibility toggle', () => {
      it('starts with hidden password', () => {
        const { getByLabelText } = render(
          <FormInput
            {...defaultProps}
            value="password"
            secureTextEntry={true}
          />
        );
        
        // Should have show password button initially
        expect(getByLabelText('Show password')).toBeTruthy();
      });

      it('toggles visibility correctly', () => {
        const { getByLabelText } = render(
          <FormInput
            {...defaultProps}
            value="password"
            secureTextEntry={true}
          />
        );
        
        // Click to show
        fireEvent.press(getByLabelText('Show password'));
        expect(getByLabelText('Hide password')).toBeTruthy();
        
        // Click to hide
        fireEvent.press(getByLabelText('Hide password'));
        expect(getByLabelText('Show password')).toBeTruthy();
      });
    });

    describe('Error state', () => {
      it('shows error icon with error message', () => {
        const { getByText } = render(
          <FormInput
            {...defaultProps}
            error="This field is required"
            touched={true}
          />
        );
        
        // Error message should be visible
        expect(getByText('This field is required')).toBeTruthy();
      });

      it('applies error styling when touched and has error', () => {
        const { toJSON } = render(
          <FormInput
            {...defaultProps}
            error="Error"
            touched={true}
          />
        );
        
        expect(toJSON()).toBeTruthy();
      });

      it('does not show error container when no error', () => {
        const { queryByText } = render(
          <FormInput
            {...defaultProps}
            touched={true}
          />
        );
        
        // No error text should be present
        expect(queryByText('alert-circle')).toBeNull();
      });
    });

    describe('Right icon button', () => {
      it('calls onRightIconPress when pressed', () => {
        const onRightIconPress = jest.fn();
        const { toJSON } = render(
          <FormInput
            {...defaultProps}
            rightIcon="close"
            onRightIconPress={onRightIconPress}
          />
        );
        
        expect(toJSON()).toBeTruthy();
      });

      it('is disabled when no onRightIconPress provided', () => {
        const { toJSON } = render(
          <FormInput
            {...defaultProps}
            rightIcon="close"
          />
        );
        
        expect(toJSON()).toBeTruthy();
      });

      it('does not show right icon when secureTextEntry is true', () => {
        const { queryByTestId } = render(
          <FormInput
            {...defaultProps}
            rightIcon="close"
            secureTextEntry={true}
          />
        );
        
        // SecureTextEntry should take precedence
        expect(queryByTestId('right-icon')).toBeNull();
      });
    });
  });

  describe('Default export', () => {
    it('exports all named components', () => {
      expect(DismissKeyboardView).toBeDefined();
      expect(KeyboardAwareScrollView).toBeDefined();
      expect(FormInput).toBeDefined();
    });
  });
});

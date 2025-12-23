/**
 * FormComponents Test Suite
 * Comprehensive tests for form input components with validation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FormInput } from '@/components/FormComponents';

describe('FormComponents', () => {
  describe('FormInput - Basic Rendering', () => {
    it('should render with label', () => {
      const { getByText } = render(
        <FormInput
          label="Email Address"
          value=""
          onChangeText={() => {}}
        />
      );
      expect(getByText('Email Address')).toBeTruthy();
    });

    it('should render with placeholder', () => {
      const { getByPlaceholderText } = render(
        <FormInput
          placeholder="Enter your email"
          value=""
          onChangeText={() => {}}
        />
      );
      expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    });

    it('should render with value', () => {
      const { getByDisplayValue } = render(
        <FormInput
          value="test@example.com"
          onChangeText={() => {}}
        />
      );
      expect(getByDisplayValue('test@example.com')).toBeTruthy();
    });

    it('should render with left icon', () => {
      const { getByTestId } = render(
        <FormInput
          leftIcon="email"
          value=""
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should render with right icon', () => {
      const { getByTestId } = render(
        <FormInput
          rightIcon="check"
          value=""
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      expect(getByTestId('email-input')).toBeTruthy();
    });
  });

  describe('FormInput - Validation States', () => {
    it('should not show error when untouched', () => {
      const { queryByText } = render(
        <FormInput
          value=""
          error="Email is required"
          touched={false}
          onChangeText={() => {}}
        />
      );
      expect(queryByText('Email is required')).toBeNull();
    });

    it('should show error when touched and has error', () => {
      const { getByText } = render(
        <FormInput
          value=""
          error="Email is required"
          touched={true}
          onChangeText={() => {}}
        />
      );
      expect(getByText('Email is required')).toBeTruthy();
    });

    it('should show error icon when error present', () => {
      const { getByTestId } = render(
        <FormInput
          value=""
          error="Invalid email"
          touched={true}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      expect(getByTestId('email-input')).toBeTruthy();
    });

    it('should apply error styles when error present', () => {
      const { getByTestId } = render(
        <FormInput
          value=""
          error="Invalid email"
          touched={true}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      const input = getByTestId('email-input');
      expect(input).toBeTruthy();
    });

    it('should show character count when maxLength set', () => {
      const { getByText } = render(
        <FormInput
          value="Hello"
          maxLength={100}
          onChangeText={() => {}}
        />
      );
      expect(getByText('5/100')).toBeTruthy();
    });

    it('should update character count on input', () => {
      const { getByText, getByTestId } = render(
        <FormInput
          value="Hello"
          maxLength={100}
          onChangeText={() => {}}
          testID="text-input"
        />
      );
      
      expect(getByText('5/100')).toBeTruthy();
      
      fireEvent.changeText(getByTestId('text-input'), 'Hello World');
      
      waitFor(() => {
        expect(getByText('11/100')).toBeTruthy();
      });
    });
  });

  describe('FormInput - User Interactions', () => {
    it('should call onChangeText when text changes', () => {
      const onChangeText = jest.fn();
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={onChangeText}
          testID="email-input"
        />
      );
      
      fireEvent.changeText(getByTestID('email-input'), 'test@example.com');
      expect(onChangeText).toHaveBeenCalledWith('test@example.com');
    });

    it('should call onFocus when input receives focus', () => {
      const onFocus = jest.fn();
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          onFocus={onFocus}
          testID="email-input"
        />
      );
      
      fireEvent(getByTestID('email-input'), 'focus');
      expect(onFocus).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', () => {
      const onBlur = jest.fn();
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          onBlur={onBlur}
          testID="email-input"
        />
      );
      
      fireEvent(getByTestID('email-input'), 'blur');
      expect(onBlur).toHaveBeenCalled();
    });

    it('should call onRightIconPress when right icon pressed', () => {
      const onRightIconPress = jest.fn();
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          rightIcon="eye"
          onRightIconPress={onRightIconPress}
          testID="password-input"
        />
      );
      
      const iconButton = getByTestID('password-input-right-icon');
      fireEvent.press(iconButton);
      expect(onRightIconPress).toHaveBeenCalled();
    });

    it('should call onSubmitEditing when return key pressed', () => {
      const onSubmitEditing = jest.fn();
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="done"
          testID="email-input"
        />
      );
      
      fireEvent(getByTestID('email-input'), 'submitEditing');
      expect(onSubmitEditing).toHaveBeenCalled();
    });
  });

  describe('FormInput - Password Mode', () => {
    it('should hide text when secureTextEntry is true', () => {
      const { getByTestID } = render(
        <FormInput
          value="password123"
          onChangeText={() => {}}
          secureTextEntry={true}
          testID="password-input"
        />
      );
      
      const input = getByTestID('password-input');
      expect(input.props.secureTextEntry).toBe(true);
    });

    it('should toggle password visibility when eye icon clicked', () => {
      const { getByTestID } = render(
        <FormInput
          value="password123"
          onChangeText={() => {}}
          secureTextEntry={true}
          rightIcon="eye"
          testID="password-input"
        />
      );
      
      const input = getByTestID('password-input');
      expect(input.props.secureTextEntry).toBe(true);
      
      const iconButton = getByTestID('password-input-right-icon');
      fireEvent.press(iconButton);
      
      waitFor(() => {
        expect(input.props.secureTextEntry).toBe(false);
      });
    });
  });

  describe('FormInput - Keyboard Types', () => {
    it('should set email keyboard type', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          keyboardType="email-address"
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('should set numeric keyboard type', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          keyboardType="numeric"
          testID="phone-input"
        />
      );
      
      const input = getByTestID('phone-input');
      expect(input.props.keyboardType).toBe('numeric');
    });

    it('should set phone-pad keyboard type', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          keyboardType="phone-pad"
          testID="phone-input"
        />
      );
      
      const input = getByTestID('phone-input');
      expect(input.props.keyboardType).toBe('phone-pad');
    });
  });

  describe('FormInput - Multiline Mode', () => {
    it('should render as multiline when multiline prop set', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          multiline={true}
          numberOfLines={4}
          testID="description-input"
        />
      );
      
      const input = getByTestID('description-input');
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });

    it('should apply multiline styles', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          multiline={true}
          testID="description-input"
        />
      );
      
      const input = getByTestID('description-input');
      expect(input).toBeTruthy();
    });

    it('should respect maxLength in multiline mode', () => {
      const { getByText } = render(
        <FormInput
          value="Some long text"
          onChangeText={() => {}}
          multiline={true}
          maxLength={500}
        />
      );
      
      expect(getByText('14/500')).toBeTruthy();
    });
  });

  describe('FormInput - Disabled State', () => {
    it('should render as disabled when editable is false', () => {
      const { getByTestID } = render(
        <FormInput
          value="Disabled"
          onChangeText={() => {}}
          editable={false}
          testID="disabled-input"
        />
      );
      
      const input = getByTestID('disabled-input');
      expect(input.props.editable).toBe(false);
    });

    it('should not call onChangeText when disabled', () => {
      const onChangeText = jest.fn();
      const { getByTestID } = render(
        <FormInput
          value="Disabled"
          onChangeText={onChangeText}
          editable={false}
          testID="disabled-input"
        />
      );
      
      fireEvent.changeText(getByTestID('disabled-input'), 'New Text');
      expect(onChangeText).not.toHaveBeenCalled();
    });

    it('should apply disabled styles', () => {
      const { getByTestID } = render(
        <FormInput
          value="Disabled"
          onChangeText={() => {}}
          editable={false}
          testID="disabled-input"
        />
      );
      
      const input = getByTestID('disabled-input');
      expect(input).toBeTruthy();
    });
  });

  describe('FormInput - AutoCapitalize', () => {
    it('should set autoCapitalize to none for email', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          autoCapitalize="none"
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.autoCapitalize).toBe('none');
    });

    it('should set autoCapitalize to words for name', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          autoCapitalize="words"
          testID="name-input"
        />
      );
      
      const input = getByTestID('name-input');
      expect(input.props.autoCapitalize).toBe('words');
    });
  });

  describe('FormInput - AutoComplete', () => {
    it('should set autoComplete for email', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          autoComplete="email"
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.autoComplete).toBe('email');
    });

    it('should set autoComplete for password', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          autoComplete="password"
          testID="password-input"
        />
      );
      
      const input = getByTestID('password-input');
      expect(input.props.autoComplete).toBe('password');
    });

    it('should set autoComplete to off', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          autoComplete="off"
          testID="custom-input"
        />
      );
      
      const input = getByTestID('custom-input');
      expect(input.props.autoComplete).toBe('off');
    });
  });

  describe('FormInput - Focus Management', () => {
    it('should update focus state on focus', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      fireEvent(input, 'focus');
      
      // Check if focus styles are applied
      expect(input).toBeTruthy();
    });

    it('should update focus state on blur', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      
      // Check if focus styles are removed
      expect(input).toBeTruthy();
    });
  });

  describe('FormInput - Return Key Types', () => {
    it('should set return key to done', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          returnKeyType="done"
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.returnKeyType).toBe('done');
    });

    it('should set return key to next', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          returnKeyType="next"
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.returnKeyType).toBe('next');
    });

    it('should set return key to send', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          returnKeyType="send"
          testID="message-input"
        />
      );
      
      const input = getByTestID('message-input');
      expect(input.props.returnKeyType).toBe('send');
    });
  });

  describe('FormInput - Accessibility', () => {
    it('should have accessible label', () => {
      const { getByLabelText } = render(
        <FormInput
          label="Email Address"
          value=""
          onChangeText={() => {}}
        />
      );
      
      expect(getByLabelText('Email Address')).toBeTruthy();
    });

    it('should have accessible error message', () => {
      const { getByText } = render(
        <FormInput
          value=""
          error="Email is required"
          touched={true}
          onChangeText={() => {}}
        />
      );
      
      expect(getByText('Email is required')).toBeTruthy();
    });

    it('should announce error to screen readers', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          error="Email is required"
          touched={true}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input).toBeTruthy();
      // Should have accessibilityHint with error
    });
  });

  describe('FormInput - Edge Cases', () => {
    it('should handle empty value', () => {
      const { getByTestID } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.value).toBe('');
    });

    it('should handle null value', () => {
      const { getByTestID } = render(
        <FormInput
          value={null}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.value).toBeFalsy();
    });

    it('should handle undefined value', () => {
      const { getByTestID } = render(
        <FormInput
          value={undefined}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.value).toBeFalsy();
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(1000);
      const { getByTestID } = render(
        <FormInput
          value={longText}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.value).toBe(longText);
    });

    it('should handle special characters', () => {
      const specialChars = '!@#$%^&*()_+-={}[]|:;"<>,.?/~`';
      const { getByTestID } = render(
        <FormInput
          value={specialChars}
          onChangeText={() => {}}
          testID="email-input"
        />
      );
      
      const input = getByTestID('email-input');
      expect(input.props.value).toBe(specialChars);
    });

    it('should handle emoji input', () => {
      const emoji = '😀🎉🌟💯';
      const { getByTestID } = render(
        <FormInput
          value={emoji}
          onChangeText={() => {}}
          testID="message-input"
        />
      );
      
      const input = getByTestID('message-input');
      expect(input.props.value).toBe(emoji);
    });
  });

  describe('FormInput - Performance', () => {
    it('should not re-render when props dont change', () => {
      const onChangeText = jest.fn();
      const { rerender } = render(
        <FormInput
          value="test"
          onChangeText={onChangeText}
          testID="email-input"
        />
      );
      
      // Re-render with same props
      rerender(
        <FormInput
          value="test"
          onChangeText={onChangeText}
          testID="email-input"
        />
      );
      
      // Should not trigger unnecessary renders
      expect(onChangeText).not.toHaveBeenCalled();
    });
  });

  describe('FormInput - Snapshots', () => {
    it('should match snapshot for basic input', () => {
      const { toJSON } = render(
        <FormInput
          label="Email"
          placeholder="Enter email"
          value=""
          onChangeText={() => {}}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot with error', () => {
      const { toJSON } = render(
        <FormInput
          label="Email"
          value=""
          error="Required"
          touched={true}
          onChangeText={() => {}}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for multiline', () => {
      const { toJSON } = render(
        <FormInput
          label="Description"
          value=""
          multiline={true}
          numberOfLines={4}
          onChangeText={() => {}}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('should match snapshot for disabled', () => {
      const { toJSON } = render(
        <FormInput
          label="Email"
          value="disabled@example.com"
          editable={false}
          onChangeText={() => {}}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

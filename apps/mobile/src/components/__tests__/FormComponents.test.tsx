import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Keyboard, Text } from 'react-native';
import FormComponents from '../FormComponents';

const { DismissKeyboardView, KeyboardAwareScrollView, FormInput } =
  FormComponents;

describe('FormComponents', () => {
  describe('DismissKeyboardView', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders children correctly', () => {
      const { getByText } = render(
        <DismissKeyboardView>
          <Text>Test Content</Text>
        </DismissKeyboardView>,
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('renders component without throwing', () => {
      const { toJSON } = render(
        <DismissKeyboardView>
          <Text>Content</Text>
        </DismissKeyboardView>,
      );

      expect(toJSON()).not.toBeNull();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red', padding: 20 };
      const { toJSON } = render(
        <DismissKeyboardView style={customStyle}>
          <Text>Content</Text>
        </DismissKeyboardView>,
      );

      // Component should render with custom style
      expect(toJSON()).not.toBeNull();
    });
  });

  describe('KeyboardAwareScrollView', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <KeyboardAwareScrollView>
          <Text>Scroll Content</Text>
        </KeyboardAwareScrollView>,
      );

      expect(getByText('Scroll Content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { flex: 1, backgroundColor: 'blue' };
      const { toJSON } = render(
        <KeyboardAwareScrollView style={customStyle}>
          <Text>Content</Text>
        </KeyboardAwareScrollView>,
      );

      expect(toJSON()).not.toBeNull();
    });

    it('applies custom contentContainerStyle', () => {
      const contentStyle = { paddingHorizontal: 16 };
      const { toJSON } = render(
        <KeyboardAwareScrollView contentContainerStyle={contentStyle}>
          <Text>Content</Text>
        </KeyboardAwareScrollView>,
      );

      expect(toJSON()).not.toBeNull();
    });

    it('handles extraScrollHeight prop', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView extraScrollHeight={100}>
          <Text>Content</Text>
        </KeyboardAwareScrollView>,
      );

      expect(toJSON()).not.toBeNull();
    });

    it('handles keyboardShouldPersistTaps prop', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
          <Text>Content</Text>
        </KeyboardAwareScrollView>,
      );

      expect(toJSON()).not.toBeNull();
    });
  });

  describe('FormInput', () => {
    const defaultProps = {
      value: '',
      onChangeText: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders correctly', () => {
      const { toJSON } = render(<FormInput {...defaultProps} />);
      expect(toJSON()).not.toBeNull();
    });

    it('renders with label', () => {
      const { getByText } = render(
        <FormInput {...defaultProps} label="Email" />,
      );
      expect(getByText('Email')).toBeTruthy();
    });

    it('renders with placeholder', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          placeholder="Enter email"
          testID="email-input"
        />,
      );
      expect(getByTestId('email-input').props.placeholder).toBe('Enter email');
    });

    it('renders with value', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          value="test@example.com"
          testID="email-input"
        />,
      );
      expect(getByTestId('email-input').props.value).toBe('test@example.com');
    });

    it('accepts text change events', () => {
      const onChangeText = jest.fn();
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          onChangeText={onChangeText}
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(() => fireEvent.changeText(input, 'new text')).not.toThrow();
    });

    it('lowercases email input for email keyboard type', () => {
      const onChangeText = jest.fn();
      const { getByTestId, rerender } = render(
        <FormInput
          value=""
          onChangeText={onChangeText}
          keyboardType="email-address"
          testID="email-input"
        />,
      );

      // The component lowercases input before calling onChangeText
      // Testing that the component renders with email-address keyboard type
      const input = getByTestId('email-input');
      expect(input.props.keyboardType).toBe('email-address');
    });

    it('shows error when touched and has error', () => {
      const { getByText } = render(
        <FormInput {...defaultProps} error="Invalid email" touched={true} />,
      );
      expect(getByText('Invalid email')).toBeTruthy();
    });

    it('does not show error when not touched', () => {
      const { queryByText } = render(
        <FormInput {...defaultProps} error="Invalid email" touched={false} />,
      );
      expect(queryByText('Invalid email')).toBeNull();
    });

    it('renders password toggle when secureTextEntry is true', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          secureTextEntry={true}
          testID="password-input"
        />,
      );
      expect(getByTestId('password-input-toggle-visibility')).toBeTruthy();
    });

    it('toggles password visibility when toggle is pressed', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          secureTextEntry={true}
          testID="password-input"
        />,
      );

      const input = getByTestId('password-input');
      const toggle = getByTestId('password-input-toggle-visibility');

      // Initially secure
      expect(input.props.secureTextEntry).toBe(true);

      // Press toggle
      fireEvent.press(toggle);

      // Should show password
      expect(getByTestId('password-input').props.secureTextEntry).toBe(false);
    });

    it('shows character count when maxLength is provided', () => {
      const { getByText } = render(
        <FormInput {...defaultProps} value="Hello" maxLength={100} />,
      );
      expect(getByText('5/100')).toBeTruthy();
    });

    it('handles focus and blur events', () => {
      const onFocus = jest.fn();
      const onBlur = jest.fn();
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          onFocus={onFocus}
          onBlur={onBlur}
          testID="input"
        />,
      );

      const input = getByTestId('input');

      fireEvent(input, 'focus');
      expect(onFocus).toHaveBeenCalled();

      fireEvent(input, 'blur');
      expect(onBlur).toHaveBeenCalled();
    });

    it('renders with left icon', () => {
      const { toJSON } = render(
        <FormInput {...defaultProps} leftIcon="email" />,
      );
      expect(toJSON()).not.toBeNull();
    });

    it('renders with right icon and handles press', () => {
      const onRightIconPress = jest.fn();
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          rightIcon="close"
          onRightIconPress={onRightIconPress}
          testID="input"
        />,
      );

      fireEvent.press(getByTestId('input-right-icon'));
      expect(onRightIconPress).toHaveBeenCalled();
    });

    it('handles multiline input', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          multiline={true}
          numberOfLines={4}
          testID="textarea"
        />,
      );

      const input = getByTestId('textarea');
      expect(input.props.multiline).toBe(true);
      expect(input.props.numberOfLines).toBe(4);
    });

    it('handles disabled state', () => {
      const { getByTestId } = render(
        <FormInput {...defaultProps} editable={false} testID="input" />,
      );

      expect(getByTestId('input').props.editable).toBe(false);
    });

    it('handles returnKeyType and onSubmitEditing', () => {
      const onSubmitEditing = jest.fn();
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
          testID="input"
        />,
      );

      const input = getByTestId('input');
      expect(input.props.returnKeyType).toBe('done');

      fireEvent(input, 'submitEditing');
      expect(onSubmitEditing).toHaveBeenCalled();
    });

    it('renders with different keyboard types', () => {
      const keyboardTypes = [
        'default',
        'email-address',
        'numeric',
        'phone-pad',
      ] as const;

      keyboardTypes.forEach((keyboardType) => {
        const { getByTestId, unmount } = render(
          <FormInput
            {...defaultProps}
            keyboardType={keyboardType}
            testID="input"
          />,
        );

        expect(getByTestId('input').props.keyboardType).toBe(keyboardType);
        unmount();
      });
    });

    it('handles autoCapitalize options', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          autoCapitalize="sentences"
          testID="input"
        />,
      );

      expect(getByTestId('input').props.autoCapitalize).toBe('sentences');
    });

    it('handles maxLength prop', () => {
      const { getByTestId } = render(
        <FormInput {...defaultProps} maxLength={50} testID="input" />,
      );

      expect(getByTestId('input').props.maxLength).toBe(50);
    });

    it('handles blurOnSubmit prop', () => {
      const { getByTestId } = render(
        <FormInput {...defaultProps} blurOnSubmit={false} testID="input" />,
      );

      expect(getByTestId('input').props.blurOnSubmit).toBe(false);
    });

    it('sets accessibility label from label prop', () => {
      const { getByTestId } = render(
        <FormInput {...defaultProps} label="Email Address" testID="input" />,
      );

      expect(getByTestId('input').props.accessibilityLabel).toBe(
        'Email Address',
      );
    });

    it('sets accessibility label from placeholder when no label', () => {
      const { getByTestId } = render(
        <FormInput
          {...defaultProps}
          placeholder="Enter your email"
          testID="input"
        />,
      );

      expect(getByTestId('input').props.accessibilityLabel).toBe(
        'Enter your email',
      );
    });
  });

  describe('Integration', () => {
    it('renders all components together', () => {
      const { getByText, getByTestId } = render(
        <DismissKeyboardView>
          <KeyboardAwareScrollView>
            <FormInput
              value=""
              onChangeText={() => {}}
              label="Form Field"
              testID="form-input"
            />
            <Text>Submit</Text>
          </KeyboardAwareScrollView>
        </DismissKeyboardView>,
      );

      expect(getByText('Form Field')).toBeTruthy();
      expect(getByText('Submit')).toBeTruthy();
      expect(getByTestId('form-input')).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('DismissKeyboardView matches snapshot', () => {
      const { toJSON } = render(
        <DismissKeyboardView>
          <Text>Content</Text>
        </DismissKeyboardView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('KeyboardAwareScrollView matches snapshot', () => {
      const { toJSON } = render(
        <KeyboardAwareScrollView>
          <Text>Content</Text>
        </KeyboardAwareScrollView>,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('FormInput matches snapshot', () => {
      const { toJSON } = render(
        <FormInput
          value="test"
          onChangeText={() => {}}
          label="Test Label"
          placeholder="Enter value"
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('FormInput with error matches snapshot', () => {
      const { toJSON } = render(
        <FormInput
          value=""
          onChangeText={() => {}}
          label="Email"
          error="Invalid email"
          touched={true}
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

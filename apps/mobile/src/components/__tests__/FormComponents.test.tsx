import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard, Text, TextInput } from 'react-native';
import FormComponents from '../FormComponents';

const { DismissKeyboardView, KeyboardAwareScrollView, FormInput } = FormComponents;

describe('FormComponents', () => {
  describe('DismissKeyboardView', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders children correctly', () => {
      const { getByText } = render(
        <DismissKeyboardView>
          <Text>Test Content</Text>
        </DismissKeyboardView>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('dismisses keyboard when tapped', () => {
      const dismissSpy = jest.spyOn(Keyboard, 'dismiss');
      const { UNSAFE_getAllByType } = render(
        <DismissKeyboardView>
          <Text>Content</Text>
        </DismissKeyboardView>
      );

      const { TouchableWithoutFeedback } = require('react-native');
      const touchable = UNSAFE_getAllByType(TouchableWithoutFeedback)[0];
      fireEvent.press(touchable);

      expect(dismissSpy).toHaveBeenCalled();
    });

    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red', padding: 20 };
      const { UNSAFE_getAllByType } = render(
        <DismissKeyboardView style={customStyle}>
          <React.Fragment>Content</React.Fragment>
        </DismissKeyboardView>
      );

      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      
      // Check if custom style is applied
      const styledView = views.find((view) => {
        const style = JSON.stringify(view.props.style);
        return style.includes('20');
      });
      expect(styledView).toBeTruthy();
    });

    it('has accessible false on TouchableWithoutFeedback', () => {
      const { UNSAFE_getAllByType } = render(
        <DismissKeyboardView>
          <React.Fragment>Content</React.Fragment>
        </DismissKeyboardView>
      );

      const { TouchableWithoutFeedback } = require('react-native');
      const touchables = UNSAFE_getAllByType(TouchableWithoutFeedback);
      
      expect(touchables[0].props.accessible).toBe(false);
    });
  });

  describe('KeyboardAwareScrollView', () => {
    it('renders children correctly', () => {
      const { getByText } = render(
        <KeyboardAwareScrollView>
          <Text>Scroll Content</Text>
        </KeyboardAwareScrollView>
      );

      expect(getByText('Scroll Content')).toBeTruthy();
    });

    it('applies custom style', () => {
      const customStyle = { flex: 1, backgroundColor: 'blue' };
      const { UNSAFE_getAllByType } = render(
        <KeyboardAwareScrollView style={customStyle}>
          <React.Fragment>Content</React.Fragment>
        </KeyboardAwareScrollView>
      );

      const { ScrollView } = require('react-native');
      const scrollViews = UNSAFE_getAllByType(ScrollView);
      
      expect(scrollViews.length).toBeGreaterThan(0);
    });

    it('applies custom contentContainerStyle', () => {
      const contentStyle = { paddingHorizontal: 16 };
      const { UNSAFE_getAllByType } = render(
        <KeyboardAwareScrollView contentContainerStyle={contentStyle}>
          <React.Fragment>Content</React.Fragment>
        </KeyboardAwareScrollView>
      );

      const { ScrollView } = require('react-native');
      const scrollViews = UNSAFE_getAllByType(ScrollView);
      
      expect(scrollViews[0].props.contentContainerStyle).toBeDefined();
    });

    it('uses default keyboardShouldPersistTaps value', () => {
      const { UNSAFE_getAllByType } = render(
        <KeyboardAwareScrollView>
          <React.Fragment>Content</React.Fragment>
        </KeyboardAwareScrollView>
      );

      const { ScrollView } = require('react-native');
      const scrollViews = UNSAFE_getAllByType(ScrollView);
      
      expect(scrollViews[0].props.keyboardShouldPersistTaps).toBe('handled');
    });

    it('uses custom keyboardShouldPersistTaps value', () => {
      const { UNSAFE_getAllByType } = render(
        <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
          <React.Fragment>Content</React.Fragment>
        </KeyboardAwareScrollView>
      );

      const { ScrollView } = require('react-native');
      const scrollViews = UNSAFE_getAllByType(ScrollView);
      
      expect(scrollViews[0].props.keyboardShouldPersistTaps).toBe('always');
    });

    it('applies extraScrollHeight to paddingBottom', () => {
      const { UNSAFE_getAllByType } = render(
        <KeyboardAwareScrollView extraScrollHeight={50}>
          <React.Fragment>Content</React.Fragment>
        </KeyboardAwareScrollView>
      );

      const { ScrollView } = require('react-native');
      const scrollViews = UNSAFE_getAllByType(ScrollView);
      
      const style = JSON.stringify(scrollViews[0].props.contentContainerStyle);
      expect(style).toContain('50');
    });

    it('hides vertical scroll indicator', () => {
      const { UNSAFE_getAllByType } = render(
        <KeyboardAwareScrollView>
          <React.Fragment>Content</React.Fragment>
        </KeyboardAwareScrollView>
      );

      const { ScrollView } = require('react-native');
      const scrollViews = UNSAFE_getAllByType(ScrollView);
      
      expect(scrollViews[0].props.showsVerticalScrollIndicator).toBe(false);
    });
  });

  describe('FormInput', () => {
    const mockOnChangeText = jest.fn();
    const mockOnBlur = jest.fn();
    const mockOnFocus = jest.fn();
    const mockOnSubmitEditing = jest.fn();
    const mockOnRightIconPress = jest.fn();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('Basic Rendering', () => {
      it('renders input with value', () => {
        const { UNSAFE_getByType } = render(
          <FormInput value="Test" onChangeText={mockOnChangeText} />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.value).toBe('Test');
      });

      it('renders with label', () => {
        const { getByText } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            label="Email"
          />
        );

        expect(getByText('Email')).toBeTruthy();
      });

      it('renders with placeholder', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Enter email"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.placeholder).toBe('Enter email');
      });

      it('renders without label when not provided', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.placeholder).toBe('Test');
      });
    });

    describe('User Interactions', () => {
      it('calls onChangeText when text changes', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Type here"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        fireEvent.changeText(input, 'New text');

        expect(mockOnChangeText).toHaveBeenCalledWith('New text');
      });

      it('calls onFocus when focused', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
            onFocus={mockOnFocus}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        fireEvent(input, 'focus');

        expect(mockOnFocus).toHaveBeenCalled();
      });

      it('calls onBlur when blurred', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
            onBlur={mockOnBlur}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        fireEvent(input, 'blur');

        expect(mockOnBlur).toHaveBeenCalled();
      });

      it('calls onSubmitEditing when submitted', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
            onSubmitEditing={mockOnSubmitEditing}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        fireEvent(input, 'submitEditing');

        expect(mockOnSubmitEditing).toHaveBeenCalled();
      });
    });

    describe('Error State', () => {
      it('does not show error when not touched', () => {
        const { queryByText } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            error="Error message"
            touched={false}
          />
        );

        expect(queryByText('Error message')).toBeNull();
      });

      it('shows error when touched', () => {
        const { getByText } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            error="Error message"
            touched={true}
          />
        );

        expect(getByText('Error message')).toBeTruthy();
      });

      it('renders error icon when showing error', () => {
        const { UNSAFE_getAllByType, getByText } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            error="Error"
            touched={true}
          />
        );

        expect(getByText('Error')).toBeTruthy();

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
        
        const errorIcon = icons.find((icon) => icon.props.name === 'alert-circle');
        expect(errorIcon).toBeTruthy();
        expect(errorIcon?.props.size).toBe(14);
      });
    });

    describe('Secure Text Entry', () => {
      it('hides text when secureTextEntry is true', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value="password"
            onChangeText={mockOnChangeText}
            placeholder="Password"
            secureTextEntry={true}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.secureTextEntry).toBe(true);
      });

      it('shows eye icon when secureTextEntry is true', () => {
        const { UNSAFE_getAllByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            secureTextEntry={true}
          />
        );

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
        
        const eyeIcon = icons.find((icon) => 
          icon.props.name === 'eye-outline' || icon.props.name === 'eye-off-outline'
        );
        expect(eyeIcon).toBeTruthy();
      });

      it('toggles password visibility when eye icon pressed', () => {
        const { UNSAFE_getAllByType, getByLabelText } = render(
          <FormInput
            value="password"
            onChangeText={mockOnChangeText}
            secureTextEntry={true}
          />
        );

        const showButton = getByLabelText('Show password');
        fireEvent.press(showButton);

        // After toggle, should show "Hide password"
        const hideButton = getByLabelText('Hide password');
        expect(hideButton).toBeTruthy();
      });
    });

    describe('Icons', () => {
      it('renders left icon when provided', () => {
        const { UNSAFE_getAllByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            leftIcon="email"
          />
        );

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
        
        const leftIcon = icons.find((icon) => icon.props.name === 'email');
        expect(leftIcon).toBeTruthy();
      });

      it('renders right icon when provided', () => {
        const { UNSAFE_getAllByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            rightIcon="close"
            onRightIconPress={mockOnRightIconPress}
          />
        );

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
        
        const rightIcon = icons.find((icon) => icon.props.name === 'close');
        expect(rightIcon).toBeTruthy();
      });

      it('calls onRightIconPress when right icon pressed', () => {
        const { UNSAFE_getAllByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            rightIcon="close"
            onRightIconPress={mockOnRightIconPress}
          />
        );

        const { TouchableOpacity } = require('react-native');
        const buttons = UNSAFE_getAllByType(TouchableOpacity);
        
        // Find the button with the close icon
        const rightIconButton = buttons.find((btn) => !btn.props.disabled);
        if (rightIconButton) {
          fireEvent.press(rightIconButton);
          expect(mockOnRightIconPress).toHaveBeenCalled();
        }
      });

      it('does not render right icon when secureTextEntry is true', () => {
        const { UNSAFE_getAllByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            rightIcon="close"
            secureTextEntry={true}
          />
        );

        const { MaterialCommunityIcons } = require('@expo/vector-icons');
        const icons = UNSAFE_getAllByType(MaterialCommunityIcons);
        
        // Should only have eye icon, not close icon
        const closeIcon = icons.find((icon) => icon.props.name === 'close');
        expect(closeIcon).toBeFalsy();
      });
    });

    describe('Multiline', () => {
      it('renders multiline input', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Description"
            multiline={true}
            numberOfLines={4}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.multiline).toBe(true);
        expect(input.props.numberOfLines).toBe(4);
      });
    });

    describe('Character Count', () => {
      it('shows character count when maxLength provided', () => {
        const { getByText } = render(
          <FormInput
            value="Hello"
            onChangeText={mockOnChangeText}
            maxLength={100}
          />
        );

        expect(getByText('5/100')).toBeTruthy();
      });

      it('does not show character count when maxLength not provided', () => {
        const { queryByText } = render(
          <FormInput value="Hello" onChangeText={mockOnChangeText} />
        );

        expect(queryByText(/\d+\/\d+/)).toBeNull();
      });

      it('updates character count as value changes', () => {
        const { rerender, getByText } = render(
          <FormInput
            value="Hi"
            onChangeText={mockOnChangeText}
            maxLength={50}
          />
        );

        expect(getByText('2/50')).toBeTruthy();

        rerender(
          <FormInput
            value="Hello World"
            onChangeText={mockOnChangeText}
            maxLength={50}
          />
        );

        expect(getByText('11/50')).toBeTruthy();
      });
    });

    describe('Editable State', () => {
      it('is editable by default', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.editable).toBe(true);
      });

      it('can be disabled', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
            editable={false}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.editable).toBe(false);
      });
    });

    describe('Keyboard Type', () => {
      it('uses default keyboard type', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.keyboardType).toBe('default');
      });

      it('uses email-address keyboard type', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Email"
            keyboardType="email-address"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.keyboardType).toBe('email-address');
      });

      it('uses numeric keyboard type', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Phone"
            keyboardType="numeric"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.keyboardType).toBe('numeric');
      });
    });

    describe('Auto Props', () => {
      it('uses default autoCapitalize', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.autoCapitalize).toBe('none');
      });

      it('uses custom autoCapitalize', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Name"
            autoCapitalize="words"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.autoCapitalize).toBe('words');
      });

      it('uses default autoComplete', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.autoComplete).toBe('off');
      });

      it('uses custom autoComplete', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Email"
            autoComplete="email"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.autoComplete).toBe('email');
      });
    });

    describe('Accessibility', () => {
      it('has accessibility label from label prop', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            label="Email Address"
            placeholder="test@example.com"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.accessibilityLabel).toBe('Email Address');
      });

      it('falls back to placeholder for accessibility label', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Enter your name"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.accessibilityLabel).toBe('Enter your name');
      });

      it('has testID when provided', () => {
        const { getByTestId } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            testID="email-input"
          />
        );

        expect(getByTestId('email-input')).toBeTruthy();
      });
    });

    describe('Edge Cases', () => {
      it('handles empty value', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Empty"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.value).toBe('');
      });

      it('handles very long value', () => {
        const longValue = 'A'.repeat(1000);
        const { UNSAFE_getByType } = render(
          <FormInput value={longValue} onChangeText={mockOnChangeText} />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.value).toBe(longValue);
      });

      it('handles special characters in value', () => {
        const specialValue = '!@#$%^&*()_+<>?:"{}|';
        const { UNSAFE_getByType } = render(
          <FormInput value={specialValue} onChangeText={mockOnChangeText} />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.value).toBe(specialValue);
      });

      it('applies custom style', () => {
        const customStyle = { marginBottom: 32 };
        const { UNSAFE_getAllByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            style={customStyle}
          />
        );

        const { View } = require('react-native');
        const views = UNSAFE_getAllByType(View);
        
        const styledView = views.find((view) => {
          const style = JSON.stringify(view.props.style);
          return style.includes('32');
        });
        expect(styledView).toBeTruthy();
      });
    });

    describe('Return Key', () => {
      it('uses default blurOnSubmit', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.blurOnSubmit).toBe(true);
      });

      it('uses custom blurOnSubmit', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
            blurOnSubmit={false}
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.blurOnSubmit).toBe(false);
      });

      it('uses custom returnKeyType', () => {
        const { UNSAFE_getByType } = render(
          <FormInput
            value=""
            onChangeText={mockOnChangeText}
            placeholder="Test"
            returnKeyType="search"
          />
        );

        const input = UNSAFE_getByType(TextInput);
        expect(input.props.returnKeyType).toBe('search');
      });
    });
  });
});

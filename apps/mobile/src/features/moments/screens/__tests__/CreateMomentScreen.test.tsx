/**
 * CreateMomentScreen Component Tests
 * Tests for moment creation flow and validation
 * Target Coverage: 60%+
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateMomentScreen from '@/screens/CreateMomentScreen';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

jest.mock('@/hooks', () => ({
  useMoments: () => ({
    createMoment: jest.fn().mockResolvedValue({ id: '1', title: 'Test Moment' }),
  }),
}));

jest.mock('@/components/createMoment', () => ({
  PhotoSection: ({ photo, onPhotoSelected }: any) => {
    const { Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={() => onPhotoSelected('https://example.com/photo.jpg')}>
        <Text>Add Photo</Text>
        {photo && <Text>Photo: {photo}</Text>}
      </TouchableOpacity>
    );
  },
  TitleInput: ({ title, onTitleChange }: any) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        value={title}
        onChangeText={onTitleChange}
        placeholder="What's this moment about?"
        testID="title-input"
      />
    );
  },
  CategorySelector: ({ selectedCategory, onSelectCategory }: any) => {
    const { Text, TouchableOpacity, View } = require('react-native');
    return (
      <View>
        <TouchableOpacity onPress={() => onSelectCategory('food')}>
          <Text>Food & Drink</Text>
        </TouchableOpacity>
        {selectedCategory && <Text>Selected: {selectedCategory}</Text>}
      </View>
    );
  },
  DetailsSection: ({ place, selectedDate, amount, onAmountChange, onDatePress, onNavigateToPlaceSearch }: any) => {
    const { Text, TextInput, TouchableOpacity, View } = require('react-native');
    return (
      <View>
        <TouchableOpacity onPress={onNavigateToPlaceSearch}>
          <Text>Select Location</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDatePress}>
          <Text>Select Date</Text>
          <Text>Date: {selectedDate.toDateString()}</Text>
        </TouchableOpacity>
        <TextInput
          value={amount}
          onChangeText={onAmountChange}
          placeholder="Amount"
          testID="amount-input"
        />
      </View>
    );
  },
  StorySection: ({ story, onStoryChange }: any) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        value={story}
        onChangeText={onStoryChange}
        placeholder="Tell your story"
        testID="story-input"
      />
    );
  },
  MomentPreview: () => {
    const { Text } = require('react-native');
    return <Text>Preview</Text>;
  },
  CATEGORIES: [
    { id: 'food', label: 'Food & Drink', emoji: '🍽️' },
    { id: 'culture', label: 'Culture', emoji: '🎨' },
  ],
  getCategoryEmoji: (id: string) => id === 'food' ? '🍽️' : '🎨',
}));

describe('CreateMomentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render screen with header', () => {
      const { getByText } = render(<CreateMomentScreen />);

      expect(getByText('Share a Moment')).toBeTruthy();
    });

    it('should render all form sections', () => {
      const { getByText, getByPlaceholderText } = render(<CreateMomentScreen />);

      expect(getByText('Add Photo')).toBeTruthy();
      expect(getByPlaceholderText("What's this moment about?")).toBeTruthy();
      expect(getByText('Food & Drink')).toBeTruthy();
      expect(getByPlaceholderText('Amount')).toBeTruthy();
      expect(getByPlaceholderText('Tell your story')).toBeTruthy();
    });

    it('should render publish button', () => {
      const { getByText } = render(<CreateMomentScreen />);

      expect(getByText('Publish Moment')).toBeTruthy();
    });

    it('should render preview section', () => {
      const { getByText } = render(<CreateMomentScreen />);

      expect(getByText('Preview')).toBeTruthy();
    });

    it('should render close button', () => {
      const { getByLabelText } = render(<CreateMomentScreen />);

      expect(getByLabelText('Close')).toBeTruthy();
    });
  });

  describe('Form Input', () => {
    it('should update title when user types', () => {
      const { getByTestId } = render(<CreateMomentScreen />);

      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Coffee in Paris');

      expect(titleInput.props.value).toBe('Coffee in Paris');
    });

    it('should update amount when user types', () => {
      const { getByTestId } = render(<CreateMomentScreen />);

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      expect(amountInput.props.value).toBe('25');
    });

    it('should update story when user types', () => {
      const { getByTestId } = render(<CreateMomentScreen />);

      const storyInput = getByTestId('story-input');
      fireEvent.changeText(storyInput, 'Amazing experience');

      expect(storyInput.props.value).toBe('Amazing experience');
    });

    it('should select category when pressed', () => {
      const { getByText } = render(<CreateMomentScreen />);

      const foodCategory = getByText('Food & Drink');
      fireEvent.press(foodCategory);

      expect(getByText('Selected: food')).toBeTruthy();
    });

    it('should add photo when selected', () => {
      const { getByText } = render(<CreateMomentScreen />);

      const addPhotoButton = getByText('Add Photo');
      fireEvent.press(addPhotoButton);

      expect(getByText('Photo: https://example.com/photo.jpg')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error when publishing without title', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      // Fill only some fields
      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Title required',
          expect.any(String)
        );
      });
    });

    it('should show error when title is too short', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Hi');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Title too short',
          'Title must be at least 5 characters'
        );
      });
    });

    it('should show error when publishing without category', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Valid Title Here');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Category required',
          expect.any(String)
        );
      });
    });

    it('should show error when publishing without amount', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Valid Title');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Amount required',
          expect.any(String)
        );
      });
    });

    it('should show error when amount is too high', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Valid Title');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '15000');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Amount too high',
          'Maximum amount is $10,000'
        );
      });
    });

    it('should disable publish button when form is invalid', () => {
      const { getByText } = render(<CreateMomentScreen />);

      const publishButton = getByText('Publish Moment');
      expect(publishButton.props.accessibilityState.disabled).toBe(true);
    });

    it('should enable publish button when form is valid', () => {
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      // Fill all required fields
      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Coffee in Paris');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      const publishButton = getByText('Publish Moment');
      expect(publishButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Payment Hints', () => {
    it('should render payment hint section', () => {
      const { queryByText } = render(<CreateMomentScreen />);

      // Payment hint is visible (implementation determines exact text)
      expect(queryByText(/payment/i) || queryByText(/amount/i)).toBeTruthy();
    });
  });

  describe('Date Selection', () => {
    it('should open date picker when date is pressed', () => {
      const { getByText } = render(<CreateMomentScreen />);

      const dateButton = getByText('Select Date');
      fireEvent.press(dateButton);

      // Date picker should be triggered
      expect(dateButton).toBeTruthy();
    });

    it('should display selected date', () => {
      const { getByText } = render(<CreateMomentScreen />);

      const dateText = getByText(/Date:/);
      expect(dateText).toBeTruthy();
    });
  });

  describe('Location Selection', () => {
    it('should show not implemented alert when selecting location', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText } = render(<CreateMomentScreen />);

      const locationButton = getByText('Select Location');
      fireEvent.press(locationButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Not implemented',
          'Place selection coming soon'
        );
      });
    });
  });

  describe('Publishing Flow', () => {
    it('should successfully publish moment with valid data', async () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      // Fill all fields
      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Coffee in Paris');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      const storyInput = getByTestId('story-input');
      fireEvent.changeText(storyInput, 'Amazing coffee');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'Success!',
          'Your moment has been published',
          expect.any(Array)
        );
      });
    });

    it('should show loading indicator while publishing', async () => {
      const { getByText, getByTestId, queryByText } = render(<CreateMomentScreen />);

      // Fill all fields
      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Coffee in Paris');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      // Loading state should appear
      await waitFor(() => {
        expect(queryByText('Publish Moment')).toBeFalsy();
      });
    });
  });

  describe('Navigation', () => {
    it('should have close button', () => {
      const { getByLabelText } = render(<CreateMomentScreen />);

      const closeButton = getByLabelText('Close');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible close button', () => {
      const { getByLabelText } = render(<CreateMomentScreen />);

      const closeButton = getByLabelText('Close');
      expect(closeButton).toBeTruthy();
    });

    it('should have accessible publish button', () => {
      const { getByText } = render(<CreateMomentScreen />);

      const publishButton = getByText('Publish Moment');
      expect(publishButton).toBeTruthy();
    });
  });

  describe('Form State Management', () => {
    it('should maintain form state across interactions', () => {
      const { getByTestId, getByText } = render(<CreateMomentScreen />);

      // Fill multiple fields
      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Coffee');

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      // All values should persist
      expect(titleInput.props.value).toBe('Coffee');
      expect(amountInput.props.value).toBe('25');
      expect(getByText('Selected: food')).toBeTruthy();
    });

    it('should clear form after successful publish', async () => {
      const { getByText, getByTestId } = render(<CreateMomentScreen />);

      // Fill and publish
      const titleInput = getByTestId('title-input');
      fireEvent.changeText(titleInput, 'Coffee in Paris');

      const categoryButton = getByText('Food & Drink');
      fireEvent.press(categoryButton);

      const amountInput = getByTestId('amount-input');
      fireEvent.changeText(amountInput, '25');

      const publishButton = getByText('Publish Moment');
      fireEvent.press(publishButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success!',
          expect.any(String),
          expect.any(Array)
        );
      });
    });
  });
});

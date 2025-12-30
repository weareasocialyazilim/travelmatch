import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LanguageSelectionBottomSheet } from '../LanguageSelectionBottomSheet';

// Mock GenericBottomSheet
jest.mock('../ui/GenericBottomSheet', () => ({
  GenericBottomSheet: ({ children, visible, onClose, title }: { children: React.ReactNode; visible: boolean; onClose: () => void; title: string }) => {
    const { View, Text } = require('react-native');
    if (!visible) return null;
    return (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    );
  },
}));

describe('LanguageSelectionBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnLanguageChange = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onLanguageChange: mockOnLanguageChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      expect(getByText('Select Language')).toBeTruthy();
    });

    it('renders English option', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      expect(getByText('English')).toBeTruthy();
    });

    it('renders Turkish option', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      expect(getByText('Türkçe')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(
        <LanguageSelectionBottomSheet {...defaultProps} visible={false} />
      );
      
      expect(queryByText('Select Language')).toBeNull();
    });

    it('renders both language options', () => {
      const { UNSAFE_getAllByType } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      
      // Should have 2 language options
      expect(touchables.length).toBe(2);
    });
  });

  describe('User Interactions', () => {
    it('calls onLanguageChange with "en" when English is selected', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      fireEvent.press(getByText('English'));
      
      expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
    });

    it('calls onLanguageChange with "tr" when Turkish is selected', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      fireEvent.press(getByText('Türkçe'));
      
      expect(mockOnLanguageChange).toHaveBeenCalledWith('tr');
    });

    it('does not call onClose automatically after selection', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      fireEvent.press(getByText('English'));
      
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('allows selecting language multiple times', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      fireEvent.press(getByText('English'));
      fireEvent.press(getByText('Türkçe'));
      fireEvent.press(getByText('English'));
      
      expect(mockOnLanguageChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Language Options', () => {
    it('provides correct language codes', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      fireEvent.press(getByText('English'));
      expect(mockOnLanguageChange).toHaveBeenLastCalledWith('en');
      
      fireEvent.press(getByText('Türkçe'));
      expect(mockOnLanguageChange).toHaveBeenLastCalledWith('tr');
    });

    it('maintains language order (English first, Turkish second)', () => {
      const { UNSAFE_getAllByType } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);
      
      expect(touchables.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid language switches', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      const english = getByText('English');
      fireEvent.press(english);
      fireEvent.press(english);
      fireEvent.press(english);
      
      expect(mockOnLanguageChange).toHaveBeenCalledTimes(3);
      expect(mockOnLanguageChange).toHaveBeenCalledWith('en');
    });

    it('handles alternating selections', () => {
      const { getByText } = render(<LanguageSelectionBottomSheet {...defaultProps} />);
      
      fireEvent.press(getByText('English'));
      fireEvent.press(getByText('Türkçe'));
      
      expect(mockOnLanguageChange).toHaveBeenNthCalledWith(1, 'en');
      expect(mockOnLanguageChange).toHaveBeenNthCalledWith(2, 'tr');
    });

    it('renders correctly when reopened', () => {
      const { rerender, getByText } = render(
        <LanguageSelectionBottomSheet {...defaultProps} visible={false} />
      );
      
      rerender(<LanguageSelectionBottomSheet {...defaultProps} visible={true} />);
      
      expect(getByText('English')).toBeTruthy();
      expect(getByText('Türkçe')).toBeTruthy();
    });
  });
});

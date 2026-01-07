import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CurrencySelectionBottomSheet } from '../CurrencySelectionBottomSheet';

// Mock GenericBottomSheet
jest.mock('../ui/GenericBottomSheet', () => ({
  GenericBottomSheet: ({
    children,
    visible,
    onClose,
    renderFooter,
    title,
  }: {
    children: React.ReactNode;
    visible: boolean;
    onClose: () => void;
    renderFooter?: () => React.ReactNode;
    title: string;
  }) => {
    const { View, Text } = require('react-native');
    if (!visible) return null;
    return (
      <View>
        <Text>{title}</Text>
        {children}
        {renderFooter && renderFooter()}
      </View>
    );
  },
}));

describe('CurrencySelectionBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnCurrencyChange = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onCurrencyChange: mockOnCurrencyChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      expect(getByText('Currency')).toBeTruthy();
    });

    it('renders all currency options', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      expect(getByText('USD')).toBeTruthy();
      expect(getByText('EUR')).toBeTruthy();
      expect(getByText('TRY')).toBeTruthy();
      expect(getByText('GBP')).toBeTruthy();
      expect(getByText('JPY')).toBeTruthy();
      expect(getByText('CAD')).toBeTruthy();
    });

    it('renders currency names', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      expect(getByText('United States Dollar')).toBeTruthy();
      expect(getByText('Euro')).toBeTruthy();
      expect(getByText('Turkish Lira')).toBeTruthy();
      expect(getByText('British Pound')).toBeTruthy();
      expect(getByText('Japanese Yen')).toBeTruthy();
      expect(getByText('Canadian Dollar')).toBeTruthy();
    });

    it('renders search input', () => {
      const { UNSAFE_getByType } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      expect(input.props.placeholder).toBe('Search for a currency');
    });

    it('renders search icon', () => {
      const { UNSAFE_getAllByType } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const MaterialCommunityIcons =
        require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);

      const searchIcon = icons.find(
        (icon: { props: { name: string } }) => icon.props.name === 'magnify',
      );
      expect(searchIcon).toBeTruthy();
    });

    it('renders Confirm Selection button', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      expect(getByText('Confirm Selection')).toBeTruthy();
    });

    it('does not render when visible is false', () => {
      const { queryByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} visible={false} />,
      );

      expect(queryByText('Currency')).toBeNull();
    });
  });

  describe('User Interactions', () => {
    it('allows selecting USD', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('USD'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('USD');
    });

    it('allows selecting EUR', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('EUR'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('EUR');
    });

    it('allows selecting TRY', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('TRY'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('TRY');
    });

    it('allows selecting GBP', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('GBP'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('GBP');
    });

    it('allows selecting JPY', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('JPY'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('JPY');
    });

    it('allows selecting CAD', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('CAD'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('CAD');
    });

    it('calls onClose after confirming selection', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('EUR'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('allows changing selection before confirming', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('USD'));
      fireEvent.press(getByText('EUR'));
      fireEvent.press(getByText('GBP'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('GBP');
    });
  });

  describe('Search Functionality', () => {
    it('allows searching by currency code', () => {
      const { UNSAFE_getByType, getByText, queryByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'USD');

      expect(getByText('USD')).toBeTruthy();
      expect(queryByText('EUR')).toBeNull();
    });

    it('allows searching by currency name', () => {
      const { UNSAFE_getByType, getByText, queryByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'Euro');

      expect(getByText('EUR')).toBeTruthy();
      expect(queryByText('USD')).toBeNull();
    });

    it('search is case-insensitive', () => {
      const { UNSAFE_getByType, getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'usd');

      expect(getByText('USD')).toBeTruthy();
    });

    it('filters currencies in real-time', () => {
      const { UNSAFE_getByType, getByText, queryByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'British');

      expect(getByText('GBP')).toBeTruthy();
      expect(queryByText('USD')).toBeNull();
      expect(queryByText('EUR')).toBeNull();
    });

    it('shows all currencies when search is cleared', () => {
      const { UNSAFE_getByType, getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'EUR');
      fireEvent.changeText(input, '');

      expect(getByText('USD')).toBeTruthy();
      expect(getByText('EUR')).toBeTruthy();
      expect(getByText('TRY')).toBeTruthy();
    });

    it('handles partial matches', () => {
      const { UNSAFE_getByType, getByText, queryByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'Dollar');

      expect(getByText('USD')).toBeTruthy();
      expect(getByText('CAD')).toBeTruthy();
      expect(queryByText('EUR')).toBeNull();
    });
  });

  describe('Selection State', () => {
    it('defaults to USD when no selected currency provided', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('USD');
    });

    it('uses provided selected currency', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet
          {...defaultProps}
          selectedCurrency="EUR"
        />,
      );

      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('EUR');
    });

    it('maintains temporary selection until confirmed', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('JPY'));

      // onCurrencyChange should not be called yet
      expect(mockOnCurrencyChange).not.toHaveBeenCalled();

      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('JPY');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty search results', () => {
      const { UNSAFE_getByType, queryByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'XYZ');

      expect(queryByText('USD')).toBeNull();
      expect(queryByText('EUR')).toBeNull();
    });

    it('confirms without changing selection', () => {
      const { getByText } = render(
        <CurrencySelectionBottomSheet
          {...defaultProps}
          selectedCurrency="TRY"
        />,
      );

      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('TRY');
    });

    it('allows selecting filtered currency', () => {
      const { UNSAFE_getByType, getByText } = render(
        <CurrencySelectionBottomSheet {...defaultProps} />,
      );

      const TextInput = require('react-native').TextInput;
      const input = UNSAFE_getByType(TextInput);

      fireEvent.changeText(input, 'Yen');
      fireEvent.press(getByText('JPY'));
      fireEvent.press(getByText('Confirm Selection'));

      expect(mockOnCurrencyChange).toHaveBeenCalledWith('JPY');
    });
  });
});

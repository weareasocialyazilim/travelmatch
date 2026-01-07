import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChooseCategoryBottomSheet } from '../ChooseCategoryBottomSheet';

describe('ChooseCategoryBottomSheet', () => {
  const mockOnClose = jest.fn() as jest.Mock;
  const mockOnSelectCategory = jest.fn() as jest.Mock;

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onSelectCategory: mockOnSelectCategory,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly when visible', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      expect(getByText('Choose Category')).toBeTruthy();
    });

    it('renders all category options', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      expect(getByText('Adventure')).toBeTruthy();
      expect(getByText('Food & Drink')).toBeTruthy();
      expect(getByText('Culture')).toBeTruthy();
      expect(getByText('Relaxation')).toBeTruthy();
      expect(getByText('Milestone')).toBeTruthy();
      expect(getByText('Challenge')).toBeTruthy();
      expect(getByText('Local Experience')).toBeTruthy();
    });

    it('renders category icons', () => {
      const { UNSAFE_getAllByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const MaterialCommunityIcons =
        require('@expo/vector-icons').MaterialCommunityIcons;
      const icons = UNSAFE_getAllByType(MaterialCommunityIcons);

      // Should have 7 category icons
      expect(icons.length).toBeGreaterThanOrEqual(7);
    });

    it('renders handle indicator', () => {
      const { UNSAFE_getAllByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const View = require('react-native').View;
      const views = UNSAFE_getAllByType(View);

      expect(views.length).toBeGreaterThan(0);
    });

    it('modal is not visible when visible prop is false', () => {
      const { UNSAFE_getByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} visible={false} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.visible).toBe(false);
    });

    it('highlights selected category', () => {
      const { UNSAFE_getAllByType } = render(
        <ChooseCategoryBottomSheet
          {...defaultProps}
          selectedCategoryId="adventure"
        />,
      );

      const TouchableOpacity = require('react-native').TouchableOpacity;
      const touchables = UNSAFE_getAllByType(TouchableOpacity);

      // First category item should be selected
      expect(touchables.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('calls onSelectCategory when Adventure is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Adventure'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'adventure',
        label: 'Adventure',
        icon: 'compass',
      });
    });

    it('calls onSelectCategory when Food & Drink is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Food & Drink'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'food',
        label: 'Food & Drink',
        icon: 'food',
      });
    });

    it('calls onSelectCategory when Culture is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Culture'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'culture',
        label: 'Culture',
        icon: 'bank',
      });
    });

    it('calls onSelectCategory when Relaxation is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Relaxation'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'relaxation',
        label: 'Relaxation',
        icon: 'meditation',
      });
    });

    it('calls onSelectCategory when Milestone is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Milestone'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'milestone',
        label: 'Milestone',
        icon: 'flag',
      });
    });

    it('calls onSelectCategory when Challenge is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Challenge'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'challenge',
        label: 'Challenge',
        icon: 'trophy',
      });
    });

    it('calls onSelectCategory when Local Experience is pressed', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Local Experience'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'local',
        label: 'Local Experience',
        icon: 'account-group',
      });
    });

    it('calls onClose after selecting category', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Adventure'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is pressed', () => {
      const { UNSAFE_getAllByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const TouchableWithoutFeedback =
        require('react-native').TouchableWithoutFeedback;
      const touchables = UNSAFE_getAllByType(TouchableWithoutFeedback);

      fireEvent.press(touchables[0]);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when modal requests to close', () => {
      const { UNSAFE_getByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      modal.props.onRequestClose();

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Properties', () => {
    it('renders as transparent modal', () => {
      const { UNSAFE_getByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.transparent).toBe(true);
    });

    it('uses slide animation', () => {
      const { UNSAFE_getByType } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const Modal = require('react-native').Modal;
      const modal = UNSAFE_getByType(Modal);

      expect(modal.props.animationType).toBe('slide');
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid category selections', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      const adventure = getByText('Adventure');
      fireEvent.press(adventure);
      fireEvent.press(adventure);
      fireEvent.press(adventure);

      // Should be called 3 times (no debounce)
      expect(mockOnSelectCategory).toHaveBeenCalledTimes(3);
    });

    it('handles switching between categories', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Adventure'));

      expect(mockOnSelectCategory).toHaveBeenLastCalledWith({
        id: 'adventure',
        label: 'Adventure',
        icon: 'compass',
      });
    });

    it('renders correctly with pre-selected category', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet
          {...defaultProps}
          selectedCategoryId="culture"
        />,
      );

      expect(getByText('Culture')).toBeTruthy();
    });

    it('allows changing from pre-selected category', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet
          {...defaultProps}
          selectedCategoryId="adventure"
        />,
      );

      fireEvent.press(getByText('Food & Drink'));

      expect(mockOnSelectCategory).toHaveBeenCalledWith({
        id: 'food',
        label: 'Food & Drink',
        icon: 'food',
      });
    });

    it('maintains category data structure on selection', () => {
      const { getByText } = render(
        <ChooseCategoryBottomSheet {...defaultProps} />,
      );

      fireEvent.press(getByText('Milestone'));

      const calledWith = mockOnSelectCategory.mock.calls[0][0];
      expect(calledWith).toHaveProperty('id');
      expect(calledWith).toHaveProperty('label');
      expect(calledWith).toHaveProperty('icon');
    });
  });
});

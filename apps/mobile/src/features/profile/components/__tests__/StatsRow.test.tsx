/**
 * StatsRow Test Suite
 * Tests for premium stats display component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StatsRow } from '../StatsRow';

describe('StatsRow Component', () => {
  const defaultProps = {
    momentsCount: 15,
    activeMoments: 5,
    onMomentsPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders moments count', () => {
      const { getByText } = render(<StatsRow {...defaultProps} />);
      expect(getByText('15')).toBeTruthy();
      expect(getByText('Anlar')).toBeTruthy();
    });

    it('renders active moments count', () => {
      const { getByText } = render(<StatsRow {...defaultProps} />);
      expect(getByText('5')).toBeTruthy();
      expect(getByText('Aktif')).toBeTruthy();
    });

    it('renders both stats', () => {
      const { getByText } = render(
        <StatsRow
          momentsCount={42}
          activeMoments={10}
          onMomentsPress={jest.fn()}
        />,
      );
      expect(getByText('42')).toBeTruthy();
      expect(getByText('10')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onMomentsPress when moments stat is clicked', () => {
      const onMomentsPress = jest.fn();
      const { getByLabelText } = render(
        <StatsRow
          momentsCount={15}
          activeMoments={5}
          onMomentsPress={onMomentsPress}
        />,
      );

      fireEvent.press(getByLabelText(/Anlar.*Tap to view/));
      expect(onMomentsPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Formatting', () => {
    it('formats large numbers correctly', () => {
      const { getByText } = render(
        <StatsRow
          momentsCount={1234}
          activeMoments={567}
          onMomentsPress={jest.fn()}
        />,
      );
      expect(getByText('1234')).toBeTruthy();
      expect(getByText('567')).toBeTruthy();
    });

    it('handles zero values', () => {
      const { getAllByText } = render(
        <StatsRow
          momentsCount={0}
          activeMoments={0}
          onMomentsPress={jest.fn()}
        />,
      );
      // Both stats show 0
      expect(getAllByText('0').length).toBe(2);
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for moments stat', () => {
      const { getByLabelText } = render(<StatsRow {...defaultProps} />);
      expect(getByLabelText(/Anlar.*Tap to view/)).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot with various counts', () => {
      const { toJSON } = render(
        <StatsRow
          momentsCount={42}
          activeMoments={12}
          onMomentsPress={jest.fn()}
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with zero values', () => {
      const { toJSON } = render(
        <StatsRow
          momentsCount={0}
          activeMoments={0}
          onMomentsPress={jest.fn()}
        />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

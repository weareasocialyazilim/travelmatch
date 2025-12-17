/**
 * MomentGridCard Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockMoment } from '../../../../__tests__/testUtilsRender.helper';
import { MomentGridCard } from '../../../../components/discover/cards/MomentGridCard';

describe('MomentGridCard Component', () => {
  const mockOnPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders moment title', () => {
      const moment = mockMoment({ title: 'Grid Moment' });
      const { getByText } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      expect(getByText('Grid Moment')).toBeTruthy();
    });

    it('renders compact price format', () => {
      const moment = mockMoment({ price: 75, currency: 'USD' });
      const { getByText } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      expect(getByText(/75/)).toBeTruthy();
    });

    it('renders host rating', () => {
      const moment = mockMoment({ hostRating: 4.8 });
      const { getByText } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      expect(getByText('4.8')).toBeTruthy();
    });

    it('applies correct layout for left column (index 0)', () => {
      const moment = mockMoment();
      const { getByTestId } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      // Left column should have marginRight
    });

    it('applies correct layout for right column (index 1)', () => {
      const moment = mockMoment();
      const { getByTestId } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={1} />
      );
      // Right column should have marginLeft
    });
  });

  describe('Interactions', () => {
    it('calls onPress with moment data', () => {
      const moment = mockMoment();
      const { getByText } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      
      fireEvent.press(getByText(moment.title));
      expect(mockOnPress).toHaveBeenCalledWith(moment);
    });
  });

  describe('Grid Layout', () => {
    it('renders two cards in a row correctly', () => {
      const moment1 = mockMoment({ id: 'moment-1', title: 'Left Card' });
      const moment2 = mockMoment({ id: 'moment-2', title: 'Right Card' });
      
      const { getByText } = render(
        <>
          <MomentGridCard moment={moment1} onPress={mockOnPress} index={0} />
          <MomentGridCard moment={moment2} onPress={mockOnPress} index={1} />
        </>
      );
      
      expect(getByText('Left Card')).toBeTruthy();
      expect(getByText('Right Card')).toBeTruthy();
    });
  });

  describe('Image Display', () => {
    it('displays moment image in compact format', () => {
      const moment = mockMoment({ images: ['grid-image.jpg'] });
      const { getByTestId } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      // Check for image component
    });

    it('handles missing images gracefully', () => {
      const moment = mockMoment({ images: [] });
      const { getByText } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      // Should still render without crashing
      expect(getByText(moment.title)).toBeTruthy();
    });
  });

  describe('Memoization', () => {
    it('uses custom equality check', () => {
      const moment = mockMoment({ id: 'moment-1', price: 50 });
      let renderCount = 0;

      const TestComponent = () => {
        renderCount++;
        return <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />;
      };

      const { rerender } = render(<TestComponent />);
      const initialCount = renderCount;

      rerender(<TestComponent />);
      
      // Should not re-render if moment data hasn't changed
      expect(renderCount).toBe(initialCount);
    });

    it('re-renders when price changes', () => {
      const moment1 = mockMoment({ id: 'moment-1', price: 50 });
      const moment2 = mockMoment({ id: 'moment-1', price: 60 });
      
      const { rerender, getByText } = render(
        <MomentGridCard moment={moment1} onPress={mockOnPress} index={0} />
      );
      
      expect(getByText(/50/)).toBeTruthy();
      
      rerender(
        <MomentGridCard moment={moment2} onPress={mockOnPress} index={0} />
      );
      
      expect(getByText(/60/)).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot for left column', () => {
      const moment = mockMoment();
      const { toJSON } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={0} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot for right column', () => {
      const moment = mockMoment();
      const { toJSON } = render(
        <MomentGridCard moment={moment} onPress={mockOnPress} index={1} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

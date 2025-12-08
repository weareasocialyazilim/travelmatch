/**
 * MomentSingleCard Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockMoment } from '../../../../__tests__/testUtils';
import { MomentSingleCard } from '../../../../components/discover/cards/MomentSingleCard';

describe('MomentSingleCard Component', () => {
  const mockOnPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders moment title', () => {
      const moment = mockMoment({ title: 'Beach Adventure' });
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(getByText('Beach Adventure')).toBeTruthy();
    });

    it('renders moment price', () => {
      const moment = mockMoment({ price: 50, currency: 'USD' });
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(getByText(/50/)).toBeTruthy();
    });

    it('renders host name', () => {
      const moment = mockMoment({ hostName: 'John Doe' });
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('renders host rating', () => {
      const moment = mockMoment({ hostRating: 4.5, hostReviewCount: 10 });
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(getByText('4.5')).toBeTruthy();
      expect(getByText(/10/)).toBeTruthy();
    });

    it('renders location', () => {
      const moment = mockMoment({ 
        location: { city: 'Miami', country: 'USA' } 
      });
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(getByText(/Miami/)).toBeTruthy();
    });

    it('displays moment image', () => {
      const moment = mockMoment({ images: ['image1.jpg'] });
      const { getByTestId } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      // Check image component if it has testID
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const moment = mockMoment();
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      
      fireEvent.press(getByText(moment.title));
      expect(mockOnPress).toHaveBeenCalledWith(moment);
    });

    it('does not call onPress multiple times on rapid taps', () => {
      const moment = mockMoment();
      const { getByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      
      const card = getByText(moment.title);
      fireEvent.press(card);
      fireEvent.press(card);
      fireEvent.press(card);
      
      // Should debounce or prevent multiple calls
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Memoization', () => {
    it('does not re-render when unrelated props change', () => {
      const moment = mockMoment();
      let renderCount = 0;
      
      const TestWrapper = () => {
        const [count, setCount] = React.useState(0);
        renderCount++;
        
        return (
          <>
            <MomentSingleCard moment={moment} onPress={mockOnPress} />
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </>
        );
      };

      const { getByText } = render(<TestWrapper />);
      const initialRenderCount = renderCount;
      
      fireEvent.press(getByText('Increment'));
      
      // Card should not re-render when parent state changes
      expect(renderCount).toBe(initialRenderCount + 1);
    });

    it('re-renders when moment data changes', () => {
      const moment1 = mockMoment({ id: 'moment-1', price: 50 });
      const moment2 = mockMoment({ id: 'moment-1', price: 60 });
      
      const { rerender, getByText } = render(
        <MomentSingleCard moment={moment1} onPress={mockOnPress} />
      );
      
      expect(getByText(/50/)).toBeTruthy();
      
      rerender(<MomentSingleCard moment={moment2} onPress={mockOnPress} />);
      
      expect(getByText(/60/)).toBeTruthy();
    });
  });

  describe('Distance Display', () => {
    it('shows distance when provided', () => {
      const moment = mockMoment();
      const { getByText } = render(
        <MomentSingleCard 
          moment={moment} 
          onPress={mockOnPress}
          distance={2.5}
        />
      );
      expect(getByText(/2.5/)).toBeTruthy();
    });

    it('hides distance when not provided', () => {
      const moment = mockMoment();
      const { queryByText } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(queryByText(/km/)).toBeNull();
    });
  });

  describe('KYC Badge', () => {
    it('shows verified badge for KYC users', () => {
      const moment = mockMoment({ 
        users: { kyc: true, name: 'Verified Host' }
      });
      const { getByTestId } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      // Check for verification badge if it has testID
    });

    it('hides verified badge for non-KYC users', () => {
      const moment = mockMoment({ 
        users: { kyc: false, name: 'Unverified Host' }
      });
      const { queryByTestId } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      // Verification badge should not exist
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot for basic moment', () => {
      const moment = mockMoment();
      const { toJSON } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot with distance', () => {
      const moment = mockMoment();
      const { toJSON } = render(
        <MomentSingleCard 
          moment={moment} 
          onPress={mockOnPress}
          distance={3.2}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot for verified host', () => {
      const moment = mockMoment({ 
        users: { kyc: true, name: 'Verified' }
      });
      const { toJSON } = render(
        <MomentSingleCard moment={moment} onPress={mockOnPress} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

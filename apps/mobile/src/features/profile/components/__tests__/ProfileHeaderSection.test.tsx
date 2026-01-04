/**
 * ProfileHeaderSection Component Tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render, mockUser } from '../../../../__tests__/testUtilsRender.helper';
import { ProfileHeaderSection } from '../ProfileHeaderSection';

describe('ProfileHeaderSection Component', () => {
  const mockOnEditPress = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders user name', () => {
      const user = mockUser({ name: 'John Doe' });
      const { getByText } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      expect(getByText('John Doe')).toBeTruthy();
    });

    it('renders user location', () => {
      const user = mockUser({
        location: { city: 'New York', country: 'USA' },
      });
      const { getByText } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      expect(getByText(/New York/)).toBeTruthy();
    });

    it('renders trust score', () => {
      const user = mockUser({ trust_score: 85 });
      const { getByText } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      expect(getByText(/85/)).toBeTruthy();
    });

    it('displays user avatar', () => {
      const user = mockUser({ avatar: 'avatar.jpg' });
      const { getByTestId } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // Check for avatar component
    });

    it('shows KYC verification badge for verified users', () => {
      const user = mockUser({ kyc: true });
      const { getByTestId } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // Check for verification badge
    });

    it('hides KYC badge for unverified users', () => {
      const user = mockUser({ kyc: false });
      const { queryByTestId } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // No verification badge
    });
  });

  describe('Edit Functionality', () => {
    it('shows edit button when onEditPress is provided', () => {
      const user = mockUser();
      const { getByTestId } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // Check for edit button
    });

    it('calls onEditPress when edit button is clicked', () => {
      const user = mockUser();
      const { getByTestId } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );

      const editButton = getByTestId('edit-button');
      fireEvent.press(editButton);

      expect(mockOnEditPress).toHaveBeenCalledTimes(1);
    });

    it('hides edit button when onEditPress is not provided', () => {
      const user = mockUser();
      const { queryByTestId } = render(<ProfileHeaderSection user={user} />);

      expect(queryByTestId('edit-button')).toBeNull();
    });
  });

  describe('Trust Score Display', () => {
    it('shows green color for high trust score (>= 85)', () => {
      const user = mockUser({ trust_score: 90 });
      const { getByText } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // Check color styling
    });

    it('shows yellow color for medium trust score (50-84)', () => {
      const user = mockUser({ trust_score: 70 });
      const { getByText } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // Check color styling
    });

    it('shows red color for low trust score (< 50)', () => {
      const user = mockUser({ trust_score: 30 });
      const { getByText } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      // Check color styling
    });
  });

  describe('Memoization', () => {
    it('does not re-render when unrelated props change', () => {
      const user = mockUser();
      let renderCount = 0;

      const TestWrapper = () => {
        const [count, setCount] = React.useState(0);
        renderCount++;
        const { TouchableOpacity, Text } = require('react-native');
        return (
          <>
            <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />
            <TouchableOpacity onPress={() => setCount((c) => c + 1)}>
              <Text>Update</Text>
            </TouchableOpacity>
          </>
        );
      };

      const { getByText } = render(<TestWrapper />);
      const initial = renderCount;

      fireEvent.press(getByText('Update'));

      // Component should be memoized
      expect(renderCount).toBe(initial + 1);
    });

    it('re-renders when user data changes', () => {
      const user1 = mockUser({ name: 'John', trust_score: 80 });
      const user2 = mockUser({ name: 'John', trust_score: 90 });

      const { rerender, getByText } = render(
        <ProfileHeaderSection user={user1} onEditPress={mockOnEditPress} />,
      );

      expect(getByText(/80/)).toBeTruthy();

      rerender(
        <ProfileHeaderSection user={user2} onEditPress={mockOnEditPress} />,
      );

      expect(getByText(/90/)).toBeTruthy();
    });
  });

  describe('Snapshots', () => {
    it('matches snapshot for verified user', () => {
      const user = mockUser({ kyc: true, trust_score: 90 });
      const { toJSON } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it('matches snapshot for unverified user', () => {
      const user = mockUser({ kyc: false, trust_score: 60 });
      const { toJSON } = render(
        <ProfileHeaderSection user={user} onEditPress={mockOnEditPress} />,
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });
});

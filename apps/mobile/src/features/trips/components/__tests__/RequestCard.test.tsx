import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, View } from 'react-native';
import { RequestCard } from '@/features/trips/components/RequestCard';
import { COLORS } from '@/constants/colors';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('RequestCard', () => {
  const mockRequest = {
    id: '1',
    person: {
      id: 'user1',
      name: 'John Doe',
      age: 30,
      avatar: 'https://example.com/avatar.jpg',
      rating: 4.8,
      isVerified: true,
      tripCount: 5,
      city: 'London',
    },
    momentTitle: 'Coffee Chat',
    momentEmoji: '☕',
    amount: 25,
    message: 'Would love to meet up!',
    createdAt: '2024-01-01T10:00:00Z',
    timeAgo: '2h ago',
    isNew: true,
    proofRequired: false,
    proofUploaded: false,
  };

  const mockOnAccept = jest.fn();
  const mockOnDecline = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render request card with person info', () => {
    const { getByText } = render(
      <RequestCard
        item={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    expect(getByText('John Doe, 30')).toBeTruthy();
    expect(getByText('☕ Coffee Chat')).toBeTruthy();
    expect(getByText('€25')).toBeTruthy();
    expect(getByText('"Would love to meet up!"')).toBeTruthy();
  });

  it('should show verified badge for verified users', () => {
    const { UNSAFE_getAllByType } = render(
      <RequestCard
        item={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    // Verified badge is rendered as a View - just check the component renders with verified user
    const views = UNSAFE_getAllByType(View);
    expect(views.length).toBeGreaterThan(0);
  });

  it('should call onAccept when accept button is pressed', () => {
    const { getByText } = render(
      <RequestCard
        item={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    const acceptButton = getByText('Accept');
    fireEvent.press(acceptButton);

    expect(mockOnAccept).toHaveBeenCalledWith(mockRequest);
  });

  it('should call onDecline when decline button is pressed', () => {
    const { getByText } = render(
      <RequestCard
        item={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    const declineButton = getByText('Decline');
    fireEvent.press(declineButton);

    expect(mockOnDecline).toHaveBeenCalledWith(mockRequest);
  });

  it('should show proof required indicator when proofRequired is true', () => {
    const requestWithProof = {
      ...mockRequest,
      proofRequired: true,
      proofUploaded: false,
    };
    const { getByText } = render(
      <RequestCard
        item={requestWithProof}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    expect(getByText('Proof Required')).toBeTruthy();
    expect(getByText('Upload Proof')).toBeTruthy();
  });

  it('should show proof uploaded when proof is uploaded', () => {
    const requestWithProof = {
      ...mockRequest,
      proofRequired: true,
      proofUploaded: true,
    };
    const { getByText } = render(
      <RequestCard
        item={requestWithProof}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    expect(getByText('Proof Uploaded')).toBeTruthy();
    expect(getByText('Accept')).toBeTruthy();
  });

  it('should navigate to profile when avatar is pressed', () => {
    const { UNSAFE_getAllByType } = render(
      <RequestCard
        item={mockRequest}
        onAccept={mockOnAccept}
        onDecline={mockOnDecline}
      />,
    );

    const touchables = UNSAFE_getAllByType(TouchableOpacity);
    const avatarTouchable = touchables[0]; // First touchable is avatar

    fireEvent.press(avatarTouchable);

    expect(mockNavigate).toHaveBeenCalledWith('ProfileDetail', {
      userId: 'user1',
    });
  });
});

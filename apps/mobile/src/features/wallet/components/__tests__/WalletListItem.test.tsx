import React from 'react';
import { render } from '@testing-library/react-native';
import { WalletListItem } from '../WalletListItem';

describe('WalletListItem', () => {
  const mockWallet = {
    id: '1',
    name: 'Apple Pay',
    status: 'Connected',
  };

  const mockOnPress = jest.fn() as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render wallet name and status', () => {
    const { getByText } = render(
      <WalletListItem
        wallet={mockWallet}
        isDefault={false}
        onPress={mockOnPress}
      />,
    );

    expect(getByText('Apple Pay')).toBeTruthy();
    expect(getByText('Connected')).toBeTruthy();
  });

  it('should show default badge when isDefault is true', () => {
    const { getByText } = render(
      <WalletListItem
        wallet={mockWallet}
        isDefault={true}
        onPress={mockOnPress}
      />,
    );

    expect(getByText('Default')).toBeTruthy();
  });

  it('should not show default badge when isDefault is false', () => {
    const { queryByText } = render(
      <WalletListItem
        wallet={mockWallet}
        isDefault={false}
        onPress={mockOnPress}
      />,
    );

    expect(queryByText('Default')).toBeNull();
  });
});

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePaymentMethods } from '@/features/payments/hooks/usePaymentMethods';
import { logger } from '@/utils/logger';
import { Linking } from 'react-native';

// Mock dependencies
jest.mock('@/utils/logger');
jest.mock('@/hooks/useScreenPerformance', () => ({
  useScreenPerformance: () => ({
    trackMount: jest.fn() as jest.Mock,
    trackInteraction: jest.fn() as jest.Mock,
  }),
}));
jest.mock('@/context/ConfirmationContext', () => ({
  useConfirmation: () => ({
    showConfirmation: jest.fn().mockResolvedValue(true) as jest.Mock,
  }),
}));

// Mock Linking.canOpenURL to prevent async state updates
jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);

describe('usePaymentMethods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default cards', async () => {
    const { result } = renderHook(() => usePaymentMethods());

    // Wait for all useEffect async operations to complete
    await waitFor(() => {
      expect(result.current.isApplePayAvailable).toBe(true);
    });

    expect(result.current.savedCards).toHaveLength(4);
    expect(result.current.savedCards[0].isDefault).toBe(true);
  });

  it('should add a new card', async () => {
    const { result } = renderHook(() => usePaymentMethods());

    // Wait for all useEffect async operations to complete
    await waitFor(() => {
      expect(result.current.isApplePayAvailable).toBe(true);
    });

    await act(async () => {
      result.current.addCard('4111111111111111', '12/25', '123');
    });

    expect(result.current.savedCards).toHaveLength(5);
    expect(result.current.savedCards[4].brand).toBe('Visa');
    expect(result.current.savedCards[4].lastFour).toBe('1111');
  });

  it('should set card as default', async () => {
    const { result } = renderHook(() => usePaymentMethods());

    // Wait for all useEffect async operations to complete
    await waitFor(() => {
      expect(result.current.isApplePayAvailable).toBe(true);
    });

    const secondCardId = result.current.savedCards[1].id;

    await act(async () => {
      result.current.setCardAsDefault(secondCardId);
    });

    expect(result.current.savedCards[0].isDefault).toBe(false);
    expect(result.current.savedCards[1].isDefault).toBe(true);
    expect(result.current.walletSettings.isDefaultPayment).toBe(false);
  });

  it('should remove a card', async () => {
    const { result } = renderHook(() => usePaymentMethods());

    // Wait for all useEffect async operations to complete
    await waitFor(() => {
      expect(result.current.isApplePayAvailable).toBe(true);
    });

    const cardToRemove = result.current.savedCards[0].id;

    await act(async () => {
      result.current.removeCard(cardToRemove);
    });

    expect(result.current.savedCards).toHaveLength(3);
    expect(logger.info).toHaveBeenCalledWith('Remove card:', cardToRemove);
  });

  it('should update wallet settings', async () => {
    const { result } = renderHook(() => usePaymentMethods());

    // Wait for all useEffect async operations to complete
    await waitFor(() => {
      expect(result.current.isApplePayAvailable).toBe(true);
    });

    await act(async () => {
      result.current.updateWalletSettings({
        isDefaultPayment: true,
        requireAuth: true,
        enableNotifications: false,
      });
    });

    expect(result.current.walletSettings.isDefaultPayment).toBe(true);
    expect(result.current.walletSettings.enableNotifications).toBe(false);
    // Should unset all cards as default when wallet is default
    expect(result.current.savedCards.every((c) => !c.isDefault)).toBe(true);
  });

  it('should track wallet connection', async () => {
    const { result } = renderHook(() => usePaymentMethods());

    // Wait for all useEffect async operations to complete
    await waitFor(() => {
      expect(result.current.isApplePayAvailable).toBe(true);
    });

    expect(result.current.isWalletConnected).toBe(true);
  });
});

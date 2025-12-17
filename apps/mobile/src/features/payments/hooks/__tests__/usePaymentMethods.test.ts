import { renderHook, act } from '@testing-library/react-hooks';
import { usePaymentMethods } from '@/features/payments/hooks/usePaymentMethods';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('@/utils/logger');
jest.mock('@/hooks/useScreenPerformance', () => ({
  useScreenPerformance: () => ({
    trackMount: jest.fn(),
    trackInteraction: jest.fn(),
  }),
}));

describe('usePaymentMethods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default cards', () => {
    const { result } = renderHook(() => usePaymentMethods());

    expect(result.current.savedCards).toHaveLength(4);
    expect(result.current.savedCards[0].isDefault).toBe(true);
  });

  it('should add a new card', () => {
    const { result } = renderHook(() => usePaymentMethods());

    act(() => {
      result.current.addCard('4111111111111111', '12/25', '123');
    });

    expect(result.current.savedCards).toHaveLength(5);
    expect(result.current.savedCards[4].brand).toBe('Visa');
    expect(result.current.savedCards[4].lastFour).toBe('1111');
  });

  it('should set card as default', () => {
    const { result } = renderHook(() => usePaymentMethods());
    const secondCardId = result.current.savedCards[1].id;

    act(() => {
      result.current.setCardAsDefault(secondCardId);
    });

    expect(result.current.savedCards[0].isDefault).toBe(false);
    expect(result.current.savedCards[1].isDefault).toBe(true);
    expect(result.current.walletSettings.isDefaultPayment).toBe(false);
  });

  it('should remove a card', () => {
    const { result } = renderHook(() => usePaymentMethods());
    const cardToRemove = result.current.savedCards[0].id;

    act(() => {
      result.current.removeCard(cardToRemove);
    });

    expect(result.current.savedCards).toHaveLength(3);
    expect(logger.info).toHaveBeenCalledWith('Remove card:', cardToRemove);
  });

  it('should update wallet settings', () => {
    const { result } = renderHook(() => usePaymentMethods());

    act(() => {
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

  it('should track wallet connection', () => {
    const { result } = renderHook(() => usePaymentMethods());

    expect(result.current.isWalletConnected).toBe(true);
  });
});

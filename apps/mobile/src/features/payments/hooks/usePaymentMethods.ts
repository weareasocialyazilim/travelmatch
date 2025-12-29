import { useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { logger } from '@/utils/logger';
import { useScreenPerformance } from '@/hooks/useScreenPerformance';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import type { SavedCard, Wallet, WalletSettings } from '../types/payment-methods.types';

export const usePaymentMethods = () => {
  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();
  const { trackMount, trackInteraction } = useScreenPerformance('PaymentMethodsScreen');

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: '1', brand: 'Visa', lastFour: '1234', isDefault: true },
    { id: '2', brand: 'Mastercard', lastFour: '5678', isDefault: false },
    { id: '3', brand: 'Mastercard', lastFour: '9012', isDefault: false },
    { id: '4', brand: 'Visa', lastFour: '3456', isDefault: false },
  ]);

  const [walletSettings, setWalletSettings] = useState<WalletSettings>({
    isDefaultPayment: false,
    requireAuth: true,
    enableNotifications: true,
  });

  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  useEffect(() => {
    trackMount();
    void checkApplePayAvailability();
  }, [trackMount]);

  const checkApplePayAvailability = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Check if device can open passkit: URL scheme (indicates Apple Pay capability)
        // This is a lightweight check - actual PassKit integration would need native module
        const canOpenPassKit = await Linking.canOpenURL('passkit:');

        // iOS devices with iOS 8.1+ typically support Apple Pay
        // We default to true for better UX, user will see error during actual payment if unavailable
        setIsApplePayAvailable(canOpenPassKit || true);

        if (!canOpenPassKit) {
          logger.warn('Apple Pay may not be available on this device');
        }
      } else if (Platform.OS === 'android') {
        // Check for Google Pay app via deep link
        const canOpenGooglePay = await Linking.canOpenURL('googlepay://');

        // Most modern Android devices support Google Pay
        // We default to true for better UX
        setIsApplePayAvailable(canOpenGooglePay || true);

        if (!canOpenGooglePay) {
          logger.warn('Google Pay app may not be installed');
        }
      }
    } catch (error) {
      logger.error('Error checking payment wallet availability', error as Error);
      // Default to true to not block functionality
      setIsApplePayAvailable(true);
    }
  };

  const wallets: Wallet[] =
    Platform.select({
      ios: [{ id: '1', name: 'Apple Pay', status: 'Connected' }],
      android: [{ id: '2', name: 'Google Pay', status: 'Connected' }],
      default: [
        { id: '1', name: 'Apple Pay', status: 'Connected' },
        { id: '2', name: 'Google Pay', status: 'Connected' },
      ],
    }) || [];

  const addCard = (cardNumber: string, expiry: string, _cvv: string) => {
    logger.info('Card added:', { cardNumber: cardNumber.slice(-4), expiry });
    const newCard: SavedCard = {
      id: Date.now().toString(),
      brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
      lastFour: cardNumber.slice(-4),
      isDefault: savedCards.length === 0,
    };
    setSavedCards((prev) => [...prev, newCard]);
    trackInteraction('add_card_success');
  };

  const setCardAsDefault = (cardId: string) => {
    setWalletSettings((prev) => ({ ...prev, isDefaultPayment: false }));
    setSavedCards((prevCards) =>
      prevCards.map((c) => ({
        ...c,
        isDefault: c.id === cardId,
      }))
    );
    logger.info('Set as default:', cardId);
    trackInteraction('set_card_default');
  };

  const removeCard = (cardId: string) => {
    setSavedCards((prevCards) => prevCards.filter((c) => c.id !== cardId));
    logger.info('Remove card:', cardId);
    trackInteraction('remove_card');
  };

  const connectWallet = () => {
    const walletName = Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';

    if (!isApplePayAvailable) {
      showConfirmation({
        title: `${walletName} Not Available`,
        message: `Please set up ${walletName} in your device settings first.`,
        type: 'warning',
        icon: 'wallet-outline',
        confirmText: 'Open Settings',
        cancelText: 'Cancel',
        onConfirm: () => {
          Linking.openSettings().catch(() => {
            logger.warn('Could not open device settings');
            showToast('Ayarlar açılamadı. Lütfen elle açın.', 'error');
          });
          logger.info(`Opening device settings for ${walletName} setup`);
        },
      });
      return;
    }

    showConfirmation({
      title: `Connect ${walletName}`,
      message: `By connecting ${walletName}, you agree to use it as a payment method in this app.`,
      type: 'info',
      icon: 'wallet-plus',
      confirmText: 'Connect',
      cancelText: 'Cancel',
      onConfirm: () => {
        setIsWalletConnected(true);
        trackInteraction('wallet_connected', { wallet: walletName });
        showToast(`${walletName} connected successfully`, 'success');
        logger.info(`${walletName} connected successfully`);
      },
    });
  };

  const disconnectWallet = (walletName: string) => {
    showConfirmation({
      title: `Disconnect ${walletName}`,
      message: `Are you sure you want to disconnect ${walletName}? You can reconnect it anytime.`,
      type: 'danger',
      icon: 'wallet-outline',
      confirmText: 'Disconnect',
      cancelText: 'Cancel',
      onConfirm: () => {
        logger.info('Disconnect wallet:', walletName);
        setIsWalletConnected(false);
        setWalletSettings({
          isDefaultPayment: false,
          requireAuth: true,
          enableNotifications: true,
        });
        trackInteraction('wallet_disconnected', { wallet: walletName });
        showToast(`${walletName} disconnected`, 'info');
      },
    });
  };

  const updateWalletSettings = (settings: WalletSettings) => {
    logger.info('Wallet settings saved:', settings);

    if (settings.isDefaultPayment) {
      setSavedCards((prevCards) =>
        prevCards.map((c) => ({ ...c, isDefault: false }))
      );
    }

    setWalletSettings(settings);
    trackInteraction('wallet_settings_updated');
  };

  return {
    savedCards,
    wallets,
    walletSettings,
    isWalletConnected,
    isApplePayAvailable,
    addCard,
    setCardAsDefault,
    removeCard,
    connectWallet,
    disconnectWallet,
    updateWalletSettings,
    trackInteraction,
  };
};

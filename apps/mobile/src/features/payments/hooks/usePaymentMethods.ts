import { useState, useEffect } from 'react';
import { Platform, Linking } from 'react-native';
import { logger } from '@/utils/logger';
import { useScreenPerformance } from '@/hooks/useScreenPerformance';
import type { SavedCard, Wallet, WalletSettings } from '../types/payment-methods.types';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

export const usePaymentMethods = () => {
    const { showToast } = useToast();
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
    checkApplePayAvailability();
  }, [trackMount]);

  const checkApplePayAvailability = () => {
    if (Platform.OS === 'ios') {
      // TODO: Implement real PassKit check when native module is available
      setIsApplePayAvailable(true);
    } else if (Platform.OS === 'android') {
      // TODO: Implement Google Pay availability check
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
      Alert.alert(
        `${walletName} Not Available`,
        `Please set up ${walletName} in your device settings first.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings().catch(() => {
                logger.warn('Could not open device settings');
              });
              logger.info(`Opening device settings for ${walletName} setup`);
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      `Connect ${walletName}`,
      `By connecting ${walletName}, you agree to use it as a payment method in this app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => {
            setIsWalletConnected(true);
            trackInteraction('wallet_connected', { wallet: walletName });
            logger.info(`${walletName} connected successfully`);
          },
        },
      ]
    );
  };

  const disconnectWallet = (walletName: string) => {
    Alert.alert(
      `Disconnect ${walletName}`,
      `Are you sure you want to disconnect ${walletName}? You can reconnect it anytime.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            logger.info('Disconnect wallet:', walletName);
            setIsWalletConnected(false);
            setWalletSettings({
              isDefaultPayment: false,
              requireAuth: true,
              enableNotifications: true,
            });
            trackInteraction('wallet_disconnected', { wallet: walletName });
          },
        },
      ]
    );
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

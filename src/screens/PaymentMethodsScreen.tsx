import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Switch,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { AddCardBottomSheet } from '../components/AddCardBottomSheet';
import BottomNav from '../components/BottomNav';
import { ScreenErrorBoundary } from '../components/ErrorBoundary';
import { RemoveCardModal } from '../components/RemoveCardModal';
import { useScreenPerformance } from '../hooks/useScreenPerformance';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

interface Wallet {
  id: string;
  name: string;
  status: string;
}

interface SavedCard {
  id: string;
  brand: string;
  lastFour: string;
  isDefault: boolean;
}

const PaymentMethodsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { trackMount, trackInteraction } = useScreenPerformance(
    'PaymentMethodsScreen',
  );

  const [isAddCardVisible, setIsAddCardVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isCardOptionsVisible, setIsCardOptionsVisible] = useState(false);
  const [isEditCardVisible, setIsEditCardVisible] = useState(false);
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isWalletOptionsVisible, setIsWalletOptionsVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isConfigureWalletVisible, setIsConfigureWalletVisible] =
    useState(false);
  const [walletSettings, setWalletSettings] = useState({
    isDefaultPayment: false,
    requireAuth: true,
    enableNotifications: true,
  });
  const [isWalletConnected, setIsWalletConnected] = useState(true);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: '1', brand: 'Visa', lastFour: '1234', isDefault: true },
    { id: '2', brand: 'Mastercard', lastFour: '5678', isDefault: false },
    { id: '3', brand: 'Mastercard', lastFour: '9012', isDefault: false },
    { id: '4', brand: 'Visa', lastFour: '3456', isDefault: false },
  ]);

  useEffect(() => {
    trackMount();
    checkApplePayAvailability();
  }, [trackMount]);

  const checkApplePayAvailability = () => {
    if (Platform.OS === 'ios') {
      // TODO: Implement real PassKit check when native module is available
      // const isAvailable = await PassKit.canMakePayments();
      // setIsApplePayAvailable(isAvailable);
      setIsApplePayAvailable(true);
    } else if (Platform.OS === 'android') {
      // TODO: Implement Google Pay availability check
      setIsApplePayAvailable(true);
    }
  };

  // Platform'a göre wallet listesi
  const wallets: Wallet[] =
    Platform.select({
      ios: [{ id: '1', name: 'Apple Pay', status: 'Connected' }],
      android: [{ id: '2', name: 'Google Pay', status: 'Connected' }],
      default: [
        { id: '1', name: 'Apple Pay', status: 'Connected' },
        { id: '2', name: 'Google Pay', status: 'Connected' },
      ],
    }) || [];

  const handleAddCard = () => {
    trackInteraction('add_card');
    logger.info('Add new card');
    setIsAddCardVisible(true);
  };

  const handleConnectWallet = () => {
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
        ],
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
      ],
    );
  };

  const handleWalletPress = (wallet: Wallet) => {
    trackInteraction('wallet_press', { wallet: wallet.name });
    logger.info('Wallet pressed:', wallet.name);
    setSelectedWallet(wallet);
    setIsWalletOptionsVisible(true);
  };

  const handleCardPress = (card: SavedCard) => {
    trackInteraction('card_press', { card: card.lastFour });
    logger.info('Card pressed:', card.lastFour);
    setSelectedCard(card);
    setIsCardOptionsVisible(true);
  };

  const handleSetAsDefault = () => {
    if (selectedCard && !selectedCard.isDefault) {
      // Kartı default yap ve wallet'ın default'unu kaldır
      setWalletSettings((prev) => ({ ...prev, isDefaultPayment: false }));

      setSavedCards((prevCards) =>
        prevCards.map((c) => ({
          ...c,
          isDefault: c.id === selectedCard.id,
        })),
      );
      logger.info('Set as default:', selectedCard.lastFour);
    }
    setIsCardOptionsVisible(false);
  };

  const handleEditCard = () => {
    setIsCardOptionsVisible(false);
    setCardExpiry('');
    setCardCvv('');
    setIsEditCardVisible(true);
    logger.info('Edit card:', selectedCard?.lastFour);
  };

  const formatExpiryDate = (text: string) => {
    // Sadece rakamları al
    const cleaned = text.replace(/\D/g, '');

    // MM/YY formatına çevir
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleExpiryChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setCardExpiry(formatted);
  };

  const handleSaveCardEdit = () => {
    if (selectedCard && cardExpiry && cardCvv) {
      logger.info('Card updated:', {
        lastFour: selectedCard.lastFour,
        expiry: cardExpiry,
        cvv: cardCvv,
      });
      // Burada card bilgilerini güncelleyebilirsiniz
      setCardExpiry('');
      setCardCvv('');
    }
    setIsEditCardVisible(false);
    setSelectedCard(null);
  };

  const handleRemoveCard = () => {
    setIsCardOptionsVisible(false);
    setIsRemoveModalVisible(true);
  };

  const confirmRemoveCard = () => {
    if (selectedCard) {
      setSavedCards((prevCards) =>
        prevCards.filter((c) => c.id !== selectedCard.id),
      );
      logger.info('Remove card:', selectedCard.lastFour);
    }
    setIsRemoveModalVisible(false);
    setSelectedCard(null);
  };

  const handleSaveWalletSettings = () => {
    logger.info('Wallet settings saved:', walletSettings);

    // Eğer wallet default yapıldıysa, kartların default'unu kaldır
    if (walletSettings.isDefaultPayment) {
      setSavedCards((prevCards) =>
        prevCards.map((c) => ({
          ...c,
          isDefault: false,
        })),
      );
    }

    setIsConfigureWalletVisible(false);
    setSelectedWallet(null);
  };

  const handleDisconnectWallet = () => {
    const walletName =
      selectedWallet?.name ||
      (Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay');

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
            setIsWalletOptionsVisible(false);
            setSelectedWallet(null);
            trackInteraction('wallet_disconnected', { wallet: walletName });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment methods</Text>
          <View style={styles.backButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
        >
          {/* Wallets Section */}
          <Text style={styles.sectionTitle}>
            {isWalletConnected ? 'Wallets' : 'Digital Wallets'}
          </Text>
          {isWalletConnected ? (
            <View style={styles.section}>
              {wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={styles.walletItem}
                  onPress={() => handleWalletPress(wallet)}
                  activeOpacity={0.7}
                >
                  <View style={styles.walletIcon}>
                    <MaterialCommunityIcons
                      name={Platform.OS === 'ios' ? 'apple' : 'google'}
                      size={24}
                      color={COLORS.text}
                    />
                  </View>
                  <View style={styles.walletInfo}>
                    <View style={styles.walletNameRow}>
                      <Text style={styles.walletName}>{wallet.name}</Text>
                      {walletSettings.isDefaultPayment && (
                        <View style={styles.defaultBadgeSmall}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.walletStatus}>{wallet.status}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={COLORS.softGray}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.connectWalletButton}
                onPress={handleConnectWallet}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={Platform.OS === 'ios' ? 'apple' : 'google'}
                  size={24}
                  color={COLORS.text}
                />
                <Text style={styles.connectWalletText}>
                  Connect {Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay'}
                </Text>
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={20}
                  color={COLORS.text}
                />
              </TouchableOpacity>
              <Text style={styles.walletHelpText}>
                {Platform.OS === 'ios'
                  ? 'Make sure Apple Pay is set up on your device'
                  : 'Make sure Google Pay is set up on your device'}
              </Text>
            </View>
          )}

          {/* Cards Section */}
          <Text style={styles.sectionTitle}>Cards</Text>
          <View style={styles.section}>
            {savedCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.cardItem}
                onPress={() => handleCardPress(card)}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  <MaterialCommunityIcons
                    name={
                      card.brand === 'Visa'
                        ? 'credit-card'
                        : 'credit-card-outline'
                    }
                    size={20}
                    color={
                      card.brand === 'Visa' ? COLORS.visa : COLORS.mastercard
                    }
                  />
                </View>
                <View style={styles.cardTextContainer}>
                  <View style={styles.cardNameRow}>
                    <Text style={styles.cardText}>•••• {card.lastFour}</Text>
                    {card.isDefault && !walletSettings.isDefaultPayment && (
                      <View style={styles.defaultBadgeSmall}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardBrand}>{card.brand}</Text>
                </View>
                {card.isDefault && (
                  <View style={styles.defaultBadge}>
                    <View style={styles.defaultDot} />
                  </View>
                )}
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.softGray}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Priority Notice */}
          <View style={styles.priorityNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={COLORS.brown}
            />
            <View style={styles.priorityNoticeText}>
              <Text style={styles.priorityNoticeTitle}>Payment Priority</Text>
              <Text style={styles.priorityNoticeDescription}>
                {isWalletConnected && walletSettings.isDefaultPayment
                  ? `${
                      wallets[0]?.name ?? 'Wallet'
                    } will be used for all payments. Cards are backup options.`
                  : savedCards.find((c) => c.isDefault)
                  ? `${
                      savedCards.find((c) => c.isDefault)?.brand ?? 'Card'
                    } •••• ${
                      savedCards.find((c) => c.isDefault)?.lastFour ?? '****'
                    } will be used for payments.`
                  : 'Please set a default payment method.'}
              </Text>
            </View>
          </View>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color={COLORS.textSecondary}
            />
            <Text style={styles.securityText}>
              All payment data is encrypted and{'\n'}securely stored. We never
              store full card numbers.
            </Text>
          </View>

          {/* Add Card Button */}
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={handleAddCard}
            activeOpacity={0.7}
          >
            <Text style={styles.addCardButtonText}>Add new card</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab="Profile" />

      <AddCardBottomSheet
        visible={isAddCardVisible}
        onClose={() => setIsAddCardVisible(false)}
        onAddCard={(cardNumber: string, expiry: string, _cvv: string) => {
          logger.info('Card added:', {
            cardNumber: cardNumber.slice(-4),
            expiry,
          });
          setIsAddCardVisible(false);
          const newCard: SavedCard = {
            id: Date.now().toString(),
            brand: cardNumber.startsWith('4') ? 'Visa' : 'Mastercard',
            lastFour: cardNumber.slice(-4),
            isDefault: savedCards.length === 0,
          };
          setSavedCards((prev) => [...prev, newCard]);
        }}
      />

      <RemoveCardModal
        visible={isRemoveModalVisible}
        cardLast4={selectedCard?.lastFour}
        onCancel={() => {
          setIsRemoveModalVisible(false);
          setSelectedCard(null);
        }}
        onRemove={confirmRemoveCard}
      />

      {/* Wallet Options Bottom Sheet */}
      <Modal
        visible={isWalletOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsWalletOptionsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouchable}
            activeOpacity={1}
            onPress={() => setIsWalletOptionsVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>{selectedWallet?.name}</Text>
            <Text style={styles.sheetSubtitle}>
              Manage your wallet connection
            </Text>

            <View style={styles.sheetOptions}>
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={() => {
                  setIsWalletOptionsVisible(false);
                  setIsConfigureWalletVisible(true);
                  logger.info('Configure wallet:', selectedWallet?.name);
                }}
              >
                <MaterialCommunityIcons
                  name="cog-outline"
                  size={24}
                  color={COLORS.brown}
                />
                <Text style={styles.sheetOptionText}>Configure Wallet</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleDisconnectWallet}
              >
                <MaterialCommunityIcons
                  name="link-variant-off"
                  size={24}
                  color={COLORS.error}
                />
                <Text
                  style={[styles.sheetOptionText, styles.sheetOptionDanger]}
                >
                  Disconnect Wallet
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sheetOption, styles.sheetOptionCancel]}
                onPress={() => setIsWalletOptionsVisible(false)}
              >
                <Text style={styles.sheetOptionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Card Bottom Sheet */}
      <Modal
        visible={isEditCardVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditCardVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouchable}
            activeOpacity={1}
            onPress={() => setIsEditCardVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>Edit Card</Text>
            <Text style={styles.sheetSubtitle}>
              {selectedCard?.brand} •••• {selectedCard?.lastFour}
            </Text>

            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor={COLORS.textSecondary}
                  value={cardExpiry}
                  onChangeText={handleExpiryChange}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="•••"
                  placeholderTextColor={COLORS.textSecondary}
                  value={cardCvv}
                  onChangeText={setCardCvv}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>

              <Text style={styles.editNote}>
                For security reasons, you cannot change the card number.
              </Text>
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonSecondary]}
                onPress={() => setIsEditCardVisible(false)}
              >
                <Text style={styles.editButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, styles.editButtonPrimary]}
                onPress={handleSaveCardEdit}
              >
                <Text style={styles.editButtonPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Configure Wallet Bottom Sheet */}
      <Modal
        visible={isConfigureWalletVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsConfigureWalletVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouchable}
            activeOpacity={1}
            onPress={() => setIsConfigureWalletVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              {selectedWallet?.name} Settings
            </Text>
            <Text style={styles.sheetSubtitle}>
              Configure your wallet preferences
            </Text>

            <ScrollView
              style={styles.configureScroll}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.configureContent}>
                <TouchableOpacity
                  style={styles.configureItem}
                  onPress={() =>
                    setWalletSettings((prev) => ({
                      ...prev,
                      isDefaultPayment: !prev.isDefaultPayment,
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.configureIcon}>
                    <MaterialCommunityIcons
                      name="credit-card-check"
                      size={24}
                      color={COLORS.brown}
                    />
                  </View>
                  <View style={styles.configureText}>
                    <Text style={styles.configureTitle}>Default Payment</Text>
                    <Text style={styles.configureDescription}>
                      Use {selectedWallet?.name} as default payment method
                    </Text>
                    {walletSettings.isDefaultPayment && (
                      <Text style={styles.configureWarning}>
                        ⚠️ This will override any default cards
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={walletSettings.isDefaultPayment}
                    onValueChange={(value) =>
                      setWalletSettings((prev) => ({
                        ...prev,
                        isDefaultPayment: value,
                      }))
                    }
                    trackColor={{ false: COLORS.softGray, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.configureItem}
                  onPress={() =>
                    setWalletSettings((prev) => ({
                      ...prev,
                      requireAuth: !prev.requireAuth,
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.configureIcon}>
                    <MaterialCommunityIcons
                      name="shield-check"
                      size={24}
                      color={COLORS.brown}
                    />
                  </View>
                  <View style={styles.configureText}>
                    <Text style={styles.configureTitle}>Security</Text>
                    <Text style={styles.configureDescription}>
                      Require authentication for purchases
                    </Text>
                  </View>
                  <Switch
                    value={walletSettings.requireAuth}
                    onValueChange={(value) =>
                      setWalletSettings((prev) => ({
                        ...prev,
                        requireAuth: value,
                      }))
                    }
                    trackColor={{ false: COLORS.softGray, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.configureItem}
                  onPress={() =>
                    setWalletSettings((prev) => ({
                      ...prev,
                      enableNotifications: !prev.enableNotifications,
                    }))
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.configureIcon}>
                    <MaterialCommunityIcons
                      name="bell-outline"
                      size={24}
                      color={COLORS.brown}
                    />
                  </View>
                  <View style={styles.configureText}>
                    <Text style={styles.configureTitle}>Notifications</Text>
                    <Text style={styles.configureDescription}>
                      Get notified for all transactions
                    </Text>
                  </View>
                  <Switch
                    value={walletSettings.enableNotifications}
                    onValueChange={(value) =>
                      setWalletSettings((prev) => ({
                        ...prev,
                        enableNotifications: value,
                      }))
                    }
                    trackColor={{ false: COLORS.softGray, true: COLORS.mint }}
                    thumbColor={COLORS.white}
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.configureFooter}>
              <TouchableOpacity
                style={styles.configureButton}
                onPress={handleSaveWalletSettings}
              >
                <Text style={styles.configureButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Card Options Bottom Sheet */}
      <Modal
        visible={isCardOptionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCardOptionsVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalBackdropTouchable}
            activeOpacity={1}
            onPress={() => setIsCardOptionsVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              {selectedCard?.brand} •••• {selectedCard?.lastFour}
            </Text>
            <Text style={styles.sheetSubtitle}>Manage this card</Text>

            <View style={styles.sheetOptions}>
              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleSetAsDefault}
              >
                <MaterialCommunityIcons
                  name={
                    selectedCard?.isDefault ? 'check-circle' : 'circle-outline'
                  }
                  size={24}
                  color={
                    selectedCard?.isDefault
                      ? COLORS.brown
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.sheetOptionText,
                    selectedCard?.isDefault && styles.sheetOptionTextActive,
                  ]}
                >
                  {selectedCard?.isDefault ? 'Default Card' : 'Set as Default'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleEditCard}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={24}
                  color={COLORS.brown}
                />
                <Text style={styles.sheetOptionText}>Edit Card Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOption}
                onPress={handleRemoveCard}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={24}
                  color={COLORS.error}
                />
                <Text
                  style={[styles.sheetOptionText, styles.sheetOptionDanger]}
                >
                  Remove Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sheetOption, styles.sheetOptionCancel]}
                onPress={() => setIsCardOptionsVisible(false)}
              >
                <Text style={styles.sheetOptionCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.softGray,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  section: {
    paddingHorizontal: 16,
    gap: 8,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  walletIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.beige,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  walletStatus: {
    fontSize: 13,
    color: COLORS.brown,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  cardIcon: {
    width: 48,
    height: 32,
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.softGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  defaultBadge: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  defaultDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.greenSuccess,
  },
  defaultBadgeSmall: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  priorityNotice: {
    flexDirection: 'row',
    backgroundColor: COLORS.amberLight,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  priorityNoticeText: {
    flex: 1,
  },
  priorityNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  priorityNoticeDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginTop: 24,
    gap: 8,
  },
  securityText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  addCardButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.mint,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.overlay50,
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.softGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  sheetOptions: {
    gap: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.softGray,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  sheetOptionTextActive: {
    color: COLORS.brown,
    fontWeight: '600',
  },
  sheetOptionDanger: {
    color: COLORS.error,
  },
  sheetOptionCancel: {
    marginTop: 8,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.softGray,
  },
  sheetOptionCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  editForm: {
    gap: 16,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.softGray,
    fontSize: 16,
    color: COLORS.text,
  },
  editNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonSecondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.softGray,
  },
  editButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  editButtonPrimary: {
    backgroundColor: COLORS.mint,
  },
  editButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  configureContent: {
    gap: 16,
  },
  configureScroll: {
    maxHeight: 280,
    marginBottom: 20,
  },
  configureFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.softGray,
    paddingTop: 20,
    marginTop: 4,
  },
  configureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  configureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configureText: {
    flex: 1,
  },
  configureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  configureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  configureWarning: {
    fontSize: 11,
    color: COLORS.amberDark,
    marginTop: 4,
    fontStyle: 'italic',
  },
  configureButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configureButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  connectWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.softGray,
    borderStyle: 'dashed',
  },
  connectWalletText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  walletHelpText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 24,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});

// Wrap with ScreenErrorBoundary for critical payment functionality
const PaymentMethodsScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <PaymentMethodsScreen />
  </ScreenErrorBoundary>
);

export default PaymentMethodsScreenWithErrorBoundary;

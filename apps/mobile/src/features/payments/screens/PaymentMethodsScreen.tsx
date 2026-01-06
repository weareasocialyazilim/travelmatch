import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import { NetworkGuard } from '@/components/NetworkGuard';
import { AddCardBottomSheet } from '@/features/wallet/components/AddCardBottomSheet';
import BottomNav from '@/components/BottomNav';
import { ScreenErrorBoundary } from '@/components/ErrorBoundary';
import { RemoveCardModal } from '@/features/wallet/components/RemoveCardModal';
import { CardListItem } from '../components/CardListItem';
import { PaymentPriorityNotice } from '../components/PaymentPriorityNotice';
import { CardOptionsModal } from '../components/CardOptionsModal';
import { EditCardModal } from '../components/EditCardModal';
import {
  WalletListItem,
  WalletConnectButton,
  WalletOptionsModal,
  WalletConfigModal,
} from '../components/WalletComponents';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';
import type { SavedCard, Wallet } from '../types/payment-methods.types';

const PaymentMethodsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const {
    savedCards,
    wallets,
    walletSettings,
    isWalletConnected,
    addCard,
    updateCard,
    setCardAsDefault,
    removeCard,
    connectWallet,
    disconnectWallet,
    updateWalletSettings,
    trackInteraction,
  } = usePaymentMethods();

  const [isAddCardVisible, setIsAddCardVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SavedCard | null>(null);
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false);
  const [isCardOptionsVisible, setIsCardOptionsVisible] = useState(false);
  const [isEditCardVisible, setIsEditCardVisible] = useState(false);
  const [isWalletOptionsVisible, setIsWalletOptionsVisible] = useState(false);
  const [isWalletConfigVisible, setIsWalletConfigVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

  const handleAddCard = () => {
    trackInteraction('add_card');
    logger.info('Add new card');
    setIsAddCardVisible(true);
  };

  const handleCardPress = (card: SavedCard) => {
    trackInteraction('card_press', { card: card.lastFour });
    logger.info('Card pressed:', card.lastFour);
    setSelectedCard(card);
    setIsCardOptionsVisible(true);
  };

  const handleWalletPress = (wallet: Wallet) => {
    trackInteraction('wallet_press', { wallet: wallet.name });
    logger.info('Wallet pressed:', wallet.name);
    setSelectedWallet(wallet);
    setIsWalletOptionsVisible(true);
  };

  const handleSetAsDefault = () => {
    if (selectedCard && !selectedCard.isDefault) {
      setCardAsDefault(selectedCard.id);
    }
    setIsCardOptionsVisible(false);
  };

  const handleRemoveCard = () => {
    setIsCardOptionsVisible(false);
    setIsRemoveModalVisible(true);
  };

  const confirmRemoveCard = () => {
    if (selectedCard) {
      removeCard(selectedCard.id);
    }
    setIsRemoveModalVisible(false);
    setSelectedCard(null);
  };

  const handleDisconnectWallet = () => {
    if (selectedWallet) {
      disconnectWallet(selectedWallet.name);
      setIsWalletOptionsVisible(false);
      setSelectedWallet(null);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <NetworkGuard offlineMessage="İnternet bağlantısı gerekli. Ödeme yöntemlerini yönetmek için lütfen bağlanın.">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ödeme Yöntemleri</Text>
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
              {isWalletConnected ? 'Cüzdanlar' : 'Dijital Cüzdanlar'}
            </Text>
            <View style={styles.section}>
              {isWalletConnected ? (
                wallets.map((wallet) => (
                  <WalletListItem
                    key={wallet.id}
                    wallet={wallet}
                    isDefault={walletSettings.isDefaultPayment}
                    onPress={handleWalletPress}
                  />
                ))
              ) : (
                <WalletConnectButton onPress={connectWallet} />
              )}
            </View>

            {/* Cards Section */}
            <Text style={styles.sectionTitle}>Kartlar</Text>
            <View style={styles.section}>
              {savedCards.map((card) => (
                <CardListItem
                  key={card.id}
                  card={card}
                  showDefault={!walletSettings.isDefaultPayment}
                  onPress={handleCardPress}
                />
              ))}
            </View>

            {/* Payment Priority Notice */}
            <PaymentPriorityNotice
              wallets={wallets}
              savedCards={savedCards}
              walletSettings={walletSettings}
              isWalletConnected={isWalletConnected}
            />

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.securityText}>
                Tüm ödeme verileri şifreli ve{'\n'}güvenli bir şekilde saklanır.
                Tam kart numaralarını asla saklamayız.
              </Text>
            </View>

            {/* Add Card Button */}
            <TouchableOpacity
              testID="add-card-button"
              style={styles.addCardButton}
              onPress={handleAddCard}
              activeOpacity={0.7}
            >
              <Text style={styles.addCardButtonText}>Yeni Kart Ekle</Text>
            </TouchableOpacity>
          </ScrollView>
        </NetworkGuard>
      </SafeAreaView>

      <BottomNav activeTab="Profile" />

      <AddCardBottomSheet
        visible={isAddCardVisible}
        onClose={() => setIsAddCardVisible(false)}
        onAddCard={(cardNumber: string, expiry: string, cvv: string) => {
          addCard(cardNumber, expiry, cvv);
          setIsAddCardVisible(false);
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

      <CardOptionsModal
        visible={isCardOptionsVisible}
        card={selectedCard}
        onClose={() => {
          setIsCardOptionsVisible(false);
          setSelectedCard(null);
        }}
        onSetDefault={handleSetAsDefault}
        onEdit={() => {
          setIsCardOptionsVisible(false);
          setIsEditCardVisible(true);
        }}
        onRemove={handleRemoveCard}
      />

      <EditCardModal
        visible={isEditCardVisible}
        card={selectedCard}
        onClose={() => {
          setIsEditCardVisible(false);
          setSelectedCard(null);
        }}
        onSave={updateCard}
      />

      <WalletOptionsModal
        visible={isWalletOptionsVisible}
        wallet={selectedWallet}
        onClose={() => {
          setIsWalletOptionsVisible(false);
          setSelectedWallet(null);
        }}
        onSetDefault={() => {
          // TODO: Implement set default wallet
          setIsWalletOptionsVisible(false);
        }}
        onConfigure={() => {
          setIsWalletOptionsVisible(false);
          setIsWalletConfigVisible(true);
        }}
        onDisconnect={handleDisconnectWallet}
      />

      <WalletConfigModal
        visible={isWalletConfigVisible}
        wallet={selectedWallet}
        settings={walletSettings}
        onClose={() => {
          setIsWalletConfigVisible(false);
          setSelectedWallet(null);
        }}
        onSave={updateWalletSettings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
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
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 24,
  },
  section: {
    marginBottom: 8,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  securityText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  addCardButton: {
    backgroundColor: COLORS.mint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  addCardButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

const PaymentMethodsScreenWithErrorBoundary = () => (
  <ScreenErrorBoundary>
    <PaymentMethodsScreen />
  </ScreenErrorBoundary>
);

export default PaymentMethodsScreenWithErrorBoundary;

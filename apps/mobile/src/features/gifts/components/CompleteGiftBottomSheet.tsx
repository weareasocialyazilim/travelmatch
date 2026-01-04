import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface CompleteGiftBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (paymentMethod: string) => void;
  amount: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CompleteGiftBottomSheet: React.FC<
  CompleteGiftBottomSheetProps
> = ({ visible, onClose, onComplete, amount }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [useSavedCard, setUseSavedCard] = useState(false);

  const translateY = useSharedValue(500);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 120 });
      opacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withTiming(500, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const savedCard = {
    brand: 'Visa',
    lastFour: '1234',
  };

  const handlePayWithApplePay = () => {
    onComplete('apple-pay');
  };

  const handlePayWithGooglePay = () => {
    onComplete('google-pay');
  };

  const handlePayWithCard = () => {
    if (useSavedCard) {
      onComplete('saved-card');
    } else {
      onComplete('new-card');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <Animated.View style={[styles.bottomSheet, animatedStyle]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Text style={styles.title}>Complete your gift</Text>
            <Text style={styles.subtitle}>Moment subtitle</Text>

            {/* Amount with Green Dot */}
            <View style={styles.amountRow}>
              <Text style={styles.amountText}>${amount.toFixed(2)}</Text>
              <View style={styles.statusDot} />
            </View>

            {/* Digital Wallets */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.walletButton}
                onPress={handlePayWithApplePay}
              >
                <Text style={styles.walletButtonText}>Apple Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.walletButton}
                onPress={handlePayWithGooglePay}
              >
                <Text style={styles.walletButtonText}>Google Pay</Text>
              </TouchableOpacity>
            </View>

            {/* Card Payment */}
            <Text style={styles.sectionTitle}>Or pay with card</Text>

            <TextInput
              style={styles.input}
              placeholder="Card number"
              placeholderTextColor={COLORS.brown}
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Expiry"
                placeholderTextColor={COLORS.brown}
                value={expiry}
                onChangeText={setExpiry}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVC"
                placeholderTextColor={COLORS.brown}
                value={cvc}
                onChangeText={setCvc}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Name on card"
              placeholderTextColor={COLORS.brown}
              value={nameOnCard}
              onChangeText={setNameOnCard}
            />

            {/* Saved Cards */}
            <Text style={styles.sectionTitle}>Saved cards</Text>

            <TouchableOpacity
              style={styles.savedCardRow}
              onPress={() => setUseSavedCard(!useSavedCard)}
            >
              <View style={styles.savedCardInfo}>
                <View style={styles.cardBrandPlaceholder} />
                <Text style={styles.savedCardText}>
                  {savedCard.brand} ... {savedCard.lastFour}
                </Text>
              </View>
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    useSavedCard && styles.checkboxChecked,
                  ]}
                >
                  {useSavedCard && (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={COLORS.text.primary}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Escrow Notice */}
            <Text style={styles.notice}>
              Your gift is held in escrow until the moment is verified.
            </Text>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePayWithCard}
              >
                <Text style={styles.primaryButtonText}>
                  Pay ${amount.toFixed(2)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.darkOverlay,
  },
  bottomSheet: {
    maxHeight: SCREEN_HEIGHT * 0.9,
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.beige,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.brown,
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 12,
  },
  amountText: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.greenSuccess,
  },
  section: {
    gap: 12,
    marginBottom: 24,
  },
  walletButton: {
    height: 40,
    backgroundColor: COLORS.beigeLight,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    height: 56,
    backgroundColor: COLORS.beigeLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  savedCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 12,
  },
  savedCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardBrandPlaceholder: {
    width: 40,
    height: 24,
    backgroundColor: COLORS.beige,
    borderRadius: 4,
  },
  savedCardText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  checkboxContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.beige,
    backgroundColor: COLORS.utility.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },
  notice: {
    fontSize: 14,
    color: COLORS.brown,
    textAlign: 'center',
    marginVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.orange,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.beigeLight,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});

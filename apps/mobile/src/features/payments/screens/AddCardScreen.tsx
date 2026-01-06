import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FlipInYRight } from 'react-native-reanimated';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';
import { securePaymentService } from '@/services/securePaymentService';
import { showError, showSuccess } from '@/stores/modalStore';
import { logger } from '@/utils/logger';

const { width: _width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'AddCard'>;

export const AddCardScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Format card number (**** **** **** ****)
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/.{1,4}/g);
    return match ? match.join(' ') : cleaned;
  };

  // Format expiry date (MM/YY)
  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  // Validate card details
  const validateCard = useCallback(() => {
    const cleanedNumber = cardNumber.replace(/\s/g, '');

    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      showError({
        title: 'Invalid Card',
        message: 'Please enter a valid card number',
      });
      return false;
    }

    if (!cardName.trim() || cardName.trim().length < 3) {
      showError({
        title: 'Invalid Name',
        message: 'Please enter the cardholder name',
      });
      return false;
    }

    const [month, year] = expiry.split('/');
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);

    if (!expMonth || expMonth < 1 || expMonth > 12) {
      showError({
        title: 'Invalid Expiry',
        message: 'Please enter a valid expiry month (01-12)',
      });
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;

    if (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    ) {
      showError({ title: 'Card Expired', message: 'This card has expired' });
      return false;
    }

    if (cvc.length < 3) {
      showError({
        title: 'Invalid CVV',
        message: 'Please enter a valid CVV code',
      });
      return false;
    }

    return true;
  }, [cardNumber, cardName, expiry, cvc]);

  const handleNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const handleExpiryChange = (text: string) => {
    // Remove existing slash for proper formatting
    const cleaned = text.replace(/\//g, '');
    setExpiry(formatExpiry(cleaned));
  };

  const handleSave = async () => {
    Keyboard.dismiss();

    if (!validateCard()) {
      return;
    }

    setIsSaving(true);

    try {
      // For PCI-DSS compliance, we tokenize the card via PayTR
      // The card data is sent directly to PayTR, never stored on our servers
      const [month, year] = expiry.split('/');

      await securePaymentService.tokenizeAndSaveCard({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardHolderName: cardName.trim(),
        expireMonth: month,
        expireYear: `20${year}`,
        cvv: cvc,
      });

      showSuccess({
        title: 'Card Saved',
        message: 'Your card has been securely saved',
      });
      navigation.goBack();
    } catch (error) {
      logger.error('Card save error:', error);
      showError({
        title: 'Save Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to save card. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Card</Text>
        <TouchableOpacity>
          <Ionicons
            name="scan-outline"
            size={24}
            color={COLORS.brand.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* LIVE CARD PREVIEW */}
        <Animated.View
          entering={FlipInYRight.duration(600)}
          style={styles.cardContainer}
        >
          <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.virtualCard}
          >
            <View style={styles.cardRow}>
              <MaterialCommunityIcons name="chip" size={32} color="#FFD700" />
              <MaterialCommunityIcons
                name="contactless-payment"
                size={24}
                color="rgba(255,255,255,0.8)"
              />
            </View>

            <Text style={styles.cardNumPreview}>
              {cardNumber || '•••• •••• •••• ••••'}
            </Text>

            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.cardLabel}>CARD HOLDER</Text>
                <Text style={styles.cardVal}>
                  {cardName.toUpperCase() || 'YOUR NAME'}
                </Text>
              </View>
              <View>
                <Text style={styles.cardLabel}>EXPIRES</Text>
                <Text style={styles.cardVal}>{expiry || 'MM/YY'}</Text>
              </View>
            </View>

            <View style={styles.logoPos}>
              <Text style={styles.visaText}>VISA</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* FORM */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          style={styles.form}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Card Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="0000 0000 0000 0000"
                placeholderTextColor="#444"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={handleNumberChange}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cardholder Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#666"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder="Selin Yilmaz"
                placeholderTextColor="#444"
                autoCapitalize="words"
                value={cardName}
                onChangeText={setCardName}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.inputGroupLeft]}>
              <Text style={styles.label}>Expiry Date</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#666"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiry}
                  onChangeText={handleExpiryChange}
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.inputGroupRight]}>
              <Text style={styles.label}>CVV</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                  value={cvc}
                  onChangeText={setCvc}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.saveText}>Save Card</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Dark theme colors for the card screen
const DARK_BG = '#121212';
const DARK_SURFACE = 'rgba(255,255,255,0.05)';
const DARK_BORDER = 'rgba(255,255,255,0.1)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },

  // Virtual Card
  cardContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  virtualCard: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardNumPreview: {
    fontSize: 22,
    color: 'white',
    letterSpacing: 2,
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginBottom: 4,
  },
  cardVal: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoPos: {
    position: 'absolute',
    bottom: 20,
    right: 24,
  },
  visaText: {
    color: 'white',
    fontStyle: 'italic',
    fontWeight: '900',
    fontSize: 24,
  },

  // Form
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    color: '#ADB5BD',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK_SURFACE,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 56,
    borderWidth: 1,
    borderColor: DARK_BORDER,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  inputGroupLeft: {
    flex: 1,
    marginRight: 10,
  },
  inputGroupRight: {
    flex: 1,
    marginLeft: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.brand.primary,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default AddCardScreen;

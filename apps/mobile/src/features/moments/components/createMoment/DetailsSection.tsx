/**
 * DetailsSection Component
 * Location, Date, Amount cards for CreateMoment screen
 */

import React, { memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
  Alert,
   
  ActionSheetIOS,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { COLORS, CARD_SHADOW } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import { useToast } from '@/context/ToastContext';

export interface Place {
  name: string;
  address: string;
}

interface EscrowInfo {
  icon: 'flash' | 'information-outline' | 'shield-check';
  color: string;
  title: string;
  description: string;
}

interface DetailsSectionProps {
  place: Place | null;
  selectedDate: Date;
  amount: string;
  onPlaceChange: (place: Place | null) => void;
  onDatePress: () => void;
  onAmountChange: (amount: string) => void;
  onNavigateToPlaceSearch?: () => void;
}

const DetailsSection: React.FC<DetailsSectionProps> = memo(
  ({
    place,
    selectedDate,
    amount,
    onPlaceChange,
    onDatePress,
    onAmountChange,
    onNavigateToPlaceSearch,
  }) => {
    const { showToast } = useToast();
    const escrowInfo: EscrowInfo = useMemo(() => {
      const amountNum = parseFloat(amount) || 0;

      if (amountNum <= VALUES.ESCROW_DIRECT_MAX) {
        return {
          icon: 'flash',
          color: COLORS.brand.primary,
          title: 'Direct Payment',
          description: '$0-$30: Instant transfer to you when someone gifts.',
        };
      } else if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX) {
        return {
          icon: 'information-outline',
          color: COLORS.softOrange,
          title: 'Giver Chooses',
          description: '$30-$100: Your supporter decides payment method.',
        };
      } else {
        return {
          icon: 'shield-check',
          color: COLORS.feedback.success,
          title: 'Proof Required',
          description:
            '$100+: Escrow protected. Upload proof to receive funds.',
        };
      }
    }, [amount]);

    const pickLocation = () => {
      const getCurrentLocation = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            showToast('Location permission is needed', 'warning');
            return;
          }

          const location = await Location.getCurrentPositionAsync({});
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (address) {
            onPlaceChange({
              name: address.name || address.street || 'Current Location',
              address: `${address.city || ''}, ${address.country || ''}`.trim(),
            });
          }
        } catch {
          showToast('Konumunuz alınamadı. Lütfen konum servislerinizin açık olduğundan emin olun', 'error');
        }
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Use Current Location', 'Search Place'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) void getCurrentLocation();
            if (buttonIndex === 2) onNavigateToPlaceSearch?.();
          },
        );
      } else {
        Alert.alert('Select Location', 'Choose an option', [
          {
            text: 'Use Current Location',
            onPress: () => void getCurrentLocation(),
          },
          { text: 'Search Place', onPress: () => onNavigateToPlaceSearch?.() },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    };

    const showEscrowInfo = () => {
      Alert.alert(
        '💰 Gift Protection Levels',
        'TravelMatch protects both givers and receivers:\n\n' +
          '✅ $0-30: Direct Payment\n' +
          'Money goes directly to the creator. No proof needed.\n\n' +
          '⚡ $30-100: Optional Escrow\n' +
          'You can choose to protect your gift. If protected, money is held until proof is uploaded.\n\n' +
          '🔒 $100+: Escrow Protected\n' +
          'Money is held in escrow. The creator must upload proof to receive funds.\n\n' +
          'This ensures authentic travel experiences and protects your gifts.',
        [{ text: 'Got it', style: 'default' }],
      );
    };

    return (
      <View style={styles.detailsSection}>
        {/* Location Card */}
        <TouchableOpacity
          style={styles.detailCard}
          onPress={pickLocation}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Select location"
        >
          <View style={styles.detailCardHeader}>
            <View style={styles.detailCardIcon}>
              <MaterialCommunityIcons
                name="map-marker"
                size={20}
                color={COLORS.brand.primary}
              />
            </View>
            <View style={styles.detailCardContent}>
              <Text style={styles.detailCardLabel}>Location</Text>
              {place ? (
                <View>
                  <Text style={styles.detailCardValue}>{place.name}</Text>
                  <Text style={styles.detailCardSubvalue}>{place.address}</Text>
                </View>
              ) : (
                <Text style={styles.detailCardPlaceholder}>
                  Choose a real place
                </Text>
              )}
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.text.tertiary}
            />
          </View>
        </TouchableOpacity>

        {/* Date Card */}
        <TouchableOpacity
          style={styles.detailCard}
          onPress={onDatePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Select date"
        >
          <View style={styles.detailCardHeader}>
            <View style={styles.detailCardIcon}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={COLORS.brand.primary}
              />
            </View>
            <View style={styles.detailCardContent}>
              <Text style={styles.detailCardLabel}>When</Text>
              <Text style={styles.detailCardValue}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={COLORS.text.tertiary}
            />
          </View>
        </TouchableOpacity>

        {/* Amount Card */}
        <View style={styles.detailCard}>
          <View style={styles.detailCardHeader}>
            <View style={styles.detailCardIcon}>
              <MaterialCommunityIcons
                name="currency-usd"
                size={20}
                color={COLORS.brand.primary}
              />
            </View>
            <View style={styles.detailCardContent}>
              <Text style={styles.detailCardLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={amount}
                  onChangeText={onAmountChange}
                  keyboardType="decimal-pad"
                  maxLength={6}
                  accessibilityLabel="Amount in dollars"
                />
              </View>
            </View>
          </View>

          {/* Escrow Info */}
          {amount && parseFloat(amount) > 0 && (
            <TouchableOpacity
              style={[
                styles.escrowInfo,
                { borderColor: escrowInfo.color + '20' },
              ]}
              onPress={showEscrowInfo}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Learn about payment protection"
            >
              <MaterialCommunityIcons
                name={escrowInfo.icon}
                size={18}
                color={escrowInfo.color}
              />
              <View style={styles.escrowTextContainer}>
                <Text style={[styles.escrowTitle, { color: escrowInfo.color }]}>
                  {escrowInfo.title}
                </Text>
                <Text style={styles.escrowDescription}>
                  {escrowInfo.description}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color={COLORS.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  },
);

DetailsSection.displayName = 'DetailsSection';

const styles = StyleSheet.create({
  detailsSection: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 16,
    ...CARD_SHADOW,
  },
  detailCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  detailCardIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.filterPillActive,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardLabel: {
    color: COLORS.text.secondary,
    fontSize: 13,
    marginBottom: 4,
  },
  detailCardValue: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  detailCardSubvalue: {
    color: COLORS.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  detailCardPlaceholder: {
    color: COLORS.text.tertiary,
    fontSize: 15,
  },
  amountInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  currencySymbol: {
    color: COLORS.text.primary,
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  escrowInfo: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.bg.primary,
    borderRadius: LAYOUT.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    padding: 12,
  },
  escrowTextContainer: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  escrowDescription: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
});

export default DetailsSection;

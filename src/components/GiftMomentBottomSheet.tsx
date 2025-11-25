import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Modal,
  Platform,
  PanResponder,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ConfirmGiftModal } from './ConfirmGiftModal';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { MomentData } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

type PaymentMethod = 'apple-pay' | 'google-pay' | 'card';

interface Props {
  visible: boolean;
  moment: MomentData | null;
  onClose: () => void;
  onGift: (paymentMethod: PaymentMethod) => void;
}

export const GiftMomentBottomSheet: React.FC<Props> = ({ 
  visible, 
  moment, 
  onClose, 
  onGift 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('apple-pay');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10
          }).start();
        }
      }
    })
  ).current;

  useEffect(() => {
    if (visible && moment) {
      openSheet();
    } else if (!visible) {
      closeSheet();
    }
  }, [visible, moment]);

  const openSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 10
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: SHEET_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 10
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setPaymentMethod('apple-pay');
      onClose();
    });
  };

  if (!moment) return null;

  const formatDateRange = useCallback(() => {
    const start = moment.dateRange.start;
    const end = moment.dateRange.end;
    
    if (!end || start.getTime() === end.getTime()) {
      return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { day: 'numeric' })}`;
  }, [moment.dateRange.start, moment.dateRange.end]);

  const getTravelNote = useCallback(() => {
    if (moment.user.type === 'traveler' && moment.user.travelDays) {
      return `In ${moment.location.city} for ${moment.user.travelDays} days`;
    }
    return `Local expert in ${moment.location.city}`;
  }, [moment.user.type, moment.user.travelDays, moment.location.city]);

  const handleGift = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmGift = () => {
    setShowConfirmModal(false);
    closeSheet();
    // Wait for sheet to close before triggering gift
    const timeoutId = setTimeout(() => {
      onGift(paymentMethod);
    }, 400);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={styles.backdropTouch} onPress={closeSheet} activeOpacity={1} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.sheet,
          { transform: [{ translateY }] }
        ]}
      >
        {/* Drag Handle */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Compact Preview */}
          <View style={styles.previewSection}>
            <View style={styles.previewImageContainer}>
              {moment.imageUrl && (
                <Image source={{ uri: moment.imageUrl }} style={styles.previewImage} />
              )}
              {moment.category && (
                <View style={styles.previewBadge}>
                  <Text style={styles.previewBadgeText}>{moment.category.emoji} {moment.category.label}</Text>
                </View>
              )}
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle} numberOfLines={2}>{moment.title}</Text>
              <View style={styles.previewMeta}>
                <MaterialCommunityIcons name="map-marker" size={14} color="#737373" />
                <Text style={styles.previewMetaText}>{moment.location.name}</Text>
              </View>
              <View style={styles.previewMeta}>
                <MaterialCommunityIcons name="calendar" size={14} color="#737373" />
                <Text style={styles.previewMetaText}>{formatDateRange()}</Text>
              </View>
            </View>
          </View>

          {/* Payment Protection Notice */}
          {moment.price < VALUES.ESCROW_DIRECT_MAX ? (
            <View style={styles.directPayNotice}>
              <View style={styles.protectionHeader}>
                <MaterialCommunityIcons name="flash" size={20} color={COLORS.success} />
                <Text style={styles.protectionTitle}>Direct Payment</Text>
              </View>
              <Text style={styles.protectionText}>
                Sent instantly to recipient. No escrow needed.
              </Text>
            </View>
          ) : (
            <View style={styles.protectionNotice}>
              <View style={styles.protectionHeader}>
                <MaterialCommunityIcons name="shield-check" size={20} color={COLORS.success} />
                <Text style={styles.protectionTitle}>Protected by ProofLoop™</Text>
              </View>
              <Text style={styles.protectionText}>
                {moment.price >= VALUES.ESCROW_OPTIONAL_MAX 
                  ? 'Escrow required. Funds release only when verified proof is uploaded.'
                  : 'Escrow optional. Funds release when proof is uploaded or after 7 days.'}
              </Text>
            </View>
          )}

          {/* Payment Info */}
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Amount</Text>
              <Text style={styles.paymentValue}>${moment.price.toFixed(2)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Processing Fee</Text>
              <Text style={styles.paymentValue}>Free</Text>
            </View>
            <View style={styles.paymentDivider} />
            <View style={styles.paymentRow}>
              <Text style={styles.paymentTotal}>Total</Text>
              <Text style={styles.paymentTotal}>${moment.price.toFixed(2)}</Text>
            </View>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.paymentMethodSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'apple-pay' && styles.paymentMethodSelected
                ]}
                onPress={() => setPaymentMethod('apple-pay')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="apple" size={24} color={paymentMethod === 'apple-pay' ? '#1E1E1E' : '#737373'} />
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod === 'apple-pay' && styles.paymentMethodTextSelected
                ]}>Apple Pay</Text>
              </TouchableOpacity>

              {Platform.OS === 'android' && (
                <TouchableOpacity
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === 'google-pay' && styles.paymentMethodSelected
                  ]}
                  onPress={() => setPaymentMethod('google-pay')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="google" size={24} color={paymentMethod === 'google-pay' ? '#1E1E1E' : '#737373'} />
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === 'google-pay' && styles.paymentMethodTextSelected
                  ]}>Google Pay</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.paymentMethodButton,
                  paymentMethod === 'card' && styles.paymentMethodSelected
                ]}
                onPress={() => setPaymentMethod('card')}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="credit-card" size={24} color={paymentMethod === 'card' ? '#1E1E1E' : '#737373'} />
                <Text style={[
                  styles.paymentMethodText,
                  paymentMethod === 'card' && styles.paymentMethodTextSelected
                ]}>Card</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleGift}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>
                Send • ${moment.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Confirm Gift Modal */}
      {visible && (
        <ConfirmGiftModal
          visible={showConfirmModal}
          amount={moment.price}
          recipientName={moment.user.name}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmGift}
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: LAYOUT.shadowOffset.bottomSheet,
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.darkGray,
  },
  content: {
    flex: 1,
  },
  previewSection: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  previewImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 6,
    lineHeight: 20,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  previewMetaText: {
    fontSize: 13,
    color: '#737373',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E1E',
    marginBottom: 16,
  },
  protectionNotice: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#E6F9F0',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A6E5C1',
  },
  directPayNotice: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD166',
  },
  protectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  protectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  protectionText: {
    fontSize: 13,
    color: '#525252',
    lineHeight: 18,
  },
  paymentInfo: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.gray,
    borderRadius: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#737373',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1E1E',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
  },
  paymentTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.buttonDark,
  },
  paymentMethodSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentMethodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  paymentMethodSelected: {
    borderColor: COLORS.buttonDark,
    backgroundColor: COLORS.gray,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  paymentMethodTextSelected: {
    color: COLORS.buttonDark,
  },
  ctaSection: {
    padding: 20,
    paddingBottom: 40,
  },
  ctaButton: {
    backgroundColor: COLORS.buttonDark,
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});

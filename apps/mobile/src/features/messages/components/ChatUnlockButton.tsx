/**
 * ChatUnlockButton - Sohbet Kilidi Açma Butonu
 *
 * Dating vizyonundaki "rıza" adımını mühürleyen ipeksi buton.
 * Like yerine açık ve net "Sohbeti Başlat" aksiyonu.
 *
 * MASTER UX Kuralları:
 * - 0-30$: Bu buton hiç görünmez
 * - 30-100$: "Sohbeti Başlat" butonu (Host onayı gerekli)
 * - 100$+: Premium glow efektli "Sohbeti Başlat"
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import type { ChatTier } from '../services/messagesService';

interface ChatUnlockButtonProps {
  tier: ChatTier;
  senderName: string;
  isApproved: boolean;
  isLoading?: boolean;
  onUnlock: () => Promise<void>;
  onStartChat: () => void;
}

export const ChatUnlockButton: React.FC<ChatUnlockButtonProps> = memo(
  ({
    tier,
    senderName,
    isApproved,
    isLoading = false,
    onUnlock,
    onStartChat,
  }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    // Premium tier glow animation
    const glowOpacity = useSharedValue(0.5);

    React.useEffect(() => {
      if (tier === 'premium') {
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1000 }),
            withTiming(0.5, { duration: 1000 }),
          ),
          -1,
          true,
        );
      }
    }, [tier, glowOpacity]);

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
    }));

    // Modal animation
    const modalScale = useSharedValue(0.8);
    const modalOpacity = useSharedValue(0);

    React.useEffect(() => {
      if (showConfirmModal) {
        modalScale.value = withSpring(1, { damping: 15 });
        modalOpacity.value = withTiming(1, { duration: 200 });
      } else {
        modalScale.value = withTiming(0.8, { duration: 150 });
        modalOpacity.value = withTiming(0, { duration: 150 });
      }
    }, [showConfirmModal, modalScale, modalOpacity]);

    const modalAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: modalScale.value }],
      opacity: modalOpacity.value,
    }));

    // Don't render for 'none' tier (0-30$)
    if (tier === 'none') {
      return null;
    }

    const handleUnlockPress = () => {
      if (isApproved) {
        onStartChat();
      } else {
        setShowConfirmModal(true);
      }
    };

    const handleConfirmUnlock = async () => {
      setIsUnlocking(true);
      try {
        await onUnlock();
        setShowConfirmModal(false);
      } catch (_unlockError) {
        // Error handled by parent
      } finally {
        setIsUnlocking(false);
      }
    };

    const isPremium = tier === 'premium';

    return (
      <>
        {/* Main Button */}
        <View style={styles.buttonContainer}>
          {isPremium && (
            <Animated.View style={[styles.premiumGlow, glowStyle]} />
          )}
          <TouchableOpacity
            style={[
              styles.unlockButton,
              isPremium && styles.premiumButton,
              isApproved && styles.approvedButton,
            ]}
            onPress={handleUnlockPress}
            disabled={isLoading}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isApproved ? `Chat with ${senderName}` : 'Start chat'}
            accessibilityState={{ disabled: isLoading }}
            accessibilityHint={isPremium ? 'Premium offer' : 'Opens chat request'}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.utility.white} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name={isApproved ? 'message-text' : 'message-badge-outline'}
                  size={22}
                  color={COLORS.utility.white}
                />
                <Text style={styles.unlockButtonText}>
                  {isApproved
                    ? `${senderName} ile Sohbet Et`
                    : 'Sohbeti Başlat'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {isPremium && !isApproved && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={12} color="#FFB800" />
              <Text style={styles.premiumBadgeText}>Premium Teklif</Text>
            </View>
          )}
        </View>

        {/* İpeksi Onay Modalı */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              {/* Decorative Icon */}
              <View style={styles.modalIconContainer}>
                <MaterialCommunityIcons
                  name="heart-multiple"
                  size={48}
                  color={COLORS.brand.primary}
                />
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>Bağ Kurmaya Hazır mısın?</Text>

              {/* Description */}
              <Text style={styles.modalDescription}>
                <Text style={styles.senderNameHighlight}>{senderName}</Text> ile
                özel bir sohbet başlatmak üzeresin.{'\n\n'}
                Bu, karşılıklı rıza ile başlayan bir bağın ilk adımı.
              </Text>

              {/* Premium hint */}
              {isPremium && (
                <View style={styles.premiumHint}>
                  <MaterialCommunityIcons
                    name="star-shooting"
                    size={16}
                    color="#FFB800"
                  />
                  <Text style={styles.premiumHintText}>
                    Bu kişi seninle tanışmaya çok istekli
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirmModal(false)}
                  disabled={isUnlocking}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Not now"
                  accessibilityState={{ disabled: isUnlocking }}
                >
                  <Text style={styles.cancelButtonText}>Şimdi Değil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    isPremium && styles.confirmButtonPremium,
                  ]}
                  onPress={handleConfirmUnlock}
                  disabled={isUnlocking}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Start chat"
                  accessibilityState={{ disabled: isUnlocking }}
                >
                  {isUnlocking ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.utility.white}
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="message-text-outline"
                        size={18}
                        color={COLORS.utility.white}
                      />
                      <Text style={styles.confirmButtonText}>
                        Sohbeti Başlat
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Privacy note */}
              <Text style={styles.privacyNote}>
                Sohbet başladığında profilin bu kişiye görünür olacak
              </Text>
            </Animated.View>
          </View>
        </Modal>
      </>
    );
  },
);

ChatUnlockButton.displayName = 'ChatUnlockButton';

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B61FF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
  },
  premiumButton: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  approvedButton: {
    backgroundColor: COLORS.brand.primary,
  },
  unlockButtonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '700',
  },
  premiumGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: '#FFB800',
    borderRadius: 20,
    opacity: 0.3,
  },
  premiumBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  premiumBadgeText: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '700',
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  senderNameHighlight: {
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
  premiumHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 20,
  },
  premiumHintText: {
    color: '#996B00',
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#7B61FF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonPremium: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  confirmButtonText: {
    color: COLORS.utility.white,
    fontSize: 15,
    fontWeight: '700',
  },
  privacyNote: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});

export default ChatUnlockButton;

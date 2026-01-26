/**
 * GratitudeButton - Teşekkür Et Butonu
 *
 * Sohbet açmadan sadece şükran gösterme aksiyonu.
 * Bireysel teşekkür notu - alıcıya özel mesaj.
 *
 * UX Kuralları:
 * - 0-30$: Sadece bu buton görünür
 * - 30-100$: Bu buton + Sohbeti Başlat butonu birlikte
 * - 100$+: Sadece Sohbeti Başlat (teşekkür otomatik)
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import type { ChatTier } from '../services/messagesService';

interface GratitudeButtonProps {
  tier: ChatTier;
  senderName: string;
  hasSentGratitude?: boolean;
  onSendGratitude: (message: string) => Promise<void>;
}

// Quick gratitude messages with emoji
const QUICK_GRATITUDES = [
  { emoji: '🙏', text: 'Çok teşekkürler!' },
  { emoji: '💜', text: 'Desteğin için minnettarım' },
  { emoji: '✨', text: 'Harikasın!' },
  { emoji: '🌟', text: 'Çok naziksin' },
];

export const GratitudeButton: React.FC<GratitudeButtonProps> = memo(
  ({ tier, senderName, hasSentGratitude = false, onSendGratitude }) => {
    const [showModal, setShowModal] = useState(false);
    const [customMessage, setCustomMessage] = useState('');
    const [selectedQuick, setSelectedQuick] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [sent, setSent] = useState(hasSentGratitude);

    // Modal animation
    const modalScale = useSharedValue(0.8);
    const modalOpacity = useSharedValue(0);

    React.useEffect(() => {
      if (showModal) {
        modalScale.value = withSpring(1, { damping: 15 });
        modalOpacity.value = withTiming(1, { duration: 200 });
      } else {
        modalScale.value = withTiming(0.8, { duration: 150 });
        modalOpacity.value = withTiming(0, { duration: 150 });
      }
    }, [showModal, modalScale, modalOpacity]);

    const modalAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: modalScale.value }],
      opacity: modalOpacity.value,
    }));

    // For 100$+ tier, don't show separate gratitude button
    if (tier === 'premium') {
      return null;
    }

    const handleSend = async () => {
      const message =
        selectedQuick !== null
          ? `${QUICK_GRATITUDES[selectedQuick].emoji} ${QUICK_GRATITUDES[selectedQuick].text}`
          : customMessage.trim();

      if (!message) return;

      setIsSending(true);
      try {
        await onSendGratitude(message);
        setSent(true);
        setShowModal(false);
        setCustomMessage('');
        setSelectedQuick(null);
      } catch (_sendGratitudeError) {
        // Error handled by parent
      } finally {
        setIsSending(false);
      }
    };

    const handleQuickSelect = (index: number) => {
      setSelectedQuick(selectedQuick === index ? null : index);
      setCustomMessage('');
    };

    return (
      <>
        {/* Main Button */}
        <TouchableOpacity
          style={[styles.gratitudeButton, sent && styles.gratitudeButtonSent]}
          onPress={() => !sent && setShowModal(true)}
          disabled={sent}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name={sent ? 'check-circle-outline' : 'heart-outline'}
            size={20}
            color={sent ? COLORS.mint : COLORS.text.secondary}
          />
          <Text
            style={[
              styles.gratitudeButtonText,
              sent && styles.gratitudeButtonTextSent,
            ]}
          >
            {sent ? 'Teşekkür Edildi' : 'Teşekkür Et'}
          </Text>
        </TouchableOpacity>

        {/* Teşekkür Modalı */}
        <Modal
          visible={showModal}
          transparent
          animationType="none"
          onRequestClose={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            style={styles.modalBackdrop}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <MaterialCommunityIcons
                  name="gift-outline"
                  size={32}
                  color={COLORS.brand.primary}
                />
                <Text style={styles.modalTitle}>
                  {senderName}'a Teşekkür Et
                </Text>
                <Text style={styles.modalSubtitle}>
                  {tier === 'none'
                    ? 'Bu sadece bir teşekkür notudur, sohbet açmaz'
                    : 'Nazik bir not gönder (sohbet açmak için ayrı butona bas)'}
                </Text>
              </View>

              {/* Quick Gratitudes */}
              <View style={styles.quickGratitudes}>
                {QUICK_GRATITUDES.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickItem,
                      selectedQuick === index && styles.quickItemSelected,
                    ]}
                    onPress={() => handleQuickSelect(index)}
                  >
                    <Text style={styles.quickEmoji}>{item.emoji}</Text>
                    <Text
                      style={[
                        styles.quickText,
                        selectedQuick === index && styles.quickTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Custom Message */}
              <TextInput
                style={styles.customInput}
                placeholder="Kendi mesajını yaz..."
                placeholderTextColor={COLORS.text.tertiary}
                value={customMessage}
                onChangeText={(text) => {
                  setCustomMessage(text);
                  setSelectedQuick(null);
                }}
                multiline
                maxLength={200}
              />

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                  disabled={isSending}
                >
                  <Text style={styles.cancelButtonText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !customMessage.trim() &&
                      selectedQuick === null &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={
                    isSending ||
                    (!customMessage.trim() && selectedQuick === null)
                  }
                >
                  {isSending ? (
                    <ActivityIndicator
                      size="small"
                      color={COLORS.utility.white}
                    />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="send"
                        size={18}
                        color={COLORS.utility.white}
                      />
                      <Text style={styles.sendButtonText}>Gönder</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Info Note */}
              <View style={styles.infoNote}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={14}
                  color={COLORS.text.tertiary}
                />
                <Text style={styles.infoNoteText}>
                  Bu mesaj sohbet başlatmaz, sadece teşekkür iletir
                </Text>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Modal>
      </>
    );
  },
);

GratitudeButton.displayName = 'GratitudeButton';

const styles = StyleSheet.create({
  gratitudeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  gratitudeButtonSent: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  gratitudeButtonText: {
    color: COLORS.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  gratitudeButtonTextSent: {
    color: COLORS.mint,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  quickGratitudes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  quickItemSelected: {
    backgroundColor: 'rgba(123, 97, 255, 0.1)',
    borderColor: '#7B61FF',
  },
  quickEmoji: {
    fontSize: 18,
  },
  quickText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  quickTextSelected: {
    color: '#7B61FF',
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.text.tertiary,
    marginHorizontal: 12,
  },

  customInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  sendButton: {
    flex: 1,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: COLORS.utility.white,
    fontSize: 15,
    fontWeight: '700',
  },

  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoNoteText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});

export default GratitudeButton;

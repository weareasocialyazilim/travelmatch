/**
 * Thank You Flow Modal
 *
 * Post-flow thank you modal that appears after escrow reaches terminal state.
 * Supports both single-recipient and bulk thank you.
 *
 * Features:
 * - Non-blocking bottom sheet presentation
 * - 1:1 or bulk thank you selection
 * - PII blocking (phone, email, URL, social handles)
 * - Rate limiting (5/day, 1/moment/week)
 * - Snooze behavior (24h dismiss)
 */

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { cacheService } from '@/services/cacheService';

interface GiftInfo {
  id: string;
  giverId: string;
  giverName: string;
  giverAvatar?: string;
  amount: number;
  momentId: string;
  escrowId: string;
}

interface GifterInfo {
  id: string;
  name: string;
  avatar?: string;
  amount: number;
}

interface ThankYouFlowModalProps {
  visible: boolean;
  giftInfo: GiftInfo | null;
  allGifters?: GifterInfo[];
  onClose: () => void;
  onSendThankYou: (message: string, recipientId?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

type FlowStep = 'selection' | 'compose' | 'sending' | 'success';

export const ThankYouFlowModal: React.FC<ThankYouFlowModalProps> = ({
  visible,
  giftInfo,
  allGifters = [],
  onClose,
  onSendThankYou,
}) => {
  const [step, setStep] = useState<FlowStep>('selection');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear state when modal opens
  const handleOpen = useCallback(() => {
    setStep('selection');
    setSelectedRecipient(null);
    setMessage('');
    setError(null);
  }, []);

  // Handle bulk thank you selection
  const handleBulkThankYou = useCallback(() => {
    if (allGifters.length === 0) {
      setError('Bu moment için hediye gönderen yok.');
      return;
    }
    setSelectedRecipient(null);
    setStep('compose');
  }, [allGifters.length]);

  // Handle single thank you selection
  const handleSingleThankYou = useCallback((recipientId: string) => {
    setSelectedRecipient(recipientId);
    setStep('compose');
  }, []);

  // Handle message send
  const handleSend = useCallback(async () => {
    if (message.length < 10) {
      setError('Mesaj en az 10 karakter olmalı.');
      return;
    }
    if (message.length > 280) {
      setError('Mesaj en fazla 280 karakter olmalı.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onSendThankYou(message, selectedRecipient || undefined);
      if (result.success) {
        setStep('success');
      } else {
        setError(result.error || 'Teşekkür gönderilemedi.');
        setStep('compose');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
      setStep('compose');
    } finally {
      setIsLoading(false);
    }
  }, [message, selectedRecipient, onSendThankYou]);

  // Handle dismiss with snooze
  const handleDismiss = useCallback(async () => {
    if (giftInfo?.momentId) {
      const snoozeKey = `snooze_${giftInfo.momentId}`;
      await cacheService.set(snoozeKey, { snoozedUntil: Date.now() + 24 * 60 * 60 * 1000 }, { expiryMs: 24 * 60 * 60 * 1000 });
    }
    onClose();
  }, [giftInfo, onClose]);

  // Basic PII blocking (server will also validate)
  const handleMessageChange = useCallback((text: string) => {
    setMessage(text);
    setError(null);

    // Simple client-side check for immediate feedback
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const urlPattern = /https?:\/\/[^\s]+/;
    const socialPattern = /@[a-zA-Z0-9_]{3,}/;

    if (phonePattern.test(text)) {
      setError('Telefon numarası paylaşılamaz.');
    } else if (emailPattern.test(text)) {
      setError('E-posta adresi paylaşılamaz.');
    } else if (urlPattern.test(text)) {
      setError('URL paylaşılamaz.');
    } else if (socialPattern.test(text)) {
      setError('Sosyal medya hesabı paylaşılamaz.');
    }
  }, []);

  // Reset when modal closes
  React.useEffect(() => {
    if (!visible) {
      handleOpen();
    }
  }, [visible, handleOpen]);

  // Show selection step
  if (step === 'selection') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        presentationStyle="pageSheet"
        onShow={handleOpen}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <View style={styles.handle} />
            <Text style={styles.title}>Teşekkür Etmek İster misin?</Text>
            <Text style={styles.subtitle}>
              {giftInfo
                ? `${giftInfo.giverName} hediye gönderdi.`
                : `${allGifters.length} kişi bu moment için hediye gönderdi.`}
            </Text>

            {/* Single Thank You */}
            {giftInfo && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handleSingleThankYou(giftInfo.giverId)}
                testID="single-thank-you"
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="person-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Bireysel Teşekkür</Text>
                  <Text style={styles.optionSubtitle}>
                    Sadece {giftInfo.giverName}'a özel mesaj
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
              </TouchableOpacity>
            )}

            {/* Bulk Thank You */}
            {allGifters.length > 1 && (
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleBulkThankYou}
                testID="bulk-thank-you"
              >
                <View style={styles.optionIcon}>
                  <Ionicons name="people-outline" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Toplu Teşekkür</Text>
                  <Text style={styles.optionSubtitle}>
                    Tüm {allGifters.length} hediye gönderene tek mesaj
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.muted} />
              </TouchableOpacity>
            )}

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleDismiss}
              testID="skip-button"
            >
              <Text style={styles.skipText}>Şimli değil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // Show compose step
  if (step === 'compose') {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        presentationStyle="pageSheet"
        onShow={handleOpen}
      >
        <View style={styles.overlay}>
          <View style={[styles.modalContainer, { minHeight: 500 }]}>
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.composeHeader}>
              <TouchableOpacity
                onPress={() => setStep('selection')}
                testID="back-button"
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
              <Text style={styles.composeTitle}>
                {selectedRecipient ? 'Bireysel Teşekkür' : 'Toplu Teşekkür'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Recipient badge */}
            <View style={styles.recipientBadge}>
              <Text style={styles.recipientText}>
                {selectedRecipient
                  ? `Sadece ${giftInfo?.giverName} görür`
                  : `Tüm ${allGifters.length} hediye gönderen görür`}
              </Text>
            </View>

            {/* Message input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={handleMessageChange}
                placeholder="Teşekkür mesajını yaz..."
                placeholderTextColor={COLORS.text.muted}
                multiline
                maxLength={280}
                textAlignVertical="top"
                testID="message-input"
              />
              <Text style={styles.charCount}>
                {message.length}/280
              </Text>
            </View>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning-outline" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Send button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (message.length < 10 || message.length > 280 || isLoading) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={message.length < 10 || message.length > 280 || isLoading}
              testID="send-button"
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? 'Gönderiliyor...' : 'Gönder'}
              </Text>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>İpuçları:</Text>
              <Text style={styles.tipText}>• Dürüst ve samimi olun</Text>
              <Text style={styles.tipText}>• Deneyiminizi kısaca paylaşın</Text>
              <Text style={styles.tipText}>• Telefon veya email paylaşmayın</Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Show success step
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={handleOpen}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, styles.successContainer]}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
          </View>
          <Text style={styles.successTitle}>Teşekkür Gönderildi!</Text>
          <Text style={styles.successSubtitle}>
            {selectedRecipient
              ? 'Özel mesajını gönderdin.'
              : 'Tüm hediye gönderenlere teşekkür ettin.'}
          </Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            testID="done-button"
          >
            <Text style={styles.doneButtonText}>Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  optionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    color: COLORS.text.muted,
    fontSize: 14,
  },
  composeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
  },
  composeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  recipientBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  recipientText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
  },
  messageInput: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.text.muted,
    textAlign: 'right',
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.error + '15',
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  tipsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  doneButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThankYouFlowModal;

/**
 * EmailVerificationModal
 *
 * Modal component that prompts users to verify their email address
 * before performing sensitive operations.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useAuth } from '@/context/AuthContext';

interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerified?: () => void;
  title?: string;
  message?: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  visible,
  onClose,
  onVerified,
  title = 'E-posta Doğrulama Gerekli',
  message = 'Bu işlemi gerçekleştirmek için e-posta adresinizi doğrulamanız gerekmektedir.',
}) => {
  const { user } = useAuth();
  const {
    isEmailVerified,
    sendVerificationEmail,
    emailSent,
    resendCooldown,
    checkVerification,
  } = useEmailVerification();

  const [isSending, setIsSending] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);

  // Check if verified when modal opens
  React.useEffect(() => {
    if (visible && isEmailVerified) {
      onVerified?.();
      onClose();
    }
  }, [visible, isEmailVerified, onVerified, onClose]);

  const handleSendEmail = async () => {
    setIsSending(true);
    setSendError(null);

    const result = await sendVerificationEmail();

    if (!result.success) {
      setSendError(result.error || 'E-posta gönderilemedi');
    }

    setIsSending(false);
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);

    const verified = await checkVerification();

    if (verified) {
      onVerified?.();
      onClose();
    }

    setIsChecking(false);
  };

  const maskEmail = (email: string): string => {
    const [local, domain] = email.split('@');
    if (local.length <= 2) {
      return `${local[0]}*@${domain}`;
    }
    return `${local.slice(0, 2)}***@${domain}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.text.secondary}
            />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="email-check-outline"
              size={64}
              color={COLORS.brand.primary}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Email display */}
          {user?.email && (
            <View style={styles.emailContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={18}
                color={COLORS.text.secondary}
              />
              <Text style={styles.emailText}>{maskEmail(user.email)}</Text>
            </View>
          )}

          {/* Error message */}
          {sendError && (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={16}
                color={COLORS.feedback.error}
              />
              <Text style={styles.errorText}>{sendError}</Text>
            </View>
          )}

          {/* Success message */}
          {emailSent && !sendError && (
            <View style={styles.successContainer}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={16}
                color={COLORS.feedback.success}
              />
              <Text style={styles.successText}>
                Doğrulama e-postası gönderildi! Gelen kutunuzu kontrol edin.
              </Text>
            </View>
          )}

          {/* Send email button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (isSending || resendCooldown > 0) && styles.buttonDisabled,
            ]}
            onPress={handleSendEmail}
            disabled={isSending || resendCooldown > 0}
          >
            {isSending ? (
              <ActivityIndicator color={COLORS.utility.white} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {resendCooldown > 0
                  ? `Tekrar Gönder (${resendCooldown}s)`
                  : emailSent
                  ? 'Tekrar Gönder'
                  : 'Doğrulama E-postası Gönder'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Check verification button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleCheckVerification}
            disabled={isChecking}
          >
            {isChecking ? (
              <ActivityIndicator color={COLORS.brand.primary} size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>
                Doğruladım, Kontrol Et
              </Text>
            )}
          </TouchableOpacity>

          {/* Info text */}
          <Text style={styles.infoText}>
            E-posta gelmedi mi? Spam klasörünüzü kontrol edin veya tekrar
            göndermeyi deneyin.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: COLORS.bg.primary,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.brand.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface.base,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  emailText: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.feedback.error}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.feedback.error,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${COLORS.feedback.success}10`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    fontSize: 13,
    color: COLORS.feedback.success,
    flex: 1,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.brand.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default EmailVerificationModal;

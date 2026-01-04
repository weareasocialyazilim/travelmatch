import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS } from '../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type LimitType = 'gift' | 'distance' | 'moment' | 'message' | 'general';

interface LimitReachedModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  limitAmount?: number;
  limitType?: LimitType;
}

const LIMIT_MESSAGES: Record<
  LimitType,
  { title: string; message: string; icon: IconName }
> = {
  gift: {
    title: 'Hediye Limitine Ulaştın 🎁',
    message:
      'Bu ay için hediye gönderme limitine ulaştın. Premium ile sınırsız hediye gönder!',
    icon: 'gift-outline',
  },
  distance: {
    title: 'Mesafe Sınırına Ulaştın 📍',
    message:
      "Daha uzaktaki anları keşfetmek için Premium ile 500km'ye kadar ara!",
    icon: 'map-marker-radius-outline',
  },
  moment: {
    title: 'An Limitine Ulaştın ✨',
    message:
      'Bu ay için moment oluşturma limitine ulaştın. Premium ile sınırsız an paylaş!',
    icon: 'camera-outline',
  },
  message: {
    title: 'Mesaj Limitine Ulaştın 💬',
    message: "Daha fazla bağlantı kurmak için Premium'a geç!",
    icon: 'message-outline',
  },
  general: {
    title: 'Limite Ulaştın',
    message: 'Bu özellik için günlük limitine ulaştın.',
    icon: 'alert-circle-outline',
  },
};

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  limitAmount,
  limitType = 'general',
}) => {
  const config = LIMIT_MESSAGES[limitType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <View style={styles.backdrop} />

        {/* Modal Content */}
        <View style={styles.modalContent}>
          {/* Neon Icon */}
          <LinearGradient
            colors={GRADIENTS.primary}
            style={styles.iconContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name={config.icon}
              size={40}
              color={COLORS.utility.black}
            />
          </LinearGradient>

          {/* Headline */}
          <Text style={styles.headline}>{config.title}</Text>

          {/* Body Text */}
          <Text style={styles.bodyText}>
            {limitAmount
              ? `Bu tutar günlük $${limitAmount} limitini aşıyor.`
              : config.message}
          </Text>

          {/* Upgrade Button - Neon CTA */}
          {onUpgrade && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                style={styles.upgradeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialCommunityIcons
                  name="crown"
                  size={20}
                  color={COLORS.utility.black}
                />
                <Text style={styles.upgradeText}>
                  Limitlerini İpeksi Bir Dokunuşla Kaldır 💎
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Şimdilik Tamam</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay60,
  },
  modalContent: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: COLORS.bg.primary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    paddingTop: 4,
  },
  bodyText: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingTop: 4,
    lineHeight: 24,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 28,
    overflow: 'hidden',
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.utility.black,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
});

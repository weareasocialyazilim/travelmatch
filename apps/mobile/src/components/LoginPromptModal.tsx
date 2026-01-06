/**
 * LoginPromptModal - İpeksi Giriş Yap Modal
 *
 * Guest kullanıcılar "Hediye Et" veya "Sohbet Et" butonuna bastığında
 * tetiklenen ipeksi modal. Kullanıcının "ürünün tadına bakmasını" sağlar.
 *
 * @module components/LoginPromptModal
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';
import * as Haptics from 'expo-haptics';

interface LoginPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  /** Action type that triggered the modal */
  action?: 'gift' | 'chat' | 'chat_unlock' | 'save' | 'default';
}

const ACTION_CONFIG = {
  gift: {
    icon: 'gift-outline' as const,
    title: 'Hediye Gönder',
    description: 'Bu ipeksi anın bir parçası olmak için üye olmalısın.',
    gradient: ['#F59E0B', '#EF4444'] as [string, string],
  },
  chat: {
    icon: 'chat-outline' as const,
    title: 'Sohbet Başlat',
    description: 'Host ile iletişime geçmek için üye olmalısın.',
    gradient: ['#3B82F6', '#8B5CF6'] as [string, string],
  },
  chat_unlock: {
    icon: 'message-badge-outline' as const,
    title: 'Sohbeti Aç',
    description: 'Bu kullanıcıyla sohbet başlatmak için üye olmalısın.',
    gradient: ['#7B61FF', '#EC4899'] as [string, string],
  },
  save: {
    icon: 'bookmark-outline' as const,
    title: 'Anı Kaydet',
    description: 'Anları kaydetmek için üye olmalısın.',
    gradient: ['#10B981', '#06B6D4'] as [string, string],
  },
  default: {
    icon: 'star-four-points-outline' as const,
    title: 'Üye Ol',
    description: 'Bu ipeksi ana ortak olmak için üye olmalısın.',
    gradient: [COLORS.brand.primary, COLORS.brand.accent] as [string, string],
  },
};

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
  visible,
  onClose,
  onLogin,
  onRegister,
  action = 'default',
}) => {
  const config = ACTION_CONFIG[action];

  const handleLogin = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLogin();
  }, [onLogin]);

  const handleRegister = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRegister();
  }, [onRegister]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  return (
    <Animated.View
      style={styles.overlay}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
        accessibilityLabel="Pencereyi kapat"
        accessibilityRole="button"
      />

      <Animated.View
        style={styles.modalContainer}
        entering={SlideInDown.springify().damping(15)}
        exiting={SlideOutDown.springify()}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <ModalContent
              config={config}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onClose={handleClose}
            />
          </BlurView>
        ) : (
          <View style={[styles.blurContainer, styles.androidContainer]}>
            <ModalContent
              config={config}
              onLogin={handleLogin}
              onRegister={handleRegister}
              onClose={handleClose}
            />
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

interface ModalContentProps {
  config: (typeof ACTION_CONFIG)[keyof typeof ACTION_CONFIG];
  onLogin: () => void;
  onRegister: () => void;
  onClose: () => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  config,
  onLogin,
  onRegister,
  onClose,
}) => (
  <View style={styles.content}>
    {/* Close Button */}
    <TouchableOpacity
      style={styles.closeButton}
      onPress={onClose}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityLabel="Kapat"
      accessibilityRole="button"
      accessibilityHint="Giriş yap penceresini kapatır"
    >
      <MaterialCommunityIcons
        name="close"
        size={24}
        color={COLORS.text.secondary}
      />
    </TouchableOpacity>

    {/* Icon */}
    <View style={styles.iconContainer}>
      <LinearGradient
        colors={config.gradient}
        style={styles.iconGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={40}
          color={COLORS.utility.white}
        />
      </LinearGradient>
    </View>

    {/* Title */}
    <Text style={styles.title}>{config.title}</Text>

    {/* Description */}
    <Text style={styles.description}>{config.description}</Text>

    {/* Features */}
    <View style={styles.featuresContainer}>
      <View style={styles.featureRow}>
        <MaterialCommunityIcons
          name="check-circle"
          size={18}
          color={COLORS.brand.primary}
        />
        <Text style={styles.featureText}>İpeksi anları keşfet</Text>
      </View>
      <View style={styles.featureRow}>
        <MaterialCommunityIcons
          name="check-circle"
          size={18}
          color={COLORS.brand.primary}
        />
        <Text style={styles.featureText}>Hediyelerle destek ol</Text>
      </View>
      <View style={styles.featureRow}>
        <MaterialCommunityIcons
          name="check-circle"
          size={18}
          color={COLORS.brand.primary}
        />
        <Text style={styles.featureText}>Güvenilir topluluğa katıl</Text>
      </View>
    </View>

    {/* Buttons */}
    <View style={styles.buttonsContainer}>
      {/* Primary: Register */}
      <TouchableOpacity
        style={styles.registerButton}
        onPress={onRegister}
        activeOpacity={0.8}
        accessibilityLabel="Ücretsiz üye ol"
        accessibilityRole="button"
        accessibilityHint="Yeni hesap oluşturma sayfasına gider"
      >
        <LinearGradient
          colors={[COLORS.brand.primary, COLORS.brand.accent]}
          style={styles.registerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.registerText}>Ücretsiz Üye Ol</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary: Login */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={onLogin}
        activeOpacity={0.7}
        accessibilityLabel="Giriş yap"
        accessibilityRole="button"
        accessibilityHint="Mevcut hesabınla giriş yap"
      >
        <Text style={styles.loginText}>Zaten üye misin? Giriş yap</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  blurContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  androidContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.98)',
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 20,
    marginTop: 8,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.utility.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 28,
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: COLORS.utility.white,
    fontWeight: '500',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  registerButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  registerGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.inverse,
  },
  loginButton: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
});

export default LoginPromptModal;

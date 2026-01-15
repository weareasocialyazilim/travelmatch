import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../constants/colors';
import { FONTS, TYPE_SCALE } from '../constants/typography';
import { Button } from './ui/Button';

type ErrorType =
  | 'network'
  | 'generic'
  | 'security'
  | 'notFound'
  | 'permission'
  // 💔 Dating & Gifting Platform Error Types
  | 'payment_failed'
  | 'gift_expired'
  | 'proof_rejected'
  | 'match_unavailable'
  | 'escrow_timeout'
  | 'verification_failed';

interface ErrorStateProps {
  /** Error type determines icon and default messaging */
  errorType?: ErrorType;
  /** Custom error message (overrides default) */
  message?: string;
  /** Custom title (overrides default) */
  title?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Custom retry button text */
  retryText?: string;
  /** Custom icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Use MaterialCommunityIcons instead */
  useMaterialIcon?: boolean;
  /** MaterialCommunityIcons name */
  materialIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Container style */
  style?: ViewStyle;
}

/**
 * Awwwards standardında Hata Durum Ekranı - "Premium Error State"
 * Dating & Gifting Platform Master 2026 Edition
 *
 * Kriz Yönetimi: Hata anlarını bir hayal kırıklığı olmaktan çıkarıp,
 * estetik bir geri dönüş yoluna dönüştürüyoruz.
 *
 * 💔 Dating temalı mesajlarla kullanıcı deneyimini koruyoruz.
 */
export const ErrorState: React.FC<ErrorStateProps> = memo(
  ({
    errorType = 'generic',
    message,
    title,
    onRetry,
    retryText = 'Tekrar Dene',
    icon,
    useMaterialIcon = false,
    materialIcon,
    style,
  }) => {
    // Error type configurations with dating-style messages
    const errorConfig: Record<
      ErrorType,
      {
        icon: keyof typeof Ionicons.glyphMap;
        materialIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
        useMaterial?: boolean;
        title: string;
        desc: string;
        retryLabel?: string;
        accentColor?: string;
      }
    > = {
      network: {
        icon: 'wifi-outline',
        title: 'Bağlantı Kesildi',
        desc: 'İnternet dünyasıyla bağın koptu gibi görünüyor. Sinyalleri kontrol edelim.',
      },
      security: {
        icon: 'lock-closed-outline',
        title: 'Erişim Kısıtlı',
        desc: 'Bu alana girmek için yetkin yetersiz veya oturumun sona ermiş.',
      },
      notFound: {
        icon: 'search-outline',
        title: 'Bulunamadı',
        desc: 'Aradığın içerik şu an mevcut değil veya taşınmış olabilir.',
      },
      permission: {
        icon: 'hand-left-outline',
        title: 'İzin Gerekli',
        desc: 'Bu özelliği kullanmak için gerekli izinleri vermelisin.',
      },
      generic: {
        icon: 'alert-circle-outline',
        title: 'Bir Sorun Var',
        desc: 'Sistemlerimizde ipeksi olmayan bir şeyler oldu. Lütfen tekrar dene.',
      },
      // 💔 Dating & Gifting Platform Errors
      payment_failed: {
        icon: 'card-outline',
        materialIcon: 'credit-card-off-outline',
        useMaterial: true,
        title: 'Ödeme Başarısız',
        desc: 'Hediyeni göndermek için bir adım kaldı ama ödeme tamamlanamadı. Kartını kontrol edip tekrar deneyebilirsin.',
        retryLabel: 'Tekrar Dene',
        accentColor: primitives.amber[500],
      },
      gift_expired: {
        icon: 'time-outline',
        materialIcon: 'gift-off-outline',
        useMaterial: true,
        title: 'Hediye Süresi Doldu',
        desc: 'Bu hediye teklifi artık geçerli değil. Yeni bir bağlantı kurmak için keşfet sayfasına göz at! 💝',
        retryLabel: 'Keşfet',
        accentColor: primitives.magenta[500],
      },
      proof_rejected: {
        icon: 'close-circle-outline',
        materialIcon: 'image-off-outline',
        useMaterial: true,
        title: 'Kanıt Reddedildi',
        desc: 'Yüklediğin kanıt kabul edilmedi. Merak etme, yeni bir fotoğraf yükleyerek tekrar deneyebilirsin.',
        retryLabel: 'Yeni Kanıt Yükle',
        accentColor: primitives.rose[500],
      },
      match_unavailable: {
        icon: 'heart-dislike-outline',
        materialIcon: 'heart-broken-outline',
        useMaterial: true,
        title: 'Eşleşme Bulunamadı',
        desc: 'Bu profil şu an aktif değil veya sana kapatılmış olabilir. Yeni bağlantılar seni bekliyor! 💫',
        retryLabel: 'Yeni Keşifler',
        accentColor: primitives.magenta[400],
      },
      escrow_timeout: {
        icon: 'timer-outline',
        materialIcon: 'clock-alert-outline',
        useMaterial: true,
        title: '48 Saat Doldu',
        desc: 'İtiraz süresi doldu ve ödeme otomatik olarak serbest bırakıldı. İşlem detaylarını cüzdanından görebilirsin.',
        retryLabel: 'Cüzdana Git',
        accentColor: primitives.amber[500],
      },
      verification_failed: {
        icon: 'shield-outline',
        materialIcon: 'shield-alert-outline',
        useMaterial: true,
        title: 'Doğrulama Başarısız',
        desc: 'Kimlik doğrulama işlemi tamamlanamadı. Güvenliğin için bu adımı tekrar denemelisin.',
        retryLabel: 'Tekrar Doğrula',
        accentColor: primitives.cyan[500],
      },
    };

    const config = errorConfig[errorType];
    const displayIcon = icon || config.icon;
    const displayMaterialIcon = materialIcon || config.materialIcon;
    const shouldUseMaterial = useMaterialIcon || config.useMaterial;
    const displayTitle = title || config.title;
    const displayMessage = message || config.desc;
    const displayRetryText = retryText || config.retryLabel || 'Tekrar Dene';
    const accentColor = config.accentColor || COLORS.feedback.error;

    // Memoize container style
    const containerStyle = useMemo(() => [styles.container, style], [style]);

    // Memoize icon circle style with accent color
    const iconCircleStyle = useMemo(
      () => [
        styles.iconCircle,
        { backgroundColor: `${accentColor}15` }, // 15% opacity
      ],
      [accentColor],
    );

    return (
      <View style={containerStyle}>
        <View style={iconCircleStyle}>
          {shouldUseMaterial && displayMaterialIcon ? (
            <MaterialCommunityIcons
              name={displayMaterialIcon}
              size={50}
              color={accentColor}
              accessible={false}
            />
          ) : (
            <Ionicons
              name={displayIcon}
              size={50}
              color={accentColor}
              accessible={false}
            />
          )}
        </View>

        <Text style={styles.title} accessible={true} accessibilityRole="header">
          {displayTitle}
        </Text>

        <Text
          style={styles.description}
          accessible={true}
          accessibilityLabel={displayMessage}
        >
          {displayMessage}
        </Text>

        {onRetry && (
          <Button
            variant="primary"
            size="lg"
            onPress={onRetry}
            fullWidth
            style={styles.button}
          >
            {displayRetryText}
          </Button>
        )}
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.errorType === nextProps.errorType &&
    prevProps.message === nextProps.message &&
    prevProps.title === nextProps.title &&
    prevProps.retryText === nextProps.retryText &&
    prevProps.icon === nextProps.icon &&
    prevProps.useMaterialIcon === nextProps.useMaterialIcon &&
    prevProps.materialIcon === nextProps.materialIcon,
);

ErrorState.displayName = 'ErrorState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.background.primary,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.feedback.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.display.bold,
    fontWeight: '800',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  description: {
    ...TYPE_SCALE.body.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    marginBottom: 40,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 30,
  },
});

import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS, TYPE_SCALE } from '../constants/typography';
import { TMButton } from './ui/TMButton';

type ErrorType = 'network' | 'generic' | 'security' | 'notFound' | 'permission';

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
  /** Container style */
  style?: ViewStyle;
}

/**
 * Awwwards standardında Hata Durum Ekranı - "Premium Error State"
 * Kriz Yönetimi: Hata anlarını bir hayal kırıklığı olmaktan çıkarıp,
 * estetik bir geri dönüş yoluna dönüştürüyoruz.
 *
 * Neon aksanlar ve net çözüm önerileri ile güven tazeler.
 */
export const ErrorState: React.FC<ErrorStateProps> = memo(
  ({
    errorType = 'generic',
    message,
    title,
    onRetry,
    retryText = 'Tekrar Dene',
    icon,
    style,
  }) => {
    // Error type configurations
    const errorConfig: Record<ErrorType, { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }> = {
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
    };

    const config = errorConfig[errorType];
    const displayIcon = icon || config.icon;
    const displayTitle = title || config.title;
    const displayMessage = message || config.desc;

    // Memoize container style
    const containerStyle = useMemo(() => [styles.container, style], [style]);

    return (
      <View style={containerStyle}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={displayIcon}
            size={50}
            color={COLORS.feedback.error}
            accessible={false}
          />
        </View>

        <Text
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
        >
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
          <TMButton
            variant="primary"
            size="lg"
            onPress={onRetry}
            fullWidth
            style={styles.button}
          >
            {retryText}
          </TMButton>
        )}
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.errorType === nextProps.errorType &&
    prevProps.message === nextProps.message &&
    prevProps.title === nextProps.title &&
    prevProps.retryText === nextProps.retryText &&
    prevProps.icon === nextProps.icon,
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

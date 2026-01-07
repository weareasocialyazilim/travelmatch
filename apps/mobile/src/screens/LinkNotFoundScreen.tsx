/**
 * Link Not Found Screen
 *
 * Shown when deep link points to non-existent resource (404)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@/hooks/useNavigationHelpers';
import type { RootStackParamList } from '@/navigation/types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

type LinkNotFoundRouteProp = RouteProp<RootStackParamList, 'LinkNotFound'>;

const LinkNotFoundScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<LinkNotFoundRouteProp>();
  const message = route.params?.message || 'İçerik bulunamadı';

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Discover' }],
    });
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      handleGoHome();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="link-off"
            size={80}
            color={COLORS.feedback.error}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>İçerik Bulunamadı</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        <Text style={styles.submessage}>
          Aradığınız içerik kaldırılmış veya mevcut değil olabilir.
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={COLORS.utility.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color={COLORS.brand.primary}
              style={styles.buttonIcon}
            />
            <Text style={styles.secondaryButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>

        {/* Help text */}
        <View style={styles.helpContainer}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color={COLORS.text.secondary}
          />
          <Text style={styles.helpText}>
            Link yanlışsa veya sorun yaşıyorsanız destek ekibimizle iletişime
            geçin.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 60,
    backgroundColor: `${COLORS.feedback.error}15`,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 16,
  },
  submessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.brand.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.utility.white,
    fontSize: 16,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.brand.primary,
    fontSize: 16,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg.secondary || `${COLORS.text.secondary}08`,
    borderRadius: 8,
    maxWidth: 320,
  },
  helpText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default LinkNotFoundScreen;

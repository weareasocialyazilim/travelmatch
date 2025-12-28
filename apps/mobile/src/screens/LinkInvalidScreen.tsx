/**
 * Link Invalid Screen
 * 
 * Shown when deep link has invalid format/params
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

type LinkInvalidRouteProp = RouteProp<RootStackParamList, 'LinkInvalid'>;

const LinkInvalidScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<LinkInvalidRouteProp>();
  const message = route.params?.message || 'Link geçersiz';

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Discover' as never }],
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="link-variant-off"
            size={80}
            color={COLORS.text.secondary}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Geçersiz Link</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        <Text style={styles.submessage}>
          Link hatalı veya bozuk görünüyor. Linki kontrol edip tekrar deneyin.
        </Text>

        {/* Actions */}
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

        {/* Info */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={16}
            color={COLORS.text.secondary}
          />
          <Text style={styles.infoText}>
            Eğer bu linki bir bildirim veya mesajdan aldıysanız, lütfen kaynağı kontrol edin.
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
    backgroundColor: `${COLORS.text.secondary}15`,
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
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
    minWidth: 200,
  },
  primaryButton: {
    backgroundColor: COLORS.brand.primary,
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.utility.white,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg.secondary || `${COLORS.text.secondary}08`,
    borderRadius: 8,
    maxWidth: 320,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default LinkInvalidScreen;

/**
 * Link Expired Screen
 * 
 * Shown when deep link points to expired/deleted resource (410)
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

type LinkExpiredRouteProp = RouteProp<RootStackParamList, 'LinkExpired'>;

const LinkExpiredScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<LinkExpiredRouteProp>();
  const message = route.params?.message || 'Bu linkin süresi dolmuş gibi görünüyor';

  const handleGoHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Discover' as never }],
    });
  };

  const handleBrowseMore = () => {
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
            name="timer-off-outline"
            size={80}
            color={COLORS.warning}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Link Süresi Dolmuş</Text>

        {/* Message */}
        <Text style={styles.message}>{message}</Text>

        <Text style={styles.submessage}>
          Bu içerik artık mevcut değil veya kaldırılmış olabilir. Benzer içeriklere göz atmak ister misiniz?
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleBrowseMore}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="compass"
              size={20}
              color={COLORS.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.primaryButtonText}>Keşfet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="home"
              size={20}
              color={COLORS.primary}
              style={styles.buttonIcon}
            />
            <Text style={styles.secondaryButtonText}>Ana Sayfaya Dön</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.infoText}>
            Linkler belirli bir süre sonra geçerliliğini yitirebilir veya içerik sahibi tarafından kaldırılmış olabilir.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.warningLight || `${COLORS.warning}15`,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 16,
  },
  submessage: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontSize: 16,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.backgroundSecondary || `${COLORS.textSecondary}08`,
    borderRadius: 8,
    maxWidth: 320,
  },
  infoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default LinkExpiredScreen;

/**
 * Session Expired Screen
 * 
 * Shown when user's session has expired and cannot be refreshed
 * - Clear message about session expiry
 * - Login button to re-authenticate
 * - Prevents further app usage until re-login
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
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { sessionManager } from '../services/sessionManager';
import { logger } from '../utils/logger';

const SessionExpiredScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      // Clear session completely
      await sessionManager.clearSession();
      
      logger.info('[SessionExpired] Navigating to login');
      
      // Navigate to login screen
      // @ts-ignore - Navigation typing
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      logger.error('[SessionExpired] Clear session failed:', error);
      
      // Force navigation anyway
      // @ts-ignore
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="clock-alert-outline"
            size={80}
            color={COLORS.warning}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Oturumunuz Sona Erdi</Text>

        {/* Message */}
        <Text style={styles.message}>
          Güvenliğiniz için oturumunuz sonlandırıldı. Devam etmek için lütfen tekrar giriş yapın.
        </Text>

        {/* Login Button */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="login"
            size={20}
            color={COLORS.white}
            style={styles.buttonIcon}
          />
          <Text style={styles.loginButtonText}>Tekrar Giriş Yap</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color={COLORS.textSecondary}
          />
          <Text style={styles.infoText}>
            Verileriniz güvende. Giriş yaptıktan sonra kaldığınız yerden devam edebilirsiniz.
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
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 320,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 32,
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

export default SessionExpiredScreen;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';

type ReferralScreenProps = StackScreenProps<RootStackParamList, 'Referral'>;

/**
 * ReferralScreen - Invite friends without monetary promises
 *
 * Removed $20 credit claims for:
 * - App Store compliance (no unfulfilled promises)
 * - Legal compliance (no false advertising)
 * - Clear value prop without guaranteed rewards
 */
export default function ReferralScreen({ navigation }: ReferralScreenProps) {
  const insets = useSafeAreaInsets();
  const REFERRAL_CODE = 'KEMAL-2026';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Lovendo'ya katıl! Davet kodum: ${REFERRAL_CODE}`,
      });
    } catch (_shareError) {
      // Share cancelled or failed
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={[styles.closeBtn, { top: insets.top + 10 }]}
      >
        <Ionicons name="close" size={24} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.giftIconContainer}>
          <LinearGradient
            colors={[COLORS.brand.accent, '#FF6B6B']}
            style={styles.iconGradient}
          >
            <MaterialCommunityIcons
              name="gift-open-outline"
              size={60}
              color={COLORS.white}
            />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Invite Friends,{'\n'}Get Connected</Text>
        <Text style={styles.desc}>
          Share your code with friends. When they join, you both get connected and can share moments together.
        </Text>

        {/* Code Box */}
        <TouchableOpacity
          style={styles.codeBox}
          onPress={handleCopy}
          activeOpacity={0.8}
        >
          <Text style={styles.codeLabel}>YOUR CODE</Text>
          <Text style={styles.codeValue}>{REFERRAL_CODE}</Text>
          <Ionicons
            name="copy-outline"
            size={20}
            color={COLORS.brand.primary}
            style={styles.copyIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareText}>Share Code</Text>
          <Ionicons name="share-outline" size={20} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  closeBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  giftIconContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brand.accent,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    color: COLORS.textOnDarkSecondary,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  codeBox: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
  },
  codeLabel: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeValue: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  copyIcon: {
    position: 'absolute',
    right: 20,
    top: 30,
  },
  shareBtn: {
    width: '100%',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  shareText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.black,
  },
});

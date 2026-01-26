import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Linking,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { logger } from '@/utils/logger';
import { useToast } from '@/context/ToastContext';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';

type InviteFriendsScreenProps = StackScreenProps<
  RootStackParamList,
  'InviteFriends'
>;

/**
 * InviteFriendsScreen - Invite friends to join Lovendo
 *
 * Features:
 * - Fetches invite code from Supabase RPC
 * - Copy to clipboard
 * - Share via native share sheet
 * - SMS sharing (sms: URI)
 * - Instagram sharing (web URL since Instagram API is restricted)
 */
export default function InviteFriendsScreen({
  navigation,
}: InviteFriendsScreenProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inviteCode, setInviteCode] = useState<string>('');
  const [friendsJoined, setFriendsJoined] = useState(0);
  const [momentsGifted, setMomentsGifted] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch invite code and stats from Supabase
  useEffect(() => {
    const fetchInviteData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get invite code
        const { data: codeData, error: codeError } = await supabase.rpc(
          'get_or_create_invite_code' as any,
          { p_user_id: user.id },
        );

        if (codeError) {
          logger.error('Failed to fetch invite code:', codeError);
          // Fallback to demo code
          setInviteCode('LV-DEMO');
        } else if (codeData && typeof codeData === 'string') {
          setInviteCode(codeData);
        } else {
          setInviteCode('LV-DEMO');
        }

        // Get usage stats - simplified query
        const userInviteCodeResult = await supabase
          .from('user_invite_codes')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (userInviteCodeResult.data && !userInviteCodeResult.error) {
          const userInviteData = userInviteCodeResult.data as { id: string };
          const statsResult = await supabase
            .from('invite_code_usages')
            .select('id')
            .eq('invite_code_id', userInviteData.id);

          if (statsResult.data && !statsResult.error) {
            setFriendsJoined(statsResult.data.length);
            // Estimate moments gifted (simplified - each friend could gift)
            setMomentsGifted(Math.floor(statsResult.data.length * 0.5));
          }
        }
      } catch (error) {
        logger.error('Failed to fetch invite data:', error);
        setInviteCode('LV-DEMO');
      } finally {
        setLoading(false);
      }
    };

    fetchInviteData();
  }, [user]);

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      showToast(t('invite.codeCopied', 'Code copied!'), 'success');
    } catch (error) {
      logger.error('Failed to copy code:', error);
      showToast(t('invite.copyFailed', 'Failed to copy'), 'error');
    }
  };

  const handleShareLink = async () => {
    if (!inviteCode) return;
    try {
      const message = t('invite.shareMessage', { code: inviteCode });
      await Share.share({
        message,
        title: t('invite.shareTitle', 'Join Lovendo'),
      });
    } catch (error) {
      logger.error('Share failed:', error);
    }
  };

  const handleShareMessages = async () => {
    if (!inviteCode) return;
    try {
      const message = t('invite.shareMessage', { code: inviteCode });
      const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(smsUrl);

      if (canOpen) {
        await Linking.openURL(smsUrl);
      } else {
        // Fallback to native share
        await Share.share({
          message,
          title: t('invite.shareTitle', 'Join Lovendo'),
        });
      }
    } catch (error) {
      logger.error('SMS share failed:', error);
      // Fallback
      handleShareLink();
    }
  };

  const handleShareInstagram = async () => {
    if (!inviteCode) return;

    try {
      const message = t('invite.shareMessage', { code: inviteCode });
      const instagramUrl = `https://instagram.com/intent/post?message=${encodeURIComponent(message)}`;
      const canOpen = await Linking.canOpenURL(instagramUrl);

      if (canOpen) {
        await Linking.openURL(instagramUrl);
      } else {
        // Fallback: Copy to clipboard and show instructions
        await Clipboard.setStringAsync(message);
        Alert.alert(
          t('invite.instagramTitle', 'Share on Instagram'),
          t(
            'invite.instagramMessage',
            'Link copied! Open Instagram and paste it in your story or DM.',
          ),
          [{ text: t('common.ok', 'OK') }],
        );
      }
    } catch (error) {
      logger.error('Instagram share failed:', error);
      // Fallback to clipboard
      await Clipboard.setStringAsync(inviteCode);
      showToast(t('invite.linkCopied', 'Link copied!'), 'info');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('invite.title')}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="reload" size={24} color={COLORS.brand.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('invite.title')}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
            }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Title and Description */}
        <Text style={styles.mainTitle}>Share Lovendo</Text>
        <Text style={styles.description}>
          {t(
            'invite.description',
            'Invite people who care about real moments.',
          )}
        </Text>

        {/* Invite Code Card */}
        <View style={styles.inviteCodeCard}>
          <Text style={styles.codeLabel}>{t('invite.codeLabel')}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyCode}
            >
              <MaterialCommunityIcons
                name="content-copy"
                size={16}
                color={COLORS.brand.primary}
              />
              <Text style={styles.copyButtonText}>{t('invite.copy')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleShareLink}
          >
            <MaterialCommunityIcons
              name="link"
              size={20}
              color={COLORS.utility.white}
            />
            <Text style={styles.primaryButtonText}>
              {t('invite.shareLink')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareMessages}
          >
            <MaterialCommunityIcons
              name="message-text"
              size={20}
              color={COLORS.text.primary}
            />
            <Text style={styles.secondaryButtonText}>
              {t('invite.shareMessages')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShareInstagram}
          >
            <MaterialCommunityIcons
              name="instagram"
              size={20}
              color={COLORS.text.primary}
            />
            <Text style={styles.secondaryButtonText}>
              {t('invite.shareInstagram')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Your Impact Section */}
        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>{t('invite.impact')}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('invite.friendsJoined')}</Text>
              <Text style={styles.statValue}>{friendsJoined}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('invite.momentsGifted')}</Text>
              <Text style={styles.statValue}>{momentsGifted}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text.secondary,
  },
  heroContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 1,
  },
  mainTitle: {
    ...TYPOGRAPHY.display2,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    paddingTop: 24,
    paddingBottom: 12,
  },
  description: {
    ...TYPOGRAPHY.bodyLarge,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  inviteCodeCard: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  codeLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '500',
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.brand.primary,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.mintTransparentLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    color: COLORS.brand.primary,
  },
  buttonsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.utility.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    gap: 8,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  impactSection: {
    padding: 16,
  },
  impactTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  statsContainer: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statLabel: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  statValue: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  bottomSpacer: {
    height: 96,
  },
});

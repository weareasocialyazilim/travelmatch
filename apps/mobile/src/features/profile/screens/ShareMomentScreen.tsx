import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Image,
  Clipboard,
  Linking,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';
import { logger } from '@/utils/logger';
import { useMoments } from '@/hooks/useMoments';
import type { Moment } from '@/hooks/useMoments';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';

type ShareMomentScreenProps = RouteProp<RootStackParamList, 'ShareMoment'>;

interface ShareOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  action: () => void;
}

export const ShareMomentScreen: React.FC = () => {
  const { showToast } = useToast();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ShareMomentScreenProps>();
  const { momentId } = route.params;
  const { getMoment } = useMoments();
  const [moment, setMoment] = useState<Moment | null>(null);
  const [_loading, setLoading] = useState(true);

  const [linkCopied, setLinkCopied] = useState(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch moment details
  useEffect(() => {
    const fetchMoment = async () => {
      if (!momentId) return;
      try {
        const data = await getMoment(momentId);
        setMoment(data);
      } catch (error) {
        logger.error('Failed to fetch moment', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMoment();
  }, [momentId, getMoment]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const displayMoment = moment || {
    id: momentId,
    title: 'TravelMatch Moment',
    description: 'Check out this amazing moment!',
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    ],
    pricePerGuest: 0,
  };

  const shareUrl = `https://travelmatch.app/moment/${momentId}`;
  const shareMessage = `Check out this moment on TravelMatch: ${displayMoment.title}\n${shareUrl}`;

  const handleNativeShare = useCallback(async () => {
    try {
      await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: displayMoment.title,
      });
    } catch {
      showToast('Could not share this moment', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareMessage, shareUrl, displayMoment.title]);

  const handleCopyLink = useCallback(() => {
    Clipboard.setString(shareUrl);
    setLinkCopied(true);
    // Clear previous timeout
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => setLinkCopied(false), 2000);
  }, [shareUrl]);

  const handleShareToWhatsApp = useCallback(() => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
      shareMessage,
    )}`;
    Linking.canOpenURL(whatsappUrl).then((supported) => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          'WhatsApp not installed',
          'Please install WhatsApp to share.',
        );
      }
    });
  }, [shareMessage]);

  const handleShareToInstagram = useCallback(() => {
    showToast('Opening Instagram to share...', 'info');
    // In production, would use Instagram API
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShareToTwitter = useCallback(() => {
    const twitterUrl = `twitter://post?message=${encodeURIComponent(
      shareMessage,
    )}`;
    Linking.canOpenURL(twitterUrl).then((supported) => {
      if (supported) {
        Linking.openURL(twitterUrl);
      } else {
        Linking.openURL(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareMessage,
          )}`,
        );
      }
    });
  }, [shareMessage]);

  const handleShareToFacebook = useCallback(() => {
    const fbUrl = `fb://share?u=${encodeURIComponent(shareUrl)}`;
    Linking.canOpenURL(fbUrl).then((supported) => {
      if (supported) {
        Linking.openURL(fbUrl);
      } else {
        Linking.openURL(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl,
          )}`,
        );
      }
    });
  }, [shareUrl]);

  const handleShareToTelegram = useCallback(() => {
    const telegramUrl = `tg://msg_url?url=${encodeURIComponent(
      shareUrl,
    )}&text=${encodeURIComponent(displayMoment.title)}`;
    Linking.canOpenURL(telegramUrl).then((supported) => {
      if (supported) {
        Linking.openURL(telegramUrl);
      } else {
        Linking.openURL(
          `https://t.me/share/url?url=${encodeURIComponent(
            shareUrl,
          )}&text=${encodeURIComponent(displayMoment.title)}`,
        );
      }
    });
  }, [shareUrl, displayMoment.title]);

  const shareOptions: ShareOption[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: 'whatsapp',
      color: COLORS.whatsapp,
      action: handleShareToWhatsApp,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: 'instagram',
      color: COLORS.instagram,
      action: handleShareToInstagram,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: 'twitter',
      color: COLORS.twitter,
      action: handleShareToTwitter,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: 'facebook',
      color: COLORS.facebook,
      action: handleShareToFacebook,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: 'telegram',
      color: COLORS.telegram,
      action: handleShareToTelegram,
    },
    {
      id: 'more',
      label: 'More',
      icon: 'dots-horizontal',
      color: COLORS.textSecondary,
      action: handleNativeShare,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Moment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Preview Card */}
      <View style={styles.previewSection}>
        <View style={styles.previewCard}>
          <Image
            source={{
              uri:
                displayMoment.images?.[0] || 'https://via.placeholder.com/400',
            }}
            style={styles.previewImage}
          />
          <View style={styles.previewInfo}>
            <Text style={styles.previewTitle} numberOfLines={2}>
              {displayMoment.title}
            </Text>
            <Text style={styles.previewPrice}>
              ${displayMoment.pricePerGuest}
            </Text>
          </View>
        </View>
      </View>

      {/* Copy Link Section */}
      <View style={styles.copyLinkSection}>
        <View style={styles.linkContainer}>
          <MaterialCommunityIcons
            name="link-variant"
            size={20}
            color={COLORS.textSecondary}
          />
          <Text style={styles.linkText} numberOfLines={1}>
            {shareUrl}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.copyButton, linkCopied && styles.copyButtonSuccess]}
          onPress={handleCopyLink}
        >
          <MaterialCommunityIcons
            name={linkCopied ? 'check' : 'content-copy'}
            size={18}
            color={linkCopied ? COLORS.mint : COLORS.primary}
          />
          <Text
            style={[
              styles.copyButtonText,
              linkCopied && styles.copyButtonTextSuccess,
            ]}
          >
            {linkCopied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Share Options */}
      <View style={styles.shareOptionsSection}>
        <Text style={styles.sectionTitle}>Share via</Text>
        <View style={styles.shareOptionsGrid}>
          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.shareOption}
              onPress={option.action}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.shareIconWrapper,
                  { backgroundColor: option.color + '15' },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    option.icon as React.ComponentProps<
                      typeof MaterialCommunityIcons
                    >['name']
                  }
                  size={28}
                  color={option.color}
                />
              </View>
              <Text style={styles.shareOptionLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* QR Code Section (Optional) */}
      <View style={styles.qrSection}>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => showToast('QR code would be displayed here', 'info')}
        >
          <MaterialCommunityIcons
            name="qrcode"
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.qrButtonText}>Show QR Code</Text>
        </TouchableOpacity>
      </View>

      {/* Invite Friends */}
      <TouchableOpacity
        style={styles.inviteButton}
        onPress={() => navigation.navigate('InviteFriends')}
      >
        <MaterialCommunityIcons
          name="account-plus"
          size={20}
          color={COLORS.white}
        />
        <Text style={styles.inviteButtonText}>
          Invite Friends to TravelMatch
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 40,
  },
  previewSection: {
    padding: 16,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: 80,
    height: 80,
  },
  previewInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  copyLinkSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  linkContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  copyButtonSuccess: {
    backgroundColor: COLORS.mint + '15',
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  copyButtonTextSuccess: {
    color: COLORS.mint,
  },
  shareOptionsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  shareOption: {
    alignItems: 'center',
    width: '28%',
  },
  shareIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  shareOptionLabel: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  qrButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 'auto',
    marginBottom: 16,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default ShareMomentScreen;

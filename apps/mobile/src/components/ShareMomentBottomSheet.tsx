import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Share,
  Clipboard,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { logger } from '../utils/logger';
import { useToast } from '../context/ToastContext';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Props for ShareMomentBottomSheet component
 */
interface ShareMomentBottomSheetProps {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Callback when the sheet is closed */
  onClose: () => void;
  /** The URL to share */
  momentUrl?: string;
  /** The title/message to share */
  momentTitle?: string;
}

/**
 * Bottom sheet for sharing moments via various platforms.
 * Supports native share, copy link, and platform-specific sharing.
 *
 * @example
 * ```tsx
 * <ShareMomentBottomSheet
 *   visible={showShare}
 *   onClose={() => setShowShare(false)}
 *   momentUrl="https://travelmatch.com/moment/123"
 *   momentTitle="Amazing coffee experience!"
 * />
 * ```
 */
export const ShareMomentBottomSheet: React.FC<ShareMomentBottomSheetProps> = ({
  visible,
  onClose,
  momentUrl = 'https://travelmatch.com/moment/123',
  momentTitle = 'Check out this amazing travel moment!',
}) => {
  const { showToast } = useToast();

  const handleCopyLink = () => {
    try {
      Clipboard.setString(momentUrl);
      showToast('Link copied to clipboard!', 'success');
      onClose();
    } catch (error) {
      showToast('Link kopyalanamadı', 'error');
    }
  };

  const handleShareVia = async () => {
    try {
      await Share.share({
        message: `${momentTitle}\n${momentUrl}`,
        url: momentUrl,
      });
      onClose();
    } catch (error) {
      logger.error('Share error:', error);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(`${momentTitle}\n${momentUrl}`)}`;
      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        showToast('WhatsApp is not installed', 'warning');
      }
      onClose();
    } catch (error) {
      logger.error('WhatsApp share error:', error);
      showToast('WhatsApp açılamadı. Lütfen uygulamanın yüklü olduğundan emin olun', 'error');
    }
  };

  const handleInstagram = async () => {
    try {
      const instagramUrl = 'instagram://';
      const canOpen = await Linking.canOpenURL(instagramUrl);

      if (canOpen) {
        await Linking.openURL(instagramUrl);
        showToast('Please paste the link in Instagram', 'info');
      } else {
        showToast('Instagram is not installed', 'warning');
      }
      onClose();
    } catch (error) {
      logger.error('Instagram share error:', error);
      showToast('Instagram açılamadı. Lütfen uygulamanın yüklü olduğundan emin olun', 'error');
    }
  };

  const options = [
    {
      id: 'copy',
      icon: 'link' as IconName,
      label: 'Copy link',
      onPress: handleCopyLink,
      backgroundColor: COLORS.gray[100],
      iconColor: COLORS.textSecondary,
    },
    {
      id: 'share',
      icon: 'share-variant' as IconName,
      label: 'Share via...',
      onPress: handleShareVia,
      backgroundColor: COLORS.gray[100],
      iconColor: COLORS.textSecondary,
    },
  ];

  const socialOptions = [
    {
      id: 'whatsapp',
      icon: 'whatsapp' as IconName,
      label: 'Share to WhatsApp',
      onPress: handleWhatsApp,
      backgroundColor: COLORS.whatsappTransparent20,
      iconColor: COLORS.whatsapp,
    },
    {
      id: 'instagram',
      icon: 'instagram' as IconName,
      label: 'Share to Instagram',
      onPress: handleInstagram,
      backgroundColor: COLORS.instagramTransparent20,
      iconColor: COLORS.instagram,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.sheetContainer}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <Text style={styles.header}>Share moment</Text>

          {/* Options List */}
          <ScrollView style={styles.optionsList}>
            {/* General Share Options */}
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={option.onPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.backgroundColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={24}
                    color={option.iconColor}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Social Share Options */}
            {socialOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionItem}
                onPress={option.onPress}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.backgroundColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={24}
                    color={option.iconColor}
                  />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bottom Safe Area */}
          <View style={styles.bottomSpacer} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay40,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  handleContainer: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  optionsList: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  bottomSpacer: {
    height: 0,
  },
});

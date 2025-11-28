import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

interface ShareProofModalProps {
  visible: boolean;
  onClose: () => void;
  proofId: string;
  proofTitle: string;
}

export const ShareProofModal: React.FC<ShareProofModalProps> = ({
  visible,
  onClose,
  proofId,
  proofTitle,
}) => {
  const shareUrl = `https://travelmatch.app/proof/${proofId}`;

  const handleShare = async (platform: string) => {
    try {
      if (platform === 'native') {
        await Share.share({
          message: `Check out my kindness gesture: ${proofTitle}\n${shareUrl}`,
          title: 'Share Proof',
        });
      } else {
        // Implement platform-specific sharing
        console.log(`Share to ${platform}:`, shareUrl);
      }
      onClose();
    } catch (error) {
      // Log the error if the user cancels the share sheet or if another error occurs.
      console.error('Share error:', error);
    }
  };

  const handleCopyLink = async () => {
    // Implement clipboard copy
    console.log('Copied:', shareUrl);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Share Proof</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Proof Info */}
          <View style={styles.proofInfo}>
            <Icon name="check-decagram" size={32} color={COLORS.success} />
            <Text style={styles.proofTitle}>{proofTitle}</Text>
          </View>

          {/* Share Options */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('story')}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.optionGradient}
              >
                <Icon name="instagram" size={32} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.optionLabel}>Story</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('facebook')}
            >
              <View
                style={[styles.optionCircle, { backgroundColor: COLORS.info }]}
              >
                <Icon name="facebook" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('twitter')}
            >
              <View
                style={[
                  styles.optionCircle,
                  { backgroundColor: COLORS.twitter },
                ]}
              >
                <Icon name="twitter" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('whatsapp')}
            >
              <View
                style={[
                  styles.optionCircle,
                  { backgroundColor: COLORS.whatsapp },
                ]}
              >
                <Icon name="whatsapp" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('native')}
            >
              <View
                style={[
                  styles.optionCircle,
                  { backgroundColor: COLORS.textSecondary },
                ]}
              >
                <Icon name="share-variant" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>More</Text>
            </TouchableOpacity>
          </View>

          {/* Copy Link */}
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Icon name="link-variant" size={20} color={COLORS.primary} />
            <Text style={styles.copyButtonText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  closeButton: {
    padding: LAYOUT.padding / 2,
  },
  copyButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  copyButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: VALUES.borderRadius * 2,
    borderTopRightRadius: VALUES.borderRadius * 2,
    paddingBottom: LAYOUT.padding * 3,
  },
  option: {
    alignItems: 'center',
  },
  optionCircle: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: LAYOUT.padding / 2,
    width: 60,
  },
  optionGradient: {
    alignItems: 'center',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    marginBottom: LAYOUT.padding / 2,
    width: 60,
  },
  optionLabel: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: LAYOUT.padding * 2,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  overlay: {
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'flex-end',
  },
  proofInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  proofTitle: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: LAYOUT.padding,
  },
  title: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
});

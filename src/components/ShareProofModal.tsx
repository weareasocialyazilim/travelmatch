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
              <View style={[styles.optionCircle, { backgroundColor: '#1877F2' }]}>
                <Icon name="facebook" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('twitter')}
            >
              <View style={[styles.optionCircle, { backgroundColor: '#1DA1F2' }]}>
                <Icon name="twitter" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('whatsapp')}
            >
              <View style={[styles.optionCircle, { backgroundColor: '#25D366' }]}>
                <Icon name="whatsapp" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.optionLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleShare('native')}
            >
              <View style={[styles.optionCircle, { backgroundColor: COLORS.textSecondary }]}>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: VALUES.borderRadius * 2,
    borderTopRightRadius: VALUES.borderRadius * 2,
    paddingBottom: LAYOUT.padding * 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeButton: {
    padding: LAYOUT.padding / 2,
  },
  proofInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 2,
  },
  proofTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 2,
  },
  option: {
    alignItems: 'center',
  },
  optionGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.padding / 2,
  },
  optionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: LAYOUT.padding / 2,
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '20',
    marginHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: LAYOUT.padding / 2,
  },
});

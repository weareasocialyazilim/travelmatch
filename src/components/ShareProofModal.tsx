import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { TYPOGRAPHY } from '../constants/typography';
import { SHADOWS } from '../constants/shadows';

interface ShareProofModalProps {
  visible: boolean;
  onClose: () => void;
  onShare: (platform: string) => void;
  proofUrl: string;
}

const socialPlatforms = [
  { name: 'Instagram', icon: 'instagram', color: COLORS.instagram },
  { name: 'Facebook', icon: 'facebook', color: COLORS.info },
  { name: 'Twitter', icon: 'twitter', color: COLORS.twitter },
  { name: 'WhatsApp', icon: 'whatsapp', color: COLORS.whatsapp },
  { name: 'More', icon: 'dots-horizontal', color: COLORS.textSecondary },
];

export const ShareProofModal: React.FC<ShareProofModalProps> = ({
  visible,
  onClose,
  onShare,
  proofUrl,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // In a real app, you would use Clipboard API
    console.log('Copied to clipboard:', proofUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>

          <Text style={styles.title}>Share Your Proof</Text>
          <Text style={styles.subtitle}>
            Let the world see the impact of kindness.
          </Text>

          <View style={styles.linkContainer}>
            <TextInput
              style={styles.linkInput}
              value={proofUrl}
              editable={false}
            />
            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <MaterialCommunityIcons
                name={copied ? 'check' : 'content-copy'}
                size={20}
                color={copied ? COLORS.success : COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.socialGrid}>
            {socialPlatforms.map((platform) => (
              <TouchableOpacity
                key={platform.name}
                style={styles.socialButton}
                onPress={() => onShare(platform.name)}
              >
                <View
                  style={[
                    styles.socialIconContainer,
                    { backgroundColor: platform.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={platform.icon}
                    size={32}
                    color={COLORS.white}
                  />
                </View>
                <Text style={styles.socialLabel}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  container: {
    backgroundColor: COLORS.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    width: '100%',
    ...Platform.select({
      ios: SHADOWS.lg,
      android: {
        elevation: 10,
      },
    }),
  },
  copyButton: {
    padding: spacing.sm,
  },
  linkContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.gray,
    borderRadius: radii.md,
    flexDirection: 'row',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  linkInput: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: COLORS.modalBackdrop,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  socialButton: {
    alignItems: 'center',
    width: '25%',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialIconContainer: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 64,
  },
  socialLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  title: {
    ...TYPOGRAPHY.h2,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

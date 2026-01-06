import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ClearCacheDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearCacheDialog: React.FC<ClearCacheDialogProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      testID="clear-cache-modal"
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={'broom' as IconName}
              size={40}
              color={COLORS.brand.primary}
            />
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.headline}>Clear cache?</Text>
            <Text style={styles.body}>
              This will remove temporary data but won&apos;t delete your
              moments.
            </Text>
          </View>

          {/* Button Group */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                onConfirm();
                onClose();
              }}
            >
              <Text style={styles.confirmButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 384,
    backgroundColor: COLORS.utility.white,
    borderRadius: 24,
    padding: 24,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 16,
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.brand.primary}1A`, // 10% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingTop: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    paddingTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: primitives.stone[100],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
    letterSpacing: 0.24,
  },
  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.utility.white,
    letterSpacing: 0.24,
  },
});

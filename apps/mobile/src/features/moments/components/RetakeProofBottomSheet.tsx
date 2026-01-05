import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface RetakeProofBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onTakeNewPhoto: () => void;
}

export const RetakeProofBottomSheet: React.FC<RetakeProofBottomSheetProps> = ({
  visible,
  onClose,
  onTakeNewPhoto,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Headline */}
        <Text style={styles.headline}>Retake proof?</Text>

        {/* Take New Photo Option */}
        <TouchableOpacity
          style={styles.listItem}
          onPress={onTakeNewPhoto}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={'camera' as IconName}
              size={24}
              color={COLORS.brand.primary}
            />
          </View>
          <Text style={styles.listItemText}>Take new photo</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
        </View>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onClose}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        {/* Bottom Safe Area */}
        <View style={styles.bottomSafeArea} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay40,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border.default,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 56,
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `${COLORS.brand.primary}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.brand.primary,
    flex: 1,
  },
  dividerContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  cancelButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginVertical: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.secondary,
  },
  bottomSafeArea: {
    height: 20,
  },
});

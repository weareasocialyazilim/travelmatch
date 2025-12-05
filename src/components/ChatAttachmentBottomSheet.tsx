import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

interface ChatAttachmentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onPhotoVideo: () => void;
  onGift: () => void;
}

export const ChatAttachmentBottomSheet: React.FC<
  ChatAttachmentBottomSheetProps
> = ({ visible, onClose, onPhotoVideo, onGift }) => {
  const options = [
    {
      id: 'photo',
      icon: 'camera' as IconName,
      label: 'Photo or Video',
      description: 'Share a photo or video',
      onPress: onPhotoVideo,
      color: COLORS.primary,
    },
    {
      id: 'gift',
      icon: 'gift' as IconName,
      label: 'Send a Gift',
      description: 'Gift this moment to someone',
      onPress: onGift,
      color: COLORS.coral,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <Text style={styles.header}>Add to message</Text>

          {/* Options List */}
          <View style={styles.optionsList}>
            {options.map((option, index) => (
              <React.Fragment key={option.id}>
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    option.onPress();
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: option.color + '20' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={option.icon}
                      size={28}
                      color={option.color}
                    />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={'chevron-right' as IconName}
                    size={24}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
                {index < options.length - 1 && (
                  <View style={styles.separator} />
                )}
              </React.Fragment>
            ))}
          </View>

          {/* Bottom Safe Area */}
          <View style={styles.bottomSpacer} />
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay50,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.9,
    elevation: 5,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  handleContainer: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.24,
  },
  optionsList: {
    flexGrow: 0,
    flexShrink: 0,
    paddingBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 72, // Align with text
  },
  bottomSpacer: {
    height: 32,
  },
});

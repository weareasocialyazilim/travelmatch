import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface UnblockUserBottomSheetProps {
  visible: boolean;
  userName: string;
  userAvatarUrl?: string;
  onUnblock: () => void;
  onCancel: () => void;
}

export const UnblockUserBottomSheet: React.FC<UnblockUserBottomSheetProps> = ({
  visible,
  userName,
  userAvatarUrl,
  onUnblock,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={styles.bottomSheet}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Profile Section */}
          <View style={styles.profileSection}>
            {userAvatarUrl ? (
              <Image source={{ uri: userAvatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={64}
                  color={COLORS.text.secondary}
                />
              </View>
            )}
            <Text style={styles.title}>{userName} engelini kaldır?</Text>
            <Text style={styles.description}>
              Bu kişinin anlarını görebilecek, mesajlarını alabilecek ve tekrar
              hediye gönderebileceksin. Yeni bir başlangıç için hazır mısın? 💝
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={COLORS.brand.primary}
            />
            <Text style={styles.infoText}>
              Engeli kaldırdığında karşı tarafa bildirim gitmeyecek.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.unblockButton}
              onPress={onUnblock}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="account-check"
                size={20}
                color={COLORS.utility.white}
              />
              <Text style={styles.unblockButtonText}>Engeli Kaldır</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay40,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.brand.primary}15`,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.brand.primary,
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  unblockButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 12,
    gap: 8,
  },
  unblockButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.utility.black,
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border.default,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
});

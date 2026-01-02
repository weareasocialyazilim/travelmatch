import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface GlassModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const GlassModal = ({
  visible,
  title,
  message,
  type = 'info',
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: GlassModalProps) => {

  const getIcon = () => {
    switch (type) {
      case 'success': return { name: 'checkmark-circle', color: COLORS.feedback.success };
      case 'danger': return { name: 'alert-circle', color: COLORS.feedback.error };
      default: return { name: 'information-circle', color: COLORS.brand.primary };
    }
  };

  const iconData = getIcon();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={styles.container}>
          <View style={[styles.iconCircle, { backgroundColor: `${iconData.color}20` }]}>
            <Ionicons name={iconData.name as any} size={32} color={iconData.color} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: type === 'danger' ? COLORS.feedback.error : COLORS.brand.primary }]}
              onPress={onConfirm}
            >
              <Text style={[styles.confirmText, type === 'danger' ? { color: COLORS.utility.white } : { color: COLORS.text.onLight }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

export type { GlassModalProps };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.surface.overlayHeavy,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: width * 0.85,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.surface.glassBorder,
    backgroundColor: COLORS.background.glass
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
    textAlign: 'center'
  },
  message: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surface.glass
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center'
  },
  cancelText: {
    color: COLORS.text.primary,
    fontWeight: '600'
  },
  confirmText: {
    fontWeight: 'bold'
  },
});

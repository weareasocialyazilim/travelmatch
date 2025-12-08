import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';

interface DeleteMomentDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  momentTitle: string;
  isDeleting?: boolean;
}

export function DeleteMomentDialog({
  visible,
  onClose,
  onConfirm,
  momentTitle,
  isDeleting = false,
}: DeleteMomentDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 z-10"
            disabled={isDeleting}
          >
            <X size={24} color="#666" />
          </TouchableOpacity>

          {/* Icon */}
          <View className="items-center mb-4 mt-2">
            <View className="w-16 h-16 rounded-full bg-amber-100 items-center justify-center">
              <AlertTriangle size={32} color="#f59e0b" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-center text-foreground mb-2">
            Delete Moment?
          </Text>

          {/* Description */}
          <View className="bg-muted/50 rounded-lg p-3 mb-4">
            <Text className="text-sm text-foreground font-medium text-center">
              "{momentTitle}"
            </Text>
          </View>

          <Text className="text-center text-muted-foreground text-sm mb-6 leading-5">
            This moment will be deleted but can be{' '}
            <Text className="font-semibold text-foreground">restored within 90 days</Text>.
            After 90 days, it will be permanently removed.
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 border-2 border-border rounded-lg bg-background"
            >
              <Text className="text-center font-semibold text-foreground">
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-destructive rounded-lg"
            >
              <Text className="text-center font-semibold text-destructive-foreground">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Note */}
          <View className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-xs text-blue-900 text-center">
              💡 You can restore this from Profile → Deleted Moments
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/**
 * PhotoSection Component
 * Photo picker section for CreateMoment screen
 * Uses centralized camera configuration for high-quality captures
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Alert,
  ActionSheetIOS,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';
import { useToast } from '@/context/ToastContext';
import { launchCamera, launchGallery } from '@/utils/cameraConfig';

interface PhotoSectionProps {
  photo: string;
  onPhotoSelected: (uri: string) => void;
}

const PhotoSection: React.FC<PhotoSectionProps> = memo(
  ({ photo, onPhotoSelected }) => {
    const { showToast } = useToast();

    const handleCameraCapture = useCallback(async () => {
      try {
        const asset = await launchCamera('MOMENT_PHOTO');
        if (asset) {
          onPhotoSelected(asset.uri);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          showToast('Camera permission is required', 'warning');
        } else {
          showToast(STRINGS.ERRORS.PHOTO_SELECT, 'error');
        }
      }
    }, [onPhotoSelected, showToast]);

    const handleGallerySelect = useCallback(async () => {
      try {
        const assets = await launchGallery('MOMENT_PHOTO', false);
        if (assets.length > 0) {
          onPhotoSelected(assets[0].uri);
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          showToast(STRINGS.ERRORS.PHOTO_PERMISSION, 'warning');
        } else {
          showToast(STRINGS.ERRORS.PHOTO_SELECT, 'error');
        }
      }
    }, [onPhotoSelected, showToast]);

    const pickImage = useCallback(() => {
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) void handleCameraCapture();
            if (buttonIndex === 2) void handleGallerySelect();
          },
        );
      } else {
        Alert.alert('Add Photo', 'Choose an option', [
          { text: 'Take Photo', onPress: () => void handleCameraCapture() },
          { text: 'Choose from Gallery', onPress: () => void handleGallerySelect() },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    }, [handleCameraCapture, handleGallerySelect]);

    return (
      <TouchableOpacity
        style={styles.photoSection}
        onPress={pickImage}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={photo ? 'Change photo' : 'Add photo'}
        accessibilityHint="Opens camera or gallery to select a photo"
      >
        {photo ? (
          <>
            <Image source={{ uri: photo }} style={styles.heroImage} />
            <View style={styles.photoOverlay}>
              <MaterialCommunityIcons
                name="camera"
                size={32}
                color={COLORS.white}
              />
              <Text style={styles.photoOverlayText}>Change Photo</Text>
            </View>
          </>
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons
              name="camera-plus"
              size={64}
              color={COLORS.textTertiary}
            />
            <Text style={styles.photoPlaceholderText}>
              Add a photo that tells your story
            </Text>
            <Text style={styles.photoPlaceholderSubtext}>
              Tap to choose from gallery
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

PhotoSection.displayName = 'PhotoSection';

const styles = StyleSheet.create({
  photoSection: {
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.white,
    width: '100%',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: COLORS.overlay30,
    gap: 8,
    justifyContent: 'center',
  },
  photoOverlayText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  photoPlaceholder: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  photoPlaceholderText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoPlaceholderSubtext: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default PhotoSection;

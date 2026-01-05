/**
 * PhotoSection Component
 * Photo picker section for CreateMoment screen
 * Uses centralized camera configuration for high-quality captures
 *
 * Also includes AwwwardsPhotoSection variant:
 * - Liquid Glass effect upload area
 * - Neon camera icon with plus badge
 * - Premium thumbnail previews
 * - "Cinematic Trust Jewelry" aesthetic
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import { STRINGS } from '@/constants/strings';
import { useToast } from '@/context/ToastContext';
import { launchCamera, launchGallery } from '@/utils/cameraConfig';
import { GlassCard } from '@/components/ui/GlassCard';

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
        showAlert({
          title: 'Add Photo',
          message: 'Choose an option',
          buttons: [
            { text: 'Take Photo', onPress: () => void handleCameraCapture() },
            {
              text: 'Choose from Gallery',
              onPress: () => void handleGallerySelect(),
            },
            { text: 'Cancel', style: 'cancel' },
          ],
        });
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
                color={COLORS.utility.white}
              />
              <Text style={styles.photoOverlayText}>Change Photo</Text>
            </View>
          </>
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialCommunityIcons
              name="camera-plus"
              size={64}
              color={COLORS.text.tertiary}
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
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.utility.white,
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
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  photoPlaceholderSubtext: {
    color: COLORS.text.secondary,
    fontSize: 13,
    textAlign: 'center',
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsPhotoSection - Liquid Glass Upload Area
// Premium glass effect with neon icons
// ═══════════════════════════════════════════════════════════════════════════

interface AwwwardsPhotoSectionProps {
  /** Selected photos (up to 3 thumbnails shown) */
  photos?: string[];
  /** Callback when upload area is pressed */
  onUploadPress: () => void;
  /** Callback when a thumbnail is pressed */
  onThumbnailPress?: (index: number) => void;
  /** Maximum file size hint */
  maxSizeHint?: string;
}

/**
 * AwwwardsPhotoSection - Liquid Glass Upload Area
 *
 * Premium photo upload section with:
 * - Glass card effect container
 * - Neon camera icon with plus badge
 * - Turkish label text
 * - Thumbnail preview slots
 */
export const AwwwardsPhotoSection: React.FC<AwwwardsPhotoSectionProps> = memo(
  ({
    photos = [],
    onUploadPress,
    onThumbnailPress,
    maxSizeHint = 'Maksimum 50MB • HD Kalite',
  }) => {
    return (
      <View style={awwwardsStyles.container}>
        {/* Glass Upload Area */}
        <GlassCard intensity={15} style={awwwardsStyles.uploadArea}>
          <TouchableOpacity
            style={awwwardsStyles.innerUpload}
            onPress={onUploadPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Fotoğraf veya video ekle"
          >
            {/* Camera Icon with Plus Badge */}
            <View style={awwwardsStyles.iconCircle}>
              <Ionicons name="camera" size={32} color={COLORS.brand.primary} />
              <View style={awwwardsStyles.plusBadge}>
                <Ionicons name="add" size={12} color={COLORS.text.inverse} />
              </View>
            </View>

            {/* Upload Text */}
            <Text style={awwwardsStyles.uploadText}>
              Fotoğraf veya Video Ekle
            </Text>
            <Text style={awwwardsStyles.hintText}>{maxSizeHint}</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* Thumbnail Preview Slots */}
        <View style={awwwardsStyles.thumbnails}>
          {[0, 1, 2].map((i) => (
            <TouchableOpacity
              key={i}
              style={awwwardsStyles.thumbPlaceholder}
              onPress={() => onThumbnailPress?.(i)}
              activeOpacity={0.7}
              disabled={!photos[i]}
            >
              {photos[i] ? (
                <Image
                  source={{ uri: photos[i] }}
                  style={awwwardsStyles.thumbImage}
                />
              ) : (
                <Ionicons
                  name="image-outline"
                  size={20}
                  color={COLORS.text.tertiary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  },
);

AwwwardsPhotoSection.displayName = 'AwwwardsPhotoSection';

const awwwardsStyles = StyleSheet.create({
  // Container
  container: {
    width: '100%',
    paddingHorizontal: 20,
  },

  // Glass upload area with dashed border
  uploadArea: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.brand.primary,
    borderRadius: 16,
  },

  // Inner touchable content
  innerUpload: {
    alignItems: 'center',
  },

  // Camera icon circle with glow
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Subtle glow
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },

  // Plus badge on camera icon
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.brand.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface.base,
  },

  // Upload label text
  uploadText: {
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontWeight: '700',
    color: COLORS.text.primary,
  },

  // Hint text below label
  hintText: {
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },

  // Thumbnail row
  thumbnails: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },

  // Individual thumbnail placeholder
  thumbPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: COLORS.surface.base,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  // Thumbnail image
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default PhotoSection;

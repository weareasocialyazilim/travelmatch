/**
 * Image Picker Component
 * Complete image selection with camera/gallery access,
 * preview, validation, and upload progress tracking.
 * Uses centralized camera configuration for consistent high-quality captures.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { radii } from '../../constants/radii';
import { SPACING } from '../../constants/spacing';
import { TYPOGRAPHY } from '../../constants/typography';
import { useImageUpload } from '../../hooks/useImageUpload';
import { validateImageFile, formatBytes } from '../../utils/imageHandling';
import {
  launchCamera,
  launchGallery,
  CAMERA_QUALITY,
} from '../../utils/cameraConfig';
import { useToast } from '@/context/ToastContext';
import type { ImageAsset } from '../../utils/imageHandling';

interface ImagePickerProps {
  /** Callback when image is uploaded successfully */
  onImageSelected?: (url: string) => void;
  /** Upload endpoint URL */
  uploadUrl?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Allow selecting multiple images */
  allowMultiple?: boolean;
  /** Show image preview after selection */
  showPreview?: boolean;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  onImageSelected,
  uploadUrl = '/api/upload',
  maxSizeMB = 10,
  allowMultiple = false,
  showPreview = true,
}) => {
  const { showToast } = useToast();
  const [selectedImages, setSelectedImages] = useState<ImageAsset[]>([]);
  const { isUploading, progress, uploadImage } = useImageUpload();

  const handlePickFromCamera = useCallback(async () => {
    try {
      const asset = await launchCamera({
        quality: CAMERA_QUALITY.HIGH,
        allowsEditing: true,
      });

      if (asset) {
        const image: ImageAsset = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          fileName: asset.fileName ?? undefined,
          mimeType: asset.mimeType ?? undefined,
        };

        const validation = validateImageFile(image, { maxSizeMB });
        if (!validation.valid) {
          showToast(validation.error || 'Invalid image', 'error');
          return;
        }

        if (allowMultiple) {
          setSelectedImages((prev) => [...prev, image]);
        } else {
          setSelectedImages([image]);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        showToast('Camera permission is required', 'warning');
      } else {
        showToast('Failed to pick image from camera', 'error');
      }
    }
  }, [allowMultiple, maxSizeMB, showToast]);

  const handlePickFromGallery = useCallback(async () => {
    try {
      const assets = await launchGallery(
        {
          quality: CAMERA_QUALITY.HIGH,
          allowsEditing: !allowMultiple,
        },
        allowMultiple,
        10,
      );

      if (assets.length > 0) {
        const validImages: ImageAsset[] = [];
        for (const asset of assets) {
          const image: ImageAsset = {
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize,
            fileName: asset.fileName ?? undefined,
            mimeType: asset.mimeType ?? undefined,
          };

          const validation = validateImageFile(image, { maxSizeMB });
          if (validation.valid) {
            validImages.push(image);
          } else {
            showToast(validation.error || 'Invalid image', 'error');
          }
        }

        if (allowMultiple) {
          setSelectedImages((prev) => [...prev, ...validImages]);
        } else {
          setSelectedImages(validImages);
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('permission')) {
        showToast('Gallery permission is required', 'warning');
      } else {
        showToast('Failed to pick image from gallery', 'error');
      }
    }
  }, [allowMultiple, maxSizeMB, showToast]);

  const handleUpload = async () => {
    if (selectedImages.length === 0) return;

    try {
      for (const image of selectedImages) {
        const url = await uploadImage(image, uploadUrl);
        onImageSelected?.(url);
      }

      // Clear after successful upload
      setSelectedImages([]);
    } catch (_uploadError) {
      // Error handled by hook
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePickFromCamera}
          disabled={isUploading}
        >
          <Text style={styles.actionButtonText}>📷 Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePickFromGallery}
          disabled={isUploading}
        >
          <Text style={styles.actionButtonText}>🖼️ Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Preview */}
      {showPreview && selectedImages.length > 0 && (
        <ScrollView horizontal style={styles.preview}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />

              {/* Remove Button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
                disabled={isUploading}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>

              {/* Image Info */}
              <View style={styles.imageInfo}>
                <Text style={styles.imageInfoText}>
                  {image.width}×{image.height}
                </Text>
                {image.fileSize && (
                  <Text style={styles.imageInfoText}>
                    {formatBytes(image.fileSize)}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <View style={styles.progressContainer}>
          <ActivityIndicator size="small" color={COLORS.brand.primary} />
          <Text style={styles.progressText}>
            Uploading... {progress.percentage}%
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress.percentage}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Upload Button */}
      {selectedImages.length > 0 && !isUploading && (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Text style={styles.uploadButtonText}>
            Upload {selectedImages.length} image
            {selectedImages.length > 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderRadius: radii.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  actionButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  preview: {
    marginBottom: SPACING.md,
  },
  imageContainer: {
    marginRight: SPACING.md,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: radii.md,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.feedback.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageInfo: {
    marginTop: SPACING.xs,
  },
  imageInfoText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  progressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginVertical: SPACING.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.brand.primary,
  },
  uploadButton: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: radii.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  uploadButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.utility.white,
  },
});

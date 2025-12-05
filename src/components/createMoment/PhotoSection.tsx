/**
 * PhotoSection Component
 * Photo picker section for CreateMoment screen
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  Alert,
  // eslint-disable-next-line react-native/split-platform-components
  ActionSheetIOS,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { STRINGS } from '../../constants/strings';

interface PhotoSectionProps {
  photo: string;
  onPhotoSelected: (uri: string) => void;
}

const PhotoSection: React.FC<PhotoSectionProps> = memo(
  ({ photo, onPhotoSelected }) => {
    const pickImage = async () => {
      const showPicker = async (useCamera: boolean) => {
        try {
          if (useCamera) {
            const { status } =
              await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(
                STRINGS.LABELS.PERMISSION_NEEDED,
                'Camera permission is required',
              );
              return;
            }
          } else {
            const { status } =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert(
                STRINGS.LABELS.PERMISSION_NEEDED,
                STRINGS.ERRORS.PHOTO_PERMISSION,
              );
              return;
            }
          }

          const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
              })
            : await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
              });

          if (!result.canceled && result.assets[0]) {
            onPhotoSelected(result.assets[0].uri);
          }
        } catch (error) {
          Alert.alert('Error', STRINGS.ERRORS.PHOTO_SELECT);
        }
      };

      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) showPicker(true);
            if (buttonIndex === 2) showPicker(false);
          },
        );
      } else {
        Alert.alert('Add Photo', 'Choose an option', [
          { text: 'Take Photo', onPress: () => showPicker(true) },
          { text: 'Choose from Gallery', onPress: () => showPicker(false) },
          { text: 'Cancel', style: 'cancel' },
        ]);
      }
    };

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

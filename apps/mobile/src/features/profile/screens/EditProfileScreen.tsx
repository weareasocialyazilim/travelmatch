import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,  Platform,
  // eslint-disable-next-line react-native/split-platform-components
  ActionSheetIOS,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLORS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { editProfileSchema, type EditProfileInput } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';

const EditProfileScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { user, refreshUser } = useAuth();

  // Original profile data from auth context
  const originalProfile = useMemo(() => {
    const userAny = user as any;
    return {
      avatarUrl:
        userAny?.profilePhoto ||
        userAny?.avatarUrl ||
        'https://via.placeholder.com/150',
      name: user?.name || '',
      username: userAny?.username || '',
      bio: userAny?.bio || '',
      location:
        typeof user?.location === 'string'
          ? user.location
          : userAny?.location?.city || '',
    };
  }, [user]);

  // Form state with RHF + Zod
  const { control, handleSubmit, formState, watch, reset } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange',
    defaultValues: {
      name: originalProfile.name,
      username: originalProfile.username,
      bio: originalProfile.bio,
      location: originalProfile.location,
    },
  });

  // Watch fields for real-time updates
  const username = watch('username');
  const bio = watch('bio');

  // Update form when user data loads
  useEffect(() => {
    reset({
      name: originalProfile.name,
      username: originalProfile.username,
      bio: originalProfile.bio,
      location: originalProfile.location,
    });
  }, [originalProfile, reset]);

  // UI state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [checkingUsername, setCheckingUsername] = useState(false);

  const BIO_MAX_LENGTH = 200;

  // Check if there are unsaved changes
  const hasChanges = useCallback(() => {
    return avatarUri !== null || formState.isDirty;
  }, [avatarUri, formState.isDirty]);

  // Username availability check (debounced)
  useEffect(() => {
    if (username === originalProfile.username) {
      setUsernameAvailable(null);
      return;
    }

    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const isAvailable = await userService.checkUsernameAvailability(
          username,
        );
        setUsernameAvailable(isAvailable);
      } catch (error) {
        // Ignore error
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, originalProfile.username]);

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Camera permission is needed to take photos. Please enable it in Settings.',
            [{ text: 'OK' }],
          );
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled) {
          setAvatarUri(result.assets[0].uri);
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Photo library permission is needed to select photos. Please enable it in Settings.',
            [{ text: 'OK' }],
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled) {
          setAvatarUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      showToast('Failed to pick image', 'error');
    }
  };

  const onSubmit = async (data: EditProfileInput) => {
    if (!hasChanges()) return;

    if (usernameAvailable === false) {
      showToast('Username is not available', 'error');
      return;
    }

    try {
      // Upload avatar if changed
      if (avatarUri) {
        await userService.updateAvatar(avatarUri);
      }

      // Update profile
      await userService.updateProfile({
        name: data.name,
        username: data.username,
        bio: data.bio,
        location: data.location,
      });

      // Refresh user context
      await refreshUser();

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const isSubmitDisabled = !canSubmitForm({ formState } as any, {
    requireDirty: false,
    requireValid: true,
  }) || usernameAvailable === false;

  const handleChangeAvatar = () => {
    const options = avatarUri
      ? ['Cancel', 'Take Photo', 'Choose from Gallery', 'Remove Photo']
      : ['Cancel', 'Take Photo', 'Choose from Gallery'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 0,
          destructiveButtonIndex: avatarUri ? 3 : undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          if (buttonIndex === 2) pickImage(false);
          if (buttonIndex === 3 && avatarUri) setAvatarUri(null);
        },
      );
    } else {
      const alertOptions: {
        text: string;
        onPress?: () => void;
        style?: 'cancel' | 'destructive';
      }[] = [
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(false) },
      ];
      if (avatarUri) {
        alertOptions.push({
          text: 'Remove Photo',
          onPress: () => setAvatarUri(null),
          style: 'destructive',
        });
      }
      alertOptions.push({ text: 'Cancel', style: 'cancel' });

      Alert.alert('Change Avatar', 'Choose an option', alertOptions);
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.saveButtonContainer]}
          onPress={handleSubmit(onSubmit)}
          disabled={formState.isSubmitting || isSubmitDisabled}
        >
          {formState.isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.mint} />
          ) : (
            <Text
              style={[
                styles.saveText,
                isSubmitDisabled && styles.saveTextDisabled,
              ]}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <TouchableOpacity
            style={styles.avatarSection}
            onPress={handleChangeAvatar}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: avatarUri || originalProfile.avatarUrl }}
                style={styles.avatar}
              />
              <View style={styles.cameraOverlay}>
                <MaterialCommunityIcons
                  name="camera"
                  size={20}
                  color={COLORS.white}
                />
              </View>
            </View>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BASIC INFO</Text>

            <View style={styles.inputCard}>
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                      <TextInput
                        style={styles.textInput}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="Enter your name"
                        placeholderTextColor={COLORS.textSecondary}
                        maxLength={50}
                      />
                      {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                  )}
                />
              </View>

              <View style={styles.inputDivider} />

              {/* Username */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <Controller
                  control={control}
                  name="username"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                      <View style={styles.usernameInputContainer}>
                        <Text style={styles.usernamePrefix}>@</Text>
                        <TextInput
                          style={[styles.textInput, styles.usernameInput]}
                          value={value}
                          onChangeText={(text) =>
                            onChange(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                          }
                          onBlur={onBlur}
                          placeholder="username"
                          placeholderTextColor={COLORS.textSecondary}
                          autoCapitalize="none"
                          autoCorrect={false}
                          maxLength={30}
                        />
                        {checkingUsername && (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.textSecondary}
                          />
                        )}
                        {!checkingUsername && usernameAvailable === true && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color={COLORS.mint}
                          />
                        )}
                        {!checkingUsername && usernameAvailable === false && (
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={20}
                            color={COLORS.coral}
                          />
                        )}
                      </View>
                      {usernameAvailable === false && (
                        <Text style={styles.usernameError}>
                          This username is already taken
                        </Text>
                      )}
                      {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                  )}
                />
              </View>

              <View style={styles.inputDivider} />

              {/* Bio */}
              <View style={styles.inputGroup}>
                <View style={styles.bioLabelRow}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <Text
                    style={[
                      styles.charCount,
                      bio.length > BIO_MAX_LENGTH * 0.9 &&
                        styles.charCountWarning,
                      bio.length >= BIO_MAX_LENGTH && styles.charCountError,
                    ]}
                  >
                    {bio.length}/{BIO_MAX_LENGTH}
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="bio"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                      <TextInput
                        style={[styles.textInput, styles.bioInput]}
                        value={value}
                        onChangeText={(text) => onChange(text.slice(0, BIO_MAX_LENGTH))}
                        onBlur={onBlur}
                        placeholder="Tell us about yourself..."
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        numberOfLines={3}
                        maxLength={BIO_MAX_LENGTH}
                      />
                      {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                  )}
                />
              </View>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>LOCATION</Text>

            <View style={styles.inputCard}>
              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <Controller
                  control={control}
                  name="location"
                  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
                    <>
                      <View style={styles.locationInputContainer}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={18}
                          color={COLORS.textSecondary}
                        />
                        <TextInput
                          style={[styles.textInput, styles.locationInput]}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          placeholder="City, Country"
                          placeholderTextColor={COLORS.textSecondary}
                        />
                      </View>
                      {error && <Text style={styles.errorText}>{error.message}</Text>}
                    </>
                  )}
                />
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    minWidth: 60,
  },
  saveButtonContainer: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.text,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.mint,
  },
  saveTextDisabled: {
    color: COLORS.textSecondary,
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  changePhotoText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.mint,
  },

  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputGroup: {
    padding: 14,
  },
  inputDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    padding: 0,
  },

  // Username
  usernameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  usernamePrefix: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  usernameInput: {
    flex: 1,
  },
  usernameError: {
    fontSize: 12,
    color: COLORS.coral,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.coral,
    marginTop: 4,
  },

  // Bio
  bioLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  charCountWarning: {
    color: COLORS.softOrange,
  },
  charCountError: {
    color: COLORS.coral,
  },

  // Location
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },

  bottomSpacer: {
    height: 40,
  },
});

export default EditProfileScreen;

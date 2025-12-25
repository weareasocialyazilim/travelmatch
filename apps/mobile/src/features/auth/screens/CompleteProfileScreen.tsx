import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
   
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import {
  showErrorAlert,
  AppError,
  AppErrorCode,
} from '@/utils/friendlyErrorHandler';
import {
  completeProfileSchema,
  type CompleteProfileInput,
} from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { MinimalFormState } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type IconName = React.ComponentProps<typeof Icon>['name'];

const INTERESTS: { id: string; name: string; icon: IconName }[] = [
  { id: '1', name: 'Travel', icon: 'airplane' },
  { id: '2', name: 'Food', icon: 'food' },
  { id: '3', name: 'Adventure', icon: 'hiking' },
  { id: '4', name: 'Culture', icon: 'domain' },
  { id: '5', name: 'Photography', icon: 'camera' },
  { id: '6', name: 'Nature', icon: 'tree' },
  { id: '7', name: 'Art', icon: 'palette' },
  { id: '8', name: 'Music', icon: 'music' },
  { id: '9', name: 'Sports', icon: 'soccer' },
  { id: '10', name: 'Volunteering', icon: 'hand-heart' },
];

type CompleteProfileScreenProps = StackScreenProps<
  RootStackParamList,
  'CompleteProfile'
>;

export const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState, setValue, watch } =
    useForm<CompleteProfileInput>({
      resolver: zodResolver(completeProfileSchema),
      mode: 'onChange',
      defaultValues: {
        fullName: '',
        username: '',
        bio: '',
        avatar: '',
        interests: [],
      },
    });

  const interests = watch('interests');
  const _bio = watch('bio');

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          throw new AppError(
            AppErrorCode.PERMISSION_CAMERA_DENIED,
            'Camera permission denied',
          );
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          setValue('avatar', result.assets[0].uri);
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          throw new AppError(
            AppErrorCode.PERMISSION_STORAGE_DENIED,
            'Storage permission denied',
          );
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          setValue('avatar', result.assets[0].uri);
        }
      }
    } catch (error) {
      showErrorAlert(error, t);
    }
  };

  const handleSelectAvatar = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) pickImage(true);
          if (buttonIndex === 2) pickImage(false);
        },
      );
    } else {
      Alert.alert('Add Profile Photo', 'Choose an option', [
        { text: 'Take Photo', onPress: () => pickImage(true) },
        { text: 'Choose from Library', onPress: () => pickImage(false) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setValue(
        'interests',
        interests.filter((id) => id !== interestId),
      );
    } else {
      if (interests.length < 5) {
        setValue('interests', [...interests, interestId]);
      } else {
        showToast('You can select up to 5 interests', 'warning');
      }
    }
  };

  const handleComplete = (_data: CompleteProfileInput) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Discover');
    }, 1500);
  };

  const handleSkip = () => {
    showConfirmation({
      title: 'Skip Profile Setup?',
      message: 'You can complete your profile later from Settings.',
      type: 'warning',
      onConfirm: () => navigation.replace('Discover'),
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <LoadingState type="overlay" message="Creating Profile..." />}

      {/* Header with Back Button & Progress */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {/* eslint-disable-next-line react-native/no-inline-styles */}
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
          <Text style={styles.progressText}>Step 2 of 2</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Tell us about yourself to personalize your experience
          </Text>
        </View>

        {/* Avatar Selection */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleSelectAvatar}
            activeOpacity={0.8}
          >
            {watch('avatar') ? (
              <Image source={{ uri: watch('avatar') }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon
                  name="camera-plus"
                  size={32}
                  color={COLORS.textSecondary}
                />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Add Profile Photo</Text>
        </View>

        {/* Name Input */}
        <Controller
          control={control}
          name="fullName"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View
                style={[styles.inputWrapper, error && styles.inputWrapperError]}
              >
                <Icon name="account" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                />
              </View>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        {/* Username Input */}
        <Controller
          control={control}
          name="username"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Username *</Text>
              <View
                style={[styles.inputWrapper, error && styles.inputWrapperError]}
              >
                <Icon name="at" size={20} color={COLORS.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Choose a username"
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
              </View>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        {/* Bio Input */}
        <Controller
          control={control}
          name="bio"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Bio (Optional)</Text>
              <View
                style={[
                  styles.inputWrapper,
                  styles.bioWrapper,
                  error && styles.inputWrapperError,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  maxLength={150}
                />
              </View>
              <Text style={styles.charCount}>{value?.length || 0}/150</Text>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        {/* Interests */}
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>Select Your Interests *</Text>
          <Text style={styles.sectionSubtitle}>
            Choose up to 5 interests (Selected: {interests.length}/5)
          </Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = interests.includes(interest.id);
              return (
                <TouchableOpacity
                  key={interest.id}
                  style={[
                    styles.interestChip,
                    isSelected && styles.interestChipSelected,
                  ]}
                  onPress={() => toggleInterest(interest.id)}
                  activeOpacity={0.7}
                >
                  <Icon
                    name={interest.icon}
                    size={18}
                    color={isSelected ? COLORS.white : COLORS.mint}
                  />
                  <Text
                    style={[
                      styles.interestText,
                      isSelected && styles.interestTextSelected,
                    ]}
                  >
                    {interest.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {formState.errors.interests && (
            <Text style={styles.errorText}>
              {formState.errors.interests.message}
            </Text>
          )}
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!canSubmitForm({ formState } as { formState: MinimalFormState }) ||
              loading) &&
              styles.completeButtonDisabled,
          ]}
          onPress={handleSubmit(handleComplete)}
          disabled={
            !canSubmitForm({ formState } as { formState: MinimalFormState }) ||
            loading
          }
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Complete Profile</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerSpacer: {
    width: 40,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.mint,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  avatar: {
    height: '100%',
    width: '100%',
  },
  avatarContainer: {
    borderRadius: 50,
    height: 100,
    width: 100,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.mint,
  },
  avatarLabel: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: COLORS.border,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  bioWrapper: {
    alignItems: 'flex-start',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  charCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
  },
  interestsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.mint,
    borderRadius: 20,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  interestChipSelected: {
    backgroundColor: COLORS.mint,
    borderColor: COLORS.mint,
  },
  interestText: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '600',
  },
  interestTextSelected: {
    color: COLORS.white,
  },
  completeButton: {
    backgroundColor: COLORS.mint,
    borderRadius: 26,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  completeButtonDisabled: {
    backgroundColor: `${COLORS.mint}50`,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

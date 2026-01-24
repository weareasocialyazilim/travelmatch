import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { showAlert } from '@/stores/modalStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as Device from 'expo-device';
import { format } from 'date-fns';
import { tr as trLocale } from 'date-fns/locale';
import { supabase } from '@/config/supabase';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import { showErrorAlert } from '@/utils/errorHandler';
import { AppError, ErrorCode } from '@/utils/appErrors';
import {
  completeProfileSchema,
  type CompleteProfileInput,
} from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { MinimalFormState } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import { useAuth } from '@/context/AuthContext';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '@/navigation/routeParams';
import { userService } from '@/services/userService';

type IconName = React.ComponentProps<typeof Icon>['name'];

const INTERESTS: { id: string; name: string; icon: IconName }[] = [
  { id: '1', name: 'Experiences', icon: 'star' },
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

const TR_COUNTRY_CODE = '+90';
const TR_LOCAL_DIGITS = 10;

const formatTrPhoneDisplay = (digits: string) => {
  const cleaned = digits.replace(/\D/g, '').slice(0, TR_LOCAL_DIGITS);
  const part1 = cleaned.slice(0, 3);
  const part2 = cleaned.slice(3, 6);
  const part3 = cleaned.slice(6, 8);
  const part4 = cleaned.slice(8, 10);
  return [part1, part2, part3, part4].filter(Boolean).join(' ');
};

const normalizeTrLocalDigits = (input: string) => {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('90')) {
    digits = digits.slice(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits.slice(0, TR_LOCAL_DIGITS);
};

const normalizeDateOnly = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);

const formatDobLabel = (date: Date, isTurkey: boolean) => {
  if (isTurkey) {
    return format(date, 'dd-MM-yyyy', { locale: trLocale });
  }
  return format(date, 'yyyy-MM-dd');
};

export const CompleteProfileScreen: React.FC<CompleteProfileScreenProps> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showConfirmation } = useConfirmation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState('');
  const [pendingDob, setPendingDob] = useState<Date | null>(null);
  const isTurkey = useMemo(() => {
    const region = Localization.getLocales()[0]?.regionCode;
    return region === 'TR';
  }, []);
  const fullNamePrefill =
    route.params?.fullName ||
    (user as { name?: string; fullName?: string })?.name ||
    (user as { name?: string; fullName?: string })?.fullName ||
    '';

  const { control, handleSubmit, formState, setValue, watch } =
    useForm<CompleteProfileInput>({
      resolver: zodResolver(completeProfileSchema),
      mode: 'onChange',
      defaultValues: {
        fullName: fullNamePrefill,
        bio: '',
        avatar: '',
        interests: [],
        phone: '',
        gender: undefined,
        dateOfBirth: undefined,
      },
    });

  const selectedGender = watch('gender');
  const phoneValue = watch('phone');
  const selectedDob = watch('dateOfBirth');

  const interests = watch('interests');

  useEffect(() => {
    if (!isTurkey) return;
    if (!phoneValue || phoneLocal) return;
    if (phoneValue.startsWith(TR_COUNTRY_CODE)) {
      setPhoneLocal(phoneValue.replace(TR_COUNTRY_CODE, ''));
    }
  }, [isTurkey, phoneValue, phoneLocal]);

  const pickImage = async (useCamera: boolean) => {
    try {
      const shouldUseCamera = useCamera && Device.isDevice;
      if (useCamera && !Device.isDevice) {
        showToast('Kamera simülatörde kullanılamıyor', 'warning');
      }

      if (shouldUseCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          throw new AppError('Camera permission denied', {
            code: ErrorCode.PERMISSION_DENIED,
            context: { permission: 'camera' },
          });
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
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
          throw new AppError('Storage permission denied', {
            code: ErrorCode.PERMISSION_DENIED,
            context: { permission: 'storage' },
          });
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
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
      showAlert({
        title: 'Add Profile Photo',
        message: 'Choose an option',
        buttons: [
          { text: 'Take Photo', onPress: () => pickImage(true) },
          { text: 'Choose from Library', onPress: () => pickImage(false) },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
    }
  };

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setValue(
        'interests',
        interests.filter((id) => id !== interestId),
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      if (interests.length < 5) {
        setValue('interests', [...interests, interestId], {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        showToast('You can select up to 5 interests', 'warning');
      }
    }
  };

  const handleComplete = async (data: CompleteProfileInput) => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        showToast('Oturum bulunamadı. Lütfen tekrar giriş yapın.', 'error');
        navigation.reset({
          index: 0,
          routes: [{ name: 'UnifiedAuth' as never }],
        });
        return;
      }

      const selectedInterests = INTERESTS.filter((interest) =>
        data.interests.includes(interest.id),
      ).map((interest) => interest.name);

      const dateOfBirth = data.dateOfBirth
        ? format(normalizeDateOnly(data.dateOfBirth), 'yyyy-MM-dd')
        : undefined;

      if (data.avatar) {
        await userService.updateAvatar(data.avatar);
      }

      await userService.updateProfile({
        full_name: data.fullName || fullNamePrefill || 'User',
        bio: data.bio || undefined,
        interests: selectedInterests,
        phone: data.phone.trim(),
        gender: data.gender,
        date_of_birth: dateOfBirth,
      });

      navigation.navigate('VerifyPhone', {
        email: user?.email || '',
        phone: data.phone.trim(),
        fullName: data.fullName || fullNamePrefill || 'User',
      });
    } catch (error) {
      showErrorAlert(error, t);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    showConfirmation({
      title: 'Phone Verification Required',
      message:
        'Phone verification is required to use Lovendo. You can skip other profile details, but phone number is mandatory for your security.',
      type: 'warning',
      onConfirm: () => {
        // Only skip if phone is already filled
        const phoneValue = watch('phone');
        if (phoneValue && phoneValue.trim() !== '') {
          navigation.navigate('VerifyPhone', {
            email: user?.email || '',
            phone: phoneValue.trim(),
            fullName: watch('fullName') || 'User',
          });
        }
        // Otherwise do nothing - user must fill phone
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <LoadingState type="overlay" message="Creating Profile..." />}

      {/* Header with Back Button & Progress */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
              return;
            }
            navigation.navigate('UnifiedAuth', { initialMode: 'register' });
          }}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {}
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
                  color={COLORS.text.secondary}
                />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Add Profile Photo</Text>
        </View>

        {/* Name is collected during registration - not shown here */}
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
                  placeholderTextColor={COLORS.text.secondary}
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

        {/* Phone Input - Required for verification */}
        <Controller
          control={control}
          name="phone"
          render={({
            field: { onChange, onBlur, value },
            fieldState: { error },
          }) => (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View
                style={[styles.inputWrapper, error && styles.inputWrapperError]}
              >
                <Icon name="phone" size={20} color={COLORS.text.secondary} />
                {isTurkey && (
                  <Text style={styles.phonePrefix}>{TR_COUNTRY_CODE}</Text>
                )}
                <TextInput
                  style={styles.input}
                  placeholder={isTurkey ? '5XX XXX XX XX' : '+90 5XX XXX XXXX'}
                  placeholderTextColor={COLORS.text.secondary}
                  value={
                    isTurkey ? formatTrPhoneDisplay(phoneLocal) : value || ''
                  }
                  onChangeText={(text) => {
                    if (!isTurkey) {
                      onChange(text);
                      return;
                    }

                    const localDigits = normalizeTrLocalDigits(text);
                    setPhoneLocal(localDigits);
                    const e164 = localDigits
                      ? `${TR_COUNTRY_CODE}${localDigits}`
                      : '';
                    setValue('phone', e164, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  onBlur={onBlur}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                />
              </View>
              <Text style={styles.phoneHint}>
                Required for account verification via SMS
              </Text>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
            </View>
          )}
        />

        {/* Gender */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Gender *</Text>
          <View style={styles.genderRow}>
            {(
              [
                { id: 'male', label: 'Male' },
                { id: 'female', label: 'Female' },
                { id: 'other', label: 'Other' },
                { id: 'prefer_not_to_say', label: 'Prefer not to say' },
              ] as const
            ).map((option) => {
              const isSelected = selectedGender === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.genderChip,
                    isSelected && styles.genderChipSelected,
                  ]}
                  onPress={() => {
                    setValue('gender', option.id, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.genderText,
                      isSelected && styles.genderTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {formState.errors.gender && (
            <Text style={styles.errorText}>
              {formState.errors.gender.message}
            </Text>
          )}
        </View>

        {/* Date of Birth */}
        <Controller
          control={control}
          name="dateOfBirth"
          render={({ field: { value }, fieldState: { error } }) => (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Date of Birth *</Text>
              <TouchableOpacity
                style={[styles.inputWrapper, error && styles.inputWrapperError]}
                onPress={() => {
                  const initialDate = selectedDob || new Date(1995, 0, 1);
                  setPendingDob(normalizeDateOnly(initialDate));
                  setShowDobPicker(true);
                }}
                activeOpacity={0.8}
              >
                <Icon name="calendar" size={20} color={COLORS.text.secondary} />
                <Text style={styles.inputText}>
                  {value
                    ? formatDobLabel(value, isTurkey)
                    : isTurkey
                      ? 'DD-MM-YYYY'
                      : 'YYYY-MM-DD'}
                </Text>
              </TouchableOpacity>
              {showDobPicker && Platform.OS !== 'ios' && (
                <DateTimePicker
                  value={pendingDob || value || new Date(1995, 0, 1)}
                  mode="date"
                  display="default"
                  maximumDate={(() => {
                    const max = new Date();
                    max.setFullYear(max.getFullYear() - 18);
                    return max;
                  })()}
                  minimumDate={(() => {
                    const min = new Date();
                    min.setFullYear(min.getFullYear() - 120);
                    return min;
                  })()}
                  onChange={(event, selectedDate) => {
                    if (event.type === 'dismissed') {
                      setShowDobPicker(false);
                      return;
                    }
                    const dateToSave = selectedDate || pendingDob;
                    if (dateToSave) {
                      setValue('dateOfBirth', normalizeDateOnly(dateToSave), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }
                    setShowDobPicker(false);
                  }}
                />
              )}
              {showDobPicker && Platform.OS === 'ios' && (
                <Modal
                  transparent
                  animationType="slide"
                  onRequestClose={() => setShowDobPicker(false)}
                >
                  <View style={styles.dateModalOverlay}>
                    <View style={styles.dateModalSheet}>
                      <View style={styles.dateModalHeader}>
                        <TouchableOpacity
                          onPress={() => setShowDobPicker(false)}
                        >
                          <Text style={styles.dateModalAction}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.dateModalTitle}>Select Date</Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (pendingDob) {
                              setValue(
                                'dateOfBirth',
                                normalizeDateOnly(pendingDob),
                                {
                                  shouldValidate: true,
                                  shouldDirty: true,
                                },
                              );
                            }
                            setShowDobPicker(false);
                          }}
                        >
                          <Text style={styles.dateModalAction}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={pendingDob || value || new Date(1995, 0, 1)}
                        mode="date"
                        display="spinner"
                        maximumDate={(() => {
                          const max = new Date();
                          max.setFullYear(max.getFullYear() - 18);
                          return max;
                        })()}
                        minimumDate={(() => {
                          const min = new Date();
                          min.setFullYear(min.getFullYear() - 120);
                          return min;
                        })()}
                        onChange={(_, selectedDate) => {
                          if (selectedDate) {
                            setPendingDob(normalizeDateOnly(selectedDate));
                          }
                        }}
                      />
                    </View>
                  </View>
                </Modal>
              )}
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
                    color={isSelected ? COLORS.utility.white : COLORS.mint}
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
            (!canSubmitForm({ formState } as { formState: MinimalFormState }, {
              requireDirty: false,
            }) ||
              loading) &&
              styles.completeButtonDisabled,
          ]}
          onPress={handleSubmit(handleComplete)}
          disabled={
            !canSubmitForm({ formState } as { formState: MinimalFormState }, {
              requireDirty: false,
            }) || loading
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
    backgroundColor: COLORS.bg.primary,
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bg.primary,
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
    backgroundColor: COLORS.border.default,
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
    color: COLORS.text.secondary,
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
    color: COLORS.text.primary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.border.default,
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
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    borderColor: COLORS.border.subtle,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 10,
  },
  inputWrapperError: {
    borderColor: COLORS.feedback.error,
  },
  input: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  inputText: {
    color: COLORS.text.primary,
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
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  phoneHint: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
  phonePrefix: {
    color: COLORS.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genderChip: {
    backgroundColor: COLORS.bg.secondary,
    borderColor: COLORS.border.subtle,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  genderChipSelected: {
    backgroundColor: COLORS.mint,
    borderColor: COLORS.mint,
  },
  genderText: {
    color: COLORS.mint,
    fontSize: 14,
    fontWeight: '600',
  },
  genderTextSelected: {
    color: COLORS.utility.white,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 4,
  },
  interestsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.bg.secondary,
    borderColor: COLORS.border.subtle,
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
    color: COLORS.utility.white,
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
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dateModalSheet: {
    backgroundColor: COLORS.bg.secondary,
    paddingBottom: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dateModalHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateModalTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  dateModalAction: {
    color: COLORS.mint,
    fontSize: 16,
    fontWeight: '600',
  },
});

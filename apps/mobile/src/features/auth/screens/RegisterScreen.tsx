/**
 * RegisterScreen - Multi-Step Registration Wizard
 *
 * Implements UX best practices:
 * 1. Show only what's needed - Fields split into 3 steps
 * 2. Appropriate input types - Correct keyboards for each field
 * 3. Real-time validation - Validate as users type with success states
 * 4. Clear error states - Specific, helpful error messages
 * 5. Break long forms down - Multi-step with animated progress
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import type { RootStackParamList } from '@/navigation/routeParams';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterInput, type Gender } from '@/utils/forms';
import { useToast } from '@/context/ToastContext';
import { PasswordStrengthMeter } from '@/components/ui';
import { FormStepIndicator, type FormStep } from '@/components/ui/FormStepIndicator';
import { COLORS, GRADIENTS, primitives } from '@/constants/colors';

// Step definitions for the progress indicator
const REGISTER_STEPS: FormStep[] = [
  { key: 'personal', label: 'Kişisel', icon: 'account' },
  { key: 'about', label: 'Hakkında', icon: 'card-account-details' },
  { key: 'security', label: 'Güvenlik', icon: 'shield-lock' },
];

const GENDER_OPTIONS: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: 'Erkek', icon: 'human-male' },
  { value: 'female', label: 'Kadın', icon: 'human-female' },
  { value: 'other', label: 'Diğer', icon: 'account-question' },
  { value: 'prefer_not_to_say', label: 'Belirtmek istemiyorum', icon: 'account-off' },
];

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const calculateAge = (birthDate: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  // Default date: 18 years ago
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 18);

  const { control, handleSubmit, formState, setValue, watch, trigger } =
    useForm<RegisterInput>({
      resolver: zodResolver(registerSchema),
      mode: 'onChange',
      defaultValues: {
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        gender: undefined,
        dateOfBirth: undefined,
      },
    });

  const { errors } = formState;

  // Watch all fields for real-time validation
  const watchedFields = watch();
  const selectedGender = watchedFields.gender;
  const selectedDate = watchedFields.dateOfBirth;

  // Validate each step to enable/disable "Continue" button
  const stepValidation = useMemo(() => {
    const step1Valid =
      !!watchedFields.fullName &&
      watchedFields.fullName.length >= 2 &&
      !!watchedFields.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchedFields.email) &&
      !!watchedFields.phone &&
      watchedFields.phone.length === 10;

    const step2Valid = !!watchedFields.gender && !!watchedFields.dateOfBirth;

    const step3Valid =
      !!watchedFields.password &&
      watchedFields.password.length >= 8 &&
      !!watchedFields.confirmPassword &&
      watchedFields.password === watchedFields.confirmPassword;

    return { step1Valid, step2Valid, step3Valid };
  }, [watchedFields]);

  // Check if current step is valid
  const isCurrentStepValid = useMemo(() => {
    switch (currentStep) {
      case 0:
        return stepValidation.step1Valid && !errors.fullName && !errors.email && !errors.phone;
      case 1:
        return stepValidation.step2Valid && !errors.gender && !errors.dateOfBirth;
      case 2:
        return stepValidation.step3Valid && !errors.password && !errors.confirmPassword;
      default:
        return false;
    }
  }, [currentStep, stepValidation, errors]);

  const handleNextStep = async () => {
    // Validate current step fields before proceeding
    let fieldsToValidate: (keyof RegisterInput)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['fullName', 'email', 'phone'];
        break;
      case 1:
        fieldsToValidate = ['gender', 'dateOfBirth'];
        break;
      case 2:
        fieldsToValidate = ['password', 'confirmPassword'];
        break;
    }

    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid && currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepPress = (stepIndex: number) => {
    // Only allow going back to previous steps
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      const result = await register({
        email: data.email,
        password: data.password,
        name: data.fullName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      });
      if (result.success) {
        showToast('Hesap oluşturuldu! Telefon doğrulaması gerekiyor.', 'success');
        // Format phone number with country code (+90 for Turkey)
        const formattedPhone = `+90${data.phone}`;
        navigation.navigate('VerifyPhone', {
          email: data.email,
          phone: formattedPhone,
          fullName: data.fullName,
        });
      } else {
        Alert.alert('Kayıt Başarısız', result.error || 'Lütfen tekrar deneyin');
      }
    } catch (error) {
      Alert.alert(
        'Kayıt Başarısız',
        error instanceof Error ? error.message : 'Lütfen tekrar deneyin'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setValue('dateOfBirth', date, { shouldValidate: true });
    }
  };

  // Render Step 1: Personal Information
  const renderStep1 = () => (
    <Animated.View
      key="step1"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Kişisel Bilgiler</Text>
      <Text style={styles.stepSubtitle}>Seni tanıyalım</Text>

      {/* Full Name */}
      <Controller
        control={control}
        name="fullName"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error, isDirty },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Ad Soyad <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                error && styles.inputError,
                isDirty && !error && value && styles.inputSuccess,
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={20}
                color={
                  error
                    ? COLORS.feedback.error
                    : isDirty && !error && value
                    ? COLORS.feedback.success
                    : COLORS.text.secondary
                }
                style={styles.inputIcon}
              />
              <TextInput
                testID="fullname-input"
                style={styles.input}
                placeholder="Adınız ve soyadınız"
                placeholderTextColor={COLORS.text.tertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="words"
                textContentType="name"
                autoComplete="name"
                editable={!isLoading}
              />
              {isDirty && !error && value && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.feedback.success}
                />
              )}
            </View>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error, isDirty },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              E-posta <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                error && styles.inputError,
                isDirty && !error && value && styles.inputSuccess,
              ]}
            >
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={
                  error
                    ? COLORS.feedback.error
                    : isDirty && !error && value
                    ? COLORS.feedback.success
                    : COLORS.text.secondary
                }
                style={styles.inputIcon}
              />
              <TextInput
                testID="email-input"
                style={styles.input}
                placeholder="ornek@email.com"
                placeholderTextColor={COLORS.text.tertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                autoComplete="email"
                editable={!isLoading}
              />
              {isDirty && !error && value && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.feedback.success}
                />
              )}
            </View>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      {/* Phone Number */}
      <Controller
        control={control}
        name="phone"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error, isDirty },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Telefon Numarası <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.phoneInputWrapper,
                error && styles.inputError,
                isDirty && !error && value?.length === 10 && styles.inputSuccess,
              ]}
            >
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCodeText}>+90</Text>
              </View>
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color={
                  error
                    ? COLORS.feedback.error
                    : isDirty && !error && value?.length === 10
                    ? COLORS.feedback.success
                    : COLORS.text.secondary
                }
                style={styles.inputIcon}
              />
              <TextInput
                testID="phone-input"
                style={styles.phoneInput}
                placeholder="5XX XXX XX XX"
                placeholderTextColor={COLORS.text.tertiary}
                value={value}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, '').slice(0, 10);
                  onChange(cleaned);
                }}
                onBlur={onBlur}
                keyboardType="phone-pad"
                textContentType="telephoneNumber"
                autoComplete="tel"
                maxLength={10}
                editable={!isLoading}
              />
              {isDirty && !error && value?.length === 10 && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.feedback.success}
                />
              )}
            </View>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
            <Text style={styles.hintText}>
              SMS ile doğrulama kodu gönderilecek
            </Text>
          </View>
        )}
      />
    </Animated.View>
  );

  // Render Step 2: About You
  const renderStep2 = () => (
    <Animated.View
      key="step2"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Hakkında</Text>
      <Text style={styles.stepSubtitle}>Biraz daha bilgi alalım</Text>

      {/* Gender Selection */}
      <Controller
        control={control}
        name="gender"
        render={({ fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Cinsiyet <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.genderContainer}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    selectedGender === option.value && styles.genderOptionSelected,
                  ]}
                  onPress={() =>
                    setValue('gender', option.value, { shouldValidate: true })
                  }
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={option.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={20}
                    color={
                      selectedGender === option.value
                        ? COLORS.primary
                        : COLORS.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.genderOptionText,
                      selectedGender === option.value &&
                        styles.genderOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedGender === option.value && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={COLORS.primary}
                      style={styles.genderCheckIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      {/* Date of Birth */}
      <Controller
        control={control}
        name="dateOfBirth"
        render={({ fieldState: { error, isDirty } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Doğum Tarihi <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                styles.dateInput,
                error && styles.inputError,
                isDirty && !error && selectedDate && styles.inputSuccess,
              ]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="calendar-outline"
                size={20}
                color={
                  error
                    ? COLORS.feedback.error
                    : isDirty && !error && selectedDate
                    ? COLORS.feedback.success
                    : COLORS.text.secondary
                }
                style={styles.inputIcon}
              />
              <Text
                style={selectedDate ? styles.dateText : styles.datePlaceholder}
              >
                {selectedDate
                  ? `${formatDate(selectedDate)} (${calculateAge(selectedDate)} yaş)`
                  : 'Doğum tarihinizi seçin'}
              </Text>
              {isDirty && !error && selectedDate && (
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={COLORS.feedback.success}
                />
              )}
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
            <Text style={styles.hintText}>18 yaşından büyük olmalısınız</Text>
          </View>
        )}
      />
    </Animated.View>
  );

  // Render Step 3: Security
  const renderStep3 = () => (
    <Animated.View
      key="step3"
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(300)}
      style={styles.stepContent}
    >
      <Text style={styles.stepTitle}>Güvenlik</Text>
      <Text style={styles.stepSubtitle}>Hesabını güvende tut</Text>

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error, isDirty },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Şifre <Text style={styles.required}>*</Text>
            </Text>
            <View
              style={[
                styles.inputWrapper,
                error && styles.inputError,
                isDirty && !error && value?.length >= 8 && styles.inputSuccess,
              ]}
            >
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={
                  error
                    ? COLORS.feedback.error
                    : isDirty && !error && value?.length >= 8
                    ? COLORS.feedback.success
                    : COLORS.text.secondary
                }
                style={styles.inputIcon}
              />
              <TextInput
                testID="password-input"
                style={styles.input}
                placeholder="En az 8 karakter"
                placeholderTextColor={COLORS.text.tertiary}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="password-new"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>
            <PasswordStrengthMeter password={value || ''} showRequirements />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      {/* Confirm Password */}
      <Controller
        control={control}
        name="confirmPassword"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error, isDirty },
        }) => {
          const passwordsMatch =
            value && watchedFields.password && value === watchedFields.password;
          return (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Şifre Tekrar <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  error && styles.inputError,
                  isDirty && !error && passwordsMatch && styles.inputSuccess,
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-check-outline"
                  size={20}
                  color={
                    error
                      ? COLORS.feedback.error
                      : isDirty && !error && passwordsMatch
                      ? COLORS.feedback.success
                      : COLORS.text.secondary
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  testID="confirm-password-input"
                  style={styles.input}
                  placeholder="Şifrenizi tekrar girin"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              {error && <Text style={styles.errorText}>{error.message}</Text>}
              {isDirty && !error && passwordsMatch && (
                <Text style={styles.successText}>Şifreler eşleşiyor ✓</Text>
              )}
            </View>
          );
        }}
      />
    </Animated.View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 0) {
              handlePreviousStep();
            } else {
              navigation.goBack();
            }
          }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kayıt Ol</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      <FormStepIndicator
        steps={REGISTER_STEPS}
        currentStep={currentStep}
        onStepPress={handleStepPress}
        allowBackNavigation={true}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderCurrentStep()}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {currentStep < 2 ? (
              // Continue Button
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !isCurrentStepValid && styles.buttonDisabled,
                ]}
                onPress={handleNextStep}
                disabled={!isCurrentStepValid || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isCurrentStepValid
                      ? GRADIENTS.gift
                      : GRADIENTS.disabled
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <Text style={styles.buttonText}>Devam Et</Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color={COLORS.utility.white}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              // Submit Button
              <TouchableOpacity
                testID="register-button"
                style={[
                  styles.continueButton,
                  (!isCurrentStepValid || isLoading) && styles.buttonDisabled,
                ]}
                onPress={handleSubmit(onSubmit)}
                disabled={!isCurrentStepValid || isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isCurrentStepValid && !isLoading
                      ? GRADIENTS.gift
                      : GRADIENTS.disabled
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <MaterialCommunityIcons
                    name={isLoading ? 'loading' : 'check-circle'}
                    size={20}
                    color={COLORS.utility.white}
                  />
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancel}>İptal</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Doğum Tarihi</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalDone}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate || defaultDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                locale="tr"
              />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Date Picker for Android */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate || defaultDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  placeholder: {
    width: 40,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  required: {
    color: COLORS.feedback.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface.base,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  inputError: {
    borderColor: COLORS.feedback.error,
    borderWidth: 1.5,
  },
  inputSuccess: {
    borderColor: COLORS.feedback.success,
    borderWidth: 1.5,
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  successText: {
    color: COLORS.feedback.success,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  hintText: {
    color: COLORS.text.secondary,
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },

  // Phone input styles
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    backgroundColor: COLORS.surface.base,
    overflow: 'hidden',
  },
  countryCodeBox: {
    height: '100%',
    paddingHorizontal: 14,
    backgroundColor: primitives.stone[100],
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border.default,
  },
  countryCodeText: {
    fontSize: 16,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    paddingVertical: 0,
    paddingRight: 14,
  },

  // Gender styles
  genderContainer: {
    gap: 10,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    backgroundColor: COLORS.surface.base,
    gap: 12,
  },
  genderOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  genderOptionText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  genderOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  genderCheckIcon: {
    marginLeft: 'auto',
  },

  // Date picker styles
  dateInput: {
    justifyContent: 'flex-start',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
  },
  datePlaceholder: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.tertiary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlayMedium,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.bg.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // Button styles
  buttonContainer: {
    marginTop: 24,
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.utility.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  loginText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

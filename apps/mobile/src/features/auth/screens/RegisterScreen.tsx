import React, { useState } from 'react';
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
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/context/AuthContext';
import { registerSchema, type RegisterInput, type Gender } from '@/utils/forms';
import { canSubmitForm } from '@/utils/forms/helpers';
import type { MinimalFormState } from '@/utils/forms/helpers';
import { useToast } from '@/context/ToastContext';
import { COLORS } from '@/constants/colors';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
  { value: 'other', label: 'Diğer' },
  { value: 'prefer_not_to_say', label: 'Belirtmek istemiyorum' },
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
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const RegisterScreen: React.FC = () => {
  const { showToast: _showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { register } = useAuth();

  // Default date: 18 years ago
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 18);

  const { control, handleSubmit, formState, setValue, watch } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      gender: undefined,
      dateOfBirth: undefined,
    },
  });

  const selectedGender = watch('gender');
  const selectedDate = watch('dateOfBirth');

  const onSubmit = async (data: RegisterInput) => {
    try {
      setIsLoading(true);
      await register({
        email: data.email,
        password: data.password,
        name: data.fullName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
      });
      // Navigation handled by auth state change
    } catch (error) {
      Alert.alert(
        'Kayıt Başarısız',
        error instanceof Error ? error.message : 'Lütfen tekrar deneyin',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setValue('dateOfBirth', date, { shouldValidate: true });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hesap Oluştur</Text>
      <Text style={styles.subtitle}>Başlamak için kayıt olun</Text>

      {/* Full Name */}
      <Controller
        control={control}
        name="fullName"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Adınız ve soyadınız"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              editable={!isLoading}
            />
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
          fieldState: { error },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="ornek@email.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      {/* Gender Selection */}
      <Controller
        control={control}
        name="gender"
        render={({ fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.genderContainer}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    selectedGender === option.value && styles.genderOptionSelected,
                  ]}
                  onPress={() => setValue('gender', option.value, { shouldValidate: true })}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.genderOptionText,
                      selectedGender === option.value && styles.genderOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
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
        render={({ fieldState: { error } }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Doğum Tarihi</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput, error && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
              disabled={isLoading}
            >
              <Text style={selectedDate ? styles.dateText : styles.datePlaceholder}>
                {selectedDate
                  ? `${formatDate(selectedDate)} (${calculateAge(selectedDate)} yaş)`
                  : 'Doğum tarihinizi seçin'}
              </Text>
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error.message}</Text>}
            <Text style={styles.hintText}>18 yaşından büyük olmalısınız</Text>
          </View>
        )}
      />

      {/* Date Picker Modal for iOS */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          transparent
          animationType="slide"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
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
          </View>
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

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="En az 8 karakter"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              editable={!isLoading}
            />
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
          fieldState: { error },
        }) => (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              placeholder="Şifrenizi tekrar girin"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              editable={!isLoading}
            />
            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </View>
        )}
      />

      <TouchableOpacity
        testID="register-button"
        style={[
          styles.button,
          (isLoading ||
            !canSubmitForm({ formState } as { formState: MinimalFormState })) &&
            styles.buttonDisabled,
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={
          isLoading ||
          !canSubmitForm({ formState } as { formState: MinimalFormState })
        }
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Gender styles
  genderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  genderOptionSelected: {
    borderColor: COLORS?.mint || '#10b981',
    backgroundColor: COLORS?.mintLight || '#d1fae5',
  },
  genderOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  genderOptionTextSelected: {
    color: COLORS?.mint || '#10b981',
    fontWeight: '600',
  },

  // Date picker styles
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  datePlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6b7280',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS?.mint || '#10b981',
  },

  // Button styles
  button: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS?.mint || '#10b981',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

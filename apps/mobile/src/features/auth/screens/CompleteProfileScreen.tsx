import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { COLORS } from '@/constants/colors';
import { completeProfileSchema } from '@/utils/forms';
import { useToast } from '@/context/ToastContext';
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
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modalVisible] = useState(true);

  const { control, handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onChange',
    defaultValues: {
      bio: '',
      interests: [] as string[],
    },
  });

  const interests = watch('interests') || [];

  const toggleInterest = (interestId: string) => {
    if (interests.includes(interestId)) {
      setValue(
        'interests',
        interests.filter((id) => id !== interestId),
        { shouldValidate: true },
      );
    } else {
      if (interests.length < 5) {
        setValue('interests', [...interests, interestId], {
          shouldValidate: true,
        });
      } else {
        showToast('You can select up to 5 interests', 'warning');
      }
    }
  };

  const handleComplete = (_data: { bio?: string; interests: string[] }) => {
    setLoading(true);
    // TODO: Save profile data to backend
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Profile completed successfully!', 'success');
      navigation.replace('Discover');
    }, 1000);
  };

  const handleSkip = () => {
    navigation.replace('Discover');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleSkip}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {loading && (
              <LoadingState type="overlay" message="Saving profile..." />
            )}

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Complete Your Profile</Text>
              <Text style={styles.modalSubtitle}>
                Add a bio and select your interests
              </Text>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
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
                        styles.bioWrapper,
                        error && styles.inputWrapperError,
                      ]}
                    >
                      <TextInput
                        style={styles.bioInput}
                        placeholder="Tell us about yourself..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        multiline
                        maxLength={150}
                        textAlignVertical="top"
                      />
                    </View>
                    <Text style={styles.charCount}>
                      {value?.length || 0}/150
                    </Text>
                    {error && (
                      <Text style={styles.errorText}>{error.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Interests */}
              <View style={styles.interestsSection}>
                <Text style={styles.sectionTitle}>Select Your Interests</Text>
                <Text style={styles.sectionSubtitle}>
                  Choose up to 5 interests ({interests.length}/5)
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
                          size={16}
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
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.completeButton}
                onPress={handleSubmit(handleComplete)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Complete Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingTop: 20,
    paddingBottom: 24,
  },
  modalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  bioWrapper: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: 12,
    minHeight: 100,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  bioInput: {
    fontSize: 15,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  interestsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.mint,
    gap: 6,
  },
  interestChipSelected: {
    backgroundColor: COLORS.mint,
    borderColor: COLORS.mint,
  },
  interestText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.mint,
  },
  interestTextSelected: {
    color: COLORS.white,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completeButton: {
    height: 52,
    backgroundColor: COLORS.mint,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
});

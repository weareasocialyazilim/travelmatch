/**
 * CreateMomentScreen
 * Refactored - uses modular sub-components
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createMomentSchema,
  type CreateMomentInput,
} from '../../../utils/forms/schemas';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PhotoSection,
  TitleInput,
  CategorySelector,
  DetailsSection,
  StorySection,
  MomentPreview,
  CATEGORIES,
  getCategoryEmoji,
  type Place,
} from '@/components/createMoment';
import { PlaceSearchModal } from '@/components/PlaceSearchModal';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { STRINGS as _STRINGS } from '../constants/strings';
import { VALUES } from '@/constants/values';
import { useMoments } from '../hooks';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NavigationProp } from '@react-navigation/native';
import { useToast } from '@/context/ToastContext';

// Import sub-components

const CreateMomentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { createMoment } = useMoments();
  const { showToast } = useToast();

  // UI-specific state (not in form)
  const [photo, setPhoto] = useState<string>(''); // Managed by PhotoSection
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateMomentInput>({
    resolver: zodResolver(createMomentSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      category: '',
      amount: 0,
      date: new Date(),
      story: '',
      photo: '',
      place: null,
    },
  });

  const title = watch('title');
  const selectedCategory = watch('category');
  const amount = watch('amount');
  const selectedDate = watch('date');
  const story = watch('story');
  const place = watch('place');

  // Payment hint text
  const paymentHint = useMemo(() => {
    const amountNum = amount || 0;
    if (amountNum <= 0) return 'Enter amount to see payment terms';
    if (amountNum <= VALUES.ESCROW_DIRECT_MAX)
      return 'Direct payment • Instant transfer';
    if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX)
      return 'Your supporter decides payment method';
    return 'Escrow protected • Proof required';
  }, [amount]);

  // Handle publish
  const onPublish = useCallback(
    async (data: CreateMomentInput) => {
      setIsSubmitting(true);

      try {
        const categoryObj = CATEGORIES.find((c) => c.id === data.category);

        const momentData = {
          title: data.title.trim(),
          story: data.story?.trim() || undefined,
          price: data.amount,
          category: {
            id: data.category,
            label: categoryObj?.label || data.category,
            emoji: getCategoryEmoji(data.category),
          },
          location: data.place
            ? {
                name: data.place.name,
                city:
                  data.place.address?.split(',')[0]?.trim() || data.place.name,
                country: data.place.address?.split(',')[1]?.trim() || '',
              }
            : undefined,
          date: data.date.toISOString(),
          imageUrl: photo || undefined,
          availability: 'Available',
        };

        // Convert to CreateMomentData format
        const createMomentInput = {
          title: momentData.title,
          description: momentData.story || '',
          category: momentData.category.id,
          location: {
            city: momentData.location?.city || '',
            country: momentData.location?.country || '',
          },
          images: momentData.imageUrl ? [momentData.imageUrl] : [],
          pricePerGuest: momentData.price,
          currency: 'USD',
          maxGuests: 4,
          duration: '2 hours',
          availability: [momentData.date],
        };

        const createdMoment = await createMoment(createMomentInput);

        if (createdMoment) {
          Alert.alert('Success!', 'Your moment has been published', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } else {
          showToast('Could not create moment. Please try again.', 'error');
        }
      } catch {
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [createMoment, navigation],
  );

  // Handlers
  const handleDatePress = useCallback(() => setShowDatePicker(true), []);
  const handleNavigateToPlaceSearch = useCallback(() => {
    setShowPlaceSearch(true);
  }, []);
  const handlePlaceSelect = useCallback(
    (selectedPlace: Place) => {
      setValue('place', selectedPlace);
    },
    [setValue],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share a Moment</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Photo Section */}
          <PhotoSection
            photo={photo}
            onPhotoSelected={(uri) => {
              setPhoto(uri);
              setValue('photo', uri);
            }}
          />

          {/* Title Input */}
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TitleInput title={value} onTitleChange={onChange} />
            )}
          />
          {errors.title && (
            <Text style={styles.errorText}>{errors.title.message}</Text>
          )}

          {/* Category Selector */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={(category) => setValue('category', category)}
          />
          {errors.category && (
            <Text style={styles.errorText}>{errors.category.message}</Text>
          )}

          {/* Details Section */}
          <DetailsSection
            place={place ?? null}
            selectedDate={selectedDate}
            amount={String(amount || '')}
            onPlaceChange={(p) => setValue('place', p)}
            onDatePress={handleDatePress}
            onAmountChange={(a) => setValue('amount', parseFloat(a) || 0)}
            onNavigateToPlaceSearch={handleNavigateToPlaceSearch}
          />
          {errors.amount && (
            <Text style={styles.errorText}>{errors.amount.message}</Text>
          )}
          {errors.date && (
            <Text style={styles.errorText}>{errors.date.message}</Text>
          )}

          {/* Story Section */}
          <StorySection
            story={story || ''}
            onStoryChange={(s) => setValue('story', s)}
          />

          {/* Live Preview */}
          <MomentPreview
            photo={photo}
            title={title}
            story={story || ''}
            place={place ?? null}
            selectedDate={selectedDate}
            amount={String(amount || '')}
          />

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Sticky Publish Button */}
        <View style={styles.publishSection}>
          <Text style={styles.publishHint}>{paymentHint}</Text>
          <TouchableOpacity
            testID="create-moment-button"
            style={[
              styles.publishButton,
              (!isValid || isSubmitting) && styles.publishButtonDisabled,
            ]}
            onPress={handleSubmit(onPublish)}
            activeOpacity={0.8}
            disabled={!isValid || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Publish moment"
            accessibilityState={{ disabled: !isValid || isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.text.primary} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={COLORS.text.primary}
                />
                <Text style={styles.publishButtonText}>Publish Moment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker &&
        (Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.datePickerModalContainer}>
              <TouchableOpacity
                style={styles.datePickerBackdrop}
                activeOpacity={1}
                onPress={() => setShowDatePicker(false)}
              />
              <View style={styles.datePickerContent}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.datePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                  onChange={(_event, date) => {
                    if (date) setValue('date', date);
                  }}
                  textColor={COLORS.text.primary}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
            onChange={(_event, date) => {
              setShowDatePicker(false);
              if (date) setValue('date', date);
            }}
          />
        ))}

      {/* Place Search Modal (Mapbox) */}
      <PlaceSearchModal
        visible={showPlaceSearch}
        onClose={() => setShowPlaceSearch(false)}
        onSelect={handlePlaceSelect}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg.primary,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderBottomColor: COLORS.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  publishSection: {
    backgroundColor: COLORS.utility.white,
    borderTopColor: COLORS.border.default,
    borderTopWidth: 1,
    gap: 12,
    padding: 20,
  },
  publishHint: {
    color: COLORS.text.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
  publishButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: LAYOUT.borderRadius.full,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  publishButtonDisabled: {
    backgroundColor: COLORS.border.default,
  },
  publishButtonText: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContent: {
    backgroundColor: COLORS.utility.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    alignItems: 'flex-end',
    borderBottomColor: COLORS.border.default,
    borderBottomWidth: 1,
    padding: 16,
  },
  datePickerDoneText: {
    color: COLORS.brand.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    color: COLORS.feedback.error,
    fontSize: 12,
    marginTop: 4,
    marginHorizontal: LAYOUT.padding,
  },
});

export default CreateMomentScreen;

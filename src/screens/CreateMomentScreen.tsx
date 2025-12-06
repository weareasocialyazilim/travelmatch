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
  Alert,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
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
} from '../components/createMoment';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { STRINGS } from '../constants/strings';
import { VALUES } from '../constants/values';
import { useMoments } from '../hooks';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { NavigationProp } from '@react-navigation/native';

// Import sub-components

const CreateMomentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { createMoment } = useMoments();

  // Form state
  const [photo, setPhoto] = useState<string>('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [place, setPlace] = useState<Place | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [story, setStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation
  const isFormValid = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);

    return !!(
      title.trim() &&
      selectedCategory &&
      amount &&
      amountNum > 0 &&
      amountNum <= 10000 &&
      selected >= today
    );
  }, [title, selectedCategory, amount, selectedDate]);

  // Payment hint text
  const paymentHint = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;
    if (amountNum <= 0) return 'Enter amount to see payment terms';
    if (amountNum <= VALUES.ESCROW_DIRECT_MAX)
      return 'Direct payment • Instant transfer';
    if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX)
      return 'Your supporter decides payment method';
    return 'Escrow protected • Proof required';
  }, [amount]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Title required', STRINGS.ERRORS.TITLE_REQUIRED);
      return;
    }
    if (title.trim().length < 5) {
      Alert.alert('Title too short', 'Title must be at least 5 characters');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Category required', STRINGS.ERRORS.CATEGORY_REQUIRED);
      return;
    }

    const amountNum = parseFloat(amount) || 0;
    if (!amount || amountNum <= 0) {
      Alert.alert('Amount required', STRINGS.ERRORS.AMOUNT_REQUIRED);
      return;
    }
    if (amountNum > 10000) {
      Alert.alert('Amount too high', 'Maximum amount is $10,000');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    if (selected < today) {
      Alert.alert('Invalid Date', 'Please select today or a future date');
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

      const momentData = {
        title: title.trim(),
        story: story.trim() || undefined,
        price: amountNum,
        category: {
          id: selectedCategory,
          label: categoryObj?.label || selectedCategory,
          emoji: getCategoryEmoji(selectedCategory),
        },
        location: place
          ? {
              name: place.name,
              city: place.address.split(',')[0]?.trim() || place.name,
              country: place.address.split(',')[1]?.trim() || '',
            }
          : undefined,
        date: selectedDate.toISOString(),
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
        Alert.alert('Error', 'Could not create moment. Please try again.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    title,
    selectedCategory,
    amount,
    selectedDate,
    story,
    place,
    photo,
    createMoment,
    navigation,
  ]);

  // Handlers
  const handleDatePress = useCallback(() => setShowDatePicker(true), []);
  const handleNavigateToPlaceSearch = useCallback(
    () => {
      // TODO: Implement proper place selection (Google Places or similar)
      Alert.alert('Not implemented', 'Place selection coming soon');
    },
    [],
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
              color={COLORS.text}
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
          <PhotoSection photo={photo} onPhotoSelected={setPhoto} />

          {/* Title Input */}
          <TitleInput title={title} onTitleChange={setTitle} />

          {/* Category Selector */}
          <CategorySelector
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Details Section */}
          <DetailsSection
            place={place}
            selectedDate={selectedDate}
            amount={amount}
            onPlaceChange={setPlace}
            onDatePress={handleDatePress}
            onAmountChange={setAmount}
            onNavigateToPlaceSearch={handleNavigateToPlaceSearch}
          />

          {/* Story Section */}
          <StorySection story={story} onStoryChange={setStory} />

          {/* Live Preview */}
          <MomentPreview
            photo={photo}
            title={title}
            story={story}
            place={place}
            selectedDate={selectedDate}
            amount={amount}
          />

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Sticky Publish Button */}
        <View style={styles.publishSection}>
          <Text style={styles.publishHint}>{paymentHint}</Text>
          <TouchableOpacity
            style={[
              styles.publishButton,
              (!isFormValid || isSubmitting) && styles.publishButtonDisabled,
            ]}
            onPress={handlePublish}
            activeOpacity={0.8}
            disabled={!isFormValid || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Publish moment"
            accessibilityState={{ disabled: !isFormValid || isSubmitting }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.text} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={COLORS.text}
                />
                <Text style={styles.publishButtonText}>Publish Moment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
          onChange={(_event, date) => {
            setShowDatePicker(Platform.OS !== 'ios');
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
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
    color: COLORS.text,
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
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    gap: 12,
    padding: 20,
  },
  publishHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  publishButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: LAYOUT.borderRadius.full,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  publishButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  publishButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CreateMomentScreen;

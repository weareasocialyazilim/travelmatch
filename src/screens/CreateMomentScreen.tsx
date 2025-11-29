import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { STRINGS } from '../constants/strings';
import { LAYOUT } from '../constants/layout';
import { useNavigation } from '@react-navigation/native';

interface Category {
  id: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

interface Place {
  name: string;
  address: string;
}

const CATEGORIES: Category[] = [
  { id: 'coffee', label: 'Coffee', icon: 'coffee' },
  { id: 'meal', label: 'Meal', icon: 'food' },
  { id: 'ticket', label: 'Ticket', icon: 'ticket' },
  { id: 'transport', label: 'Transport', icon: 'bus' },
  { id: 'experience', label: 'Experience', icon: 'star' },
  { id: 'other', label: 'Other', icon: 'dots-horizontal' },
];

const CreateMomentScreen: React.FC = () => {
  const navigation = useNavigation();

  // Form state
  const [photo, setPhoto] = useState<string>('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [place, setPlace] = useState<Place | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [story, setStory] = useState('');

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          STRINGS.LABELS.PERMISSION_NEEDED,
          STRINGS.ERRORS.PHOTO_PERMISSION,
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', STRINGS.ERRORS.PHOTO_SELECT);
    }
  };

  const escrowInfo = useMemo(() => {
    const amountNum = parseFloat(amount) || 0;

    if (amountNum <= VALUES.ESCROW_DIRECT_MAX) {
      return {
        icon: 'flash' as const,
        color: COLORS.primary,
        title: 'Direct Payment',
        description: '$0-$30: Instant transfer to you when someone gifts.',
      };
    } else if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX) {
      return {
        icon: 'information-outline' as const,
        color: COLORS.softOrange,
        title: 'Giver Chooses',
        description: '$30-$100: Your supporter decides payment method.',
      };
    } else {
      return {
        icon: 'shield-check' as const,
        color: COLORS.success,
        title: 'Proof Required',
        description: '$100+: Escrow protected. Upload proof to receive funds.',
      };
    }
  }, [amount]);

  const isFormValid = useMemo(() => {
    return !!(
      title.trim() &&
      selectedCategory &&
      amount &&
      parseFloat(amount) > 0
    );
  }, [title, selectedCategory, amount]);

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Title required', STRINGS.ERRORS.TITLE_REQUIRED);
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Category required', STRINGS.ERRORS.CATEGORY_REQUIRED);
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Amount required', STRINGS.ERRORS.AMOUNT_REQUIRED);
      return;
    }

    Alert.alert('Success!', 'Your moment has been published', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

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
        >
          {/* Hero Photo Section */}
          <TouchableOpacity
            style={styles.photoSection}
            onPress={pickImage}
            activeOpacity={0.9}
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

          {/* Title Input - Overlay Style */}
          <View style={styles.titleSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your moment a title..."
              placeholderTextColor={COLORS.textTertiary}
              value={title}
              onChangeText={setTitle}
              maxLength={VALUES.TITLE_MAX_LENGTH}
              multiline
            />
            <Text style={styles.titleCounter}>
              {title.length}/{VALUES.TITLE_MAX_LENGTH}
            </Text>
          </View>

          {/* Category Chips - Horizontal Scroll */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.id &&
                      styles.categoryChipSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={category.icon}
                    size={20}
                    color={
                      selectedCategory === category.id
                        ? COLORS.text
                        : COLORS.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === category.id &&
                        styles.categoryChipTextSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Details Cards */}
          <View style={styles.detailsSection}>
            {/* Location Card */}
            <TouchableOpacity
              style={styles.detailCard}
              onPress={() => {
                setPlace({ name: 'Café Kitsuné', address: 'Paris, France' });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.detailCardContent}>
                  <Text style={styles.detailCardLabel}>Location</Text>
                  {place ? (
                    <View>
                      <Text style={styles.detailCardValue}>{place.name}</Text>
                      <Text style={styles.detailCardSubvalue}>
                        {place.address}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.detailCardPlaceholder}>
                      Choose a real place
                    </Text>
                  )}
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.textTertiary}
                />
              </View>
            </TouchableOpacity>

            {/* Date Card */}
            <TouchableOpacity
              style={styles.detailCard}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
            >
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.detailCardContent}>
                  <Text style={styles.detailCardLabel}>When</Text>
                  <Text style={styles.detailCardValue}>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color={COLORS.textTertiary}
                />
              </View>
            </TouchableOpacity>

            {/* Amount Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailCardHeader}>
                <View style={styles.detailCardIcon}>
                  <MaterialCommunityIcons
                    name="currency-usd"
                    size={20}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.detailCardContent}>
                  <Text style={styles.detailCardLabel}>Amount</Text>
                  <View style={styles.amountInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0"
                      placeholderTextColor={COLORS.textTertiary}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      maxLength={6}
                    />
                  </View>
                </View>
              </View>

              {/* Escrow Info */}
              {amount && parseFloat(amount) > 0 && (
                <View
                  style={[
                    styles.escrowInfo,
                    { borderColor: escrowInfo.color + '20' },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={escrowInfo.icon}
                    size={18}
                    color={escrowInfo.color}
                  />
                  <View style={styles.escrowTextContainer}>
                    <Text
                      style={[styles.escrowTitle, { color: escrowInfo.color }]}
                    >
                      {escrowInfo.title}
                    </Text>
                    <Text style={styles.escrowDescription}>
                      {escrowInfo.description}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Story Section - Optional */}
          <View style={styles.storySection}>
            <Text style={styles.sectionLabel}>
              Why this matters{' '}
              <Text style={styles.optionalLabel}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.storyInput}
              placeholder="Share the story behind this moment..."
              placeholderTextColor={COLORS.textTertiary}
              value={story}
              onChangeText={setStory}
              multiline
              numberOfLines={4}
              maxLength={VALUES.STORY_MAX_LENGTH}
              textAlignVertical="top"
            />
            <Text style={styles.storyCounter}>
              {story.length}/{VALUES.STORY_MAX_LENGTH}
            </Text>
          </View>

          {/* Live Preview */}
          {(photo || title || selectedCategory || amount) && (
            <View style={styles.previewSection}>
              <Text style={styles.previewLabel}>PREVIEW</Text>
              <View style={styles.previewCard}>
                {/* Preview Image */}
                {photo && (
                  <View style={styles.previewImageContainer}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.previewImage}
                    />

                    {/* User Badge */}
                    <View style={styles.userBadge}>
                      <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>Y</Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>Your Name</Text>
                        <Text style={styles.userRole}>Traveler</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Preview Content */}
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle} numberOfLines={2}>
                    {title || 'Your moment title'}
                  </Text>
                  {story && (
                    <Text style={styles.previewStory} numberOfLines={3}>
                      {story}
                    </Text>
                  )}
                  {place && (
                    <Text style={styles.previewLocation}>{place.name}</Text>
                  )}

                  <View style={styles.previewDetails}>
                    {place && (
                      <View style={styles.previewDetailItem}>
                        <MaterialCommunityIcons
                          name="map-marker"
                          size={16}
                          color={COLORS.textSecondary}
                        />
                        <Text style={styles.previewDetailText}>
                          {place.name}
                        </Text>
                      </View>
                    )}
                    <View style={styles.previewDetailItem}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={16}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.previewDetailText}>
                        {selectedDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>
                    {amount && (
                      <View style={styles.previewDetailItem}>
                        <MaterialCommunityIcons
                          name="currency-usd"
                          size={16}
                          color={COLORS.textSecondary}
                        />
                        <Text
                          style={[
                            styles.previewDetailText,
                            styles.previewPrice,
                          ]}
                        >
                          {amount}
                        </Text>
                      </View>
                    )}
                  </View>

                  {parseFloat(amount) >= VALUES.ESCROW_OPTIONAL_MAX && (
                    <View style={styles.previewProofBadge}>
                      <MaterialCommunityIcons
                        name="shield-check"
                        size={14}
                        color={COLORS.success}
                      />
                      <Text style={styles.previewProofText}>
                        ProofLoop Protected
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Sticky Publish Button */}
        <View style={styles.publishSection}>
          {amount && parseFloat(amount) > 0 ? (
            <Text style={styles.publishHint}>
              {(() => {
                const amountNum = parseFloat(amount);
                if (amountNum <= VALUES.ESCROW_DIRECT_MAX) {
                  return 'Direct payment • Instant transfer';
                } else if (amountNum <= VALUES.ESCROW_OPTIONAL_MAX) {
                  return 'Your supporter decides payment method';
                } else {
                  return 'Escrow protected • Proof required';
                }
              })()}
            </Text>
          ) : (
            <Text style={styles.publishHint}>
              Enter amount to see payment terms
            </Text>
          )}
          <TouchableOpacity
            style={[
              styles.publishButton,
              !isFormValid && styles.publishButtonDisabled,
            ]}
            onPress={handlePublish}
            activeOpacity={0.8}
            disabled={!isFormValid}
          >
            <MaterialCommunityIcons
              name="check"
              size={20}
              color={COLORS.text}
            />
            <Text style={styles.publishButtonText}>Publish Moment</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
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
  // eslint-disable-next-line react-native/sort-styles
  scrollContent: {
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },

  // Photo Section
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
    backgroundColor: COLORS.blackTransparent,
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

  // Title Section
  titleSection: {
    backgroundColor: COLORS.white,
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    padding: 20,
  },
  titleInput: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    minHeight: 60,
  },
  titleCounter: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },

  // Category Section
  categorySection: {
    backgroundColor: COLORS.background,
    paddingVertical: 16,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 20,
    textTransform: 'uppercase',
  },
  categoryScroll: {
    gap: 8,
    paddingHorizontal: 20,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.borderRadius.full,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.filterPillActive,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },

  // Details Section
  detailsSection: {
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    padding: 16,
    ...CARD_SHADOW,
  },
  detailCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  detailCardIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.filterPillActive,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  detailCardValue: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
  },
  detailCardSubvalue: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  detailCardPlaceholder: {
    color: COLORS.textTertiary,
    fontSize: 15,
  },
  amountInputContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  currencySymbol: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '600',
    marginRight: 4,
  },
  amountInput: {
    color: COLORS.text,
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  escrowInfo: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.background,
    borderRadius: LAYOUT.borderRadius.sm,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    padding: 12,
  },
  escrowTextContainer: {
    flex: 1,
  },
  escrowTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  escrowDescription: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  // Story Section
  storySection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionalLabel: {
    color: COLORS.textTertiary,
    fontWeight: '400',
  },
  storyInput: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.md,
    color: COLORS.text,
    fontSize: 15,
    marginTop: 12,
    minHeight: 100,
    padding: 16,
    ...CARD_SHADOW,
  },
  storyCounter: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },

  // Preview Section
  previewSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  previewLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.borderRadius.lg,
    overflow: 'hidden',
    ...CARD_SHADOW,
  },
  previewImageContainer: {
    aspectRatio: 16 / 9,
    position: 'relative',
    width: '100%',
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  userBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: LAYOUT.borderRadius.full,
    flexDirection: 'row',
    gap: 8,
    left: 12,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
    ...CARD_SHADOW,
  },
  userAvatar: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  userAvatarText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  userRole: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 8,
  },
  previewLocation: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 12,
  },
  previewStory: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  previewDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  previewDetailItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  previewDetailText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  previewPrice: {
    color: COLORS.text,
    fontWeight: '600',
  },
  previewProofBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successLight,
    borderRadius: LAYOUT.borderRadius.sm,
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewProofText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '600',
  },

  // Publish Section
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

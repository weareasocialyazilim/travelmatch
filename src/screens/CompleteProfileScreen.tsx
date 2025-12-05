import type { StackScreenProps } from '@react-navigation/stack';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  // eslint-disable-next-line react-native/split-platform-components
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { LoadingState } from '../components/LoadingState';

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
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is needed');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          setAvatar(result.assets[0].uri);
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Photo library permission is needed',
          );
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets[0]) {
          setAvatar(result.assets[0].uri);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
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
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId));
    } else {
      if (selectedInterests.length < 5) {
        setSelectedInterests([...selectedInterests, interestId]);
      } else {
        Alert.alert('Maximum Reached', 'You can select up to 5 interests');
      }
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your name');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Username Required', 'Please enter a username');
      return;
    }
    if (username.trim().length < 3) {
      Alert.alert(
        'Username Too Short',
        'Username must be at least 3 characters',
      );
      return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Discover');
    }, 1500);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Profile Setup?',
      'You can complete your profile later from Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => navigation.replace('Discover'),
        },
      ],
    );
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
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
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
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Full Name *</Text>
          <View style={styles.inputWrapper}>
            <Icon name="account" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Username Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Username *</Text>
          <View style={styles.inputWrapper}>
            <Icon name="at" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
              placeholderTextColor={COLORS.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>
          {username.length > 0 && username.length < 3 && (
            <Text style={styles.errorText}>
              Username must be at least 3 characters
            </Text>
          )}
        </View>

        {/* Bio Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Bio (Optional)</Text>
          <View style={[styles.inputWrapper, styles.bioWrapper]}>
            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={COLORS.textSecondary}
              value={bio}
              onChangeText={setBio}
              multiline
              maxLength={150}
            />
          </View>
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>

        {/* Interests */}
        <View style={styles.interestsSection}>
          <Text style={styles.sectionTitle}>Select Your Interests *</Text>
          <Text style={styles.sectionSubtitle}>
            Choose up to 5 interests (Selected: {selectedInterests.length}/5)
          </Text>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
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
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            (!name.trim() ||
              !username.trim() ||
              selectedInterests.length === 0) &&
              styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={
            loading ||
            !name.trim() ||
            !username.trim() ||
            selectedInterests.length === 0
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

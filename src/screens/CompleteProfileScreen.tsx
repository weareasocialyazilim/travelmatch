import { StackScreenProps } from '@react-navigation/stack';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CARD_SHADOW, COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { RootStackParamList } from '../navigation/AppNavigator';
import Loading from '../components/Loading';

const INTERESTS = [
  { id: '1', name: 'Travel', icon: 'airplane' },
  { id: '2', name: 'Food', icon: 'food' },
  { id: '3', name: 'Adventure', icon: 'mountain' },
  { id: '4', name: 'Culture', icon: 'temple-buddhist' },
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
  const [avatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectAvatar = () => {
    // Implement image picker
    Alert.alert('Select Avatar', 'Image picker implementation needed');
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
    if (selectedInterests.length === 0) {
      Alert.alert('Select Interests', 'Please select at least one interest');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <Loading mode="overlay" text="Creating Profile..." />}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
                Choose up to 5 interests (Selected: {selectedInterests.length}
                /5)
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
                        size={20}
                        color={isSelected ? COLORS.white : COLORS.primary}
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
              style={styles.completeButton}
              onPress={handleComplete}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>Complete Profile</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    height: '100%',
    width: '100%',
  },
  avatarContainer: {
    borderRadius: 60,
    height: 120,
    marginBottom: LAYOUT.padding,
    overflow: 'hidden',
    width: 120,
  },
  avatarLabel: {
    color: COLORS.primary,
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
    marginBottom: LAYOUT.padding * 3,
  },
  bioInput: {
    minHeight: 100,
    paddingVertical: 0,
    textAlignVertical: 'top',
  },
  bioWrapper: {
    alignItems: 'flex-start',
    paddingVertical: LAYOUT.padding,
  },
  buttonGradient: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  cardContainer: {
    alignSelf: 'center',
    borderRadius: VALUES.borderRadius * 2,
    maxWidth: 420,
    overflow: 'hidden',
    width: '100%',
    ...CARD_SHADOW,
    marginVertical: LAYOUT.padding * 2,
  },
  cardGradient: {
    borderRadius: VALUES.borderRadius * 2,
    padding: LAYOUT.padding * 2,
  },
  charCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '400',
    marginTop: LAYOUT.padding / 2,
    textAlign: 'right',
  },
  completeButton: {
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 1.5,
    overflow: 'hidden',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 3,
    marginTop: LAYOUT.padding * 2,
  },
  input: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: LAYOUT.padding,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: LAYOUT.padding,
  },
  inputSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 1.5,
  },
  interestChip: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    flexDirection: 'row',
    margin: LAYOUT.padding / 2,
    paddingHorizontal: LAYOUT.padding * 1.5,
    paddingVertical: LAYOUT.padding,
  },
  interestChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  interestText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  interestTextSelected: {
    color: COLORS.white,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -LAYOUT.padding / 2,
  },
  interestsSection: {
    marginBottom: LAYOUT.padding * 3,
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 4,
    paddingHorizontal: LAYOUT.padding * 2,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: LAYOUT.padding * 1.5,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 2,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding,
  },
  skipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
  },
});

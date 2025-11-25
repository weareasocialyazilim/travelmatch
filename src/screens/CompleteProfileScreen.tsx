import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, CARD_SHADOW } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

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

export const CompleteProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                    <Icon name="camera-plus" size={32} color={COLORS.textSecondary} />
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
                {loading ? (
                  <Text style={styles.buttonText}>Creating Profile...</Text>
                ) : (
                  <Text style={styles.buttonText}>Complete Profile</Text>
                )}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 4,
  },
    cardContainer: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      borderRadius: VALUES.borderRadius * 2,
      overflow: 'hidden',
      ...CARD_SHADOW,
      marginVertical: LAYOUT.padding * 2,
    },
    cardGradient: {
      padding: LAYOUT.padding * 2,
      borderRadius: VALUES.borderRadius * 2,
    },
  header: {
    alignItems: 'center',
    marginTop: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding * 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 3,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: LAYOUT.padding,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  inputSection: {
    marginBottom: LAYOUT.padding * 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: LAYOUT.padding,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    paddingHorizontal: LAYOUT.padding * 1.5,
    backgroundColor: COLORS.white,
  },
  bioWrapper: {
    alignItems: 'flex-start',
    paddingVertical: LAYOUT.padding,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    paddingVertical: LAYOUT.padding * 1.5,
    marginLeft: LAYOUT.padding,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  charCount: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: LAYOUT.padding / 2,
  },
  interestsSection: {
    marginBottom: LAYOUT.padding * 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding / 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding * 1.5,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -LAYOUT.padding / 2,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.padding,
    paddingHorizontal: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    margin: LAYOUT.padding / 2,
  },
  interestChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: LAYOUT.padding / 2,
  },
  interestTextSelected: {
    color: COLORS.white,
  },
  completeButton: {
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
    marginBottom: LAYOUT.padding * 1.5,
  },
  buttonGradient: {
    paddingVertical: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { COLORS_DARK as COLORS } from '@/constants/colors';
import type { RootStackParamList } from '@/navigation/routeParams';

const TAGS = ['Good Vibes ✨', 'Generous 🎁', 'Punctual ⏰', 'Fun 🥳'];

type ReviewScreenRouteProp = RouteProp<RootStackParamList, 'Review'>;

export const ReviewScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<ReviewScreenRouteProp>();

  const { userName, userAvatar } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleSubmit = () => {
    // TODO: Submit review to API
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>How was the vibe?</Text>
        <Text style={styles.subtitle}>Rate your experience with {userName}</Text>

        <Image source={{ uri: userAvatar }} style={styles.avatar} />

        {/* Stars */}
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={COLORS.brand.primary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.tags}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.activeTag]}
              onPress={() => toggleTag(tag)}
            >
              <Text
                style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.activeTagText,
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Write a private note..."
          placeholderTextColor={COLORS.text.secondary}
          multiline
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity
          style={[styles.submitBtn, rating === 0 && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={rating === 0}
        >
          <Text style={styles.submitText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.text.secondary,
    marginBottom: 30,
    fontSize: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 30,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginBottom: 30,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeTag: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  tagText: {
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  activeTagText: {
    color: '#000000',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    color: COLORS.text.primary,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: COLORS.brand.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000000',
  },
});

export default ReviewScreen;

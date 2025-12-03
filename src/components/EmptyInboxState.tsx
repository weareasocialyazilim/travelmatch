import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';
import type { RootStackParamList } from '../navigation/AppNavigator';

export const EmptyInboxState: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleCreateMoment = () => {
    navigation.navigate('CreateMoment');
  };

  const handleExploreGifts = () => {
    navigation.navigate('Discover');
  };

  return (
    <View style={styles.container}>
      {/* Empty State Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGjMUmY6-DRP-4mkI_obsjYh0Uu22hLjVVn4gIWMJW9r_PG-OUoQvRA0vnZgMRuVLzoVcZ6Tw3nPI6evpp6gP8TV4p9NCfdPZU-u-l0sBed7IiNQXU2en4iXumNiWB7TjO_1NohfBtFK55jMnZKql_TlK6qAgWEJw3LFp9L5kDi8AclnBDgvBxeeZ-7xZ8-1k-VsmqOZVr4sq6zmpMyM8YnjAZYzzyQa8Todvx4i5J7V69SyQAxS67e1sRQPfZ_WnLrSbPCMI0zgRp',
          }}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Text Block */}
      <View style={styles.textBlock}>
        <Text style={styles.headline}>No messages yet</Text>
        <Text style={styles.body}>
          Start gifting or creating moments to connect.
        </Text>
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleCreateMoment}
        >
          <Text style={styles.primaryButtonText}>Create a Moment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleExploreGifts}
        >
          <Text style={styles.secondaryButtonText}>Explore Gifts</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  illustrationContainer: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 1,
    marginBottom: 32,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background,
    letterSpacing: 0.24,
  },
  secondaryButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.primary}33`, // 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.24,
  },
});

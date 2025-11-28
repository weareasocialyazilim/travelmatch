import { StackScreenProps } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Loading } from '../components';
import { COLORS } from '../constants/colors';
import { LAYOUT } from '../constants/layout';
import { VALUES } from '../constants/values';
import { RootStackParamList } from '../navigation/AppNavigator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type MatchConfirmationScreenProps = StackScreenProps<
  RootStackParamList,
  'MatchConfirmation'
>;

export const MatchConfirmationScreen: React.FC<
  MatchConfirmationScreenProps
> = ({ navigation, route }) => {
  const [showCelebration, setShowCelebration] = useState(true);
  const [loading, setLoading] = useState(false);

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  const selectedGivers = route.params?.selectedGivers || [];

  useEffect(() => {
    // Start animations
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(heartAnim, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Auto-navigate after 3 seconds
    const timer = setTimeout(() => {
      setShowCelebration(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, heartAnim, rotateAnim, scaleAnim]);

  const handleContinue = () => {
    setLoading(true);
    // Navigate to Chat with first giver (primary contact)
    setTimeout(() => {
      setLoading(false);
      if (selectedGivers.length > 0) {
        navigation.replace('Chat', {
          otherUser: {
            id: selectedGivers[0].id,
            name: selectedGivers[0].name,
            avatar: selectedGivers[0].avatar,
          },
        });
      } else {
        navigation.navigate('Home');
      }
    }, 1000);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const heartScale = heartAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 1.3, 1],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Loading visible={loading} text="Starting Chat..." overlay />
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Match Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <Icon name="check-circle" size={120} color={COLORS.white} />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>It&apos;s a Match!</Text>
          <Text style={styles.subtitle}>
            Your gesture has been approved by {selectedGivers.length}{' '}
            {selectedGivers.length === 1 ? 'giver' : 'givers'}
          </Text>

          {/* Heart Animation */}
          <Animated.View
            style={[
              styles.heartContainer,
              {
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Icon name="heart" size={80} color={COLORS.white} />
          </Animated.View>

          {/* Success Message */}
          <View style={styles.messageContainer}>
            <Icon name="emoticon-happy" size={32} color={COLORS.white} />
            <Text style={styles.message}>
              You can now start chatting and coordinate the details of your kind
              gesture!
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="account-group" size={24} color={COLORS.white} />
              <Text style={styles.statValue}>{selectedGivers.length}</Text>
              <Text style={styles.statLabel}>
                {selectedGivers.length === 1 ? 'Giver' : 'Givers'}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="currency-usd" size={24} color={COLORS.white} />
              <Text style={styles.statValue}>
                ${selectedGivers.reduce((sum, giver) => sum + giver.amount, 0)}
              </Text>
              <Text style={styles.statLabel}>Total Amount</Text>
            </View>
            <View style={styles.statCard}>
              <Icon name="message" size={24} color={COLORS.white} />
              <Text style={styles.statValue}>Chat</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </Animated.View>

        {/* Continue Button */}
        {!showCelebration && (
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <View style={styles.whiteButton}>
                <Text style={styles.buttonText}>Start Chatting</Text>
                <Icon name="arrow-right" size={24} color={COLORS.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.replace('Home')}
            >
              <Text style={styles.skipText}>Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Floating Particles */}
        <View style={styles.particlesContainer}>
          {[...Array(20)].map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.particle,
                {
                  left: Math.random() * SCREEN_WIDTH,
                  top: Math.random() * 600,
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, Math.random() * 0.8],
                  }),
                },
              ]}
            >
              <Icon
                name={
                  index % 3 === 0
                    ? 'heart'
                    : index % 3 === 1
                    ? 'star'
                    : 'circle'
                }
                size={8 + Math.random() * 12}
                color={COLORS.white}
              />
            </Animated.View>
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    bottom: LAYOUT.padding * 4,
    left: LAYOUT.padding * 2,
    position: 'absolute',
    right: LAYOUT.padding * 2,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
    marginRight: LAYOUT.padding,
  },
  container: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  continueButton: {
    marginBottom: LAYOUT.padding * 1.5,
    width: '100%',
  },
  gradient: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
  },
  heartContainer: {
    marginVertical: LAYOUT.padding * 2,
  },
  iconContainer: {
    marginBottom: LAYOUT.padding * 3,
  },
  message: {
    color: COLORS.white,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginLeft: LAYOUT.padding,
  },
  messageContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparentDark,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 3,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  particle: {
    position: 'absolute',
  },
  particlesContainer: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  skipButton: {
    paddingVertical: LAYOUT.padding,
  },
  skipText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: COLORS.whiteTransparent,
    borderRadius: VALUES.borderRadius,
    flex: 1,
    marginHorizontal: LAYOUT.padding / 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  statLabel: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: LAYOUT.padding / 4,
    marginTop: LAYOUT.padding / 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: LAYOUT.padding * 2,
    width: '100%',
  },
  subtitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: LAYOUT.padding * 3,
    opacity: 0.9,
    textAlign: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: '800',
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
  },
  whiteButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 2,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MatchConfirmationScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const [showCelebration, setShowCelebration] = useState(true);

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
  }, []);

  const handleContinue = () => {
    // Navigate to Chat with first giver (primary contact)
    if (selectedGivers.length > 0) {
      navigation.replace('Chat', { 
        otherUser: {
          id: selectedGivers[0].id,
          name: selectedGivers[0].name,
          avatar: selectedGivers[0].avatar,
        }
      });
    } else {
      navigation.navigate('Home');
    }
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
          <Text style={styles.title}>It's a Match!</Text>
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
                $
                {selectedGivers.reduce(
                  (sum: number, giver: any) => sum + giver.amount,
                  0
                )}
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
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.padding * 2,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: LAYOUT.padding * 3,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: LAYOUT.padding,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: LAYOUT.padding * 3,
    opacity: 0.9,
    lineHeight: 26,
  },
  heartContainer: {
    marginVertical: LAYOUT.padding * 2,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
    marginBottom: LAYOUT.padding * 3,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.white,
    marginLeft: LAYOUT.padding,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: LAYOUT.padding * 2,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
    marginHorizontal: LAYOUT.padding / 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: LAYOUT.padding / 2,
    marginBottom: LAYOUT.padding / 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.white,
    opacity: 0.8,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: LAYOUT.padding * 4,
    left: LAYOUT.padding * 2,
    right: LAYOUT.padding * 2,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: LAYOUT.padding * 1.5,
  },
  whiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: LAYOUT.padding * 2,
    borderRadius: VALUES.borderRadius,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginRight: LAYOUT.padding,
  },
  skipButton: {
    paddingVertical: LAYOUT.padding,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.8,
  },
  particlesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  particle: {
    position: 'absolute',
  },
});

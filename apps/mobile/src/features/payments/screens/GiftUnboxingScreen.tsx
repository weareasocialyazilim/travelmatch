/**
 * GiftUnboxingScreen
 *
 * Gift unboxing ceremony with animated reveal.
 *
 * Also includes AwwwardsGiftUnboxingScreen variant:
 * - "Duygusal Zirve" - Emotional peak moment of the platform
 * - Silk-smooth particle animations
 * - Neon glow explosion effect
 * - TYPOGRAPHY_SYSTEM integration
 * - Turkish labels following "Cinematic Trust Jewelry" aesthetic
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated as RNAnimated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GlassCard } from '@/components/ui/GlassCard';
import { TMButton } from '@/components/ui/TMButton';

const { width, height } = Dimensions.get('window');

export const GiftUnboxingScreen = () => {
  const navigation = useNavigation();
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 1. Box Pops Up
    scale.value = withSpring(1);

    // 2. Shake Effect
    rotate.value = withDelay(500, withRepeat(withSequence(
      withTiming(-10, { duration: 100 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    ), 3));

    // 3. Content Fade In
    opacity.value = withDelay(1500, withTiming(1, { duration: 800 }));
  }, []);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }]
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withSpring(opacity.value * 0) }]
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background.primary, '#1a0b2e']}
        style={styles.gradient}
      />

      {/* Animated Gift Box */}
      <Animated.View style={[styles.boxContainer, boxStyle]}>
        <MaterialCommunityIcons name="gift" size={150} color={COLORS.brand.accent} />
        <View style={styles.glow} />
      </Animated.View>

      {/* Reveal Content */}
      <Animated.View style={[styles.content, contentStyle]}>
        <Text style={styles.congrats}>YOU GOT A VIBE!</Text>
        <Text style={styles.desc}>
          <Text style={styles.highlight}>Selin Y.</Text> gifted you the experience:
        </Text>

        <View style={styles.ticketCard}>
          <Text style={styles.ticketTitle}>Dinner at Hotel Costes</Text>
          <Text style={styles.ticketValue}>Value: $150</Text>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('ChatDetail', { conversationId: 'new', otherUser: { id: 'giver', name: 'Gift Giver', role: 'Traveler' as const, kyc: 'Unverified' as const, location: '' } })}
        >
          <Text style={styles.btnText}>Say Thanks & Chat</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' },
  gradient: { ...StyleSheet.absoluteFillObject },
  boxContainer: { marginBottom: 50, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: COLORS.brand.accent, opacity: 0.3, zIndex: -1, transform: [{ scale: 1.5 }] },
  content: { alignItems: 'center', width: '100%', paddingHorizontal: 30 },
  congrats: { fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 16, textAlign: 'center', letterSpacing: 1 },
  desc: { color: COLORS.text.secondary, fontSize: 18, textAlign: 'center', marginBottom: 30 },
  highlight: { color: 'white', fontWeight: 'bold' },
  ticketCard: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 24, borderRadius: 20, width: '100%', alignItems: 'center', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ticketTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  ticketValue: { color: COLORS.brand.primary, fontSize: 16, fontWeight: 'bold' },
  btn: { backgroundColor: 'white', paddingHorizontal: 32, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center' },
  btnText: { color: 'black', fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' },
});

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsGiftUnboxingScreen - "Duygusal Zirve" (Emotional Peak)
// Silk-smooth ceremony animations, neon explosion, particle effects
// ═══════════════════════════════════════════════════════════════════════════

interface AwwwardsGiftUnboxingParams {
  giftId?: string;
  momentTitle?: string;
  momentLocation?: string;
  momentValue?: string;
  senderName?: string;
  senderAvatar?: string;
}

interface AwwwardsGiftUnboxingScreenProps {
  navigation: any;
  route: {
    params?: AwwwardsGiftUnboxingParams;
  };
}

/**
 * Floating Particle Component for celebration effect
 */
const FloatingParticle: React.FC<{
  delay: number;
  startX: number;
  color: string;
}> = ({ delay, startX, color }) => {
  const translateY = useRef(new RNAnimated.Value(height)).current;
  const translateX = useRef(new RNAnimated.Value(startX)).current;
  const opacity = useRef(new RNAnimated.Value(0)).current;
  const scale = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      RNAnimated.parallel([
        RNAnimated.timing(translateY, {
          toValue: -100,
          duration: 3000 + Math.random() * 2000,
          useNativeDriver: true,
        }),
        RNAnimated.sequence([
          RNAnimated.timing(opacity, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          RNAnimated.delay(2000),
          RNAnimated.timing(opacity, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
        RNAnimated.timing(scale, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        RNAnimated.timing(translateX, {
          toValue: startX + (Math.random() - 0.5) * 100,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]).start();
    };

    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <RNAnimated.View
      style={[
        awwwardsStyles.particle,
        {
          backgroundColor: color,
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    />
  );
};

/**
 * AwwwardsGiftUnboxingScreen - Hediye Kutusu Açılış Seremonisi
 *
 * Awwwards "Duygusal Zirve" screen with:
 * - Silk-smooth box pulse animation before tap
 * - Explosive scale animation on open
 * - Floating celebration particles
 * - Neon glow box with breathing effect
 * - Liquid Glass moment preview card
 * - TYPOGRAPHY_SYSTEM integration
 * - Turkish labels throughout
 */
export const AwwwardsGiftUnboxingScreen: React.FC<AwwwardsGiftUnboxingScreenProps> = ({
  navigation,
  route,
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const {
    momentTitle = 'Bali Sunset Experience',
    momentLocation = 'Uluwatu, Bali',
    momentValue = '$45',
    senderName = 'Caner',
  } = route.params || {};

  // Reanimated values for silk-smooth animations
  const boxScale = useSharedValue(1);
  const boxRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.3);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(40);

  // Breathing glow animation for closed box
  useEffect(() => {
    if (!isOpened) {
      // Breathing effect
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Gentle wobble
      boxRotate.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [isOpened]);

  const handleOpen = () => {
    setIsOpened(true);
    setShowParticles(true);

    // Explosive scale animation
    boxScale.value = withSequence(
      withSpring(1.3, { damping: 4, stiffness: 200 }),
      withTiming(2.5, { duration: 400, easing: Easing.out(Easing.exp) }),
      withTiming(0, { duration: 200 })
    );

    // Glow explosion
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 400 })
    );

    // Content reveal
    contentOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) })
    );

    contentTranslateY.value = withDelay(
      500,
      withSpring(0, { damping: 15, stiffness: 100 })
    );
  };

  // Animated styles
  const boxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: boxScale.value },
      { rotate: `${boxRotate.value}deg` },
    ],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0.3, 1], [1, 2]) }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  // Generate particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: i * 100,
    startX: Math.random() * width,
    color: [
      COLORS.primary.main,
      COLORS.primary.light,
      '#FFD700',
      '#FF6B6B',
      '#4ECDC4',
    ][i % 5],
  }));

  return (
    <View style={awwwardsStyles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[COLORS.background.primary, '#1A1A1C', '#0D0D0E']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating particles */}
      {showParticles &&
        particles.map((p) => (
          <FloatingParticle
            key={p.id}
            delay={p.delay}
            startX={p.startX}
            color={p.color}
          />
        ))}

      {/* Closed state - Gift box */}
      {!isOpened && (
        <View style={awwwardsStyles.closedContainer}>
          {/* Title */}
          <Text style={awwwardsStyles.unboxingTitle}>Sana Bir Hediye Var!</Text>
          <Text style={awwwardsStyles.unboxingSubtitle}>
            Açmak için kutunun üzerine dokun
          </Text>

          {/* Animated gift box */}
          <TouchableOpacity onPress={handleOpen} activeOpacity={0.95}>
            <Animated.View style={[awwwardsStyles.boxWrapper, boxAnimatedStyle]}>
              {/* Glow effect */}
              <Animated.View style={[awwwardsStyles.boxGlow, glowAnimatedStyle]} />

              {/* Neon box */}
              <View style={awwwardsStyles.neonBox}>
                <Ionicons name="gift" size={60} color={COLORS.primary.main} />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Sender hint */}
          <Text style={awwwardsStyles.senderHint}>
            {senderName} senden gelen
          </Text>
        </View>
      )}

      {/* Opened state - Celebration content */}
      {isOpened && (
        <Animated.View style={[awwwardsStyles.openedContainer, contentAnimatedStyle]}>
          {/* Celebration glow background */}
          <View style={awwwardsStyles.celebrationBg}>
            <View style={awwwardsStyles.shineCircle} />
          </View>

          {/* Success tag */}
          <Text style={awwwardsStyles.successTag}>TEBRİKLER</Text>

          {/* Title */}
          <Text style={awwwardsStyles.openedTitle}>Hediye Aktifleştirildi!</Text>

          {/* Moment preview card */}
          <GlassCard style={awwwardsStyles.momentPreview}>
            <View style={awwwardsStyles.momentIcon}>
              <Ionicons name="map" size={32} color={COLORS.primary.main} />
            </View>
            <View style={awwwardsStyles.momentInfo}>
              <Text style={awwwardsStyles.momentName}>{momentTitle}</Text>
              <Text style={awwwardsStyles.momentLoc}>
                {momentLocation} • <Text style={awwwardsStyles.momentValue}>{momentValue} Değerinde</Text>
              </Text>
            </View>
          </GlassCard>

          {/* Thanks note */}
          <Text style={awwwardsStyles.thanksNote}>
            {senderName} seni unutmadı ve bu eşsiz deneyimi seninle paylaştı.
          </Text>

          {/* Action buttons */}
          <View style={awwwardsStyles.actionRow}>
            <TMButton
              title="Deneyimi Gör"
              variant="primary"
              onPress={() => navigation.navigate('MomentDetail')}
              style={awwwardsStyles.actionBtn}
            />
            <TouchableOpacity
              style={awwwardsStyles.laterLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={awwwardsStyles.laterLinkText}>Daha Sonra</Text>
            </TouchableOpacity>
          </View>

          {/* Thank sender option */}
          <TouchableOpacity
            style={awwwardsStyles.thankSenderBtn}
            onPress={() =>
              navigation.navigate('ChatDetail', {
                conversationId: 'new',
                otherUser: {
                  id: 'sender',
                  name: senderName,
                  role: 'Traveler' as const,
                  kyc: 'Unverified' as const,
                  location: '',
                },
              })
            }
          >
            <Ionicons name="chatbubble-outline" size={18} color={COLORS.primary.main} />
            <Text style={awwwardsStyles.thankSenderText}>
              {senderName}'e Teşekkür Et
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const awwwardsStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },

  // ─────────────────────────────────────────────────────────────────
  // Particles
  // ─────────────────────────────────────────────────────────────────
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // ─────────────────────────────────────────────────────────────────
  // Closed State
  // ─────────────────────────────────────────────────────────────────
  closedContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  unboxingTitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.h1,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.black,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: TYPOGRAPHY_SYSTEM.letterSpacing.tight,
  },
  unboxingSubtitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 60,
    lineHeight: TYPOGRAPHY_SYSTEM.sizes.bodyM * TYPOGRAPHY_SYSTEM.lineHeights.normal,
  },
  boxWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  neonBox: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.background.elevated,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary.main,
    // Neon glow shadow
    shadowColor: COLORS.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  boxGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.primary.main,
    opacity: 0.3,
  },
  senderHint: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    color: COLORS.text.muted,
    marginTop: 40,
  },

  // ─────────────────────────────────────────────────────────────────
  // Opened State
  // ─────────────────────────────────────────────────────────────────
  openedContainer: {
    width: '100%',
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  celebrationBg: {
    position: 'absolute',
    top: -150,
    zIndex: -1,
    alignItems: 'center',
  },
  shineCircle: {
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: COLORS.primary.main,
    opacity: 0.08,
  },
  successTag: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    color: COLORS.primary.main,
    letterSpacing: 4,
    marginBottom: 12,
  },
  openedTitle: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: 28,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: TYPOGRAPHY_SYSTEM.letterSpacing.tight,
  },
  momentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  momentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary.main}15`,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle glow
    shadowColor: COLORS.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  momentInfo: {
    flex: 1,
  },
  momentName: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyL,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.bold,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  momentLoc: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    color: COLORS.text.secondary,
  },
  momentValue: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.mono,
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
  },
  thanksNote: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY_SYSTEM.sizes.bodyM * TYPOGRAPHY_SYSTEM.lineHeights.relaxed,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  actionRow: {
    width: '100%',
    gap: 16,
  },
  actionBtn: {
    height: 60,
    borderRadius: 30,
  },
  laterLink: {
    alignItems: 'center',
    padding: 12,
  },
  laterLinkText: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    color: COLORS.text.muted,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
  },
  thankSenderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: `${COLORS.primary.main}10`,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: `${COLORS.primary.main}30`,
  },
  thankSenderText: {
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    color: COLORS.primary.main,
    fontWeight: TYPOGRAPHY_SYSTEM.weights.semibold,
  },
});
